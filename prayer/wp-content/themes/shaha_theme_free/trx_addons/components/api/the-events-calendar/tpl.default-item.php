<?php
/**
 * The style "default" of the Events
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.2
 */

$args = get_query_var('trx_addons_args_sc_events');

if ($args['slider']) {
	?><div class="slider-slide swiper-slide"><?php
} else if ($args['columns'] > 1) {
	?><div class="<?php echo esc_attr(trx_addons_get_column_class(1, $args['columns'])); ?>"><?php
}

?><span class="sc_events_item"><?php
	// Event's date
	$date = tribe_get_start_date(null, true, 'd-M-l');
	if (empty($date)) $date = get_the_date('d-M-l');
	$date = explode('-', $date);
	?><span class="sc_events_item_date">
		<span class="sc_events_item_day"><?php echo esc_html($date[0]); ?></span>
		<span class="sc_events_item_md_wrap">
		    <span class="sc_events_item_month"><?php echo esc_html($date[1]); ?></span>
		    <span class="sc_events_item_day_name"><?php echo esc_html($date[2]); ?></span>
        </span>
	</span><?php
    ?><span class="sc_events_item_td_wrap"><?php
        // Event's title
        ?><span class="sc_events_item_title"><?php the_title(); ?></span><?php
        // Event's details
        ?><span class="sc_events_item_details"><?php
            $recurring_event = (tribe_get_start_date(null, true, 'd M') !== tribe_get_end_date(null, true, 'd M'));
            $date_details = tribe_get_start_date(null, true, 'd M ');
            $date_details .= tribe_get_start_time(null, '@ g a');
            $date_details .= ($recurring_event ? ' - '. tribe_get_end_date(null, true, 'd M ') : ' - ' );
            $date_details .= tribe_get_end_time(null, 'g a');
            $date_details .= ($recurring_event ? ' / ' . esc_html__('Recurring Event', 'shaha') : '');
            if (!empty($date_details))
                ?><span class="sc_events_item_details_date"><?php shaha_show_layout($date_details); ?></span><?php

            if (!empty($venue = tribe_get_venue_details())) {
                $venue_output = $venue['linked_name'];
                $venue_output .= (!empty($venue['linked_name']) && !empty($venue['address']) ? ', ' : '');
                $venue_output .= $venue['address'];
                ?><span class="sc_events_item_details_venue"><?php shaha_show_layout($venue_output); ?></span><?php
            }
        ?></span><?php
    ?></span><?php
	// Arrow (button)
    ?><a href="<?php echo esc_url(get_permalink()); ?>" class="sc_events_item_button sc_button sc_button_default sc_button_size_normal">
        <span class="sc_button_text">
            <span class="sc_button_title">
            <?php esc_html_e('Event Details', 'shaha'); ?>
            </span>
        </span>
    </a><?php
?></span><?php

if ($args['slider'] || $args['columns'] > 1) {
	?></div><?php
}

?>