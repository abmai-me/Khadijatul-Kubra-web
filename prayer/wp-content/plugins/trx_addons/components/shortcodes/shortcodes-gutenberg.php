<?php
/**
 * ThemeREX Shortcodes: Gutenberg support
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.6.52
 */


// Don't load directly
if ( ! defined( 'TRX_ADDONS_VERSION' ) ) {
	die( '-1' );
}


// Gutenberg Support
//------------------------------------------------------

// Add common shortcode's specific lists to the JS storage
if ( ! function_exists( 'trx_addons_gutenberg_sc_params' ) ) {
	add_filter( 'trx_addons_filter_gutenberg_sc_params', 'trx_addons_gutenberg_sc_params' );
	function trx_addons_gutenberg_sc_params( $vars = array() ) {
		// Return iconed classes list
		$list_icons            = trx_addons_get_list_icons_classes();
		$vars['icons_classes'] = array();
		if ( ! empty( $list_icons ) ) {
			foreach ( $list_icons as $x => $y ) {
				$vars['icons_classes'][] = $y;
			}
		}

		// Return list of the element positions
		$vars['sc_positions'] = trx_addons_get_list_sc_positions();

		// Return list of the title align
		$vars['sc_aligns'] = trx_addons_get_list_sc_aligns();

		// Return shortlist of the title align
		$vars['sc_aligns_short'] = trx_addons_get_list_sc_aligns(false, false);

		// Return list of the subtitle positions
		$vars['sc_subtitle_positions'] = trx_addons_get_list_sc_subtitle_positions();

		// Return list of the orderby options for CPT shortcodes
		$vars['sc_query_orderby'] = trx_addons_get_list_sc_query_orderby();

		// Return list of the order options
		$vars['sc_query_orders'] = trx_addons_get_list_sc_query_orders();

		// Return list of the slider pagination positions
		$vars['sc_paginations'] = trx_addons_get_list_sc_paginations();

		// Return list of post's types
		$vars['posts_types'] = trx_addons_get_list_posts_types();

		// Return list of taxonomies
		$vars['taxonomies'] = array();
		foreach ( $vars['posts_types'] as $key => $value ) {
			$vars['taxonomies'][ $key ] = trx_addons_get_list_taxonomies( false, $key );
		}

		// Return list of categories
		$vars['categories'] = array();
//		$vars['categories']['category'] = trx_addons_get_list_categories();
		foreach ( $vars['posts_types'] as $key => $value ) {
			$taxonomies = trx_addons_get_list_taxonomies( false, $key );
			foreach ( $taxonomies as $x => $y ) {
				//$vars['categories'][ $x ] = trx_addons_get_list_terms( false, $x );
				$tax_obj = get_taxonomy($x);
				$vars['categories'][ $x ] = trx_addons_array_merge(
												array( 0 => sprintf(__('- %s -', 'trx_addons'), $tax_obj->label)),
												$x == 'category' 
													? trx_addons_get_list_categories() 
													: trx_addons_get_list_terms(false, $x)
											);
			}
		}

		// Return list of categories
		$vars['list_categories'] = trx_addons_array_merge( array( 0 => esc_html__( '- Select category -', 'trx_addons' ) ), trx_addons_get_list_categories() );

		// List of meta parts
		$vars['meta_parts'] = apply_filters('trx_addons_filter_get_list_meta_parts', array());

		// Prepare list of pages
		$vars['list_pages'] = trx_addons_get_list_posts(
			false, array(
				'post_type'    => 'page',
				'not_selected' => false,
			)
		);

		// Return input hover effects
		$vars['input_hover'] = trx_addons_get_list_input_hover( true );

		// Return all thumbnails sizes
		$vars['thumbnail_sizes'] = trx_addons_get_list_thumbnail_sizes();

		// Return all meta parts
		$vars['meta_parts'] = apply_filters('trx_addons_filter_get_list_meta_parts', array());

		// Return list of the directions
		$vars['sc_directions'] = trx_addons_get_list_sc_directions();

		// Return list of the enter animations
		$vars['animations_in'] = trx_addons_get_list_animations_in();

		// Return list of the out animations
		$vars['animations_out'] = trx_addons_get_list_animations_out();

		return $vars;
	}
}
