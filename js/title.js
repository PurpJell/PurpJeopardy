document.addEventListener('DOMContentLoaded', function() {
    // const bubbleContainer = document.getElementById('bubbles');
    const playGameButton = document.getElementById('playButton');

    const animationContainer = document.createElement('div');
    animationContainer.id = 'animations';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = 0;
    animationContainer.style.left = 0;
    animationContainer.style.width = '100vw';
    animationContainer.style.height = '100vh';
    animationContainer.style.overflow = 'hidden';

    document.body.appendChild(animationContainer);

    let bubbles = [];

    for (let i = 0; i < 26; i++) {
        const randomDelay = Math.random() * 3 + 0.5;

        setTimeout(() => {
            const bubble = document.createElement('img');
            const bubbleColor = Math.floor(Math.random() * 3);
            if (bubbleColor === 0) {
                bubble.src = '../images/bubble1.png';
            } else if (bubbleColor === 1) {
                bubble.src = '../images/bubble2.png';
            }
            else {
                bubble.src = '../images/bubble3.png';
            }
            bubble.className = 'bubble';
            animationContainer.appendChild(bubble);
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

    function spawnHook() {
        const hook = document.createElement('img');
        hook.style.position = 'relative';
        hook.style.width = '5vw';
        hook.src = '../images/hook.png';
        hook.className = 'hook';
        animationContainer.appendChild(hook);
        dropInHook(hook);
    }

    function dropInHook(hook) {
        hook.style.left = `${Math.random() * 50 + 25}vw`; // 25-75vw
        hook.style.top = '-100vh';
        const depth = Math.random() * 20 + 40; // 40-60vh

        console.log(depth);

        const keyframes = [
            { transform: 'translateY(0vh)', offset: 0},
            { transform: `translateY(${depth}vh)`, offset: 1}
        ];

        const options = {
            duration: 3000, // 5 seconds
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        const animation = hook.animate(keyframes, options);

        animation.onfinish = () => {
            hook.style.top = `${depth-100}vh`;
            startHookMovement(hook);
        };
    }

    function startHookMovement(hook) {
        

        const direction = Math.random() > 0.5 ? 1 : -1;
        const displacement = Math.random() * 10 + 15; // 15-25vw

        hook.style.scaleX = direction *-1;

        const keyframes = [
            { transform: `translateX(0)`, offset: 0},
            { transform: `translateX(${displacement * direction *15/65}vw) translateY(${Math.random() * 10 + 10}vh) scaleX(${direction *-1})`, offset: 0.15},
            { transform: `translateX(${displacement * direction *30/65}vw) translateY(${Math.random() * -5 - 10}vh) scaleX(${direction *-1})`, offset: 0.30},
            { transform: `translateX(${displacement * direction *45/65}vw) translateY(${Math.random() * 25 + 5}vh) scaleX(${direction *-1})`, offset: 0.45},
            { transform: `translateX(${displacement * direction *60/65}vw) translateY(0) scaleX(${direction *-1})`, offset: 0.60},
            { transform: `translateX(${displacement * direction}vw)`, offset: 0.65},
            { transform: `translateX(${displacement * direction}vw) scaleX(${direction})`, offset: 0.66},
            { transform: `translateX(${displacement * direction *25/35}vw) translateY(${Math.random() * -5 -5}vh) scaleX(${direction})`, offset: 0.75},
            { transform: `translateX(${displacement * direction *10/35}vw) translateY(${Math.random() * 10 + 10}vh) scaleX(${direction})`, offset: 0.90},
            { transform: `translateX(0) translateY(0) scaleX(${direction})`, offset: 1}
        ];

        const options = {
            duration: 5000, // 5 seconds
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        const animation = hook.animate(keyframes, options);

        animation.onfinish = () => {
            startHookPull(hook);
        };
    }

    function startHookPull(hook) {
        const keyframes = [
            { transform: 'translateY(0)', offset: 0},
            { transform: 'translateY(-100vh)', offset: 1}
        ];

        const options = {
            duration: 5000, // 5 seconds
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        const animation = hook.animate(keyframes, options);

        animation.onfinish = () => {
            hook.remove();
            spawnHook();
        };
    }

    spawnHook();

    playGameButton.addEventListener('click', () => {
        window.location.href = 'lobby.html';
    });


});