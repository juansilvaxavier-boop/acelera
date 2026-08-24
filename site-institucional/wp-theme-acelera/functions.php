<?php
/**
 * Tema Acelera — funções do tema.
 */

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    register_nav_menus([
        'primary' => __('Menu principal', 'acelera'),
    ]);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('acelera-style', get_stylesheet_uri(), [], '1.0');
});

/**
 * ---------------------------------------------------------------------
 * Proxy mTLS para a API do Banco Cora (consulta de faturas por CPF/CNPJ).
 *
 * As credenciais (client id, certificado e chave privada) NUNCA ficam no
 * navegador — só aqui, como constantes definidas em wp-config.php. Veja
 * site-institucional/README-DEPLOY.md para o passo a passo de configuração.
 *
 * Endpoint publicado: GET /wp-json/acelera/v1/faturas?documento=12345678900
 * ---------------------------------------------------------------------
 */
add_action('rest_api_init', function () {
    register_rest_route('acelera/v1', '/faturas', [
        'methods'             => 'GET',
        'callback'            => 'acelera_consultar_faturas_cora',
        'permission_callback' => '__return_true',
        'args'                => [
            'documento' => ['required' => true],
        ],
    ]);
});

function acelera_consultar_faturas_cora(WP_REST_Request $request)
{
    $documento = preg_replace('/\D/', '', (string) $request->get_param('documento'));
    if (!$documento) {
        return new WP_REST_Response(
            ['error' => 'Informe o parâmetro documento (CPF ou CNPJ, apenas números).'],
            400
        );
    }

    $client_id = defined('ACELERA_CORA_CLIENT_ID') ? ACELERA_CORA_CLIENT_ID : '';
    $cert_path = defined('ACELERA_CORA_CERT_PATH') ? ACELERA_CORA_CERT_PATH : '';
    $key_path  = defined('ACELERA_CORA_CERT_PATH') && defined('ACELERA_CORA_KEY_PATH') ? ACELERA_CORA_KEY_PATH : '';

    if (!$client_id || !$cert_path || !$key_path || !file_exists($cert_path) || !file_exists($key_path)) {
        // Integração ainda não configurada neste ambiente.
        return new WP_REST_Response(
            ['error' => 'Integração com a Cora ainda não configurada neste ambiente.'],
            503
        );
    }

    $env        = defined('ACELERA_CORA_ENV') ? ACELERA_CORA_ENV : 'production';
    $token_host = $env === 'stage' ? 'matls-clients.api.stage.cora.com.br' : 'matls-clients.api.cora.com.br';
    $api_host   = $env === 'stage' ? 'api.stage.cora.com.br' : 'api.cora.com.br';

    $token = acelera_cora_get_token($token_host, $client_id, $cert_path, $key_path);
    if (is_wp_error($token)) {
        return new WP_REST_Response(['error' => 'Não foi possível autenticar na Cora agora.'], 502);
    }

    $ch = curl_init(
        "https://{$api_host}/v2/invoices/?state=OPEN&search=" . rawurlencode($documento)
    );
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSLCERT        => $cert_path,
        CURLOPT_SSLKEY         => $key_path,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        CURLOPT_TIMEOUT        => 20,
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error  = curl_error($ch);
    curl_close($ch);

    if ($body === false || $status < 200 || $status >= 300) {
        error_log('Acelera/Cora: erro ao consultar faturas - ' . $error . ' status=' . $status);
        return new WP_REST_Response(['error' => 'Não foi possível consultar as faturas na Cora agora.'], 502);
    }

    $data  = json_decode($body, true);
    $lista = is_array($data) ? ($data['items'] ?? $data['data'] ?? $data) : [];
    $items = array_map('acelera_mapear_fatura_cora', $lista);

    return new WP_REST_Response(['items' => $items], 200);
}

function acelera_cora_get_token($token_host, $client_id, $cert_path, $key_path)
{
    $cached = get_transient('acelera_cora_token');
    if ($cached) {
        return $cached;
    }

    $ch = curl_init("https://{$token_host}/token");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'grant_type' => 'client_credentials',
            'client_id'  => $client_id,
        ]),
        CURLOPT_SSLCERT => $cert_path,
        CURLOPT_SSLKEY  => $key_path,
        CURLOPT_TIMEOUT => 20,
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false || $status < 200 || $status >= 300) {
        return new WP_Error('cora_token', 'Falha ao obter token da Cora');
    }

    $json = json_decode($body, true);
    if (empty($json['access_token'])) {
        return new WP_Error('cora_token', 'Resposta de token inválida da Cora');
    }

    $ttl = isset($json['expires_in']) ? max(60, (int) $json['expires_in'] - 60) : 23 * 3600;
    set_transient('acelera_cora_token', $json['access_token'], $ttl);

    return $json['access_token'];
}

function acelera_mapear_fatura_cora($inv)
{
    return [
        'id'             => $inv['id'] ?? null,
        'descricao'      => $inv['services'][0]['name'] ?? ($inv['code'] ?? 'Fatura Acelera'),
        'vencimento'     => $inv['payment_terms']['due_date'] ?? null,
        'valor'          => isset($inv['total_amount']) ? $inv['total_amount'] / 100 : 0,
        'status'         => $inv['status'] ?? null,
        'boleto'         => $inv['payment_options']['bank_slip']['url'] ?? null,
        'linhaDigitavel' => $inv['payment_options']['bank_slip']['digitable'] ?? null,
        'pix'            => $inv['pix']['emv'] ?? null,
    ];
}
