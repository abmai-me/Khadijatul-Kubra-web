<?php
/**
 * Shortcode: Blogger (Gutenberg support)
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
if ( ! function_exists( 'trx_addons_gutenberg_sc_blogger_editor_assets' ) ) {
	add_action( 'enqueue_block_editor_assets', 'trx_addons_gutenberg_sc_blogger_editor_assets' );
	function trx_addons_gutenberg_sc_blogger_editor_assets() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			// Scripts
			wp_enqueue_script(
				'trx-addons-gutenberg-editor-block-blogger',
				trx_addons_get_file_url( TRX_ADDONS_PLUGIN_SHORTCODES . 'blogger/gutenberg/blogger.gutenberg-editor.js' ),
				array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'trx_addons-admin' ),
				filemtime( trx_addons_get_file_dir( TRX_ADDONS_PLUGIN_SHORTCODES . 'blogger/gutenberg/blogger.gutenberg-editor.js' ) ),
				true
			);
		}
	}
}

// Block register
if ( ! function_exists( 'trx_addons_sc_blogger_add_in_gutenberg' ) ) {
	add_action( 'init', 'trx_addons_sc_blogger_add_in_gutenberg' );
	function trx_addons_sc_blogger_add_in_gutenberg() {
		if ( trx_addons_exists_gutenberg() && trx_addons_get_setting( 'allow_gutenberg_blocks' ) ) {
			$atts = array(
						'type'               => array(
							'type'    => 'string',
							'default' => 'default',
						),
						'post_type'			=> array(
							'type'    => 'string',
							'default' => 'post',
						),
						'taxonomy'			=> array(
							'type'    => 'string',
							'default' => 'category',
						),
						'cat'				=> array(
							'type'    => 'string',
							'default' => '',
						),
						'pagination'		=> array(
							'type'    => 'string',
							'default' => 'none',
						),
						'show_filters'		=> array(
							'type'    => 'boolean',
							'default' => false,
						),
						'filters_title'		=> array(
							'type'    => 'string',
							'default' => '',
						),
						'filters_subtitle'	=> array(
							'type'    => 'string',
							'default' => '',
						),
						'filters_title_align'=> array(
							'type'    => 'string',
							'default' => 'none',
						),
						'filters_taxonomy'	=> array(
							'type'    => 'string',
							'default' => 'category',
						),
						'filters_ids'		=> array(
							'type'    => 'string',
							'default' => '',
						),
						'filters_all'		=> array(
							'type'    => 'boolean',
							'default' => true,
						),
						'filters_all_text'	=> array(
							'type'    => 'string',
							'default' => esc_html__('All','trx_addons')
						),
						'meta_parts'		=> array(
							'type'    => 'string',
							'default' => 'date,views,comments',
						),
						'image_position'	=> array(
							'type'    => 'string',
							'default' => 'top',
						),
						'image_width'	=> array(
							'type'    => 'number',
							'default' => 40,
						),
						'image_ratio'	=> array(
							'type'    => 'string',
							'default' => 'none',
						),
						'date_format'	=> array(
							'type'    => 'string',
							'default' => '',
						),
						'excerpt_length'=> array(
							'type'    => 'string',
							'default' => '',
						),
						'text_align'	=> array(
							'type'    => 'string',
							'default' => 'left',
						),
						'on_plate'		=> array(
							'type'    => 'boolean',
							'default' => false,
						),
						'numbers'		=> array(
							'type'    => 'boolean',
							'default' => false,
						),
						'hide_excerpt'	=> array(
							'type'    => 'boolean',
							'default' => false,
						),
						'no_links'		=> array(
							'type'    => 'boolean',
							'default' => false,
						),
						'more_text'		=> array(
							'type'    => 'string',
							'default' => esc_html__('Read more', 'trx_addons'),
						),
						// Query attributes
						'ids'           => array(
							'type'    => 'string',
							'default' => '',
						),
						'count'			=> array(
							'type'    => 'number',
							'default' => 2,
						),
						'columns'		=> array(
							'type'    => 'number',
							'default' => 2,
						),
						'offset'		=> array(
							'type'    => 'number',
							'default' => 0,
						),
						'orderby'				=> array(
							'type'    => 'string',
							'default' => 'none',
						),
						'order'				=> array(
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
							'default' => esc_html__( 'Blogger', 'trx_addons' ),
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
					);
			// Templates
			$layouts = apply_filters('trx_addons_sc_type', trx_addons_components_get_allowed_layouts('sc', 'blogger'), 'trx_sc_blogger' );
			$templates = trx_addons_components_get_allowed_templates('sc', 'blogger', $layouts);
			if ( is_array($templates) ) {
				foreach ($templates as $k => $v) {
					$atts['template_' . $k] = array(
						'type' => 'string',
						'default' => is_array($v) ? trx_addons_array_get_first($v) : ''
					);
				}
			}
			register_block_type(
				'trx-addons/blogger', array(
					'attributes' => $atts,
					'render_callback' => 'trx_addons_gutenberg_sc_blogger_render_block',
				)
			);
		} else {
			return;
		}
	}
}

// Block render
if ( ! function_exists( 'trx_addons_gutenberg_sc_blogger_render_block' ) ) {
	function trx_addons_gutenberg_sc_blogger_render_block( $attributes = array() ) {
		return trx_addons_sc_blogger( $attributes );
	}
}

// Return list of allowed layouts
if ( ! function_exists( 'trx_addons_gutenberg_sc_blogger_layouts' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_layouts', 'trx_addons_gutenberg_sc_blogger_layouts', 10, 1 );
	function trx_addons_gutenberg_sc_blogger_layouts( $list = array() ) {
		$list['sc_blogger'] = apply_filters('trx_addons_sc_type', trx_addons_components_get_allowed_layouts('sc', 'blogger'), 'trx_sc_blogger' );
		return $list;
	}
}

// Add shortcode-specific lists to the js vars
if ( ! function_exists( 'trx_addons_gutenberg_sc_blogger_params' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_params', 'trx_addons_gutenberg_sc_blogger_params', 10, 1 );
	function trx_addons_gutenberg_sc_blogger_params( $vars = array() ) {
		// Templates
		$layouts = apply_filters('trx_addons_sc_type', trx_addons_components_get_allowed_layouts('sc', 'blogger'), 'trx_sc_blogger' );
		$templates = trx_addons_components_get_allowed_templates('sc', 'blogger', $layouts);
		$vars['sc_blogger_templates'] = $templates;
		if ( is_array($templates) ) {
			foreach ($templates as $k => $v) {
				$options = array();
				$default = '';
				if (is_array($v)) {
					foreach($v as $k1 => $v1) {
						$options[$k1] = !empty($v1['title']) ? $v1['title'] : ucfirst( str_replace( array('_', '-'), ' ', $k1 ) );
						if (empty($default)) $default = $k1;
					}
				}
				$vars['sc_blogger_template_' . $k] = $options;
			}
		}
		$vars['sc_blogger_image_positions'] = trx_addons_get_list_sc_blogger_image_positions();
		$vars['sc_blogger_image_ratio'] = trx_addons_get_list_sc_image_ratio();
		return $vars;
	}
}
