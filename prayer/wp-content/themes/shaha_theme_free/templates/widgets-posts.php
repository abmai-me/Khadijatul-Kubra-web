<?php
/**
 * The template to display posts in widgets and/or in the search results
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

$shaha_post_id    = get_the_ID();
$shaha_post_date  = shaha_get_date();
$shaha_post_title = get_the_title();
$shaha_post_link  = get_permalink();
$shaha_post_author_id   = get_the_author_meta('ID');
$shaha_post_author_name = get_the_author_meta('display_name');
$shaha_post_author_url  = get_author_posts_url($shaha_post_author_id, '');

$shaha_args = get_query_var('shaha_args_widgets_posts');
$shaha_show_date = isset($shaha_args['show_date']) ? (int) $shaha_args['show_date'] : 1;
$shaha_show_image = isset($shaha_args['show_image']) ? (int) $shaha_args['show_image'] : 1;
$shaha_show_author = isset($shaha_args['show_author']) ? (int) $shaha_args['show_author'] : 1;
$shaha_show_counters = isset($shaha_args['show_counters']) ? (int) $shaha_args['show_counters'] : 1;
$shaha_show_categories = isset($shaha_args['show_categories']) ? (int) $shaha_args['show_categories'] : 1;

$shaha_output = shaha_storage_get('shaha_output_widgets_posts');

$shaha_post_counters_output = '';
if ( $shaha_show_counters ) {
	$shaha_post_counters_output = '<span class="post_info_item post_info_counters">'
								. shaha_get_post_counters('comments')
							. '</span>';
}


$shaha_output .= '<article class="post_item with_thumb">';

if ($shaha_show_image) {
	$shaha_post_thumb = get_the_post_thumbnail($shaha_post_id, shaha_get_thumb_size('tiny'), array(
		'alt' => get_the_title()
	));
	if ($shaha_post_thumb) $shaha_output .= '<div class="post_thumb">' . ($shaha_post_link ? '<a href="' . esc_url($shaha_post_link) . '">' : '') . ($shaha_post_thumb) . ($shaha_post_link ? '</a>' : '') . '</div>';
}

$shaha_output .= '<div class="post_content">'
			. ($shaha_show_categories 
					? '<div class="post_categories">'
						. shaha_get_post_categories()
						. $shaha_post_counters_output
						. '</div>' 
					: '')
			. '<h6 class="post_title">' . ($shaha_post_link ? '<a href="' . esc_url($shaha_post_link) . '">' : '') . ($shaha_post_title) . ($shaha_post_link ? '</a>' : '') . '</h6>'
			. apply_filters('shaha_filter_get_post_info', 
								'<div class="post_info">'
									. ($shaha_show_date 
										? '<span class="post_info_item post_info_posted">'
											. ($shaha_post_link ? '<a href="' . esc_url($shaha_post_link) . '" class="post_info_date">' : '') 
											. esc_html($shaha_post_date) 
											. ($shaha_post_link ? '</a>' : '')
											. '</span>'
										: '')
									. ($shaha_show_author 
										? '<span class="post_info_item post_info_posted_by">' 
											. esc_html__('by', 'shaha') . ' ' 
											. ($shaha_post_link ? '<a href="' . esc_url($shaha_post_author_url) . '" class="post_info_author">' : '') 
											. esc_html($shaha_post_author_name) 
											. ($shaha_post_link ? '</a>' : '') 
											. '</span>'
										: '')
									. (!$shaha_show_categories && $shaha_post_counters_output
										? $shaha_post_counters_output
										: '')
								. '</div>')
		. '</div>'
	. '</article>';
shaha_storage_set('shaha_output_widgets_posts', $shaha_output);
?>