<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'khadijat_wp563' );

/** Database username */
define( 'DB_USER', 'khadijat_wp563' );

/** Database password */
define( 'DB_PASSWORD', '2@5VsrS2.p' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

define('DISABLE_WP_CRON', true);

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'olgertelydw3f7wvpugjvejhajrxjpc3x1jsvp39pjej0bobwg1ie7qpczjny9cr' );
define( 'SECURE_AUTH_KEY',  'lo3gvoc1f1m9vns6xvzbp4pcv09qhfamfwtfyjad1dllgnkdfmyv7g1suiu0a0tw' );
define( 'LOGGED_IN_KEY',    'xa6ptjexlkndhlxsneduclyojlioiaoeaemdefs7vqlivriaqub7fgr1yxy3tuui' );
define( 'NONCE_KEY',        'uyacnrykvdaqhzwmenveojone3n1tuob6wo1tx4jbjky3j3nshc2xfyefkdu29hu' );
define( 'AUTH_SALT',        '7pkuey1xdgxbzuesf7s3rk7r63o2no49lqq21gai4ugrqeyfd3hishiuktwmrzvd' );
define( 'SECURE_AUTH_SALT', 'k6mdysux3equslwgnisbyfkxqngwrhuoftjwwkyxh5qhpu6km6eayalpcknhbpn2' );
define( 'LOGGED_IN_SALT',   'vltoadvfn4cgufqn41m4gxdfgiwand9oncl4ovjazgezt3duuuzodkqbrqe8lt8h' );
define( 'NONCE_SALT',       'j9xrqqm3cns1sr5tugtig2g0f3t76njyjx7deenkhfbp8n4r3yqddchsqq3qjklr' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wpuj_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';