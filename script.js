document.addEventListener('DOMContentLoaded', function() {
    const blinkingText = document.getElementById('blinking');
    setInterval(() => {
        blinkingText.style.visibility = (blinkingText.style.visibility === 'hidden') ? 'visible' : 'hidden';
    }, 500);

    const buttons = document.querySelectorAll('.btn');
    const hour = new Date().getHours();

    buttons.forEach(button => {
        if (hour >= 6 && hour < 12) {
            button.classList.add('morning');
        } else if (hour >= 12 && hour < 18) {
            button.classList.add('afternoon');
        } else {
            button.classList.add('evening');
        }
    });
});
