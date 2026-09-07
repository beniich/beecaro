<?php
/**
 * BeeCarbonat Admin Menu & Settings
 */

if (!defined('ABSPATH')) {
    exit;
}

function beecarbonat_add_admin_menu() {
    // Top-level menu
    add_menu_page(
        'BeeCarbonat Enterprise',
        'BeeCarbonat OS',
        'manage_options',
        'beecarbonat-dashboard',
        'beecarbonat_render_admin_dashboard',
        'dashicons-chart-area',
        30
    );

    // Submenu: Live Dashboard
    add_submenu_page(
        'beecarbonat-dashboard',
        'Tableau de bord BeeCarbonat',
        'Tableau de bord',
        'manage_options',
        'beecarbonat-dashboard',
        'beecarbonat_render_admin_dashboard'
    );

    // Submenu: Settings
    add_submenu_page(
        'beecarbonat-dashboard',
        'Réglages BeeCarbonat',
        'Réglages & Configuration',
        'manage_options',
        'beecarbonat-settings',
        'beecarbonat_render_admin_settings'
    );

    // Submenu: Shortcodes Documentation
    add_submenu_page(
        'beecarbonat-dashboard',
        'Guide & Shortcodes',
        'Guide & Intégration',
        'manage_options',
        'beecarbonat-docs',
        'beecarbonat_render_admin_docs'
    );
}
add_action('admin_menu', 'beecarbonat_add_admin_menu');

// Register settings
function beecarbonat_register_settings() {
    register_setting('beecarbonat_settings_group', 'beecarbonat_options');
}
add_action('admin_init', 'beecarbonat_register_settings');

// Admin Dashboard Page (Embedded Cockpit inside WP-Admin)
function beecarbonat_render_admin_dashboard() {
    $options = get_option('beecarbonat_options', array());
    $app_url = !empty($options['app_url']) ? $options['app_url'] : 'https://ais-pre-jusd7a677bwjsidqvkttkn-783660138806.europe-west2.run.app';
    $theme = !empty($options['default_theme']) ? $options['default_theme'] : 'dark';
    $lang = !empty($options['default_lang']) ? $options['default_lang'] : 'fr';

    wp_enqueue_style('beecarbonat-css');
    wp_enqueue_script('beecarbonat-js');
    ?>
    <div class="wrap beecarbonat-admin-wrap">
        <div class="beecarbonat-admin-header">
            <div>
                <h1 class="beecarbonat-admin-title">BeeCarbonat Enterprise OS</h1>
                <p class="beecarbonat-admin-subtitle">Portail centralisé ESG, CAFM, Gestion Énergétique & Marché Carbone pour WordPress.</p>
            </div>
            <div>
                <a href="<?php echo esc_url($app_url); ?>" target="_blank" class="button button-primary" style="background:#8b5cf6;border-color:#7c3aed;">
                    Ouvrir en plein écran &#x2197;
                </a>
            </div>
        </div>

        <?php echo do_shortcode('[beecarbonat url="' . esc_url($app_url) . '" height="900px" theme="' . esc_attr($theme) . '" lang="' . esc_attr($lang) . '" title="BeeCarbonat Cockpit Live"]'); ?>
    </div>
    <?php
}

// Admin Settings Page
function beecarbonat_render_admin_settings() {
    $options = get_option('beecarbonat_options', array());
    $current_url = !empty($options['app_url']) ? $options['app_url'] : 'https://ais-pre-jusd7a677bwjsidqvkttkn-783660138806.europe-west2.run.app';
    $current_height = !empty($options['default_height']) ? $options['default_height'] : '850px';
    $current_theme = !empty($options['default_theme']) ? $options['default_theme'] : 'dark';
    $current_lang = !empty($options['default_lang']) ? $options['default_lang'] : 'fr';
    ?>
    <div class="wrap beecarbonat-admin-wrap">
        <div class="beecarbonat-admin-header">
            <div>
                <h1 class="beecarbonat-admin-title">Configuration BeeCarbonat</h1>
                <p class="beecarbonat-admin-subtitle">Configurez l'adresse de votre plateforme déployée et les paramètres par défaut.</p>
            </div>
        </div>

        <form method="post" action="options.php" style="background:#fff;padding:24px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:800px;">
            <?php settings_fields('beecarbonat_settings_group'); ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="app_url">URL de l'application BeeCarbonat</label></th>
                    <td>
                        <input name="beecarbonat_options[app_url]" type="url" id="app_url" value="<?php echo esc_attr($current_url); ?>" class="regular-text" style="width:100%;max-width:550px;" required />
                        <p class="description">URL Cloud Run, Vercel ou domaine personnalisé de votre application (ex: <code>https://votre-app.run.app</code>).</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label for="default_height">Hauteur par défaut</label></th>
                    <td>
                        <input name="beecarbonat_options[default_height]" type="text" id="default_height" value="<?php echo esc_attr($current_height); ?>" class="regular-text" style="width:150px;" />
                        <p class="description">Exemple: <code>850px</code> ou <code>90vh</code> ou <code>100%</code>.</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label for="default_theme">Thème par défaut</label></th>
                    <td>
                        <select name="beecarbonat_options[default_theme]" id="default_theme">
                            <option value="dark" <?php selected($current_theme, 'dark'); ?>>Cyberpunk Sombre (Recommandé)</option>
                            <option value="light" <?php selected($current_theme, 'light'); ?>>Clair Moderne</option>
                        </select>
                        <p class="description">Style visuel appliqué à l'encadrement et au portail.</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label for="default_lang">Langue par défaut</label></th>
                    <td>
                        <select name="beecarbonat_options[default_lang]" id="default_lang">
                            <option value="fr" <?php selected($current_lang, 'fr'); ?>>Français</option>
                            <option value="en" <?php selected($current_lang, 'en'); ?>>English</option>
                            <option value="ar" <?php selected($current_lang, 'ar'); ?>>العربية</option>
                        </select>
                    </td>
                </tr>
            </table>

            <?php submit_button('Enregistrer les modifications'); ?>
        </form>
    </div>
    <?php
}

// Admin Docs Page
function beecarbonat_render_admin_docs() {
    ?>
    <div class="wrap beecarbonat-admin-wrap">
        <div class="beecarbonat-admin-header">
            <div>
                <h1 class="beecarbonat-admin-title">Exemples de Shortcodes WordPress</h1>
                <p class="beecarbonat-admin-subtitle">Copiez et collez ces codes courts directement dans Gutenberg, Elementor ou Divi.</p>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:20px;margin-top:20px;">
            <div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;color:#1e293b;">1. Affichage Complet Standard</h3>
                <p style="color:#64748b;font-size:13px;">Affiche toute l'application avec le bandeau interactif et le mode plein écran :</p>
                <code style="display:block;background:#0f0e17;color:#ecd7ff;padding:12px;border-radius:6px;font-size:14px;">[beecarbonat]</code>
            </div>

            <div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;color:#1e293b;">2. Vue Marché Carbone & ESG</h3>
                <p style="color:#64748b;font-size:13px;">Ouvre directement le module de trading de crédits carbone et conformité :</p>
                <code style="display:block;background:#0f0e17;color:#ecd7ff;padding:12px;border-radius:6px;font-size:14px;">[beecarbonat view="carbonmarket" height="900px"]</code>
            </div>

            <div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;color:#1e293b;">3. Vue Maintenance CAFM & GMAO</h3>
                <p style="color:#64748b;font-size:13px;">Portail d'intervention technique, bons de travail et QR codes équipements :</p>
                <code style="display:block;background:#0f0e17;color:#ecd7ff;padding:12px;border-radius:6px;font-size:14px;">[beecarbonat view="cmms" height="850px"]</code>
            </div>

            <div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
                <h3 style="margin-top:0;color:#1e293b;">4. Intégration Épurée Sans Barre Supérieure</h3>
                <p style="color:#64748b;font-size:13px;">Pour un rendu 100% transparent intégré dans vos maquettes sur-mesure :</p>
                <code style="display:block;background:#0f0e17;color:#ecd7ff;padding:12px;border-radius:6px;font-size:14px;">[beecarbonat topbar="false" height="100vh"]</code>
            </div>
        </div>
    </div>
    <?php
}
