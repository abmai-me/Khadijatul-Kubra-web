<?php
/**
 * Shortcode: Display site meta and/or title and/or breadcrumbs
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.6.08
 */

// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}

	
// Merge shortcode specific styles into single stylesheet
if ( !function_exists( 'trx_addons_sc_layouts_title_merge_styles' ) ) {
	add_filter("trx_addons_filter_merge_styles", 'trx_addons_sc_layouts_title_merge_styles');
	add_filter("trx_addons_filter_merge_styles_layouts", 'trx_addons_sc_layouts_title_merge_styles');
	function trx_addons_sc_layouts_title_merge_styles($list) {
		$list[] = TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'title/_title.scss';
		return $list;
	}
}



// trx_sc_layouts_title
//-------------------------------------------------------------
/*
[trx_sc_layouts_title id="unique_id" icon="hours" text1="Opened hours" text2="8:00am - 5:00pm"]
*/
if ( !function_exists( 'trx_addons_sc_layouts_title' ) ) {
	function trx_addons_sc_layouts_title($atts, $content=null){	
		$atts = trx_addons_sc_prepare_atts('trx_sc_layouts_title', $atts, trx_addons_sc_common_atts('id,hide', array(
			// Individual params
			"type" => "default",
			"image" => "",
			"use_featured_image" => "0",
			"height" => "",
			"align" => '',
			"meta" => "0",
			"title" => "0",
			"breadcrumbs" => "0",
			))
		);

		ob_start();
		trx_addons_get_template_part(array(
										TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'title/tpl.'.trx_addons_esc($atts['type']).'.php',
                                        TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'title/tpl.default.php'
                                        ),
                                        'trx_addons_args_sc_layouts_title',
                                        $atts
                                    );
		$output = ob_get_contents();
		ob_end_clean();
		
		return apply_filters('trx_addons_sc_output', $output, 'trx_sc_layouts_title', $atts, $content);
	}
}


// Add shortcode [trx_sc_layouts_title]
if (!function_exists('trx_addons_sc_layouts_title_add_shortcode')) {
	function trx_addons_sc_layouts_title_add_shortcode() {
		
		if (!trx_addons_cpt_layouts_sc_required()) return;

		add_shortcode("trx_sc_layouts_title", "trx_addons_sc_layouts_title");
	}
	add_action('init', 'trx_addons_sc_layouts_title_add_shortcode', 15);
}


// Add shortcodes
//----------------------------------------------------------------------------

// Add shortcodes to Elementor
if ( trx_addons_exists_elementor() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'title/title-sc-elementor.php';
}

// Add shortcodes to Gutenberg
if ( trx_addons_exists_gutenberg() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'title/title-sc-gutenberg.php';
}

// Add shortcodes to VC
if ( trx_addons_exists_vc() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'title/title-sc-vc.php';
}
