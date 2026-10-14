<?php
/**
 * The template to display the logo or the site name and the slogan in the Header
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

$shaha_args = get_query_var('shaha_logo_args');

// Site logo
$shaha_logo_type   = isset($shaha_args['type']) ? $shaha_args['type'] : '';
$shaha_logo_image  = shaha_get_logo_image($shaha_logo_type);
$shaha_logo_text   = shaha_is_on(shaha_get_theme_option('logo_text')) ? get_bloginfo( 'name' ) : '';
$shaha_logo_slogan = get_bloginfo( 'description', 'display' );
if (!empty($shaha_logo_image) || !empty($shaha_logo_text)) {
	?><a class="sc_layouts_logo" href="<?php echo is_front_page() ? '#' : esc_url(home_url('/')); ?>"><?php
		if (!empty($shaha_logo_image)) {
			if (empty($shaha_logo_type) && function_exists('the_custom_logo') && (int) $shaha_logo_image > 0) {
				the_custom_logo();
			} else {
				$shaha_attr = shaha_getimagesize($shaha_logo_image);
				echo '<img src="'.esc_url($shaha_logo_image).'" alt="'.esc_html(basename($shaha_logo_image)).'"'.(!empty($shaha_attr[3]) ? ' '.wp_kses_data($shaha_attr[3]) : '').'>';
			}
		} else {
			shaha_show_layout(shaha_prepare_macros($shaha_logo_text), '<span class="logo_text">', '</span>');
			shaha_show_layout(shaha_prepare_macros($shaha_logo_slogan), '<span class="logo_slogan">', '</span>');
		}
	?></a><?php
}
?>