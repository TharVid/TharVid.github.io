// Shared script for blog post pages
document.addEventListener('DOMContentLoaded', function() {
    // Blinking cursor in logo
    const blinkingText = document.getElementById('blinking');
    if (blinkingText) {
        setInterval(() => {
            blinkingText.style.visibility = (blinkingText.style.visibility === 'hidden') ? 'visible' : 'hidden';
        }, 500);
    }
});
