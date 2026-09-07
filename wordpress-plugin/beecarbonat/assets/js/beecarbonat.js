/**
 * BeeCarbonat Enterprise - WordPress Plugin JavaScript
 * Handles iFrame interactions, fullscreen toggle, and postMessage bridge
 */

(function() {
    'use strict';

    function initBeeCarbonat() {
        var embeds = document.querySelectorAll('.beecarbonat-embed-wrapper');
        
        embeds.forEach(function(wrapper) {
            if (wrapper.dataset.beecarbonatInit) return;
            wrapper.dataset.beecarbonatInit = 'true';

            var iframe = wrapper.querySelector('.beecarbonat-iframe');
            var loader = wrapper.querySelector('.beecarbonat-loader');
            var fullscreenBtn = wrapper.querySelector('.beecarbonat-fullscreen-btn');
            var reloadBtn = wrapper.querySelector('.beecarbonat-reload-btn');

            // Hide loader on iframe load
            if (iframe && loader) {
                iframe.addEventListener('load', function() {
                    loader.classList.add('loaded');
                });
                // Fallback timeout in case load event takes long
                setTimeout(function() {
                    if (loader) loader.classList.add('loaded');
                }, 4000);
            }

            // Reload button
            if (reloadBtn && iframe) {
                reloadBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (loader) loader.classList.remove('loaded');
                    iframe.src = iframe.src;
                });
            }

            // Fullscreen toggle
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var isFullscreen = wrapper.classList.toggle('beecarbonat-fullscreen-active');
                    
                    if (isFullscreen) {
                        fullscreenBtn.innerHTML = '&#x2715; Réduire';
                        document.body.style.overflow = 'hidden';
                    } else {
                        fullscreenBtn.innerHTML = '&#x26F6; Plein écran';
                        document.body.style.overflow = '';
                    }
                });
            }
        });

        // Listen for postMessage from BeeCarbonat application
        window.addEventListener('message', function(event) {
            if (!event.data || typeof event.data !== 'object') return;

            // Handle height resize message if emitted
            if (event.data.type === 'BEECARBONAT_RESIZE' && event.data.height) {
                var iframe = document.querySelector('.beecarbonat-iframe');
                if (iframe && iframe.parentElement) {
                    iframe.parentElement.style.height = event.data.height + 'px';
                }
            }

            // Handle navigation redirect message if emitted
            if (event.data.type === 'BEECARBONAT_REDIRECT' && event.data.url) {
                window.location.href = event.data.url;
            }
        });

        // Close fullscreen on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var activeFullscreen = document.querySelector('.beecarbonat-fullscreen-active');
                if (activeFullscreen) {
                    activeFullscreen.classList.remove('beecarbonat-fullscreen-active');
                    document.body.style.overflow = '';
                    var btn = activeFullscreen.querySelector('.beecarbonat-fullscreen-btn');
                    if (btn) btn.innerHTML = '&#x26F6; Plein écran';
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBeeCarbonat);
    } else {
        initBeeCarbonat();
    }
})();
