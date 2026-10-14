<?php
/**
 * The Classic template to display the content
 *
 * Used for index/archive/search.
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

$shaha_blog_style = explode('_', shaha_get_theme_option('blog_style'));
$shaha_columns = empty($shaha_blog_style[1]) ? 2 : max(2, $shaha_blog_style[1]);
$shaha_expanded = !shaha_sidebar_present() && shaha_is_on(shaha_get_theme_option('expand_content'));
$shaha_post_format = get_post_format();
$shaha_post_format = empty($shaha_post_format) ? 'standard' : str_replace('post-format-', '', $shaha_post_format);
$shaha_animation = shaha_get_theme_option('blog_animation');
$shaha_components = shaha_is_inherit(shaha_get_theme_option_from_meta('meta_parts')) 
							? 'date,counters'.($shaha_columns < 3 ? ',edit' : '')
							: shaha_array_get_keys_by_value(shaha_get_theme_option('meta_parts'));
$shaha_counters = shaha_is_inherit(shaha_get_theme_option_from_meta('counters')) 
							? 'comments'
							: shaha_array_get_keys_by_value(shaha_get_theme_option('counters'));

?><div class="<?php echo trim($shaha_blog_style[0]) == 'classic' ? 'column' : 'masonry_item masonry_item'; ?>-1_<?php echo esc_attr($shaha_columns); ?>"><article id="post-<?php the_ID(); ?>"
	<?php post_class( 'post_item post_format_'.esc_attr($shaha_post_format)
					. ' post_layout_classic post_layout_classic_'.esc_attr($shaha_columns)
					. ' post_layout_'.esc_attr($shaha_blog_style[0]) 
					. ' post_layout_'.esc_attr($shaha_blog_style[0]).'_'.esc_attr($shaha_columns)
					); ?>
	<?php echo (!shaha_is_off($shaha_animation) ? ' data-animation="'.esc_attr(shaha_get_animation_classes($shaha_animation)).'"' : ''); ?>>
	<?php

	// Sticky label
	if ( is_sticky() && !is_paged() ) {
		?><span class="post_label label_sticky"></span><?php
	}

	// Featured image
	shaha_show_post_featured( array( 'thumb_size' => shaha_get_thumb_size($shaha_blog_style[0] == 'classic'
													? (strpos(shaha_get_theme_option('body_style'), 'full')!==false 
															? ( $shaha_columns > 2 ? 'big' : 'huge' )
															: (	$shaha_columns > 2
																? ($shaha_expanded ? 'med' : 'small')
																: ($shaha_expanded ? 'big' : 'med')
																)
														)
													: (strpos(shaha_get_theme_option('body_style'), 'full')!==false 
															? ( $shaha_columns > 2 ? 'masonry-big' : 'full' )
															: (	$shaha_columns <= 2 && $shaha_expanded ? 'masonry-big' : 'masonry')
														)
								) ) );

	if ( !in_array($shaha_post_format, array('link', 'aside', 'status', 'quote')) ) {
		?>
		<div class="post_header entry-header">
			<?php 
			do_action('shaha_action_before_post_title'); 

			// Post title
			the_title( sprintf( '<h4 class="post_title entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h4>' );

			do_action('shaha_action_before_post_meta'); 

			// Post meta
			if (!empty($shaha_components))
				shaha_show_post_meta(apply_filters('shaha_filter_post_meta_args', array(
					'components' => $shaha_components,
					'counters' => $shaha_counters,
					'seo' => false
					), $shaha_blog_style[0], $shaha_columns)
				);

			do_action('shaha_action_after_post_meta'); 
			?>
		</div><!-- .entry-header -->
		<?php
	}		
	?>

	<div class="post_content entry-content">
		<div class="post_content_inner">
			<?php
			$shaha_show_learn_more = false;
			if (has_excerpt()) {
				the_excerpt();
			} else if (strpos(get_the_content('!--more'), '!--more')!==false) {
				the_content( '' );
			} else if (in_array($shaha_post_format, array('link', 'aside', 'status'))) {
				the_content();
			} else if ($shaha_post_format == 'quote') {
				if (($quote = shaha_get_tag(get_the_content(), '<blockquote>', '</blockquote>'))!='')
					shaha_show_layout(wpautop($quote));
				else
					the_excerpt();
			} else if (substr(get_the_content(), 0, 1)!='[') {
				the_excerpt();
			}
			?>
		</div>
		<?php
		// Post meta
		if (in_array($shaha_post_format, array('link', 'aside', 'status', 'quote'))) {
			if (!empty($shaha_components))
				shaha_show_post_meta(apply_filters('shaha_filter_post_meta_args', array(
					'components' => $shaha_components,
					'counters' => $shaha_counters
					), $shaha_blog_style[0], $shaha_columns)
				);
		}
		// More button
		if ( $shaha_show_learn_more ) {
			?><p><a class="more-link" href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e('Read more', 'shaha'); ?></a></p><?php
		}
		?>
	</div><!-- .entry-content -->

</article></div>