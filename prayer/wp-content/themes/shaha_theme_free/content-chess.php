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
$shaha_columns = empty($shaha_blog_style[1]) ? 1 : max(1, $shaha_blog_style[1]);
$shaha_expanded = !shaha_sidebar_present() && shaha_is_on(shaha_get_theme_option('expand_content'));
$shaha_post_format = get_post_format();
$shaha_post_format = empty($shaha_post_format) ? 'standard' : str_replace('post-format-', '', $shaha_post_format);
$shaha_animation = shaha_get_theme_option('blog_animation');

?><article id="post-<?php the_ID(); ?>" 
	<?php post_class( 'post_item post_layout_chess post_layout_chess_'.esc_attr($shaha_columns).' post_format_'.esc_attr($shaha_post_format) ); ?>
	<?php echo (!shaha_is_off($shaha_animation) ? ' data-animation="'.esc_attr(shaha_get_animation_classes($shaha_animation)).'"' : ''); ?>>

	<?php
	// Add anchor
	if ($shaha_columns == 1 && shortcode_exists('trx_sc_anchor')) {
		echo do_shortcode('[trx_sc_anchor id="post_'.esc_attr(get_the_ID()).'" title="'.esc_attr(get_the_title()).'"]');
	}

	// Sticky label
	if ( is_sticky() && !is_paged() ) {
		?><span class="post_label label_sticky"></span><?php
	}

	// Featured image
	shaha_show_post_featured( array(
											'class' => $shaha_columns == 1 ? 'shaha-full-height' : '',
											'show_no_image' => true,
											'thumb_bg' => true,
											'thumb_size' => shaha_get_thumb_size(
																	strpos(shaha_get_theme_option('body_style'), 'full')!==false
																		? ( $shaha_columns > 1 ? 'huge' : 'original' )
																		: (	$shaha_columns > 2 ? 'big' : 'huge')
																	)
											) 
										);

	?><div class="post_inner"><div class="post_inner_content"><?php 

		?><div class="post_header entry-header"><?php 
			do_action('shaha_action_before_post_title'); 

			// Post title
			the_title( sprintf( '<h3 class="post_title entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h3>' );
			
			do_action('shaha_action_before_post_meta'); 

			// Post meta
			$shaha_components = shaha_is_inherit(shaha_get_theme_option_from_meta('meta_parts')) 
										? 'date,counters'.($shaha_columns == 1 ? ',edit' : '')
										: shaha_array_get_keys_by_value(shaha_get_theme_option('meta_parts'));
			$shaha_counters = shaha_is_inherit(shaha_get_theme_option_from_meta('counters')) 
										? 'comments'
										: shaha_array_get_keys_by_value(shaha_get_theme_option('counters'));
			$shaha_post_meta = empty($shaha_components) 
										? '' 
										: shaha_show_post_meta(apply_filters('shaha_filter_post_meta_args', array(
												'components' => $shaha_components,
												'counters' => $shaha_counters,
												'seo' => false,
												'echo' => false
												), $shaha_blog_style[0], $shaha_columns)
											);
			shaha_show_layout($shaha_post_meta);
		?></div><!-- .entry-header -->
	
		<div class="post_content entry-content">
			<div class="post_content_inner">
				<?php
				$shaha_show_learn_more = !in_array($shaha_post_format, array('link', 'aside', 'status', 'quote'));
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
				shaha_show_layout($shaha_post_meta);
			}
			// More button
			if ( $shaha_show_learn_more ) {
				?><p><a class="more-link" href="<?php echo esc_url(get_permalink()); ?>"><?php esc_html_e('Read more', 'shaha'); ?></a></p><?php
			}
			?>
		</div><!-- .entry-content -->

	</div></div><!-- .post_inner -->

</article>