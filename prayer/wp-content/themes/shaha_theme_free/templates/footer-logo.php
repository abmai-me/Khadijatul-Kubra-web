<?php
/**
 * The template to display the site logo in the footer
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.10
 */

// Logo
if (shaha_is_on(shaha_get_theme_option('logo_in_footer'))) {
	$shaha_logo_image = '';
	if (shaha_is_on(shaha_get_theme_option('logo_retina_enabled')) && shaha_get_retina_multiplier(2) > 1)
		$shaha_logo_image = shaha_get_theme_option( 'logo_footer_retina' );
	if (empty($shaha_logo_image)) 
		$shaha_logo_image = shaha_get_theme_option( 'logo_footer' );
	$shaha_logo_text   = get_bloginfo( 'name' );
	if (!empty($shaha_logo_image) || !empty($shaha_logo_text)) {
		?>
		<div class="footer_logo_wrap">
			<div class="footer_logo_inner">
				<?php
				if (!empty($shaha_logo_image)) {
					$shaha_attr = shaha_getimagesize($shaha_logo_image);
					echo '<a href="'.esc_url(home_url('/')).'"><img src="'.esc_url($shaha_logo_image).'" class="logo_footer_image" alt="'.esc_html(basename($shaha_logo_image)).'"'.(!empty($shaha_attr[3]) ? ' ' . wp_kses_data($shaha_attr[3]) : '').'></a>' ;
				} else if (!empty($shaha_logo_text)) {
					echo '<h1 class="logo_footer_text"><a href="'.esc_url(home_url('/')).'">' . esc_html($shaha_logo_text) . '</a></h1>';
				}
				?>
			</div>
		</div>
		<?php
	}
}
?>