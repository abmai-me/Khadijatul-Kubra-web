<?php
/**
 * The template to display the widgets area in the footer
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.10
 */

// Footer sidebar
$shaha_footer_name = shaha_get_theme_option('footer_widgets');
$shaha_footer_present = !shaha_is_off($shaha_footer_name) && is_active_sidebar($shaha_footer_name);
if ($shaha_footer_present) { 
	shaha_storage_set('current_sidebar', 'footer');
	$shaha_footer_wide = shaha_get_theme_option('footer_wide');
	ob_start();
	if ( is_active_sidebar($shaha_footer_name) ) {
		dynamic_sidebar($shaha_footer_name);
	}
	$shaha_out = trim(ob_get_contents());
	ob_end_clean();
	if (!empty($shaha_out)) {
		$shaha_out = preg_replace("/<\\/aside>[\r\n\s]*<aside/", "</aside><aside", $shaha_out);
		$shaha_need_columns = true;
		if ($shaha_need_columns) {
			$shaha_columns = max(0, (int) shaha_get_theme_option('footer_columns'));
			if ($shaha_columns == 0) $shaha_columns = min(4, max(1, substr_count($shaha_out, '<aside ')));
			if ($shaha_columns > 1)
				$shaha_out = preg_replace("/class=\"widget /", "class=\"column-1_".esc_attr($shaha_columns).' widget ', $shaha_out);
			else
				$shaha_need_columns = false;
		}
		?>
		<div class="footer_widgets_wrap widget_area<?php echo !empty($shaha_footer_wide) ? ' footer_fullwidth' : ''; ?> sc_layouts_row  sc_layouts_row_type_normal">
			<div class="footer_widgets_inner widget_area_inner">
				<?php 
				if (!$shaha_footer_wide) { 
					?><div class="content_wrap"><?php
				}
				if ($shaha_need_columns) {
					?><div class="columns_wrap"><?php
				}
				do_action( 'shaha_action_before_sidebar' );
				shaha_show_layout($shaha_out);
				do_action( 'shaha_action_after_sidebar' );
				if ($shaha_need_columns) {
					?></div><!-- /.columns_wrap --><?php
				}
				if (!$shaha_footer_wide) {
					?></div><!-- /.content_wrap --><?php
				}
				?>
			</div><!-- /.footer_widgets_inner -->
		</div><!-- /.footer_widgets_wrap -->
		<?php
	}
}
?>