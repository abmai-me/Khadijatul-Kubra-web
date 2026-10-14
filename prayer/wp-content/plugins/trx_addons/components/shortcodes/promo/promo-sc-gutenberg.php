<?php
/**
 * Shortcode: Promo block (Gutenberg support)
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.2
 */

// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}



// Gutenberg Block
//------------------------------------------------------

// Add scripts and styles for the editor
if ( ! function_exists( 'trx_addons_gutenberg_sc_promo_editor_assets' ) ) {
	add_action( 'enqueue_block_editor_assets', 'trx_addons_gutenberg_sc_promo_editor_assets' );
	function trx_addons_gutenberg_sc_promo_editor_assets() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			// Scripts
			wp_enqueue_script(
				'trx-addons-gutenberg-editor-block-promo',
				trx_addons_get_file_url( TRX_ADDONS_PLUGIN_SHORTCODES . 'promo/gutenberg/promo.gutenberg-editor.js' ),
				array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'trx_addons-admin' ),
				filemtime( trx_addons_get_file_dir( TRX_ADDONS_PLUGIN_SHORTCODES . 'promo/gutenberg/promo.gutenberg-editor.js' ) ),
				true
			);
		}
	}
}

// Block register
if ( ! function_exists( 'trx_addons_sc_promo_add_in_gutenberg' ) ) {
	add_action( 'init', 'trx_addons_sc_promo_add_in_gutenberg' );
	function trx_addons_sc_promo_add_in_gutenberg() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			register_block_type(
				'trx-addons/promo', array(
					'attributes'      => array(
						'type'               => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'icon'               => array(
							'type'    => 'string',
							'default' => '',
						),
						'link2'              => array(
							'type'    => 'string',
							'default' => '',
						),
						'link2_text'         => array(
							'type'    => 'string',
							'default' => '',
						),
						'link2_style'        => array(
							'type'    => 'string',
							'default' => '',
						),
						'text_bg_color'      => array(
							'type'    => 'string',
							'default' => '',
						),
						'image'              => array(
							'type'    => 'number',
							'default' => 0,
						),
						'image_url'          => array(
							'type'		=> 'string',
							'default'	=> '',
						),
						'image_bg_color'     => array(
							'type'    => 'string',
							'default' => '',
						),
						'image_cover'        => array(
							'type'    => 'boolean',
							'default' => true,
						),
						'image_position'     => array(
							'type'    => 'string',
							'default' => 'left',
						),
						'image_width'        => array(
							'type'    => 'string',
							'default' => '50%',
						),
						'video_url'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'video_embed'        => array(
							'type'    => 'string',
							'default' => '',
						),
						'video_in_popup'     => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'size'               => array(
							'type'    => 'string',
							'default' => 'normal',
						),
						'full_height'        => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'text_width'         => array(
							'type'    => 'string',
							'default' => 'none',
						),
						'text_float'         => array(
							'type'    => 'string',
							'default' => 'none',
						),
						'text_align'         => array(
							'type'    => 'string',
							'default' => 'none',
						),
						'text_paddings'      => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'text_margins'       => array(
							'type'    => 'string',
							'default' => '',
						),
						'gap'                => array(
							'type'    => 'string',
							'default' => '',
						),
						// Title attributes
						'title_style'        => array(
							'type'    => 'string',
							'default' => '',
						),
						'title_tag'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'title_align'        => array(
							'type'    => 'string',
							'default' => '',
						),
						'title_color'        => array(
							'type'    => 'string',
							'default' => '',
						),
						'title_color2'       => array(
							'type'    => 'string',
							'default' => '',
						),
						'gradient_direction' => array(
							'type'    => 'string',
							'default' => '0',
						),
						'title'              => array(
							'type'    => 'string',
							'default' => esc_html__( 'Promo', 'trx_addons' ),
						),
						'subtitle'           => array(
							'type'    => 'string',
							'default' => '',
						),
						'description'        => array(
							'type'    => 'string',
							'default' => '',
						),
						// Button attributes
						'link'               => array(
							'type'    => 'string',
							'default' => '',
						),
						'link_text'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'link_style'         => array(
							'type'    => 'string',
							'default' => '',
						),
						'link_image'         => array(
							'type'    => 'number',
							'default' => 0,
						),
						'link_image_url'     => array(
							'type'    => 'string',
							'default' => '',
						),
						// ID, Class, CSS attributes
						'id'                 => array(
							'type'    => 'string',
							'default' => '',
						),
						'class'              => array(
							'type'    => 'string',
							'default' => '',
						),
						'className'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'css'                => array(
							'type'    => 'string',
							'default' => '',
						),
					),
					'render_callback' => 'trx_addons_gutenberg_sc_promo_render_block',
				)
			);
		} else {
			return;
		}
	}
}

// Block render
if ( ! function_exists( 'trx_addons_gutenberg_sc_promo_render_block' ) ) {
	function trx_addons_gutenberg_sc_promo_render_block( $attributes = array() ) {
		return trx_addons_sc_promo( $attributes );
	}
}

// Return list of allowed layouts
if ( ! function_exists( 'trx_addons_gutenberg_sc_promo_get_layouts' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_layouts', 'trx_addons_gutenberg_sc_promo_get_layouts', 10, 1 );
	function trx_addons_gutenberg_sc_promo_get_layouts( $array = array() ) {
		$array['sc_promo'] = apply_filters( 'trx_addons_sc_type', trx_addons_components_get_allowed_layouts( 'sc', 'promo' ), 'trx_sc_promo' );
		return $array;
	}
}


// Add shortcode's specific lists to the JS storage
if ( ! function_exists( 'trx_addons_sc_promo_gutenberg_sc_params' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_params', 'trx_addons_sc_promo_gutenberg_sc_params' );
	function trx_addons_sc_promo_gutenberg_sc_params( $vars = array() ) {

		// Return list of the image positions
		$vars['sc_promo_positions'] = trx_addons_get_list_sc_promo_positions();

		// Return list of the promo's sizes
		$vars['sc_promo_sizes'] = trx_addons_get_list_sc_promo_sizes();

		// Return list of the promo text area's widths
		$vars['sc_promo_widths'] = trx_addons_get_list_sc_promo_widths();

		return $vars;
	}
}
