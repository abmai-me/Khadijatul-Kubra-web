<?php
/**
 * ThemeREX Addons Custom post type: Services (Gutenberg support)
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.4
 */

// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}


// Gutenberg Block
//------------------------------------------------------

// Add scripts and styles for the editor
if ( ! function_exists( 'trx_addons_gutenberg_sc_services_editor_assets' ) ) {
	add_action( 'enqueue_block_editor_assets', 'trx_addons_gutenberg_sc_services_editor_assets' );
	function trx_addons_gutenberg_sc_services_editor_assets() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			// Scripts
			wp_enqueue_script(
				'trx-addons-gutenberg-editor-block-services',
				trx_addons_get_file_url( TRX_ADDONS_PLUGIN_CPT . 'services/gutenberg/services.gutenberg-editor.js' ),
				array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'trx_addons-admin' ),
				filemtime( trx_addons_get_file_dir( TRX_ADDONS_PLUGIN_CPT . 'services/gutenberg/services.gutenberg-editor.js' ) ),
				true
			);
		}
	}
}

// Block register
if ( ! function_exists( 'trx_addons_sc_services_add_in_gutenberg' ) ) {
	add_action( 'init', 'trx_addons_sc_services_add_in_gutenberg' );
	function trx_addons_sc_services_add_in_gutenberg() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			register_block_type(
				'trx-addons/services', array(
					'attributes'      => array(
						'type'               => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'tabs_effect'        => array(
							'type'    => 'string',
							'default' => 'fade',
						),
						'featured'           => array(
							'type'    => 'string',
							'default' => 'image',
						),
						'featured_position'  => array(
							'type'    => 'string',
							'default' => 'top',
						),
						'no_links'           => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'more_text'          => array(
							'type'    => 'string',
							'default' => esc_html__( 'Read more' ),
						),
						'pagination'         => array(
							'type'    => 'string',
							'default' => 'none',
						),
						'hide_excerpt'       => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'no_margin'          => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'icons_animation'    => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'hide_bg_image'      => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'popup'              => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'post_type'          => array(
							'type'    => 'string',
							'default' => TRX_ADDONS_CPT_SERVICES_PT,
						),
						'taxonomy'           => array(
							'type'    => 'string',
							'default' => TRX_ADDONS_CPT_SERVICES_TAXONOMY,
						),
						'cat'                => array(
							'type'    => 'string',
							'default' => '0',
						),
						// Query attributes
						'ids'                => array(
							'type'    => 'string',
							'default' => '',
						),
						'count'              => array(
							'type'    => 'number',
							'default' => 2,
						),
						'columns'            => array(
							'type'    => 'number',
							'default' => 2,
						),
						'offset'             => array(
							'type'    => 'number',
							'default' => 0,
						),
						'orderby'            => array(
							'type'    => 'string',
							'default' => 'none',
						),
						'order'              => array(
							'type'    => 'string',
							'default' => 'asc',
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
							'default' => esc_html__( 'Services', 'trx_addons' ),
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
					'render_callback' => 'trx_addons_gutenberg_sc_services_render_block',
				)
			);
		} else {
			return;
		}
	}
}

// Block render
if ( ! function_exists( 'trx_addons_gutenberg_sc_services_render_block' ) ) {
	function trx_addons_gutenberg_sc_services_render_block( $attributes = array() ) {
		return trx_addons_sc_services( $attributes );
	}
}

// Return list of allowed layouts
if ( ! function_exists( 'trx_addons_gutenberg_sc_services_get_layouts' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_layouts', 'trx_addons_gutenberg_sc_services_get_layouts', 10, 1 );
	function trx_addons_gutenberg_sc_services_get_layouts( $array = array() ) {
		$array['trx_sc_services'] = apply_filters( 'trx_addons_sc_type', trx_addons_components_get_allowed_layouts( 'cpt', 'services', 'sc' ), 'trx_sc_services' );

		return $array;
	}
}

// Add shortcode's specific vars to the JS storage
if ( ! function_exists( 'trx_addons_gutenberg_sc_services_params' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_params', 'trx_addons_gutenberg_sc_services_params' );
	function trx_addons_gutenberg_sc_services_params( $vars = array() ) {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {

			$vars['CPT_SERVICES_PT']       = TRX_ADDONS_CPT_SERVICES_PT;
			$vars['CPT_SERVICES_TAXONOMY'] = TRX_ADDONS_CPT_SERVICES_TAXONOMY;

			// Return list of the featured elements in services
			$vars['sc_services_featured'] = trx_addons_get_list_sc_services_featured();

			// Return list of positions of the featured element in services
			$vars['sc_services_featured_positions'] = trx_addons_get_list_sc_services_featured_positions();

			// Return list of the tabs effects in services
			$vars['sc_services_tabs_effects'] = trx_addons_get_list_sc_services_tabs_effects();

			return $vars;
		}
	}
}
