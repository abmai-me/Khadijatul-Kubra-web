<?php
/**
 * The template to display the copyright info in the footer
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.10
 */

// Copyright area
$shaha_footer_scheme =  shaha_is_inherit(shaha_get_theme_option('footer_scheme')) ? shaha_get_theme_option('color_scheme') : shaha_get_theme_option('footer_scheme');
$shaha_copyright_scheme = shaha_is_inherit(shaha_get_theme_option('copyright_scheme')) ? $shaha_footer_scheme : shaha_get_theme_option('copyright_scheme');
?> 
<div class="footer_copyright_wrap scheme_<?php echo esc_attr($shaha_copyright_scheme); ?>">
	<div class="footer_copyright_inner">
		<div class="content_wrap">
			<div class="copyright_text"><?php
				// Replace {{...}} and ((...)) on the <i>...</i> and <b>...</b>
				$shaha_copyright = shaha_prepare_macros(shaha_get_theme_option('copyright'));
				if (!empty($shaha_copyright)) {
					// Replace {date_format} on the current date in the specified format
					if (preg_match("/(\\{[\\w\\d\\\\\\-\\:]*\\})/", $shaha_copyright, $shaha_matches)) {
						$shaha_copyright = str_replace($shaha_matches[1], date_i18n(str_replace(array('{', '}'), '', $shaha_matches[1])), $shaha_copyright);
					}
					// Display copyright
					echo wp_kses_data(nl2br($shaha_copyright));
				}
			?></div>
		</div>
	</div>
</div>
