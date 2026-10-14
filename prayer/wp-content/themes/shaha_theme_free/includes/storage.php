<?php
/**
 * Theme storage manipulations
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

// Disable direct call
if ( ! defined( 'ABSPATH' ) ) { exit; }

// Get theme variable
if (!function_exists('shaha_storage_get')) {
	function shaha_storage_get($var_name, $default='') {
		global $Shaha_STORAGE;
		return isset($Shaha_STORAGE[$var_name]) ? $Shaha_STORAGE[$var_name] : $default;
	}
}

// Set theme variable
if (!function_exists('shaha_storage_set')) {
	function shaha_storage_set($var_name, $value) {
		global $Shaha_STORAGE;
		$Shaha_STORAGE[$var_name] = $value;
	}
}

// Check if theme variable is empty
if (!function_exists('shaha_storage_empty')) {
	function shaha_storage_empty($var_name, $key='', $key2='') {
		global $Shaha_STORAGE;
		if (!empty($key) && !empty($key2))
			return empty($Shaha_STORAGE[$var_name][$key][$key2]);
		else if (!empty($key))
			return empty($Shaha_STORAGE[$var_name][$key]);
		else
			return empty($Shaha_STORAGE[$var_name]);
	}
}

// Check if theme variable is set
if (!function_exists('shaha_storage_isset')) {
	function shaha_storage_isset($var_name, $key='', $key2='') {
		global $Shaha_STORAGE;
		if (!empty($key) && !empty($key2))
			return isset($Shaha_STORAGE[$var_name][$key][$key2]);
		else if (!empty($key))
			return isset($Shaha_STORAGE[$var_name][$key]);
		else
			return isset($Shaha_STORAGE[$var_name]);
	}
}

// Inc/Dec theme variable with specified value
if (!function_exists('shaha_storage_inc')) {
	function shaha_storage_inc($var_name, $value=1) {
		global $Shaha_STORAGE;
		if (empty($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = 0;
		$Shaha_STORAGE[$var_name] += $value;
	}
}

// Concatenate theme variable with specified value
if (!function_exists('shaha_storage_concat')) {
	function shaha_storage_concat($var_name, $value) {
		global $Shaha_STORAGE;
		if (empty($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = '';
		$Shaha_STORAGE[$var_name] .= $value;
	}
}

// Get array (one or two dim) element
if (!function_exists('shaha_storage_get_array')) {
	function shaha_storage_get_array($var_name, $key, $key2='', $default='') {
		global $Shaha_STORAGE;
		if (empty($key2))
			return !empty($var_name) && !empty($key) && isset($Shaha_STORAGE[$var_name][$key]) ? $Shaha_STORAGE[$var_name][$key] : $default;
		else
			return !empty($var_name) && !empty($key) && isset($Shaha_STORAGE[$var_name][$key][$key2]) ? $Shaha_STORAGE[$var_name][$key][$key2] : $default;
	}
}

// Set array element
if (!function_exists('shaha_storage_set_array')) {
	function shaha_storage_set_array($var_name, $key, $value) {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if ($key==='')
			$Shaha_STORAGE[$var_name][] = $value;
		else
			$Shaha_STORAGE[$var_name][$key] = $value;
	}
}

// Set two-dim array element
if (!function_exists('shaha_storage_set_array2')) {
	function shaha_storage_set_array2($var_name, $key, $key2, $value) {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if (!isset($Shaha_STORAGE[$var_name][$key])) $Shaha_STORAGE[$var_name][$key] = array();
		if ($key2==='')
			$Shaha_STORAGE[$var_name][$key][] = $value;
		else
			$Shaha_STORAGE[$var_name][$key][$key2] = $value;
	}
}

// Merge array elements
if (!function_exists('shaha_storage_merge_array')) {
	function shaha_storage_merge_array($var_name, $key, $value) {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if ($key==='')
			$Shaha_STORAGE[$var_name] = array_merge($Shaha_STORAGE[$var_name], $value);
		else
			$Shaha_STORAGE[$var_name][$key] = array_merge($Shaha_STORAGE[$var_name][$key], $value);
	}
}

// Add array element after the key
if (!function_exists('shaha_storage_set_array_after')) {
	function shaha_storage_set_array_after($var_name, $after, $key, $value='') {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if (is_array($key))
			shaha_array_insert_after($Shaha_STORAGE[$var_name], $after, $key);
		else
			shaha_array_insert_after($Shaha_STORAGE[$var_name], $after, array($key=>$value));
	}
}

// Add array element before the key
if (!function_exists('shaha_storage_set_array_before')) {
	function shaha_storage_set_array_before($var_name, $before, $key, $value='') {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if (is_array($key))
			shaha_array_insert_before($Shaha_STORAGE[$var_name], $before, $key);
		else
			shaha_array_insert_before($Shaha_STORAGE[$var_name], $before, array($key=>$value));
	}
}

// Push element into array
if (!function_exists('shaha_storage_push_array')) {
	function shaha_storage_push_array($var_name, $key, $value) {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if ($key==='')
			array_push($Shaha_STORAGE[$var_name], $value);
		else {
			if (!isset($Shaha_STORAGE[$var_name][$key])) $Shaha_STORAGE[$var_name][$key] = array();
			array_push($Shaha_STORAGE[$var_name][$key], $value);
		}
	}
}

// Pop element from array
if (!function_exists('shaha_storage_pop_array')) {
	function shaha_storage_pop_array($var_name, $key='', $defa='') {
		global $Shaha_STORAGE;
		$rez = $defa;
		if ($key==='') {
			if (isset($Shaha_STORAGE[$var_name]) && is_array($Shaha_STORAGE[$var_name]) && count($Shaha_STORAGE[$var_name]) > 0) 
				$rez = array_pop($Shaha_STORAGE[$var_name]);
		} else {
			if (isset($Shaha_STORAGE[$var_name][$key]) && is_array($Shaha_STORAGE[$var_name][$key]) && count($Shaha_STORAGE[$var_name][$key]) > 0) 
				$rez = array_pop($Shaha_STORAGE[$var_name][$key]);
		}
		return $rez;
	}
}

// Inc/Dec array element with specified value
if (!function_exists('shaha_storage_inc_array')) {
	function shaha_storage_inc_array($var_name, $key, $value=1) {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if (empty($Shaha_STORAGE[$var_name][$key])) $Shaha_STORAGE[$var_name][$key] = 0;
		$Shaha_STORAGE[$var_name][$key] += $value;
	}
}

// Concatenate array element with specified value
if (!function_exists('shaha_storage_concat_array')) {
	function shaha_storage_concat_array($var_name, $key, $value) {
		global $Shaha_STORAGE;
		if (!isset($Shaha_STORAGE[$var_name])) $Shaha_STORAGE[$var_name] = array();
		if (empty($Shaha_STORAGE[$var_name][$key])) $Shaha_STORAGE[$var_name][$key] = '';
		$Shaha_STORAGE[$var_name][$key] .= $value;
	}
}

// Call object's method
if (!function_exists('shaha_storage_call_obj_method')) {
	function shaha_storage_call_obj_method($var_name, $method, $param=null) {
		global $Shaha_STORAGE;
		if ($param===null)
			return !empty($var_name) && !empty($method) && isset($Shaha_STORAGE[$var_name]) ? $Shaha_STORAGE[$var_name]->$method(): '';
		else
			return !empty($var_name) && !empty($method) && isset($Shaha_STORAGE[$var_name]) ? $Shaha_STORAGE[$var_name]->$method($param): '';
	}
}

// Get object's property
if (!function_exists('shaha_storage_get_obj_property')) {
	function shaha_storage_get_obj_property($var_name, $prop, $default='') {
		global $Shaha_STORAGE;
		return !empty($var_name) && !empty($prop) && isset($Shaha_STORAGE[$var_name]->$prop) ? $Shaha_STORAGE[$var_name]->$prop : $default;
	}
}
?>