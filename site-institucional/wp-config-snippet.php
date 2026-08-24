<?php
/**
 * Cole este bloco no wp-config.php do WordPress, ANTES da linha
 * "/* That's all, stop editing! *​/" — NUNCA commite este arquivo com
 * valores reais preenchidos (mantenha fora do controle de versão).
 *
 * ACELERA_CORA_ENV: "production" ou "stage".
 * ACELERA_CORA_CLIENT_ID: client_id fornecido pela Cora.
 * ACELERA_CORA_CERT_PATH / ACELERA_CORA_KEY_PATH: caminhos absolutos do
 * certificado e chave privada mTLS no servidor da Hostinger. Coloque os
 * arquivos .pem FORA da pasta public_html (não acessível publicamente) —
 * veja README-DEPLOY.md, seção 5.
 */

define('ACELERA_CORA_ENV', 'production');
define('ACELERA_CORA_CLIENT_ID', 'COLE_AQUI_O_CLIENT_ID');
define('ACELERA_CORA_CERT_PATH', '/home/SEU_USUARIO/cora/cora-cert.pem');
define('ACELERA_CORA_KEY_PATH', '/home/SEU_USUARIO/cora/cora-key.pem');
