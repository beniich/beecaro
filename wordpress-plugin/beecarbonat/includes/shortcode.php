<?php
/**
 * BeeCarbonat Shortcode Handler
 * Provides [beecarbonat] shortcode for WordPress pages, posts, and Elementor
 */

if (!defined('ABSPATH')) {
    exit;
}

function beecarbonat_render_shortcode($atts) {
    $options = get_option('beecarbonat_options', array());
    $default_url = !empty($options['app_url']) ? $options['app_url'] : 'https://ais-pre-jusd7a677bwjsidqvkttkn-783660138806.europe-west2.run.app';
    $default_height = !empty($options['default_height']) ? $options['default_height'] : '850px';
    $default_theme = !empty($options['default_theme']) ? $options['default_theme'] : 'dark';
    $default_lang = !empty($options['default_lang']) ? $options['default_lang'] : 'fr';

    $a = shortcode_atts(array(
        'url'        => $default_url,
        'view'       => '',
        'height'     => $default_height,
        'theme'      => $default_theme,
        'lang'       => $default_lang,
        'title'      => 'BeeCarbonat Enterprise Portal',
        'topbar'     => 'true',
        'fullscreen' => 'true',
    ), $atts, 'beecarbonat');

    // Build iframe URL with parameters
    $target_url = esc_url($a['url']);
    $params = array();

    if (!empty($a['view'])) {
        $params['view'] = sanitize_text_field($a['view']);
    }
    if (!empty($a['theme'])) {
        $params['theme'] = sanitize_text_field($a['theme']);
    }
    if (!empty($a['lang'])) {
        $params['lang'] = sanitize_text_field($a['lang']);
    }

    if (!empty($params)) {
        $separator = (strpos($target_url, '?') !== false) ? '&' : '?';
        $target_url .= $separator . http_build_query($params);
    }

    $height_css = esc_attr($a['height']);
    $theme_class = ($a['theme'] === 'light') ? 'beecarbonat-light-mode' : '';
    $show_topbar = filter_var($a['topbar'], FILTER_VALIDATE_BOOLEAN);
    $show_fullscreen = filter_var($a['fullscreen'], FILTER_VALIDATE_BOOLEAN);

    // Enqueue styles and scripts
    wp_enqueue_style('beecarbonat-css');
    wp_enqueue_script('beecarbonat-js');

    ob_start();
    ?>
    <div class="beecarbonat-embed-wrapper <?php echo esc_attr($theme_class); ?>" id="beecarbonat-app-<?php echo esc_attr(uniqid()); ?>">
        <div class="beecarbonat-card <?php echo esc_attr($theme_class); ?>">
            <?php if ($show_topbar): ?>
                <div class="beecarbonat-top-bar">
                    <div class="beecarbonat-brand">
                        <span class="beecarbonat-logo-dot"></span>
                        <span><?php echo esc_html($a['title']); ?></span>
                    </div>
                    <div class="beecarbonat-actions">
                        <button type="button" class="beecarbonat-btn-icon beecarbonat-reload-btn" title="Actualiser le tableau de bord">
                            &#x21BB; Actualiser
                        </button>
                        <?php if ($show_fullscreen): ?>
                            <button type="button" class="beecarbonat-btn-icon beecarbonat-fullscreen-btn" title="Basculer plein écran">
                                &#x26F6; Plein écran
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <div class="beecarbonat-iframe-container" style="height: <?php echo $height_css; ?>;">
                <!-- Loading State -->
                <div class="beecarbonat-loader">
                    <div class="beecarbonat-spinner"></div>
                    <div class="beecarbonat-loader-text">Chargement BeeCarbonat...</div>
                </div>

                <!-- Live React App iFrame -->
                <iframe 
                    class="beecarbonat-iframe" 
                    src="<?php echo esc_url($target_url); ?>" 
                    title="<?php echo esc_attr($a['title']); ?>"
                    allow="camera; microphone; geolocation; fullscreen; clipboard-read; clipboard-write;"
                    loading="lazy"
                ></iframe>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('beecarbonat', 'beecarbonat_render_shortcode');
