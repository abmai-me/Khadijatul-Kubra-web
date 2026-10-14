<div class="front_page_section front_page_section_about<?php
			$shaha_scheme = shaha_get_theme_option('front_page_about_scheme');
			if (!shaha_is_inherit($shaha_scheme)) echo ' scheme_'.esc_attr($shaha_scheme);
			echo ' front_page_section_paddings_'.esc_attr(shaha_get_theme_option('front_page_about_paddings'));
		?>"<?php
		$shaha_css = '';
		$shaha_bg_image = shaha_get_theme_option('front_page_about_bg_image');
		if (!empty($shaha_bg_image)) 
			$shaha_css .= 'background-image: url('.esc_url(shaha_get_attachment_url($shaha_bg_image)).');';
		if (!empty($shaha_css))
			echo ' style="' . esc_attr($shaha_css) . '"';
?>><?php
	// Add anchor
	$shaha_anchor_icon = shaha_get_theme_option('front_page_about_anchor_icon');	
	$shaha_anchor_text = shaha_get_theme_option('front_page_about_anchor_text');	
	if ((!empty($shaha_anchor_icon) || !empty($shaha_anchor_text)) && shortcode_exists('trx_sc_anchor')) {
		echo do_shortcode('[trx_sc_anchor id="front_page_section_about"'
										. (!empty($shaha_anchor_icon) ? ' icon="'.esc_attr($shaha_anchor_icon).'"' : '')
										. (!empty($shaha_anchor_text) ? ' title="'.esc_attr($shaha_anchor_text).'"' : '')
										. ']');
	}
	?>
	<div class="front_page_section_inner front_page_section_about_inner<?php
			if (shaha_get_theme_option('front_page_about_fullheight'))
				echo ' shaha-full-height sc_layouts_flex sc_layouts_columns_middle';
			?>"<?php
			$shaha_css = '';
			$shaha_bg_mask = shaha_get_theme_option('front_page_about_bg_mask');
			$shaha_bg_color = shaha_get_theme_option('front_page_about_bg_color');
			if (!empty($shaha_bg_color) && $shaha_bg_mask > 0)
				$shaha_css .= 'background-color: '.esc_attr($shaha_bg_mask==1
																	? $shaha_bg_color
																	: shaha_hex2rgba($shaha_bg_color, $shaha_bg_mask)
																).';';
			if (!empty($shaha_css))
				echo ' style="' . esc_attr($shaha_css) . '"';
	?>>
		<div class="front_page_section_content_wrap front_page_section_about_content_wrap content_wrap">
			<?php
			// Caption
			$shaha_caption = shaha_get_theme_option('front_page_about_caption');
			if (!empty($shaha_caption) || (current_user_can('edit_theme_options') && is_customize_preview())) {
				?><h2 class="front_page_section_caption front_page_section_about_caption front_page_block_<?php echo !empty($shaha_caption) ? 'filled' : 'empty'; ?>"><?php echo wp_kses_post($shaha_caption); ?></h2><?php
			}
		
			// Description (text)
			$shaha_description = shaha_get_theme_option('front_page_about_description');
			if (!empty($shaha_description) || (current_user_can('edit_theme_options') && is_customize_preview())) {
				?><div class="front_page_section_description front_page_section_about_description front_page_block_<?php echo !empty($shaha_description) ? 'filled' : 'empty'; ?>"><?php echo wp_kses_post(wpautop($shaha_description)); ?></div><?php
			}
			
			// Content
			$shaha_content = shaha_get_theme_option('front_page_about_content');
			if (!empty($shaha_content) || (current_user_can('edit_theme_options') && is_customize_preview())) {
				?><div class="front_page_section_content front_page_section_about_content front_page_block_<?php echo !empty($shaha_content) ? 'filled' : 'empty'; ?>"><?php
					$shaha_page_content_mask = '%%CONTENT%%';
					if (strpos($shaha_content, $shaha_page_content_mask) !== false) {
						$shaha_content = preg_replace(
									'/(\<p\>\s*)?'.$shaha_page_content_mask.'(\s*\<\/p\>)/i',
									sprintf('<div class="front_page_section_about_source">%s</div>',
												apply_filters('the_content', get_the_content())),
									$shaha_content
									);
					}
					shaha_show_layout($shaha_content);
				?></div><?php
			}
			?>
		</div>
	</div>
</div>