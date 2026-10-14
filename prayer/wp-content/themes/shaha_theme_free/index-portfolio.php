<?php
/**
 * The template for homepage posts with "Portfolio" style
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

shaha_storage_set('blog_archive', true);

get_header(); 

if (have_posts()) {

	shaha_show_layout(get_query_var('blog_archive_start'));

	$shaha_stickies = is_home() ? get_option( 'sticky_posts' ) : false;
	$shaha_sticky_out = shaha_get_theme_option('sticky_style')=='columns' 
							&& is_array($shaha_stickies) && count($shaha_stickies) > 0 && get_query_var( 'paged' ) < 1;
	
	// Show filters
	$shaha_cat = shaha_get_theme_option('parent_cat');
	$shaha_post_type = shaha_get_theme_option('post_type');
	$shaha_taxonomy = shaha_get_post_type_taxonomy($shaha_post_type);
	$shaha_show_filters = shaha_get_theme_option('show_filters');
	$shaha_tabs = array();
	if (!shaha_is_off($shaha_show_filters)) {
		$shaha_args = array(
			'type'			=> $shaha_post_type,
			'child_of'		=> $shaha_cat,
			'orderby'		=> 'name',
			'order'			=> 'ASC',
			'hide_empty'	=> 1,
			'hierarchshahal'	=> 0,
			'exclude'		=> '',
			'include'		=> '',
			'number'		=> '',
			'taxonomy'		=> $shaha_taxonomy,
			'pad_counts'	=> false
		);
		$shaha_portfolio_list = get_terms($shaha_args);
		if (is_array($shaha_portfolio_list) && count($shaha_portfolio_list) > 0) {
			$shaha_tabs[$shaha_cat] = esc_html__('All', 'shaha');
			foreach ($shaha_portfolio_list as $shaha_term) {
				if (isset($shaha_term->term_id)) $shaha_tabs[$shaha_term->term_id] = $shaha_term->name;
			}
		}
	}
	if (count($shaha_tabs) > 0) {
		$shaha_portfolio_filters_ajax = true;
		$shaha_portfolio_filters_active = $shaha_cat;
		$shaha_portfolio_filters_id = 'portfolio_filters';
		if (!is_customize_preview())
			wp_enqueue_script('jquery-ui-tabs', false, array('jquery', 'jquery-ui-core'), null, true);
		?>
		<div class="portfolio_filters shaha_tabs shaha_tabs_ajax">
			<ul class="portfolio_titles shaha_tabs_titles">
				<?php
				foreach ($shaha_tabs as $shaha_id=>$shaha_title) {
					?><li><a href="<?php echo esc_url(shaha_get_hash_link(sprintf('#%s_%s_content', $shaha_portfolio_filters_id, $shaha_id))); ?>" data-tab="<?php echo esc_attr($shaha_id); ?>"><?php echo esc_html($shaha_title); ?></a></li><?php
				}
				?>
			</ul>
			<?php
			$shaha_ppp = shaha_get_theme_option('posts_per_page');
			if (shaha_is_inherit($shaha_ppp)) $shaha_ppp = '';
			foreach ($shaha_tabs as $shaha_id=>$shaha_title) {
				$shaha_portfolio_need_content = $shaha_id==$shaha_portfolio_filters_active || !$shaha_portfolio_filters_ajax;
				?>
				<div id="<?php echo esc_attr(sprintf('%s_%s_content', $shaha_portfolio_filters_id, $shaha_id)); ?>"
					class="portfolio_content shaha_tabs_content"
					data-blog-template="<?php echo esc_attr(shaha_storage_get('blog_template')); ?>"
					data-blog-style="<?php echo esc_attr(shaha_get_theme_option('blog_style')); ?>"
					data-posts-per-page="<?php echo esc_attr($shaha_ppp); ?>"
					data-post-type="<?php echo esc_attr($shaha_post_type); ?>"
					data-taxonomy="<?php echo esc_attr($shaha_taxonomy); ?>"
					data-cat="<?php echo esc_attr($shaha_id); ?>"
					data-parent-cat="<?php echo esc_attr($shaha_cat); ?>"
					data-need-content="<?php echo (false===$shaha_portfolio_need_content ? 'true' : 'false'); ?>"
				>
					<?php
					if ($shaha_portfolio_need_content) 
						shaha_show_portfolio_posts(array(
							'cat' => $shaha_id,
							'parent_cat' => $shaha_cat,
							'taxonomy' => $shaha_taxonomy,
							'post_type' => $shaha_post_type,
							'page' => 1,
							'sticky' => $shaha_sticky_out
							)
						);
					?>
				</div>
				<?php
			}
			?>
		</div>
		<?php
	} else {
		shaha_show_portfolio_posts(array(
			'cat' => $shaha_cat,
			'parent_cat' => $shaha_cat,
			'taxonomy' => $shaha_taxonomy,
			'post_type' => $shaha_post_type,
			'page' => 1,
			'sticky' => $shaha_sticky_out
			)
		);
	}

	shaha_show_layout(get_query_var('blog_archive_end'));

} else {

	if ( is_search() )
		get_template_part( 'content', 'none-search' );
	else
		get_template_part( 'content', 'none-archive' );

}

get_footer();
?>