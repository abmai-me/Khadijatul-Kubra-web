<?php
/**
 * The Front Page template file.
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.31
 */

get_header();

// If front-page is a static page
if (get_option('show_on_front') == 'page') {

	// If Front Page Builder is enabled - display sections
	if (shaha_is_on(shaha_get_theme_option('front_page_enabled'))) {

		if ( have_posts() ) the_post();

		$shaha_sections = shaha_array_get_keys_by_value(shaha_get_theme_option('front_page_sections'), 1, false);
		if (is_array($shaha_sections)) {
			foreach ($shaha_sections as $shaha_section) {
				get_template_part("front-page/section", $shaha_section);
			}
		}
	
	// Else if this page is blog archive
	} else if (is_page_template('blog.php')) {
		get_template_part('blog');

	// Else - display native page content
	} else {
		get_template_part('page');
	}

// Else get index template to show posts
} else {
	get_template_part('index');
}

get_footer();
?>