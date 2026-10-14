<?php
/**
 * The template to display default site header
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */


$shaha_header_css = $shaha_header_image = '';
$shaha_header_video = shaha_get_header_video();
if (true || empty($shaha_header_video)) {
	$shaha_header_image = get_header_image();
	if (shaha_trx_addons_featured_image_override()) $shaha_header_image = shaha_get_current_mode_image($shaha_header_image);
}

?><header class="top_panel top_panel_default<?php
					echo !empty($shaha_header_image) || !empty($shaha_header_video) ? ' with_bg_image' : ' without_bg_image';
					if ($shaha_header_video!='') echo ' with_bg_video';
					if ($shaha_header_image!='') echo ' '.esc_attr(shaha_add_inline_css_class('background-image: url('.esc_url($shaha_header_image).');'));
					if (is_single() && has_post_thumbnail()) echo ' with_featured_image';
					if (shaha_is_on(shaha_get_theme_option('header_fullheight'))) echo ' header_fullheight shaha-full-height';
					?> scheme_<?php echo esc_attr(shaha_is_inherit(shaha_get_theme_option('header_scheme')) 
													? shaha_get_theme_option('color_scheme') 
													: shaha_get_theme_option('header_scheme'));
					?>"><?php

	// Background video
	if (!empty($shaha_header_video)) {
		get_template_part( 'templates/header-video' );
	}
	
	// Main menu
    get_template_part( 'templates/header-navi' );

	// Page title and breadcrumbs area
	get_template_part( 'templates/header-title');

	// Header widgets area
	get_template_part( 'templates/header-widgets' );

?></header>