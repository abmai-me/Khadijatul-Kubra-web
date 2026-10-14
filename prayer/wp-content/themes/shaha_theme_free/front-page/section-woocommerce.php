<div class="front_page_section front_page_section_woocommerce<?php
			$shaha_scheme = shaha_get_theme_option('front_page_woocommerce_scheme');
			if (!shaha_is_inherit($shaha_scheme)) echo ' scheme_'.esc_attr($shaha_scheme);
			echo ' front_page_section_paddings_'.esc_attr(shaha_get_theme_option('front_page_woocommerce_paddings'));
		?>"<?php
		$shaha_css = '';
		$shaha_bg_image = shaha_get_theme_option('front_page_woocommerce_bg_image');
		if (!empty($shaha_bg_image)) 
			$shaha_css .= 'background-image: url('.esc_url(shaha_get_attachment_url($shaha_bg_image)).');';
		if (!empty($shaha_css))
			echo ' style="' . esc_attr($shaha_css) . '"';
?>><?php
	// Add anchor
	$shaha_anchor_icon = shaha_get_theme_option('front_page_woocommerce_anchor_icon');	
	$shaha_anchor_text = shaha_get_theme_option('front_page_woocommerce_anchor_text');	
	if ((!empty($shaha_anchor_icon) || !empty($shaha_anchor_text)) && shortcode_exists('trx_sc_anchor')) {
		echo do_shortcode('[trx_sc_anchor id="front_page_section_woocommerce"'
										. (!empty($shaha_anchor_icon) ? ' icon="'.esc_attr($shaha_anchor_icon).'"' : '')
										. (!empty($shaha_anchor_text) ? ' title="'.esc_attr($shaha_anchor_text).'"' : '')
										. ']');
	}
	?>
	<div class="front_page_section_inner front_page_section_woocommerce_inner<?php
			if (shaha_get_theme_option('front_page_woocommerce_fullheight'))
				echo ' shaha-full-height sc_layouts_flex sc_layouts_columns_middle';
			?>"<?php
			$shaha_css = '';
			$shaha_bg_mask = shaha_get_theme_option('front_page_woocommerce_bg_mask');
			$shaha_bg_color = shaha_get_theme_option('front_page_woocommerce_bg_color');
			if (!empty($shaha_bg_color) && $shaha_bg_mask > 0)
				$shaha_css .= 'background-color: '.esc_attr($shaha_bg_mask==1
																	? $shaha_bg_color
																	: shaha_hex2rgba($shaha_bg_color, $shaha_bg_mask)
																).';';
			if (!empty($shaha_css))
				echo ' style="' . esc_attr($shaha_css) . '"';
	?>>
		<div class="front_page_section_content_wrap front_page_section_woocommerce_content_wrap content_wrap woocommerce">
			<?php
			// Content wrap with title and description
			$shaha_caption = shaha_get_theme_option('front_page_woocommerce_caption');
			$shaha_description = shaha_get_theme_option('front_page_woocommerce_description');
			if (!empty($shaha_caption) || !empty($shaha_description) || (current_user_can('edit_theme_options') && is_customize_preview())) {
				// Caption
				if (!empty($shaha_caption) || (current_user_can('edit_theme_options') && is_customize_preview())) {
					?><h2 class="front_page_section_caption front_page_section_woocommerce_caption front_page_block_<?php echo !empty($shaha_caption) ? 'filled' : 'empty'; ?>"><?php
						echo wp_kses_post($shaha_caption);
					?></h2><?php
				}
			
				// Description (text)
				if (!empty($shaha_description) || (current_user_can('edit_theme_options') && is_customize_preview())) {
					?><div class="front_page_section_description front_page_section_woocommerce_description front_page_block_<?php echo !empty($shaha_description) ? 'filled' : 'empty'; ?>"><?php
						echo wp_kses_post(wpautop($shaha_description));
					?></div><?php
				}
			}
		
			// Content (widgets)
			?><div class="front_page_section_output front_page_section_woocommerce_output list_products shop_mode_thumbs"><?php 
				$shaha_woocommerce_sc = shaha_get_theme_option('front_page_woocommerce_products');
				if ($shaha_woocommerce_sc == 'products') {
					$shaha_woocommerce_sc_ids = shaha_get_theme_option('front_page_woocommerce_products_per_page');
					$shaha_woocommerce_sc_per_page = count(explode(',', $shaha_woocommerce_sc_ids));
				} else {
					$shaha_woocommerce_sc_per_page = max(1, (int) shaha_get_theme_option('front_page_woocommerce_products_per_page'));
				}
				$shaha_woocommerce_sc_columns = max(1, min($shaha_woocommerce_sc_per_page, (int) shaha_get_theme_option('front_page_woocommerce_products_columns')));
				echo do_shortcode("[{$shaha_woocommerce_sc}"
									. ($shaha_woocommerce_sc == 'products' 
											? ' ids="'.esc_attr($shaha_woocommerce_sc_ids).'"' 
											: '')
									. ($shaha_woocommerce_sc == 'product_category' 
											? ' category="'.esc_attr(shaha_get_theme_option('front_page_woocommerce_products_categories')).'"' 
											: '')
									. ($shaha_woocommerce_sc != 'best_selling_products' 
											? ' orderby="'.esc_attr(shaha_get_theme_option('front_page_woocommerce_products_orderby')).'"'
											  . ' order="'.esc_attr(shaha_get_theme_option('front_page_woocommerce_products_order')).'"' 
											: '')
									. ' per_page="'.esc_attr($shaha_woocommerce_sc_per_page).'"' 
									. ' columns="'.esc_attr($shaha_woocommerce_sc_columns).'"' 
									. ']');
			?></div>
		</div>
	</div>
</div>