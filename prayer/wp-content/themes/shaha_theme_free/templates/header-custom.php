<?php
/**
 * The template to display custom header from the ThemeREX Addons Layouts
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.06
 */

$shaha_header_css = $shaha_header_image = '';
$shaha_header_video = shaha_get_header_video();
if (true || empty($shaha_header_video)) {
	$shaha_header_image = get_header_image();
	if (shaha_trx_addons_featured_image_override()) $shaha_header_image = shaha_get_current_mode_image($shaha_header_image);
}

$shaha_header_id = str_replace('header-custom-', '', shaha_get_theme_option("header_style"));

if ((int) $shaha_header_id == 0) {
	$shaha_header_id = shaha_get_post_id(array(
												'name' => $shaha_header_id,
												'post_type' => defined('TRX_ADDONS_CPT_LAYOUT_PT') ? TRX_ADDONS_CPT_LAYOUT_PT : 'cpt_layouts'
												)
											);
} else {
	$shaha_header_id = apply_filters('shaha_filter_get_translated_layout', $shaha_header_id);
}
$shaha_header_meta = get_post_meta($shaha_header_id, 'trx_addons_options', true);

if (empty($shaha_header_image))
    $shaha_header_image = get_the_post_thumbnail_url($shaha_header_id, 'full');

?><header class="top_panel top_panel_custom top_panel_custom_<?php echo esc_attr($shaha_header_id); 
				?> top_panel_custom_<?php echo esc_attr(sanitize_title(get_the_title($shaha_header_id)));
				echo !empty($shaha_header_image) || !empty($shaha_header_video) 
					? ' with_bg_image' 
					: ' without_bg_image';
				if ($shaha_header_video!='') 
					echo ' with_bg_video';
				if ($shaha_header_image!='') 
					echo ' '.esc_attr(shaha_add_inline_css_class('background-image: url('.esc_url($shaha_header_image).');'));
				if (!empty($shaha_header_meta['margin']) != '') 
					echo ' '.esc_attr(shaha_add_inline_css_class('margin-bottom: '.esc_attr(shaha_prepare_css_value($shaha_header_meta['margin'])).';'));
				if (is_single() && has_post_thumbnail()) 
					echo ' with_featured_image';
				if (shaha_is_on(shaha_get_theme_option('header_fullheight'))) 
					echo ' header_fullheight shaha-full-height';
				?> scheme_<?php echo esc_attr(shaha_is_inherit(shaha_get_theme_option('header_scheme')) 
												? shaha_get_theme_option('color_scheme') 
												: shaha_get_theme_option('header_scheme'));
				?>"><?php

	// Background video
	if (!empty($shaha_header_video)) {
		get_template_part( 'templates/header-video' );
	}

	// Custom header's layout
	do_action('shaha_action_show_layout', $shaha_header_id);

	// Header widgets area
	get_template_part( 'templates/header-widgets' );
		
?></header>