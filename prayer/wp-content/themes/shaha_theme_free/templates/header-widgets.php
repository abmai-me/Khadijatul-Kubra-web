<?php
/**
 * The template to display the widgets area in the header
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

// Header sidebar
$shaha_header_name = shaha_get_theme_option('header_widgets');
$shaha_header_present = !shaha_is_off($shaha_header_name) && is_active_sidebar($shaha_header_name);
if ($shaha_header_present) { 
	shaha_storage_set('current_sidebar', 'header');
	$shaha_header_wide = shaha_get_theme_option('header_wide');
	ob_start();
	if ( is_active_sidebar($shaha_header_name) ) {
		dynamic_sidebar($shaha_header_name);
	}
	$shaha_widgets_output = ob_get_contents();
	ob_end_clean();
	if (!empty($shaha_widgets_output)) {
		$shaha_widgets_output = preg_replace("/<\/aside>[\r\n\s]*<aside/", "</aside><aside", $shaha_widgets_output);
		$shaha_need_columns = strpos($shaha_widgets_output, 'columns_wrap')===false;
		if ($shaha_need_columns) {
			$shaha_columns = max(0, (int) shaha_get_theme_option('header_columns'));
			if ($shaha_columns == 0) $shaha_columns = min(6, max(1, substr_count($shaha_widgets_output, '<aside ')));
			if ($shaha_columns > 1)
				$shaha_widgets_output = preg_replace("/class=\"widget /", "class=\"column-1_".esc_attr($shaha_columns).' widget ', $shaha_widgets_output);
			else
				$shaha_need_columns = false;
		}
		?>
		<div class="header_widgets_wrap widget_area<?php echo !empty($shaha_header_wide) ? ' header_fullwidth' : ' header_boxed'; ?>">
			<div class="header_widgets_inner widget_area_inner">
				<?php 
				if (!$shaha_header_wide) { 
					?><div class="content_wrap"><?php
				}
				if ($shaha_need_columns) {
					?><div class="columns_wrap"><?php
				}
				do_action( 'shaha_action_before_sidebar' );
				shaha_show_layout($shaha_widgets_output);
				do_action( 'shaha_action_after_sidebar' );
				if ($shaha_need_columns) {
					?></div>	<!-- /.columns_wrap --><?php
				}
				if (!$shaha_header_wide) {
					?></div>	<!-- /.content_wrap --><?php
				}
				?>
			</div>	<!-- /.header_widgets_inner -->
		</div>	<!-- /.header_widgets_wrap -->
		<?php
	}
}
?>