<div class="front_page_section front_page_section_contacts<?php
			$shaha_scheme = shaha_get_theme_option('front_page_contacts_scheme');
			if (!shaha_is_inherit($shaha_scheme)) echo ' scheme_'.esc_attr($shaha_scheme);
			echo ' front_page_section_paddings_'.esc_attr(shaha_get_theme_option('front_page_contacts_paddings'));
		?>"<?php
		$shaha_css = '';
		$shaha_bg_image = shaha_get_theme_option('front_page_contacts_bg_image');
		if (!empty($shaha_bg_image)) 
			$shaha_css .= 'background-image: url('.esc_url(shaha_get_attachment_url($shaha_bg_image)).');';
		if (!empty($shaha_css))
			echo ' style="' . esc_attr($shaha_css) . '"';
?>><?php
	// Add anchor
	$shaha_anchor_icon = shaha_get_theme_option('front_page_contacts_anchor_icon');	
	$shaha_anchor_text = shaha_get_theme_option('front_page_contacts_anchor_text');	
	if ((!empty($shaha_anchor_icon) || !empty($shaha_anchor_text)) && shortcode_exists('trx_sc_anchor')) {
		echo do_shortcode('[trx_sc_anchor id="front_page_section_contacts"'
										. (!empty($shaha_anchor_icon) ? ' icon="'.esc_attr($shaha_anchor_icon).'"' : '')
										. (!empty($shaha_anchor_text) ? ' title="'.esc_attr($shaha_anchor_text).'"' : '')
										. ']');
	}
	?>
	<div class="front_page_section_inner front_page_section_contacts_inner<?php
			if (shaha_get_theme_option('front_page_contacts_fullheight'))
				echo ' shaha-full-height sc_layouts_flex sc_layouts_columns_middle';
			?>"<?php
			$shaha_css = '';
			$shaha_bg_mask = shaha_get_theme_option('front_page_contacts_bg_mask');
			$shaha_bg_color = shaha_get_theme_option('front_page_contacts_bg_color');
			if (!empty($shaha_bg_color) && $shaha_bg_mask > 0)
				$shaha_css .= 'background-color: '.esc_attr($shaha_bg_mask==1
																	? $shaha_bg_color
																	: shaha_hex2rgba($shaha_bg_color, $shaha_bg_mask)
																).';';
			if (!empty($shaha_css))
				echo ' style="' . esc_attr($shaha_css) . '"';
	?>>
		<div class="front_page_section_content_wrap front_page_section_contacts_content_wrap content_wrap">
			<?php

			// Title and description
			$shaha_caption = shaha_get_theme_option('front_page_contacts_caption');
			$shaha_description = shaha_get_theme_option('front_page_contacts_description');
			if (!empty($shaha_caption) || !empty($shaha_description) || (current_user_can('edit_theme_options') && is_customize_preview())) {
				// Caption
				if (!empty($shaha_caption) || (current_user_can('edit_theme_options') && is_customize_preview())) {
					?><h2 class="front_page_section_caption front_page_section_contacts_caption front_page_block_<?php echo !empty($shaha_caption) ? 'filled' : 'empty'; ?>"><?php
						echo wp_kses_post($shaha_caption);
					?></h2><?php
				}
			
				// Description
				if (!empty($shaha_description) || (current_user_can('edit_theme_options') && is_customize_preview())) {
					?><div class="front_page_section_description front_page_section_contacts_description front_page_block_<?php echo !empty($shaha_description) ? 'filled' : 'empty'; ?>"><?php
						echo wp_kses_post(wpautop($shaha_description));
					?></div><?php
				}
			}

			// Content (text)
			$shaha_content = shaha_get_theme_option('front_page_contacts_content');
			$shaha_layout = shaha_get_theme_option('front_page_contacts_layout');
			if ($shaha_layout == 'columns' && (!empty($shaha_content) || (current_user_can('edit_theme_options') && is_customize_preview()))) {
				?><div class="front_page_section_columns front_page_section_contacts_columns columns_wrap">
					<div class="column-1_3">
				<?php
			}

			if ((!empty($shaha_content) || (current_user_can('edit_theme_options') && is_customize_preview()))) {
				?><div class="front_page_section_content front_page_section_contacts_content front_page_block_<?php echo !empty($shaha_content) ? 'filled' : 'empty'; ?>"><?php
					echo wp_kses_post($shaha_content);
				?></div><?php
			}

			if ($shaha_layout == 'columns' && (!empty($shaha_content) || (current_user_can('edit_theme_options') && is_customize_preview()))) {
				?></div><div class="column-2_3"><?php
			}
		
			// Shortcode output
			$shaha_sc = shaha_get_theme_option('front_page_contacts_shortcode');
			if (!empty($shaha_sc) || (current_user_can('edit_theme_options') && is_customize_preview())) {
				?><div class="front_page_section_output front_page_section_contacts_output front_page_block_<?php echo !empty($shaha_sc) ? 'filled' : 'empty'; ?>"><?php
					shaha_show_layout(do_shortcode($shaha_sc));
				?></div><?php
			}

			if ($shaha_layout == 'columns' && (!empty($shaha_content) || (current_user_can('edit_theme_options') && is_customize_preview()))) {
				?></div></div><?php
			}
			?>			
		</div>
	</div>
</div>