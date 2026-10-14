<?php
/**
 * The template to display the background video in the header
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.14
 */
$shaha_header_video = shaha_get_header_video();
$shaha_embed_video = '';
if (!empty($shaha_header_video) && !shaha_is_from_uploads($shaha_header_video)) {
	if (shaha_is_youtube_url($shaha_header_video) && preg_match('/[=\/]([^=\/]*)$/', $shaha_header_video, $matches) && !empty($matches[1])) {
		?><div id="background_video" data-youtube-code="<?php echo esc_attr($matches[1]); ?>"></div><?php
	} else {
		global $wp_embed;
		if (false && is_object($wp_embed)) {
			$shaha_embed_video = do_shortcode($wp_embed->run_shortcode( '[embed]' . trim($shaha_header_video) . '[/embed]' ));
			$shaha_embed_video = shaha_make_video_autoplay($shaha_embed_video);
		} else {
			$shaha_header_video = str_replace('/watch?v=', '/embed/', $shaha_header_video);
			$shaha_header_video = shaha_add_to_url($shaha_header_video, array(
				'feature' => 'oembed',
				'controls' => 0,
				'autoplay' => 1,
				'showinfo' => 0,
				'modestbranding' => 1,
				'wmode' => 'transparent',
				'enablejsapi' => 1,
				'origin' => home_url(),
				'widgetid' => 1
			));
			$shaha_embed_video = '<iframe src="' . esc_url($shaha_header_video) . '" width="1170" height="658" allowfullscreen="0" frameborder="0"></iframe>';
		}
		?><div id="background_video"><?php shaha_show_layout($shaha_embed_video); ?></div><?php
	}
}
?>