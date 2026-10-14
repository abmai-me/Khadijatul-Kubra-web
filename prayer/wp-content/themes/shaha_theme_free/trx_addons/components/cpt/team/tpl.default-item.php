<?php
/**
 * The style "default" of the Team
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.2
 */

$args = get_query_var('trx_addons_args_sc_team');

$meta = get_post_meta(get_the_ID(), 'trx_addons_options', true);
$link = get_permalink();

if ($args['slider']) {
	?><div class="slider-slide swiper-slide"><?php
} else if ($args['columns'] > 1) {
	?><div class="<?php echo esc_attr(trx_addons_get_column_class(1, $args['columns'])); ?>"><?php
}
?>
<div class="sc_team_item">
	<?php
    // Featured image
    $shaha_mult = shaha_get_retina_multiplier();
    trx_addons_get_template_part('templates/tpl.featured.php',
								'trx_addons_args_featured',
								apply_filters('trx_addons_filter_args_featured', array(
												'class' => 'sc_team_item_thumb',
												'hover' => '',
												'thumb_size' => apply_filters('trx_addons_filter_thumb_size', trx_addons_get_thumb_size('avatar'), 200*$shaha_mult)
												), 'team-default')
								);
	?><div class="sc_team_item_info">
		<div class="sc_team_item_header">
			<h4 class="sc_team_item_title"><a href="<?php echo esc_url($link); ?>"><?php the_title(); ?></a></h4>
			<div class="sc_team_item_subtitle"><?php trx_addons_show_layout($meta['subtitle']);?></div>
            <?php
            if (!empty($meta["email"])) {
                ?><div class="sc_team_item_email"><a href="mailto:<?php echo esc_url($meta["email"]); ?>"><?php trx_addons_show_layout($meta["email"]); ?></a></div><?php
            }
            ?>
		</div>
    </div>
</div>
<?php
if ($args['slider'] || $args['columns'] > 1) {
	?></div><?php
}
?>