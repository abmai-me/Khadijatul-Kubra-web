<?php
/**
 * REST API support
 *
 * @package WordPress
 * @subpackage ThemeREX Addons
 * @since v1.6.50
 */

// Don't load directly
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

// Throttle from attacks
if (!defined('TRX_ADDONS_THROTTLE_TIME'))		define('TRX_ADDONS_THROTTLE_TIME', 5);		// Time (in sec) to check total queries
if (!defined('TRX_ADDONS_THROTTLE_QUERIES'))	define('TRX_ADDONS_THROTTLE_QUERIES', 5);	// Max queries allowed during the time above
if (!defined('TRX_ADDONS_THROTTLE_DELAY'))		define('TRX_ADDONS_THROTTLE_DELAY', 30);	// Delay after attack is detected


//------------------------------------------------
//--  REST API support
//------------------------------------------------

// Register endpoints
if ( !function_exists( 'trx_addons_rest_register_endpoints' ) ) {
	add_action( 'rest_api_init', 'trx_addons_rest_register_endpoints');
	function trx_addons_rest_register_endpoints() {
		// Return layouts for the Gutenberg blocks
		register_rest_route( 'trx_addons/v2', '/get/sc_layout', array(
			'methods' => 'GET,POST',
			'callback' => 'trx_addons_rest_get_sc_layout',
			));
		}
}


// Return layout
if ( !function_exists( 'trx_addons_rest_get_sc_layout' ) && class_exists( 'WP_REST_Request' ) ) {
	function trx_addons_rest_get_sc_layout(WP_REST_Request $request) {
		
		// Prepare response
		$response = array();

		// Check throttle
		if (trx_addons_rest_check_throttle()) {
			$response = new WP_REST_Response($response);
			$response->set_status(403);
			return $response;
		}
		
		// Get params from widget
		$params = $request->get_params();
		if (!empty($params['sc'])) {
			$sc = str_replace('trx_sc_', 'trx_addons_sc_', $params['sc']);
			if (function_exists($sc)) {
				$response['data'] = $sc($params);
			} else {
				$response['data'] = '<div class="sc_error">' . esc_html(sprintf(__("Unknown block %s", 'trx_addons'), $params['sc'])) . '</div>';
			}
		}
	
		return new WP_REST_Response($response);
	}
}


// Check for attack
if (!function_exists('trx_addons_rest_check_throttle')) {
	function trx_addons_rest_check_throttle() {
		$throttle = get_option('trx_addons_throttle');
		if (empty($throttle)) $throttle = array('time'=>0, 'last'=>array());
		$now = time();
		if ($now - $throttle['time'] > TRX_ADDONS_THROTTLE_DELAY) {
			// Add time of the current query
			if (count($throttle['last']) >= TRX_ADDONS_THROTTLE_QUERIES)
				array_shift($throttle['last']);
			array_push($throttle['last'], $now);
			// Check total queries
			$total = 1;
			for ($i=count($throttle['last'])-2; $i>=0; $i--) {
				if ($now - $throttle['last'][$i] <= TRX_ADDONS_THROTTLE_TIME) {
					$total++;
				} else
					break;
			}
			if ($total >= TRX_ADDONS_THROTTLE_QUERIES) {
				$throttle['time'] = $now;
				$throttle['last'] = array();
			}
			update_option('trx_addons_throttle', $throttle);
		}
		// Reject
		if ($now - $throttle['time'] < TRX_ADDONS_THROTTLE_DELAY) {
			return true;
		}
		return false;
	}
}
