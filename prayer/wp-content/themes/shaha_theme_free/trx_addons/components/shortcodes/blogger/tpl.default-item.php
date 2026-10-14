<?php
/**
 * The style "default" of the Blogger
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.2
 */

$args = get_query_var('trx_addons_args_sc_blogger');

if ($args['slider']) {
	?><div class="slider-slide swiper-slide"><?php
} else if ($args['columns'] > 1) {
	?><div class="<?php echo esc_attr(trx_addons_get_column_class(1, $args['columns'])); ?>"><?php
}

$post_format = get_post_format();
$post_format = empty($post_format) ? 'standard' : str_replace('post-format-', '', $post_format);
$post_link = get_permalink();
$post_title = get_the_title();
$post_tribe_events = in_array('tribe_events', get_post_class());

?><div <?php post_class( 'sc_blogger_item post_format_'.esc_attr($post_format) ); ?>><?php

    // Event's date
    if ($post_tribe_events) {
        $date = tribe_get_start_date(null, true, 'd-M');
        if (empty($date)) $date = get_the_date('d-M');
        $date = explode('-', $date);
        ?><div class="sc_blogger_item_wrap_featured_event">
        <span class="sc_events_item_date">
            <span class="sc_events_item_day"><?php echo esc_html($date[0]); ?></span>
            <span class="sc_events_item_month"><?php echo esc_html($date[1]); ?></span>
        </span><?php
    }
	// Featured image
	trx_addons_get_template_part('templates/tpl.featured.php',
									'trx_addons_args_featured',
									apply_filters('trx_addons_filter_args_featured', array(
														'class' => 'sc_blogger_item_featured',
														'hover' => 'zoomin',
														'thumb_size' => apply_filters('trx_addons_filter_thumb_size', trx_addons_get_thumb_size($args['columns'] > 2 ? 'medium' : 'big'), 'blogger-default')
														), 'blogger-default')
								);
    // Event's date end
    if ($post_tribe_events) {
        ?></div><!--sc_blogger_item_wrap_featured_event--><?php
    }


    // Post content
	?><div class="sc_blogger_item_content entry-content"><?php

		// Post title
		if ( !in_array($post_format, array('link', 'aside', 'status', 'quote')) ) {
			?><div class="sc_blogger_item_header entry-header"><?php
                // Post meta
                if (!$post_tribe_events && !in_array($post_format, array('link', 'aside', 'status', 'quote'))) {
                    trx_addons_sc_show_post_meta('sc_blogger', apply_filters('trx_addons_filter_show_post_meta', array(
                            'components' => 'date,counters',
                            'counters' => 'comments'
                        ), 'sc_blogger_default', $args['columns'])
                    );
                }
                // Post title
                the_title( sprintf( '<h5 class="sc_blogger_item_title entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h5>' );
                // Post meta
                if ($post_tribe_events && !in_array($post_format, array('link', 'aside', 'status', 'quote'))) {
                    trx_addons_sc_show_post_meta('sc_blogger', apply_filters('trx_addons_filter_show_post_meta', array(
                            'components' => 'date',
                        ), 'sc_blogger_default', $args['columns'])
                    );
                }
			?></div><!-- .entry-header --><?php
		}		

		// Post content
		if (!isset($args['hide_excerpt']) || $args['hide_excerpt']==0) {
			?><div class="sc_blogger_item_excerpt">
				<div class="sc_blogger_item_excerpt_text">
					<?php
					$show_more = !in_array($post_format, array('link', 'aside', 'status', 'quote'));
					if (has_excerpt()) {
						the_excerpt();
					} else if (strpos(get_the_content('!--more'), '!--more')!==false) {
						the_content( '' );
					} else if (!$show_more) {
						the_content();
					} else {
						the_excerpt();
					}
					?>
				</div>
				<?php
				// Post meta
				if (in_array($post_format, array('link', 'aside', 'status', 'quote'))) {
					trx_addons_sc_show_post_meta('sc_blogger', apply_filters('trx_addons_filter_show_post_meta', array(
						'components' => 'date'
						), 'sc_blogger_default', $args['columns'])
					);
				}
				// More button
				if ( $show_more ) {
					?><div class="sc_blogger_item_button sc_item_button"><a href="<?php echo esc_url($post_link); ?>" class="<?php echo esc_attr(apply_filters('trx_addons_filter_sc_item_link_classes', 'sc_button sc_button_default', 'sc_blogger', $args)); ?>"><?php esc_html_e('Read more', 'shaha'); ?></a></div><?php
				}
			?></div><!-- .sc_blogger_item_excerpt --><?php
		}
		
	?></div><!-- .entry-content --><?php
	
?></div><!-- .sc_blogger_item --><?php

if ($args['slider'] || $args['columns'] > 1) {
	?></div><?php
}
?>