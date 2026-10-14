<?php
/**
 * The Sticky template to display the sticky posts
 *
 * Used for index/archive
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

$shaha_columns = max(1, min(3, count(get_option( 'sticky_posts' ))));
$shaha_post_format = get_post_format();
$shaha_post_format = empty($shaha_post_format) ? 'standard' : str_replace('post-format-', '', $shaha_post_format);
$shaha_animation = shaha_get_theme_option('blog_animation');

?><div class="column-1_<?php echo esc_attr($shaha_columns); ?>"><article id="post-<?php the_ID(); ?>" 
	<?php post_class( 'post_item post_layout_sticky post_format_'.esc_attr($shaha_post_format) ); ?>
	<?php echo (!shaha_is_off($shaha_animation) ? ' data-animation="'.esc_attr(shaha_get_animation_classes($shaha_animation)).'"' : ''); ?>
	>

	<?php
	if ( is_sticky() && is_home() && !is_paged() ) {
		?><span class="post_label label_sticky"></span><?php
	}

	// Featured image
	shaha_show_post_featured(array(
		'thumb_size' => shaha_get_thumb_size($shaha_columns==1 ? 'big' : ($shaha_columns==2 ? 'med' : 'avatar'))
	));

	if ( !in_array($shaha_post_format, array('link', 'aside', 'status', 'quote')) ) {
		?>
		<div class="post_header entry-header">
			<?php
			// Post title
			the_title( sprintf( '<h6 class="post_title entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h6>' );
			// Post meta
			shaha_show_post_meta(apply_filters('shaha_filter_post_meta_args', array(), 'sticky', $shaha_columns));
			?>
		</div><!-- .entry-header -->
		<?php
	}
	?>
</article></div>