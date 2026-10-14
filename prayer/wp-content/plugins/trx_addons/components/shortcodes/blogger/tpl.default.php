<?php
/**
 * The style "default" of the Blogger
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.2
 */

$args = get_query_var('trx_addons_args_sc_blogger');

$templates = trx_addons_components_get_allowed_templates('sc', 'blogger');
$template  = $templates[$args['type']][$args['template_'.$args['type']]];

$query_args = array(
// Attention! Parameter 'suppress_filters' is damage WPML-queries!
//	'suppress_filters' => true,
	'post_status' => 'publish',
	'ignore_sticky_posts' => true
);

// Posts per page
if (empty($args['ids'])) {
	$query_args['posts_per_page'] = $args['count'];
	if ( !trx_addons_is_off($args['pagination']) && $args['page'] > 1 ) {
		$query_args['paged'] = $args['page'];
	} else {
		$query_args['offset'] = $args['offset'];
	}
}

// Post type
$query_args = trx_addons_query_add_posts_and_cats($query_args, $args['ids'], $args['post_type']);

// Sort order
$query_args = trx_addons_query_add_sort_order($query_args, $args['orderby'], $args['order']);

// Filters
$tabs = trx_addons_sc_get_filters_tabs('sc_blogger', $args);
if (count($tabs) > 0 && !empty($args['filters_active']) && $args['filters_active'] != 'all') {
	$query_args = trx_addons_query_add_posts_and_cats($query_args, '', '', $args['filters_active'], $args['filters_taxonomy']);
} else {
	$query_args = trx_addons_query_add_posts_and_cats($query_args, '', '', $args['cat'], $args['taxonomy']);
}

// Get posts
$query = new WP_Query( $query_args );
if ( $query->found_posts > 0 || count($tabs) > 0 ) {
	$posts_count = ($args['count'] > $query->found_posts) ? $query->found_posts : $args['count'];
	if ($args['columns'] < 1) $args['columns'] = $posts_count;
	//$args['columns'] = min($args['columns'], $posts_count);
	$args['columns'] = max(1, min(12, (int) $args['columns']));
	$args['slider'] = $args['slider'] > 0 && $posts_count > $args['columns'];
	$args['slides_space'] = max(0, (int) $args['slides_space']);
	if (empty($args['template_' . $args['type']])) {
		$args['template_' . $args['type']] = 'default';
	}
	?><div <?php if (!empty($args['id'])) echo ' id="'.esc_attr($args['id']).'"'; ?>
		class="sc_blogger sc_blogger_<?php
			echo esc_attr($args['type']);
			echo ' sc_blogger_' . esc_attr($args['type']) . '_' . esc_attr($args['template_' . $args['type']]);
			if (in_array($args['type'], array('default', 'list'))) {
				if ( isset($template['layout']['featured'] ) ) {
					echo ' sc_blogger_with_image';
				}
				echo ' sc_blogger_image_position_' . esc_attr($args['image_position'])
					. ( (int) $args['on_plate'] > 0 ? ' sc_blogger_on_plate' : '' );
				if ( ! empty($args['numbers'] ) ) {
					echo ' sc_blogger_with_numbers';
				}
			}
			if ( ! empty($args['class']) ) echo ' '.esc_attr($args['class']); 
			?>"<?php
		if (!empty($args['css'])) echo ' style="'.esc_attr($args['css']).'"';
		?>><?php

		// Show titles
		trx_addons_sc_show_titles('sc_blogger', $args);
		
		// Show filters
		trx_addons_sc_show_filters('sc_blogger', $args, $tabs);

		// Shortcode's wrapper
		if ($args['slider']) {
			$args['slides_min_width'] = $args['type']=='wide' ? 390 : 220;
			trx_addons_sc_show_slider_wrap_start('sc_blogger', $args);
		} else if ($args['columns'] > 1 && empty($args['posts_container'])) {
			if ($args['image_ratio'] == 'masonry') {
				do_action( 'trx_addons_action_load_masonry_scripts' );
				?><div class="sc_blogger_masonry_wrap sc_item_masonry sc_item_posts_container masonry_wrap masonry_<?php echo esc_attr($args['columns']); ?>"><?php
			} else {
				?><div class="sc_blogger_columns_wrap sc_item_columns sc_item_posts_container <?php echo esc_attr(trx_addons_get_columns_wrap_class()) . ($args['type']!='plain' ? ' columns_padding_bottom' : ''); ?>"><?php
			}
		} else {
			?><div class="sc_blogger_content sc_item_content sc_item_posts_container<?php if (!empty($args['posts_container'])) echo ' '.esc_attr($args['posts_container']); ?>"><?php
		}	
		$args['item_number'] = 0;
		while ( $query->have_posts() ) { $query->the_post();
			$args['item_number']++;
			if (!apply_filters('trx_addons_filter_sc_blogger_template', false, $args)) {
				trx_addons_get_template_part(array(
											TRX_ADDONS_PLUGIN_SHORTCODES . 'blogger/tpl.'.trx_addons_esc($args['type']).'-item.php',
											TRX_ADDONS_PLUGIN_SHORTCODES . 'blogger/tpl.default-item.php'
											),
											'trx_addons_args_sc_blogger', 
											$args
										);
			}
		}

		wp_reset_postdata();
	
		?></div><?php

		if ($args['slider']) {
			trx_addons_sc_show_slider_wrap_end('sc_blogger', $args);
		}

		trx_addons_sc_show_pagination('sc_blogger', $args, $query);

		trx_addons_sc_show_links('sc_blogger', $args);

	?></div><?php
}
