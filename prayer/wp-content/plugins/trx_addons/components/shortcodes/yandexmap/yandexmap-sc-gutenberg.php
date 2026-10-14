<?php
/**
 * Shortcode: Yandex Map (Gutenberg support)
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.6.51
 */

// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}



// Gutenberg Block
//------------------------------------------------------

// Add scripts and styles for the editor
if ( ! function_exists( 'trx_addons_gutenberg_sc_yandexmap_editor_assets' ) ) {
	add_action( 'enqueue_block_editor_assets', 'trx_addons_gutenberg_sc_yandexmap_editor_assets' );
	function trx_addons_gutenberg_sc_yandexmap_editor_assets() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			// Scripts
			wp_enqueue_script(
				'trx-addons-gutenberg-editor-block-yandexmap',
				trx_addons_get_file_url( TRX_ADDONS_PLUGIN_SHORTCODES . 'yandexmap/gutenberg/yandexmap.gutenberg-editor.js' ),
				array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'trx_addons-admin' ),
				filemtime( trx_addons_get_file_dir( TRX_ADDONS_PLUGIN_SHORTCODES . 'yandexmap/gutenberg/yandexmap.gutenberg-editor.js' ) ),
				true
			);
		}
	}
}

// Block register
if ( ! function_exists( 'trx_addons_sc_yandexmap_add_in_gutenberg' ) ) {
	add_action( 'init', 'trx_addons_sc_yandexmap_add_in_gutenberg' );
	function trx_addons_sc_yandexmap_add_in_gutenberg() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			register_block_type(
				'trx-addons/yandexmap', array(
					'attributes'      => array(
						'type'               => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'style'              => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'zoom'               => array(
							'type'    => 'string',
							'default' => '16',
						),
						'center'             => array(
							'type'    => 'string',
							'default' => '',
						),
						'width'              => array(
							'type'    => 'string',
							'default' => '100%',
						),
						'height'             => array(
							'type'    => 'string',
							'default' => '350',
						),
						'cluster'            => array(
							'type'    => 'string',
							'default' => '',
						),
						'cluster_url'     	=> array(
							'type'    => 'string',
							'default' => '',
						),
						'prevent_scroll'     => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'address'            => array(
							'type'    => 'string',
							'default' => '',
						),
						'markers'            => array(
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
							'default' => esc_html__( 'Yandex Map', 'trx_addons' ),
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
					'render_callback' => 'trx_addons_gutenberg_sc_yandexmap_render_block',
				)
			);
		} else {
			return;
		}
	}
}

// Block render
if ( ! function_exists( 'trx_addons_gutenberg_sc_yandexmap_render_block' ) ) {
	function trx_addons_gutenberg_sc_yandexmap_render_block( $attributes = array() ) {
		if ( ! empty( $attributes['markers'] ) ) {
			$attributes['markers'] = json_decode( $attributes['markers'], true );
		}
		if ( ! empty( $attributes['markers'] ) || ! empty( $attributes['address'] )  ) {
			return trx_addons_sc_yandexmap( $attributes );
		} else {
			return esc_html__( 'Add at least one marker or address', 'trx_addons' );
		}
	}
}

// Return list of allowed layouts
if ( ! function_exists( 'trx_addons_gutenberg_sc_yandexmap_get_layouts' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_layouts', 'trx_addons_gutenberg_sc_yandexmap_get_layouts', 10, 1 );
	function trx_addons_gutenberg_sc_yandexmap_get_layouts( $array = array() ) {
		$array['sc_yandexmap'] = apply_filters( 'trx_addons_sc_type', trx_addons_components_get_allowed_layouts( 'sc', 'yandexmap' ), 'trx_sc_yandexmap' );
		return $array;
	}
}

// Add shortcode's specific lists to the JS storage
if ( ! function_exists( 'trx_addons_sc_yandexmap_gutenberg_sc_params' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_params', 'trx_addons_sc_yandexmap_gutenberg_sc_params' );
	function trx_addons_sc_yandexmap_gutenberg_sc_params( $vars = array() ) {
		
		// Return list of yandexmap styles
		$vars['sc_yandexmap_styles'] = trx_addons_get_list_sc_yandexmap_styles();

		return $vars;
	}
}
