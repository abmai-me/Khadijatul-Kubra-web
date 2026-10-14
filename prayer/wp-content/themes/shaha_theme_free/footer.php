<?php
/**
 * The Footer: widgets area, logo, footer menu and socials
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

						// Widgets area inside page content
						shaha_create_widgets_area('widgets_below_content');
						?>				
					</div><!-- </.content> -->

					<?php
					// Show main sidebar
					get_sidebar();

					// Widgets area below page content
					shaha_create_widgets_area('widgets_below_page');

					$shaha_body_style = shaha_get_theme_option('body_style');
					if ($shaha_body_style != 'fullscreen') {
						?></div><!-- </.content_wrap> --><?php
					}
					?>
			</div><!-- </.page_content_wrap> -->

			<?php
			// Footer
			$shaha_footer_type = shaha_get_theme_option("footer_type");
			if ($shaha_footer_type == 'custom' && !shaha_is_layouts_available())
				$shaha_footer_type = 'default';
			get_template_part( "templates/footer-{$shaha_footer_type}");
			?>

		</div><!-- /.page_wrap -->

	</div><!-- /.body_wrap -->

	<?php if (shaha_is_on(shaha_get_theme_option('debug_mode')) && shaha_get_file_dir('images/makeup.jpg')!='') { ?>
		<img src="<?php echo esc_url(shaha_get_file_url('images/makeup.jpg')); ?>" id="makeup">
	<?php } ?>

	<?php wp_footer(); ?>

</body>
</html>