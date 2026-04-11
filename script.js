// Shared script for blog post pages
document.addEventListener('DOMContentLoaded', function() {
    // Blinking cursor in logo
    const blinkingText = document.getElementById('blinking');
    if (blinkingText) {
        setInterval(() => {
            blinkingText.style.visibility = (blinkingText.style.visibility === 'hidden') ? 'visible' : 'hidden';
        }, 500);
    }

    // GA Event Tracking for blog posts
    if (typeof gtag === 'function') {
        var pageTitle = document.title;

        // Outbound link clicks
        document.querySelectorAll('a[target="_blank"]').forEach(function(el) {
            el.addEventListener('click', function() {
                gtag('event', 'outbound_click', { event_category: 'outbound', event_label: el.href });
            });
        });

        // Resume download
        document.querySelectorAll('a[href*="Resume"]').forEach(function(el) {
            el.addEventListener('click', function() {
                gtag('event', 'resume_download', { event_category: 'engagement', event_label: 'Resume Download - ' + pageTitle });
            });
        });

        // Nav link clicks
        document.querySelectorAll('.nav-link, .footer-link').forEach(function(el) {
            el.addEventListener('click', function() {
                gtag('event', 'nav_click', { event_category: 'navigation', event_label: el.textContent.trim() + ' - ' + pageTitle });
            });
        });

        // Scroll depth tracking (25%, 50%, 75%, 100%)
        var scrollMarkers = { 25: false, 50: false, 75: false, 100: false };
        window.addEventListener('scroll', function() {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            var pct = Math.round((scrollTop / docHeight) * 100);
            [25, 50, 75, 100].forEach(function(mark) {
                if (pct >= mark && !scrollMarkers[mark]) {
                    scrollMarkers[mark] = true;
                    gtag('event', 'scroll_depth', {
                        event_category: 'content',
                        event_label: pageTitle,
                        value: mark
                    });
                }
            });
        });
    }
});
