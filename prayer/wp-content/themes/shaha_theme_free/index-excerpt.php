<?php
/**
 * The template for homepage posts with "Excerpt" style
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

shaha_storage_set('blog_archive', true);

get_header(); 

if (have_posts()) {

	shaha_show_layout(get_query_var('blog_archive_start'));

	?><div class="posts_container"><?php
	
	$shaha_stickies = is_home() ? get_option( 'sticky_posts' ) : false;
	$shaha_sticky_out = shaha_get_theme_option('sticky_style')=='columns' 
							&& is_array($shaha_stickies) && count($shaha_stickies) > 0 && get_query_var( 'paged' ) < 1;
	if ($shaha_sticky_out) {
		?><div class="sticky_wrap columns_wrap"><?php	
	}
	while ( have_posts() ) { the_post(); 
		if ($shaha_sticky_out && !is_sticky()) {
			$shaha_sticky_out = false;
			?></div><?php
		}
		get_template_part( 'content', $shaha_sticky_out && is_sticky() ? 'sticky' : 'excerpt' );
	}
	if ($shaha_sticky_out) {
		$shaha_sticky_out = false;
		?></div><?php
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