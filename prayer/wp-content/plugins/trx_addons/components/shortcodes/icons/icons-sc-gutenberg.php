<?php
/**
 * Shortcode: Icons (Gutenberg support)
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
if ( ! function_exists( 'trx_addons_gutenberg_sc_icons_editor_assets' ) ) {
	add_action( 'enqueue_block_editor_assets', 'trx_addons_gutenberg_sc_icons_editor_assets' );
	function trx_addons_gutenberg_sc_icons_editor_assets() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			// Scripts
			wp_enqueue_script(
				'trx-addons-gutenberg-editor-block-icons',
				trx_addons_get_file_url( TRX_ADDONS_PLUGIN_SHORTCODES . 'icons/gutenberg/icons.gutenberg-editor.js' ),
				array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'trx_addons-admin' ),
				filemtime( trx_addons_get_file_dir( TRX_ADDONS_PLUGIN_SHORTCODES . 'icons/gutenberg/icons.gutenberg-editor.js' ) ),
				true
			);
		}
	}
}

// Block register
if ( ! function_exists( 'trx_addons_sc_icons_add_in_gutenberg' ) ) {
	add_action( 'init', 'trx_addons_sc_icons_add_in_gutenberg' );
	function trx_addons_sc_icons_add_in_gutenberg() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			register_block_type(
				'trx-addons/icons', array(
					'attributes'      => array(
						'type'               => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'align'              => array(
							'type'    => 'string',
							'default' => 'center',
						),
						'size'               => array(
							'type'    => 'string',
							'default' => 'medium',
						),
						'color'              => array(
							'type'    => 'string',
							'default' => '',
						),
						'columns'            => array(
							'type'    => 'number',
							'default' => 1,
						),
						'icons_animation'    => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'icons'              => array(
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
							'default' => esc_html__( 'Icons', 'trx_addons' ),
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
					'render_callback' => 'trx_addons_gutenberg_sc_icons_render_block',
				)
			);
		} else {
			return;
		}
	}
}

// Block render
if ( ! function_exists( 'trx_addons_gutenberg_sc_icons_render_block' ) ) {
	function trx_addons_gutenberg_sc_icons_render_block( $attributes = array() ) {
		if ( ! empty( $attributes['icons'] ) ) {
			$attributes['icons'] = json_decode( $attributes['icons'], true );
			return trx_addons_sc_icons( $attributes );
		} else {			
			return esc_html__( 'Add at least one item', 'trx_addons' );
		}
	}
}

// Return list of allowed layouts
if ( ! function_exists( 'trx_addons_gutenberg_sc_icons_get_layouts' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_layouts', 'trx_addons_gutenberg_sc_icons_get_layouts', 10, 1 );
	function trx_addons_gutenberg_sc_icons_get_layouts( $array = array() ) {
		$array['sc_icons'] = apply_filters( 'trx_addons_sc_type', trx_addons_components_get_allowed_layouts( 'sc', 'icons' ), 'trx_sc_icons' );
		return $array;
	}
}


// Add shortcode's specific lists to the JS storage
if ( ! function_exists( 'trx_addons_sc_icons_gutenberg_sc_params' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_params', 'trx_addons_sc_icons_gutenberg_sc_params' );
	function trx_addons_sc_icons_gutenberg_sc_params( $vars = array() ) {

		// Icon position
		$vars['sc_icon_positions'] = trx_addons_get_list_sc_icon_positions();
		
		// Return list of the icon's sizes
		$vars['sc_icon_sizes'] = trx_addons_get_list_sc_icon_sizes();

		return $vars;
	}
}
