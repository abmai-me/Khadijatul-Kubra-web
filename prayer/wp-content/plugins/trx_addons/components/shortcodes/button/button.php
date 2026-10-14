<?php
/**
 * Shortcode: Button
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.2
 */

// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}

	
// Merge shortcode's specific styles into single stylesheet
if ( !function_exists( 'trx_addons_sc_button_merge_styles' ) ) {
	add_filter("trx_addons_filter_merge_styles", 'trx_addons_sc_button_merge_styles');
	function trx_addons_sc_button_merge_styles($list) {
		$list[] = TRX_ADDONS_PLUGIN_SHORTCODES . 'button/_button.scss';
		return $list;
	}
}



// trx_sc_button
//-------------------------------------------------------------
/*
[trx_sc_button id="unique_id" type="default" title="Block title" subtitle="" link="#" icon="icon-cog" image="path_to_image"]
*/
if (!function_exists('trx_addons_sc_button')) {	
	function trx_addons_sc_button($atts, $content=null){	
		$atts = trx_addons_sc_prepare_atts('trx_sc_button', $atts, trx_addons_sc_common_atts('id,icon', array(
			// Individual params
			"type" => "default",
			"size" => "normal",
			"align" => "none",
			"text_align" => "none",
			"bg_image" => "",
			"back_image" => "",		// Alter name for bg_image in VC (it broke bg_image)
			"image" => "",
			"icon_position" => "left",
			"title" => "",
			"subtitle" => "",
			"link" => '',
			"new_window" => 0,
			))
		);
		$output = '';
		if (!empty($atts['link'])) {
			if (empty($atts['icon'])) {
				$atts['icon'] = isset( $atts['icon_' . $atts['icon_type']] ) && $atts['icon_' . $atts['icon_type']] != 'empty' 
									? $atts['icon_' . $atts['icon_type']] 
									: '';
				trx_addons_load_icons($atts['icon_type']);
			} else if (strtolower($atts['icon']) == 'none')
				$atts['icon'] = '';
	
			if (empty($atts['bg_image'])) $atts['bg_image'] = $atts['back_image'];
			$atts['bg_image'] = trx_addons_get_attachment_url($atts['bg_image'], apply_filters('trx_addons_filter_thumb_size', trx_addons_get_thumb_size('masonry'), 'button-bg'));
			$atts['image'] = trx_addons_get_attachment_url($atts['image'], apply_filters('trx_addons_filter_thumb_size', trx_addons_get_thumb_size('masonry'), 'button'));
	
			ob_start();
			trx_addons_get_template_part(array(
											TRX_ADDONS_PLUGIN_SHORTCODES . 'button/tpl.'.trx_addons_esc($atts['type']).'.php',
											TRX_ADDONS_PLUGIN_SHORTCODES . 'button/tpl.default.php'
											),
                                            'trx_addons_args_sc_button', 
                                            $atts
                                        );
			$output = ob_get_contents();
			ob_end_clean();
		}
		
		return apply_filters('trx_addons_sc_output', $output, 'trx_sc_button', $atts, $content);
	}
}



// Add shortcode [trx_sc_button]
if (!function_exists('trx_addons_sc_button_add_shortcode')) {
	function trx_addons_sc_button_add_shortcode() {
		add_shortcode("trx_sc_button", "trx_addons_sc_button");
	}
	add_action('init', 'trx_addons_sc_button_add_shortcode', 20);
}


// Add shortcodes
//----------------------------------------------------------------------------

// Add shortcodes to Elementor
if ( trx_addons_exists_elementor() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_SHORTCODES . 'button/button-sc-elementor.php';
}

// Add shortcodes to Gutenberg
if ( trx_addons_exists_gutenberg() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_SHORTCODES . 'button/button-sc-gutenberg.php';
}

// Add shortcodes to VC
if ( trx_addons_exists_vc() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_SHORTCODES . 'button/button-sc-vc.php';
}
