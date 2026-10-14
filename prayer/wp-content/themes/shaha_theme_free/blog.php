<?php
/**
 * The template to display blog archive
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

/*
Template Name: Blog archive
*/

/**
 * Make page with this template and put it into menu
 * to display posts as blog archive
 * You can setup output parameters (blog style, posts per page, parent category, etc.)
 * in the Theme Options section (under the page content)
 * You can build this page in the WordPress editor or any Page Builder to make custom page layout:
 * just insert %%CONTENT%% in the desired place of content
 */

// Get template page's content
$shaha_content = '';
$shaha_blog_archive_mask = '%%CONTENT%%';
$shaha_blog_archive_subst = sprintf('<div class="blog_archive">%s</div>', $shaha_blog_archive_mask);
if ( have_posts() ) {
	the_post();
	if (($shaha_content = apply_filters('the_content', get_the_content())) != '') {
		if (($shaha_pos = strpos($shaha_content, $shaha_blog_archive_mask)) !== false) {
			$shaha_content = preg_replace('/(\<p\>\s*)?'.$shaha_blog_archive_mask.'(\s*\<\/p\>)/i', $shaha_blog_archive_subst, $shaha_content);
		} else
			$shaha_content .= $shaha_blog_archive_subst;
		$shaha_content = explode($shaha_blog_archive_mask, $shaha_content);
		// Add VC custom styles to the inline CSS
		$vc_custom_css = get_post_meta( get_the_ID(), '_wpb_shortcodes_custom_css', true );
		if ( !empty( $vc_custom_css ) ) shaha_add_inline_css(strip_tags($vc_custom_css));
	}
}

// Prepare args for a new query
$shaha_args = array(
	'post_status' => current_user_can('read_private_pages') && current_user_can('read_private_posts') ? array('publish', 'private') : 'publish'
);
$shaha_args = shaha_query_add_posts_and_cats($shaha_args, '', shaha_get_theme_option('post_type'), shaha_get_theme_option('parent_cat'));
$shaha_page_number = get_query_var('paged') ? get_query_var('paged') : (get_query_var('page') ? get_query_var('page') : 1);
if ($shaha_page_number > 1) {
	$shaha_args['paged'] = $shaha_page_number;
	$shaha_args['ignore_sticky_posts'] = true;
}
$shaha_ppp = shaha_get_theme_option('posts_per_page');
if ((int) $shaha_ppp != 0)
	$shaha_args['posts_per_page'] = (int) $shaha_ppp;
// Make a new main query
$GLOBALS['wp_the_query']->query($shaha_args);


// Add internal query vars in the new query!
if (is_array($shaha_content) && count($shaha_content) == 2) {
	set_query_var('blog_archive_start', $shaha_content[0]);
	set_query_var('blog_archive_end', $shaha_content[1]);
}

get_template_part('index');
?>