<?php
/**
 * Theme lists
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

// Disable direct call
if ( ! defined( 'ABSPATH' ) ) { exit; }



// Return numbers range
if ( !function_exists( 'shaha_get_list_range' ) ) {
	function shaha_get_list_range($from=1, $to=2, $prepend_inherit=false) {
		$list = array();
		for ($i=$from; $i<=$to; $i++)
			$list[$i] = $i;
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}



// Return styles list
if ( !function_exists( 'shaha_get_list_styles' ) ) {
	function shaha_get_list_styles($from=1, $to=2, $prepend_inherit=false) {
		$list = array();
		for ($i=$from; $i<=$to; $i++) {
			// Translators: Add number to the style name 'Style 1', 'Style 2' ...
			$list[$i] = sprintf(esc_html__('Style %d', 'shaha'), $i);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return list with 'Yes' and 'No' items
if ( !function_exists( 'shaha_get_list_yesno' ) ) {
	function shaha_get_list_yesno($prepend_inherit=false) {
		$list = array(
			"yes"	=> esc_html__("Yes", 'shaha'),
			"no"	=> esc_html__("No", 'shaha')
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return list with 'On' and 'Of' items
if ( !function_exists( 'shaha_get_list_onoff' ) ) {
	function shaha_get_list_onoff($prepend_inherit=false) {
		$list = array(
			"on"	=> esc_html__("On", 'shaha'),
			"off"	=> esc_html__("Off", 'shaha')
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return list with 'Show' and 'Hide' items
if ( !function_exists( 'shaha_get_list_showhide' ) ) {
	function shaha_get_list_showhide($prepend_inherit=false) {
		$list = array(
			"show" => esc_html__("Show", 'shaha'),
			"hide" => esc_html__("Hide", 'shaha')
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return list with 'Horizontal' and 'Vertshahal' items
if ( !function_exists( 'shaha_get_list_directions' ) ) {
	function shaha_get_list_directions($prepend_inherit=false) {
		$list = array(
			"horizontal" => esc_html__("Horizontal", 'shaha'),
			"vertshahal"   => esc_html__("Vertshahal", 'shaha')
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return list with paddings sizes
if ( !function_exists( 'shaha_get_list_paddings' ) ) {
	function shaha_get_list_paddings($prepend_inherit=false) {
		$list = apply_filters('shaha_filter_list_paddings', array(
			"none" => esc_html__("None", 'shaha'),
			"small" => esc_html__("Small", 'shaha'),
			"medium" => esc_html__("Medium", 'shaha'),
			"large" => esc_html__("Large", 'shaha')
		));
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return custom sidebars list, prepended inherit and main sidebars item (if need)
if ( !function_exists( 'shaha_get_list_sidebars' ) ) {
	function shaha_get_list_sidebars($prepend_inherit=false, $add_hide=false) {
		if (($list = shaha_storage_get('list_sidebars'))=='') {
			global $wp_registered_sidebars;
			$list = array();
			if (is_array($wp_registered_sidebars)) {
				foreach ( $wp_registered_sidebars as $k => $v ) {
					$list[$v['id']] = $v['name'];
				}
			}
			shaha_storage_set('list_sidebars', $list);
		}
		if ($add_hide) $list = shaha_array_merge(array('hide' => esc_html__("- Select widgets -", 'shaha')), $list);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return sidebars positions
if ( !function_exists( 'shaha_get_list_sidebars_positions' ) ) {
	function shaha_get_list_sidebars_positions($prepend_inherit=false) {
		$list = apply_filters('shaha_filter_list_sidebars_positions', array(
			'hide'  => esc_html__('Hide',  'shaha'),
			'left'  => esc_html__('Left',  'shaha'),
			'right' => esc_html__('Right', 'shaha')
		));
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return header/footer types
if ( !function_exists( 'shaha_get_list_header_footer_types' ) ) {
	function shaha_get_list_header_footer_types($prepend_inherit=false) {
		$list = apply_filters('shaha_filter_list_header_footer_types', array(
			'default' => esc_html__('Default', 'shaha'),
		));
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return header styles
if ( !function_exists( 'shaha_get_list_header_styles' ) ) {
	function shaha_get_list_header_styles($prepend_inherit=false) {
		static $list = false;
		if (!$list) {
			$list = apply_filters('shaha_filter_list_header_styles', array());
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return header positions
if ( !function_exists( 'shaha_get_list_header_positions' ) ) {
	function shaha_get_list_header_positions($prepend_inherit=false) {
		$list = array(
			'default' => esc_html__('Default','shaha'),
			'over' => esc_html__('Over',	'shaha'),
			'under' => esc_html__('Under',	'shaha')
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return footer styles
if ( !function_exists( 'shaha_get_list_footer_styles' ) ) {
	function shaha_get_list_footer_styles($prepend_inherit=false) {
		static $list = false;
		if (!$list) {
			$list = apply_filters('shaha_filter_list_footer_styles', array());
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return body styles list, prepended inherit
if ( !function_exists( 'shaha_get_list_body_styles' ) ) {
	function shaha_get_list_body_styles($prepend_inherit=false) {
		$list = apply_filters('shaha_filter_list_body_styles', array(
			'boxed'		=> esc_html__('Boxed',		'shaha'),
			'wide'		=> esc_html__('Wide',		'shaha'),
			'fullwide'	=> esc_html__('Fullwide',	'shaha'),
			'fullscreen'=> esc_html__('Fullscreen',	'shaha')
			)
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return blog styles list, prepended inherit
if ( !function_exists( 'shaha_get_list_blog_styles' ) ) {
	function shaha_get_list_blog_styles($prepend_inherit=false) {
		$list = apply_filters('shaha_filter_list_blog_styles', array(
			'excerpt'	  => esc_html__('Default',				'shaha'),
			'classic_2'	  => esc_html__('Classic /2 columns/',	'shaha'),
			'classic_3'	  => esc_html__('Classic /3 columns/',	'shaha'),
			'masonry_2'	  => esc_html__('Masonry /2 columns/',	'shaha'),
			'masonry_3'	  => esc_html__('Masonry /3 columns/',	'shaha'),
			'portfolio_2' => esc_html__('Portfolio /2 columns/','shaha'),
			'portfolio_3' => esc_html__('Portfolio /3 columns/','shaha'),
			'portfolio_4' => esc_html__('Portfolio /4 columns/','shaha'),
			'gallery_2'   => esc_html__('Gallery /2 columns/',	'shaha'),
			'gallery_3'   => esc_html__('Gallery /3 columns/',	'shaha'),
			'gallery_4'   => esc_html__('Gallery /4 columns/',	'shaha'),
			'chess_1'	  => esc_html__('Chess /2 column/',		'shaha'),
			'chess_2'	  => esc_html__('Chess /4 columns/',	'shaha'),
			'chess_3'	  => esc_html__('Chess /6 columns/',	'shaha')
			)
		);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}


// Return list of categories
if ( !function_exists( 'shaha_get_list_categories' ) ) {
	function shaha_get_list_categories($prepend_inherit=false) {
		if (($list = shaha_storage_get('list_categories'))=='') {
			$list = array();
			$taxonomies = get_categories( array(
											'type' => 'post',
											'orderby' => 'name',
											'order' => 'ASC',
											'hide_empty' => 0,
											'hierarchshahal' => 1,
											'taxonomy' => 'category',
											'pad_counts' => false
											)
										);
			if (is_array($taxonomies) && count($taxonomies) > 0) {
				foreach ($taxonomies as $cat) {
					$list[$cat->term_id] = $cat->name;
				}
			}
			shaha_storage_set('list_categories', $list);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}


// Return list of taxonomies
if ( !function_exists( 'shaha_get_list_terms' ) ) {
	function shaha_get_list_terms($prepend_inherit=false, $taxonomy='category') {
		if (($list = shaha_storage_get('list_taxonomies_'.($taxonomy)))=='') {
			$list = array();
			$taxonomies = get_terms( $taxonomy, array(
													'orderby' => 'name',
													'order' => 'ASC',
													'hide_empty' => 0,
													'hierarchshahal' => 1,
													'taxonomy' => $taxonomy,
													'pad_counts' => false 
													)
									);
			if (is_array($taxonomies) && count($taxonomies) > 0) {
				foreach ($taxonomies as $cat) {
					$list[$cat->term_id] = $cat->name;
				}
			}
			shaha_storage_set('list_taxonomies_'.($taxonomy), $list);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return list of post's types
if ( !function_exists( 'shaha_get_list_posts_types' ) ) {
	function shaha_get_list_posts_types($prepend_inherit=false) {
		if (($list = shaha_storage_get('list_posts_types'))=='') {
			$list = apply_filters('shaha_filter_list_posts_types', array(
				'post' => esc_html__('Post', 'shaha')
			));
			shaha_storage_set('list_posts_types', $list);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}


// Return list post items from any post type and taxonomy
if ( !function_exists( 'shaha_get_list_posts' ) ) {
	function shaha_get_list_posts($prepend_inherit=false, $opt=array()) {
		$opt = array_merge(array(
			'post_type'			=> 'post',
			'post_status'		=> 'publish',
			'post_parent'		=> '',
			'taxonomy'			=> 'category',
			'taxonomy_value'	=> '',
			'meta_key'			=> '',
			'meta_value'		=> '',
			'meta_compare'		=> '',
			'posts_per_page'	=> -1,
			'orderby'			=> 'post_date',
			'order'				=> 'desc',
			'not_selected'		=> true,
			'return'			=> 'id'
			), is_array($opt) ? $opt : array('post_type'=>$opt));

		$hash = 'list_posts'
				. '_' . (is_array($opt['post_type']) ? join('_', $opt['post_type']) : $opt['post_type'])
				. '_' . (is_array($opt['post_parent']) ? join('_', $opt['post_parent']) : $opt['post_parent'])
				. '_' . ($opt['taxonomy'])
				. '_' . (is_array($opt['taxonomy_value']) ? join('_', $opt['taxonomy_value']) : $opt['taxonomy_value'])
				. '_' . ($opt['meta_key'])
				. '_' . ($opt['meta_compare'])
				. '_' . ($opt['meta_value'])
				. '_' . ($opt['orderby'])
				. '_' . ($opt['order'])
				. '_' . ($opt['return'])
				. '_' . ($opt['posts_per_page']);
		if (($list = shaha_storage_get($hash))=='') {
			$list = array();
			if ($opt['not_selected']!==false) $list['none'] = $opt['not_selected']===true 
																				? esc_html__("- Not selected -", 'shaha')
																				: $opt['not_selected'];
			$args = array(
				'post_type' => $opt['post_type'],
				'post_status' => $opt['post_status'],
				'posts_per_page' => $opt['posts_per_page'],
				'ignore_sticky_posts' => true,
				'orderby'	=> $opt['orderby'],
				'order'		=> $opt['order']
			);
			if (!empty($opt['post_parent'])) {
				if (is_array($opt['post_parent']))
					$args['post_parent__in'] = $opt['post_parent'];
				else
					$args['post_parent'] = $opt['post_parent'];
			}
			if (!empty($opt['taxonomy_value'])) {
				$args['tax_query'] = array(
					array(
						'taxonomy' => $opt['taxonomy'],
						'field' => is_array($opt['taxonomy_value']) 
										? ((int) $opt['taxonomy_value'][0] > 0  ? 'term_taxonomy_id' : 'slug')
										: ((int) $opt['taxonomy_value'] > 0  ? 'term_taxonomy_id' : 'slug'),
						'terms' => is_array($opt['taxonomy_value'])
										? $opt['taxonomy_value'] 
										: ((int) $opt['taxonomy_value'] > 0 ? (int) $opt['taxonomy_value'] : $opt['taxonomy_value'] ) 
					)
				);
			}
			if (!empty($opt['meta_key'])) {
				$args['meta_key'] = $opt['meta_key'];
			}
			if (!empty($opt['meta_value'])) {
				$args['meta_value'] = $opt['meta_value'];
			}
			if (!empty($opt['meta_compare'])) {
				$args['meta_compare'] = $opt['meta_compare'];
			}
			$posts = get_posts( $args );
			if (is_array($posts) && count($posts) > 0) {
				foreach ($posts as $post) {
					$list[$opt['return']=='id' ? $post->ID : $post->post_title] = $post->post_title;
				}
			}
			shaha_storage_set($hash, $list);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}


// Return list of registered users
if ( !function_exists( 'shaha_get_list_users' ) ) {
	function shaha_get_list_users($prepend_inherit=false, $roles=array('administrator', 'editor', 'author', 'contributor', 'shop_manager')) {
		if (($list = shaha_storage_get('list_users'))=='') {
			$list = array();
			$list['none'] = esc_html__("- Not selected -", 'shaha');
			$users = get_users( array(
									'orderby' => 'display_name',
									'order' => 'ASC'
									)
								);
			if (is_array($users) && count($users) > 0) {
				foreach ($users as $user) {
					$accept = true;
					if (is_array($user->roles)) {
						if (is_array($user->roles) && count($user->roles) > 0) {
							$accept = false;
							foreach ($user->roles as $role) {
								if (in_array($role, $roles)) {
									$accept = true;
									break;
								}
							}
						}
					}
					if ($accept) $list[$user->user_login] = $user->display_name;
				}
			}
			shaha_storage_set('list_users', $list);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return menus list, prepended inherit
if ( !function_exists( 'shaha_get_list_menus' ) ) {
	function shaha_get_list_menus($prepend_inherit=false) {
		if (($list = shaha_storage_get('list_menus'))=='') {
			$list = array();
			$list['default'] = esc_html__("Default", 'shaha');
			$menus = wp_get_nav_menus();
			if (is_array($menus) && count($menus) > 0) {
				foreach ($menus as $menu) {
					$list[$menu->slug] = $menu->name;
				}
			}
			shaha_storage_set('list_menus', $list);
		}
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return iconed classes list
if ( !function_exists( 'shaha_get_list_icons' ) ) {
	function shaha_get_list_icons($prepend_inherit=false) {
		static $list = false;
		if (!is_array($list)) 
			$list = !is_admin() ? array() : shaha_parse_icons_classes(shaha_get_file_dir("css/font-icons/css/fontello-codes.css"));
		$list = shaha_array_merge(array('none' => 'none'), $list);
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}

// Return images list
if ( !function_exists( 'shaha_get_list_images' ) ) {
	function shaha_get_list_images($prepend_inherit=false) {
		$list = function_exists('trx_addons_get_list_files')
				? trx_addons_get_list_files('css/icons.png', 'png')
				: array();
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}


// Additional attributes for VC and SOW
//----------------------------------------------------
if ( !function_exists( 'shaha_get_list_sc_color_styles' ) ) {
	function shaha_get_list_sc_color_styles($prepend_inherit=false) {
		$list = apply_filters('shaha_filter_get_list_sc_color_styles', array(
			'default' => esc_html__('Default', 'shaha'),
			'link2' => esc_html__('Link 2', 'shaha'),
			'link3' => esc_html__('Link 3', 'shaha'),
			'dark' => esc_html__('Dark', 'shaha')
		));
		return $prepend_inherit ? shaha_array_merge(array('inherit' => esc_html__("Inherit", 'shaha')), $list) : $list;
	}
}
?>