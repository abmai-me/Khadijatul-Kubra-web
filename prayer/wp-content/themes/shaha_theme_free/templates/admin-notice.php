<?php
/**
 * The template to display Admin notices
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0.1
 */
 
$shaha_theme_obj = wp_get_theme();
?>
<div class="update-nag" id="shaha_admin_notice">
	<h3 class="shaha_notice_title"><?php
		// Translators: Add theme name and version to the 'Welcome' message
		echo esc_html(sprintf(esc_html__('Welcome to %1$s v.%2$s', 'shaha'),
				$shaha_theme_obj->name . (Shaha_THEME_FREE ? ' ' . esc_html__('Free', 'shaha') : ''),
				$shaha_theme_obj->version
				));
	?></h3>
	<?php
	if (!shaha_exists_trx_addons()) {
		?><p><?php echo wp_kses_data(__('<b>Attention!</b> Plugin "ThemeREX Addons is required! Please, install and activate it!', 'shaha')); ?></p><?php
	}
	?><p>
		<a href="<?php echo esc_url(admin_url().'themes.php?page=shaha_about'); ?>" class="button button-primary"><i class="dashicons dashicons-nametag"></i> <?php
			// Translators: Add theme name
			echo esc_html(sprintf(esc_html__('About %s', 'shaha'), $shaha_theme_obj->name));
		?></a>
		<?php
		if (shaha_get_value_gp('page')!='tgmpa-install-plugins') {
			?>
			<a href="<?php echo esc_url(admin_url().'themes.php?page=tgmpa-install-plugins'); ?>" class="button button-primary"><i class="dashicons dashicons-admin-plugins"></i> <?php esc_html_e('Install plugins', 'shaha'); ?></a>
			<?php
		}
		if (function_exists('shaha_exists_trx_addons') && shaha_exists_trx_addons() && class_exists('trx_addons_demo_data_importer')) {
			?>
			<a href="<?php echo esc_url(admin_url().'themes.php?page=trx_importer'); ?>" class="button button-primary"><i class="dashicons dashicons-download"></i> <?php esc_html_e('One Click Demo Data', 'shaha'); ?></a>
			<?php
		}
		?>
        <a href="<?php echo esc_url(admin_url().'customize.php'); ?>" class="button button-primary"><i class="dashicons dashicons-admin-appearance"></i> <?php esc_html_e('Theme Customizer', 'shaha'); ?></a>
		<span> <?php esc_html_e('or', 'shaha'); ?> </span>
        <a href="<?php echo esc_url(admin_url().'themes.php?page=theme_options'); ?>" class="button button-primary"><i class="dashicons dashicons-admin-appearance"></i> <?php esc_html_e('Theme Options', 'shaha'); ?></a>
        <a href="#" class="button shaha_hide_notice"><i class="dashicons dashicons-dismiss"></i> <?php esc_html_e('Hide Notice', 'shaha'); ?></a>
	</p>
</div>