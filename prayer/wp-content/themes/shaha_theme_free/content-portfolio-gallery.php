<?php
/**
 * The Gallery template to display posts
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
$shaha_image = wp_get_attachment_image_src( get_post_thumbnail_id(get_the_ID()), 'full' );

?><article id="post-<?php the_ID(); ?>" 
	<?php post_class( 'post_item post_layout_portfolio post_layout_gallery post_layout_gallery_'.esc_attr($shaha_columns).' post_format_'.esc_attr($shaha_post_format) ); ?>
	<?php echo (!shaha_is_off($shaha_animation) ? ' data-animation="'.esc_attr(shaha_get_animation_classes($shaha_animation)).'"' : ''); ?>
	data-size="<?php if (!empty($shaha_image[1]) && !empty($shaha_image[2])) echo intval($shaha_image[1]) .'x' . intval($shaha_image[2]); ?>"
	data-src="<?php if (!empty($shaha_image[0])) echo esc_url($shaha_image[0]); ?>"
	>

	<?php

	// Sticky label
	if ( is_sticky() && !is_paged() ) {
		?><span class="post_label label_sticky"></span><?php
	}

	// Featured image
	$shaha_image_hover = 'icon';
	if (in_array($shaha_image_hover, array('icons', 'zoom'))) $shaha_image_hover = 'dots';
	$shaha_components = shaha_is_inherit(shaha_get_theme_option_from_meta('meta_parts')) 
								? 'categories,date,counters,share'
								: shaha_array_get_keys_by_value(shaha_get_theme_option('meta_parts'));
	$shaha_counters = shaha_is_inherit(shaha_get_theme_option_from_meta('counters')) 
								? 'comments'
								: shaha_array_get_keys_by_value(shaha_get_theme_option('counters'));
	shaha_show_post_featured(array(
		'hover' => $shaha_image_hover,
		'thumb_size' => shaha_get_thumb_size( strpos(shaha_get_theme_option('body_style'), 'full')!==false || $shaha_columns < 3 ? 'masonry-big' : 'masonry' ),
		'thumb_only' => true,
		'show_no_image' => true,
		'post_info' => '<div class="post_details">'
							. '<h2 class="post_title"><a href="'.esc_url(get_permalink()).'">'. esc_html(get_the_title()) . '</a></h2>'
							. '<div class="post_description">'
								. (!empty($shaha_components)
										? shaha_show_post_meta(apply_filters('shaha_filter_post_meta_args', array(
											'components' => $shaha_components,
											'counters' => $shaha_counters,
											'seo' => false,
											'echo' => false
											), $shaha_blog_style[0], $shaha_columns))
										: '')
								. '<div class="post_description_content">'
									. apply_filters('the_excerpt', get_the_excerpt())
								. '</div>'
								. '<a href="'.esc_url(get_permalink()).'" class="theme_button post_readmore"><span class="post_readmore_label">' . esc_html__('Learn more', 'shaha') . '</span></a>'
							. '</div>'
						. '</div>'
	));
	?>
</article>