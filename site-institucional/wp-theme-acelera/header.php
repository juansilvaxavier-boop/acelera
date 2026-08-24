<?php ?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="acelera-header">
  <div class="acelera-container acelera-header-inner">
    <a class="acelera-logo" href="<?php echo esc_url(home_url('/')); ?>">Acelera</a>
    <nav class="acelera-nav" aria-label="Menu principal">
      <?php
      wp_nav_menu([
          'theme_location' => 'primary',
          'container'      => false,
          'fallback_cb'    => function () {
              echo '<ul>';
              echo '<li><a href="' . esc_url(home_url('/')) . '">Início</a></li>';
              echo '<li><a href="' . esc_url(home_url('/#sobre')) . '">Sobre</a></li>';
              echo '<li><a href="' . esc_url(home_url('/#contato')) . '">Contato</a></li>';
              echo '<li><a href="' . esc_url(home_url('/consulta-de-faturas/')) . '">Consulta de Faturas</a></li>';
              echo '</ul>';
          },
      ]);
      ?>
    </nav>
  </div>
</header>
