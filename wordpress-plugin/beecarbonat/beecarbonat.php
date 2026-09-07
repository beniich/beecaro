<?php
/**
 * Plugin Name: BeeCarbonat Enterprise - Smart ESG & CAFM Portal
 * Plugin URI: https://beecarbonat.com
 * Description: Intégration officielle de la plateforme BeeCarbonat pour WordPress : Intégrez vos cockpits de pilotage ESG, CAFM, gestion d'énergie, bilans carbone et maintenance technique dans vos pages WordPress ou directement dans wp-admin via le shortcode [beecarbonat].
 * Version: 1.0.0
 * Author: BeeCarbonat Team
 * Author URI: https://beecarbonat.com
 * License: GPL-2.0+
 * Text Domain: beecarbonat
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('BEECARBONAT_VERSION', '1.0.0');
define('BEECARBONAT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BEECARBONAT_PLUGIN_URL', plugin_dir_url(__FILE__));

// Enqueue styles and scripts
function beecarbonat_register_assets() {
    wp_register_style(
        'beecarbonat-css',
        BEECARBONAT_PLUGIN_URL . 'assets/css/beecarbonat.css',
        array(),
        BEECARBONAT_VERSION
    );

    wp_register_script(
        'beecarbonat-js',
        BEECARBONAT_PLUGIN_URL . 'assets/js/beecarbonat.js',
        array(),
        BEECARBONAT_VERSION,
        true
    );
}
add_action('wp_enqueue_scripts', 'beecarbonat_register_assets');
add_action('admin_enqueue_scripts', 'beecarbonat_register_assets');

// Include Shortcode
require_once BEECARBONAT_PLUGIN_DIR . 'includes/shortcode.php';

// Include Admin Settings & Menu
if (is_admin()) {
    require_once BEECARBONAT_PLUGIN_DIR . 'includes/admin-settings.php';
}

// Add settings link on plugin page
function beecarbonat_plugin_action_links($links) {
    $settings_link = '<a href="admin.php?page=beecarbonat-settings">' . __('Réglages', 'beecarbonat') . '</a>';
    $dashboard_link = '<a href="admin.php?page=beecarbonat-dashboard" style="font-weight:bold;color:#8b5cf6;">' . __('Cockpit Live', 'beecarbonat') . '</a>';
    array_unshift($links, $dashboard_link, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'beecarbonat_plugin_action_links');
