<?php
/**
 * Shortcode: Display WooCommerce Currency Switcher with items number and totals
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.6.14
 */

// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}

	
// Merge shortcode specific styles into single stylesheet
if ( !function_exists( 'trx_addons_sc_layouts_currency_merge_styles' ) ) {
	add_filter("trx_addons_filter_merge_styles", 'trx_addons_sc_layouts_currency_merge_styles');
	add_filter("trx_addons_filter_merge_styles_layouts", 'trx_addons_sc_layouts_currency_merge_styles');
	function trx_addons_sc_layouts_currency_merge_styles($list) {
		$list[] = TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'currency/_currency.scss';
		return $list;
	}
}

	

// trx_sc_layouts_currency
//-------------------------------------------------------------
/*
[trx_sc_layouts_currency id="unique_id" text="Shopping currency"]
*/
if ( !function_exists( 'trx_addons_sc_layouts_currency' ) ) {
	function trx_addons_sc_layouts_currency($atts, $content=null){	
		$atts = trx_addons_sc_prepare_atts('trx_sc_layouts_currency', $atts, trx_addons_sc_common_atts('id,hide', array(
			// Individual params
			"type" => "default",
			))
		);

		ob_start();
		trx_addons_get_template_part(array(
										TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'currency/tpl.'.trx_addons_esc($atts['type']).'.php',
										TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'currency/tpl.default.php'
										),
										'trx_addons_args_sc_layouts_currency',
										$atts
									);
		$output = ob_get_contents();
		ob_end_clean();
		
		return apply_filters('trx_addons_sc_output', $output, 'trx_sc_layouts_currency', $atts, $content);
	}
}


// Add shortcode [trx_sc_layouts_currency]
if (!function_exists('trx_addons_sc_layouts_currency_add_shortcode')) {
	function trx_addons_sc_layouts_currency_add_shortcode() {
		
		if (!trx_addons_cpt_layouts_sc_required()) return;

		add_shortcode("trx_sc_layouts_currency", "trx_addons_sc_layouts_currency");
	}

	add_action('init', 'trx_addons_sc_layouts_currency_add_shortcode', 15);
}


// Add shortcodes
//----------------------------------------------------------------------------

// Add shortcodes to Elementor
if ( trx_addons_exists_elementor() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'currency/currency-sc-elementor.php';
}

// Add shortcodes to Gutenberg
if ( trx_addons_exists_gutenberg() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'currency/currency-sc-gutenberg.php';
}

// Add shortcodes to VC
if ( trx_addons_exists_vc() ) {
	require_once TRX_ADDONS_PLUGIN_DIR . TRX_ADDONS_PLUGIN_CPT_LAYOUTS_SHORTCODES . 'currency/currency-sc-vc.php';
}
