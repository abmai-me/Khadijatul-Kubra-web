<?php
/**
 * The template to display the socials in the footer
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.10
 */


// Socials
if ( shaha_is_on(shaha_get_theme_option('socials_in_footer')) && ($shaha_output = shaha_get_socials_links()) != '') {
	?>
	<div class="footer_socials_wrap socials_wrap">
		<div class="footer_socials_inner">
			<?php shaha_show_layout($shaha_output); ?>
		</div>
	</div>
	<?php
}
?>