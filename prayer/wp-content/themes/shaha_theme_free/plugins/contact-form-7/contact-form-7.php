<?php
/* Contact Form 7 support functions
------------------------------------------------------------------------------- */

// Theme init priorities:
// 9 - register other filters (for installer, etc.)
if (!function_exists('shaha_cf7_theme_setup9')) {
    add_action( 'after_setup_theme', 'shaha_cf7_theme_setup9', 9 );
    function shaha_cf7_theme_setup9() {

        if (is_admin()) {
            add_filter( 'shaha_filter_tgmpa_required_plugins',		'shaha_cf7_tgmpa_required_plugins' );
        }
    }
}

// Filter to add in the required plugins list
if ( !function_exists( 'shaha_cf7_tgmpa_required_plugins' ) ) {
    //Handler of the add_filter('shaha_filter_tgmpa_required_plugins',	'shaha_cf7_tgmpa_required_plugins');
    function shaha_cf7_tgmpa_required_plugins($list=array()) {
        if (shaha_storage_isset('required_plugins', 'contact-form-7')) {
            $list[] = array(
                'name' 		=> shaha_storage_get_array('required_plugins', 'contact-form-7'),
                'slug' 		=> 'contact-form-7',
                'required' 	=> false
            );
        }
        return $list;
    }
}

?>