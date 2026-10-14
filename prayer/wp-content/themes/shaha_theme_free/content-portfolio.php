<?php
/**
 * The Portfolio template to display the content
 *
 * Used for index/archive/search.
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

$shaha_blog_style = explode('_', shaha_get_theme_option('blog_style'));
$shaha_columns = empty($shaha_blog_style[1]) ? 2 : max(2, $shaha_blog_style[1]);
$shaha_post_format = get_post_format();
$shaha_post_format = empty($shaha_post_format) ? 'standard' : str_replace('post-format-', '', $shaha_post_format);
$shaha_animation = shaha_get_theme_option('blog_animation');

?><article id="post-<?php the_ID(); ?>" 
	<?php post_class( 'post_item post_layout_portfolio post_layout_portfolio_'.esc_attr($shaha_columns).' post_format_'.esc_attr($shaha_post_format).(is_sticky() && !is_paged() ? ' sticky' : '') ); ?>
	<?php echo (!shaha_is_off($shaha_animation) ? ' data-animation="'.esc_attr(shaha_get_animation_classes($shaha_animation)).'"' : ''); ?>>
	<?php

	// Sticky label
	if ( is_sticky() && !is_paged() ) {
		?><span class="post_label label_sticky"></span><?php
	}

	$shaha_image_hover = shaha_get_theme_option('image_hover');
	// Featured image
	shaha_show_post_featured(array(
		'thumb_size' => shaha_get_thumb_size(strpos(shaha_get_theme_option('body_style'), 'full')!==false || $shaha_columns < 3 
								? 'masonry-big' 
								: 'masonry'),
		'show_no_image' => true,
		'class' => $shaha_image_hover == 'dots' ? 'hover_with_info' : '',
		'post_info' => $shaha_image_hover == 'dots' ? '<div class="post_info">'.esc_html(get_the_title()).'</div>' : ''
	));
	?>
</article>