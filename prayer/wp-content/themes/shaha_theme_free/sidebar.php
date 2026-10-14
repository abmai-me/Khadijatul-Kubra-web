<?php
/**
 * The Sidebar containing the main widget areas.
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

if (shaha_sidebar_present()) {
	ob_start();
	$shaha_sidebar_name = shaha_get_theme_option('sidebar_widgets');
	shaha_storage_set('current_sidebar', 'sidebar');
	if ( is_active_sidebar($shaha_sidebar_name) ) {
		dynamic_sidebar($shaha_sidebar_name);
	}
	$shaha_out = trim(ob_get_contents());
	ob_end_clean();
	if (!empty($shaha_out)) {
		$shaha_sidebar_position = shaha_get_theme_option('sidebar_position');
		?>
		<div class="sidebar <?php echo esc_attr($shaha_sidebar_position); ?> widget_area<?php if (!shaha_is_inherit(shaha_get_theme_option('sidebar_scheme'))) echo ' scheme_'.esc_attr(shaha_get_theme_option('sidebar_scheme')); ?>" role="complementary">
			<div class="sidebar_inner">
				<?php
				do_action( 'shaha_action_before_sidebar' );
				shaha_show_layout(preg_replace("/<\/aside>[\r\n\s]*<aside/", "</aside><aside", $shaha_out));
				do_action( 'shaha_action_after_sidebar' );
				?>
			</div><!-- /.sidebar_inner -->
		</div><!-- /.sidebar -->
		<?php
	}
}
?>