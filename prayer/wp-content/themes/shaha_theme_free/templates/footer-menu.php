<?php
/**
 * The template to display menu in the footer
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.10
 */

// Footer menu
$shaha_menu_footer = shaha_get_nav_menu(array(
											'location' => 'menu_footer',
											'class' => 'sc_layouts_menu sc_layouts_menu_default'
											));
if (!empty($shaha_menu_footer)) {
	?>
	<div class="footer_menu_wrap">
		<div class="footer_menu_inner">
			<?php shaha_show_layout($shaha_menu_footer); ?>
		</div>
	</div>
	<?php
}
?>