<?php
/**
 * The template to display default site footer
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.10
 */

$shaha_footer_scheme =  shaha_is_inherit(shaha_get_theme_option('footer_scheme')) ? shaha_get_theme_option('color_scheme') : shaha_get_theme_option('footer_scheme');
$shaha_footer_id = str_replace('footer-custom-', '', shaha_get_theme_option("footer_style"));
if ((int) $shaha_footer_id == 0) {
	$shaha_footer_id = shaha_get_post_id(array(
												'name' => $shaha_footer_id,
												'post_type' => defined('TRX_ADDONS_CPT_LAYOUT_PT') ? TRX_ADDONS_CPT_LAYOUT_PT : 'cpt_layouts'
												)
											);
} else {
	$shaha_footer_id = apply_filters('shaha_filter_get_translated_layout', $shaha_footer_id);
}
$shaha_footer_meta = get_post_meta($shaha_footer_id, 'trx_addons_options', true);
?>
<footer class="footer_wrap footer_custom footer_custom_<?php echo esc_attr($shaha_footer_id); 
						?> footer_custom_<?php echo esc_attr(sanitize_title(get_the_title($shaha_footer_id))); 
						if (!empty($shaha_footer_meta['margin']) != '') 
							echo ' '.esc_attr(shaha_add_inline_css_class('margin-top: '.shaha_prepare_css_value($shaha_footer_meta['margin']).';'));
						?> scheme_<?php echo esc_attr($shaha_footer_scheme); 
						?>">
	<?php
    // Custom footer's layout
    do_action('shaha_action_show_layout', $shaha_footer_id);
	?>
</footer><!-- /.footer_wrap -->
