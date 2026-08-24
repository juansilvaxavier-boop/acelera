<?php get_header(); ?>

<main>
  <section class="acelera-hero">
    <div class="acelera-container">
      <h1>Acelera</h1>
      <p>
        <!-- TODO: edite esta frase de apresentação da empresa -->
        Descreva aqui, em uma ou duas frases, o que a Acelera faz e para quem.
      </p>
      <a class="acelera-button" href="<?php echo esc_url(home_url('/consulta-de-faturas/')); ?>">Consultar minhas faturas</a>
    </div>
  </section>

  <section id="sobre" class="acelera-section">
    <div class="acelera-container">
      <h2>Sobre a Acelera</h2>
      <!-- TODO: substitua pelo texto real "quem somos / o que fazemos" -->
      <p>
        Texto institucional sobre a empresa: história, missão e diferenciais.
        Edite esta página pelo WordPress em Páginas → Início, ou diretamente
        neste arquivo (<code>front-page.php</code>).
      </p>

      <div class="acelera-grid">
        <div class="acelera-card">
          <h3>O que fazemos</h3>
          <p>Descreva o principal serviço ou produto oferecido.</p>
        </div>
        <div class="acelera-card">
          <h3>Como trabalhamos</h3>
          <p>Descreva o diferencial de atendimento ou processo.</p>
        </div>
        <div class="acelera-card">
          <h3>Para quem</h3>
          <p>Descreva o público-alvo / segmento atendido.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="contato" class="acelera-section">
    <div class="acelera-container">
      <h2>Contato</h2>
      <ul class="acelera-contact-list">
        <li><strong>E-mail:</strong> <!-- TODO --> contato@acelera.ind.br</li>
        <li><strong>Telefone / WhatsApp:</strong> <!-- TODO --> (00) 00000-0000</li>
        <li><strong>Endereço:</strong> <!-- TODO --> Cidade - UF</li>
      </ul>
    </div>
  </section>
</main>

<?php get_footer(); ?>
