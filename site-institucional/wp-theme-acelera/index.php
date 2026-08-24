<?php get_header(); ?>

<main class="acelera-container acelera-section">
  <?php if (have_posts()) : ?>
    <?php while (have_posts()) : the_post(); ?>
      <article>
        <h1><?php the_title(); ?></h1>
        <div><?php the_content(); ?></div>
      </article>
    <?php endwhile; ?>
  <?php else : ?>
    <p>Nenhum conteúdo encontrado.</p>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
