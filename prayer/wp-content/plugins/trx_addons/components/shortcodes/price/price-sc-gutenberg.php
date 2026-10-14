<?php
/**
 * Shortcode: Price block (Gutenberg support)
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
if ( ! function_exists( 'trx_addons_gutenberg_sc_price_editor_assets' ) ) {
	add_action( 'enqueue_block_editor_assets', 'trx_addons_gutenberg_sc_price_editor_assets' );
	function trx_addons_gutenberg_sc_price_editor_assets() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			// Scripts
			wp_enqueue_script(
				'trx-addons-gutenberg-editor-block-price',
				trx_addons_get_file_url( TRX_ADDONS_PLUGIN_SHORTCODES . 'price/gutenberg/price.gutenberg-editor.js' ),
				array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'trx_addons-admin' ),
				filemtime( trx_addons_get_file_dir( TRX_ADDONS_PLUGIN_SHORTCODES . 'price/gutenberg/price.gutenberg-editor.js' ) ),
				true
			);
		}
	}
}

// Block register
if ( ! function_exists( 'trx_addons_sc_price_add_in_gutenberg' ) ) {
	add_action( 'init', 'trx_addons_sc_price_add_in_gutenberg' );
	function trx_addons_sc_price_add_in_gutenberg() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			register_block_type(
				'trx-addons/price', array(
					'attributes'      => array(
						'type'               => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'columns'            => array(
							'type'    => 'number',
							'default' => 1,
						),
						'prices'            => array(
							'type'    => 'string',
							'default' => '',
						),
						// Slider attributes
						'slider'             => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'slides_space'       => array(
							'type'    => 'number',
							'default' => 0,
						),
						'slides_centered'    => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'slides_overflow'    => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'slider_mouse_wheel' => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'slider_autoplay'    => array(
							'type'    => 'boolean',
							'default' => true,
						),
						'slider_controls'    => array(
							'type'    => 'string',
							'default' => 'none',
						),
						'slider_pagination'  => array(
							'type'    => 'string',
							'default' => 'none',
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
							'default' => esc_html__( 'Price', 'trx_addons' ),
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
						// Rerender
						'reload'             => array(
							'type'    => 'string',
							'default' => '',
						),
					),
					'render_callback' => 'trx_addons_gutenberg_sc_price_render_block',
				)
			);
		} else {
			return;
		}
	}
}

// Block render
if ( ! function_exists( 'trx_addons_gutenberg_sc_price_render_block' ) ) {
	function trx_addons_gutenberg_sc_price_render_block( $attributes = array() ) {
		if ( ! empty( $attributes['prices'] ) ) {
			$attributes['prices'] = json_decode( $attributes['prices'], true );
			return trx_addons_sc_price( $attributes );
		} else {
			return esc_html__( 'Add at least one item', 'trx_addons' );
		}
	}
}

// Return list of allowed layouts
if ( ! function_exists( 'trx_addons_gutenberg_sc_price_get_layouts' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_layouts', 'trx_addons_gutenberg_sc_price_get_layouts', 10, 1 );
	function trx_addons_gutenberg_sc_price_get_layouts( $array = array() ) {
		$array['sc_price'] = apply_filters( 'trx_addons_sc_type', trx_addons_components_get_allowed_layouts( 'sc', 'price' ), 'trx_sc_price' );
		return $array;
	}
}
