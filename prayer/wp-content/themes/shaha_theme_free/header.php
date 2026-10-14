<?php
/**
 * The Header: Logo and main menu
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js scheme_<?php
										 // Class scheme_xxx need in the <html> as context for the <body>!
										 echo esc_attr(shaha_get_theme_option('color_scheme'));
										 ?>"
>
<head>
	<?php wp_head(); ?>
</head>

<body <?php	body_class(); ?>>

	<?php do_action( 'shaha_action_before_body' ); ?>

	<div class="body_wrap">

		<div class="page_wrap"><?php

			// Desktop header
			$shaha_header_type = shaha_get_theme_option("header_type");
			if ($shaha_header_type == 'custom' && !shaha_is_layouts_available())
				$shaha_header_type = 'default';
			get_template_part( "templates/header-{$shaha_header_type}");

			// Side menu
			if (in_array(shaha_get_theme_option('menu_style'), array('left', 'right'))) {
				get_template_part( 'templates/header-navi-side' );
			}

			// Mobile header
			get_template_part( 'templates/header-mobile');
			?>

			<div class="page_content_wrap">

				<?php if (shaha_get_theme_option('body_style') != 'fullscreen') { ?>
				<div class="content_wrap">
				<?php } ?>

					<?php
					// Widgets area above page content
					shaha_create_widgets_area('widgets_above_page');
					?>				

					<div class="content">
						<?php
						// Widgets area inside page content
						shaha_create_widgets_area('widgets_above_content');
						?>				
