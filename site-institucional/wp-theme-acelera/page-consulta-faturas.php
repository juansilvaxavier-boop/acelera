<?php
/**
 * Template Name: Consulta de Faturas
 *
 * Crie uma Página no WordPress (ex.: "Consulta de Faturas", slug
 * consulta-de-faturas) e, em Atributos da página, selecione este modelo.
 */
get_header();
?>

<main class="acelera-container acelera-section">
  <h1>Consulta de Faturas</h1>
  <p>Informe seu CPF ou CNPJ (apenas números) para consultar as faturas em aberto.</p>

  <form id="acelera-faturas-form" class="acelera-form-row" autocomplete="off">
    <input
      type="text"
      inputmode="numeric"
      class="acelera-input"
      id="acelera-documento"
      name="documento"
      placeholder="CPF ou CNPJ"
      required
    >
    <button type="submit" class="acelera-button">Consultar</button>
  </form>

  <p id="acelera-faturas-status" class="acelera-status" role="status" aria-live="polite"></p>

  <ul id="acelera-faturas-lista" class="acelera-fatura-list"></ul>
</main>

<script>
(function () {
  var form = document.getElementById('acelera-faturas-form');
  var status = document.getElementById('acelera-faturas-status');
  var lista = document.getElementById('acelera-faturas-lista');
  var endpoint = <?php echo wp_json_encode(esc_url_raw(rest_url('acelera/v1/faturas'))); ?>;

  function formatarMoeda(valor) {
    try {
      return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch (e) {
      return 'R$ ' + valor;
    }
  }

  function formatarData(iso) {
    if (!iso) return '-';
    var partes = String(iso).split('-');
    if (partes.length !== 3) return iso;
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  function render(items) {
    lista.innerHTML = '';
    if (!items.length) {
      status.textContent = 'Nenhuma fatura em aberto encontrada para este documento.';
      return;
    }
    status.textContent = items.length + ' fatura(s) encontrada(s).';
    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'acelera-fatura';

      var info = document.createElement('div');
      info.className = 'acelera-fatura-info';
      info.innerHTML =
        '<h3>' + (item.descricao || 'Fatura') + '</h3>' +
        '<p>Vencimento: ' + formatarData(item.vencimento) + ' &middot; ' +
        formatarMoeda(item.valor) + ' &middot; <span class="acelera-badge">' +
        (item.status || '') + '</span></p>';

      var acoes = document.createElement('div');
      acoes.className = 'acelera-fatura-actions';

      if (item.boleto) {
        var boletoLink = document.createElement('a');
        boletoLink.href = item.boleto;
        boletoLink.target = '_blank';
        boletoLink.rel = 'noopener';
        boletoLink.className = 'acelera-button';
        boletoLink.textContent = 'Ver boleto';
        acoes.appendChild(boletoLink);
      }

      li.appendChild(info);
      li.appendChild(acoes);
      lista.appendChild(li);
    });
  }

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    var documento = document.getElementById('acelera-documento').value.replace(/\D/g, '');
    if (!documento) return;

    lista.innerHTML = '';
    status.textContent = 'Consultando...';

    fetch(endpoint + '?documento=' + encodeURIComponent(documento))
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data && data.error ? data.error : 'Erro ao consultar.');
          return data;
        });
      })
      .then(function (data) {
        render(data.items || []);
      })
      .catch(function (err) {
        status.textContent = err.message || 'Não foi possível consultar as faturas agora.';
      });
  });
})();
</script>

<?php get_footer(); ?>
