<?php
// Add plugin-specific colors and fonts to the custom CSS
if (!function_exists('shaha_mailchimp_get_css')) {
	add_filter('shaha_filter_get_css', 'shaha_mailchimp_get_css', 10, 4);
	function shaha_mailchimp_get_css($css, $colors, $fonts, $scheme='') {
		
		if (isset($css['fonts']) && $fonts) {
			$css['fonts'] .= <<<CSS

CSS;
		
			
			$rad = shaha_get_border_radius();
			$css['fonts'] .= <<<CSS

.mc4wp-form .mc4wp-alert,
.mc4wp-form .mc4wp-form-fields input[type="email"],
.mc4wp-form .mc4wp-form-fields input[type="submit"],
.mc4wp-form .mc4wp-form-fields button {
	-webkit-border-radius: {$rad};
	    -ms-border-radius: {$rad};
			border-radius: {$rad};
}

CSS;
		}

		
		if (isset($css['colors']) && $colors) {
			$css['colors'] .= <<<CSS

.mc4wp-form input[type="email"] {
	background-color: {$colors['alter_bg_color']};
	border-color: {$colors['alter_dark']};
	color: {$colors['text_dark']};
}
.mc4wp-form button {
	background-color: {$colors['text_hover']};
	border-color: {$colors['text_hover']};
	color: {$colors['text_dark']};
}
.mc4wp-form button:hover {
	background-color: {$colors['text_link']};
	border-color: {$colors['text_link']};
	color: {$colors['text_dark']};
}
.mc4wp-form .mc4wp-alert {
	background-color: {$colors['text_link']};
	border-color: {$colors['text_hover']};
	color: {$colors['inverse_text']};
}
CSS;
		}

		return $css;
	}
}
?>