document.addEventListener('DOMContentLoaded', function() {
    // const bubbleContainer = document.getElementById('bubbles');
    const playGameButton = document.getElementById('playButton');

    let bubbles = [];

    for (let i = 0; i < 18; i++) {
        const randomDelay = Math.random() * 3 + 0.5;

        setTimeout(() => {
            const bubble = document.createElement('img');
            bubble.src = '../images/bubble.png';
            bubble.className = 'bubble';
            document.body.appendChild(bubble);
            bubbles.push(bubble);
            startBubbleRise(bubble);
        }, randomDelay * 1000);
    }

    function startBubbleRise(bubble) {
        bubble.style.left = `${Math.random() * 99}vw`;
        const scaleValue = Math.random() * 1.9 + 0.2;
        bubble.style.display = 'block';
        bubble.style.scale = scaleValue;

        bubble.style.animation = 'none';
        bubble.offsetHeight;
        bubble.style.animation = `bubbleRise ${5 + scaleValue*0.5}s linear forwards`;

        bubble.addEventListener('animationend', () => {
            bubble.style.bottom = 0;
            startBubbleRise(bubble);
        }, { once: true });
    }

    playGameButton.addEventListener('click', () => {
        window.location.href = 'lobby.html';
    });


});