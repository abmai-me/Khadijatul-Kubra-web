<?php
/**
 * The template for homepage posts with "Classic" style
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

shaha_storage_set('blog_archive', true);

get_header(); 

if (have_posts()) {

	shaha_show_layout(get_query_var('blog_archive_start'));

	$shaha_classes = 'posts_container '
						. (substr(shaha_get_theme_option('blog_style'), 0, 7) == 'classic' ? 'columns_wrap columns_padding_bottom' : 'masonry_wrap');
	$shaha_stickies = is_home() ? get_option( 'sticky_posts' ) : false;
	$shaha_sticky_out = shaha_get_theme_option('sticky_style')=='columns' 
							&& is_array($shaha_stickies) && count($shaha_stickies) > 0 && get_query_var( 'paged' ) < 1;
	if ($shaha_sticky_out) {
		?><div class="sticky_wrap columns_wrap"><?php	
	}
	if (!$shaha_sticky_out) {
		if (shaha_get_theme_option('first_post_large') && !is_paged() && !in_array(shaha_get_theme_option('body_style'), array('fullwide', 'fullscreen'))) {
			the_post();
			get_template_part( 'content', 'excerpt' );
		}
		
		?><div class="<?php echo esc_attr($shaha_classes); ?>"><?php
	}
	while ( have_posts() ) { the_post(); 
		if ($shaha_sticky_out && !is_sticky()) {
			$shaha_sticky_out = false;
			?></div><div class="<?php echo esc_attr($shaha_classes); ?>"><?php
		}
		get_template_part( 'content', $shaha_sticky_out && is_sticky() ? 'sticky' : 'classic' );
	}
	
	?></div><?php

	shaha_show_pagination();

	shaha_show_layout(get_query_var('blog_archive_end'));

} else {

	if ( is_search() )
		get_template_part( 'content', 'none-search' );
	else
		get_template_part( 'content', 'none-archive' );

}

get_footer();
?>