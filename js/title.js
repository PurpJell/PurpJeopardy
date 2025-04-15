document.addEventListener('DOMContentLoaded', function() {
    const playGameButton = document.getElementById('playButton');
    const createBoardButton = document.getElementById('createBoardButton');
    const optionsButton = document.getElementById('optionsButton');
    const exitGameButton = document.getElementById('exitButton');
    const languageButton = document.getElementById('languageButton');

    const cover = document.getElementById('cover');
    const optionsScreen = document.getElementById('optionsScreen');
    const optionsTitleText = document.getElementById('optionsTitleText');
    const musicVolumeText = document.getElementById('musicVolumeText');
    const musicVolumeSlider = document.getElementById('musicVolumeSlider');
    const soundEffectsVolumeText = document.getElementById('soundEffectsVolumeText');
    const soundEffectsVolumeSlider = document.getElementById('soundEffectsVolumeSlider');
    const ipAddressText = document.getElementById('ipAddressText');
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const saveOptionsButton = document.getElementById('saveOptionsButton');
    const cancelOptionsButton = document.getElementById('cancelOptionsButton');

    let language = localStorage.getItem('language') || 'en';
    let musicVolume = localStorage.getItem('musicVolume') || 100;
    let soundEffectsVolume = localStorage.getItem('soundEffectsVolume') || 100;
    let ipAddress = window.electron.ipcRenderer.sendSync('get-ip-address');
    localStorage.setItem('ipAddress', ipAddress);

    window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);

    if (language === 'lt') {
        playGameButton.textContent = '\u017Daisti';
        createBoardButton.textContent = 'Sukurti lent\u0105';
        optionsButton.textContent = 'Nustatymai';
        exitGameButton.textContent = 'I\u0161eiti';
        languageButton.src = '../images/icons/flag_lt.png';
        optionsTitleText.textContent = 'Nustatymai';
        musicVolumeText.textContent = 'Muzikos garsumas';
        soundEffectsVolumeText.textContent = 'Efekt\u0173 garsumas';
        ipAddressText.textContent = 'IP adresas';
        saveOptionsButton.textContent = 'I\u0161saugoti';
        cancelOptionsButton.textContent = 'At\u0161aukti';
    }
    else {
        languageButton.src = '../images/icons/flag_en.png';
    }

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

    function spawnBubbles(){
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
    }

    
    function startBubbleRise(bubble) {
        bubble.style.left = `${Math.random() * 99}vw`;
        const scaleValue = Math.random() * 1.8 + 0.2; // 0.2 - 2.0
        if (scaleValue > 1.4) {
            bubble.style.zIndex = -1;
        }
        else {
            bubble.style.zIndex = -2;
        }
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
    
    function spawnFish() {
        const randomDelay = Math.random() * 3 + 0.5;
        
        setTimeout(() => {
            const fish = document.createElement('img');
            fish.src = '../images/fish1.png';
            fish.className = 'fish';
            animationContainer.appendChild(fish);
            startFishAnimation(fish);
        }, randomDelay * 1000);
    }
    
    function startFishAnimation(fish) {
        const direction = Math.random() > 0.5 ? "left" : "right";
        if (direction === "left") {
            fish.style.right = '-4vw';
        }
        else {
            fish.style.left = '-4vw';
        }
        
        fish.style.top = `${Math.random() * 75 + 18}%`;
        
        const randomColor = Math.floor(Math.random() * 3);
        if (randomColor === 0) {
            fish.src = '../images/fish1.png';
        } else if (randomColor === 1) {
            fish.src = '../images/fish2.png';
        } else {
            fish.src = '../images/fish3.png';
        }
        
        fish.style.scale = Math.random() + 1;
        
        fish.style.animation = 'none';
        fish.offsetHeight;
        
        fish.style.animation = `${direction === "left" ? "swimLeft" : "swimRight"} ${Math.random() * 3 + 5}s linear 1`;
        
        fish.addEventListener('animationend', () => {
            spawnFish();
            fish.remove();
        }, { once: true });
    }
    
    for (let i = 0; i < 12; i++) {
        spawnFish();
    }
    
    spawnBubbles();
    spawnHook();
    
    playGameButton.addEventListener('click', () => {
        window.location.href = 'lobby.html';
    });

    createBoardButton.addEventListener('click', () => {
        window.location.href = 'boardList.html';
    });

    let localIPs;

    optionsButton.addEventListener('click', () => {

        musicVolumeSlider.value = musicVolume;
        soundEffectsVolumeSlider.value = soundEffectsVolume;
        dropdownButton.textContent = ipAddress;

        if (!localIPs) {
            localIPs = window.electron.ipcRenderer.sendSync('get-ip-list');

            let ipList = localIPs.map(ip => {
                const option = document.createElement('option');
                option.value = ip;
                option.textContent = ip;
                return option;
            });

            ipList.forEach(ip => {
                const dropdownOption = document.createElement('div');
                dropdownOption.textContent = ip.value;
                dropdownOption.className = 'dropdown-option';
                dropdownOption.addEventListener('click', () => {
                    dropdownButton.textContent = ip.value;
                    dropdownMenu.style.display = 'none';
                });
                dropdownMenu.appendChild(dropdownOption);
            });
        }

        if (optionsScreen.style.display === 'flex') {
            optionsScreen.style.display = 'none';
            cover.style.display = 'none';
        } else {
            optionsScreen.style.display = 'flex';
            cover.style.display = 'block';
        }
    });

    musicVolumeSlider.addEventListener('input', () => {
        window.musicManager.setVolume(musicVolumeSlider.value / 100);
    });

    document.addEventListener('click', (event) => {
        if (event.target !== dropdownButton && event.target !== dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    });

    dropdownButton.addEventListener('click', () => {
        if (dropdownMenu.style.display === 'flex') {
            dropdownMenu.style.display = 'none';
        } else {
            dropdownMenu.style.display = 'flex';
        }
    });

    saveOptionsButton.addEventListener('click', () => {
        musicVolume = musicVolumeSlider.value;
        soundEffectsVolume = soundEffectsVolumeSlider.value;
        ipAddress = dropdownButton.textContent;

        let previousIP = localStorage.getItem('ipAddress');

        if (previousIP !== ipAddress) {
            let question = 'Changing the IP address will restart the game. Do you want to continue?';
            let yesText = 'Yes';
            let noText = 'No';
            if (language === 'lt') {
                question = 'Kei\u010Diant IP adres\u0105 reikia perkrauti \u017Eaidim\u0105. Ar tikrai norite t\u0119sti?';
                yesText = 'Taip';
                noText = 'Ne';
            }

            customConfirm(question, yesText, noText, false).then((result) => {
                if (!result) {
                    return;
                }
                else {
                    localStorage.setItem('musicVolume', musicVolume);
                    localStorage.setItem('soundEffectsVolume', soundEffectsVolume);
                    localStorage.setItem('ipAddress', ipAddress);
    
                    optionsScreen.style.display = 'none';
                    cover.style.display = 'none';
                    window.electron.ipcRenderer.send('set-config-ip', ipAddress);
                }
            });
        }
        else {
            localStorage.setItem('musicVolume', musicVolume);
            localStorage.setItem('soundEffectsVolume', soundEffectsVolume);
            localStorage.setItem('ipAddress', ipAddress);
    
            optionsScreen.style.display = 'none';
            cover.style.display = 'none';
        }

    });

    cancelOptionsButton.addEventListener('click', () => {

        musicVolume = localStorage.getItem('musicVolume') || 100;
        soundEffectsVolume = localStorage.getItem('soundEffectsVolume') || 100;
        ipAddress = localStorage.getItem('ipAddress');

        window.musicManager.setVolume(musicVolume / 100);

        optionsScreen.style.display = 'none';
        cover.style.display = 'none';
    });
    
    exitGameButton.addEventListener('click', () => {
        window.close();
    });

    languageButton.addEventListener('click', () => {
        if (language === 'en') {
            language = 'lt';
        }
        else {
            language = 'en';
        }
        localStorage.setItem('language', language);
        location.reload();
    });

    function customConfirm(message, yesText, noText, removeCover = true) {
        return new Promise((resolve) => {
            confirmText.textContent = message;
            confirmYesButton.textContent = yesText;
            confirmNoButton.textContent = noText;
            confirmWindow.style.display = 'flex';
            cover.style.display = 'block';
            cover.style.zIndex = 4;
    
            function handleYesClick() {
                cleanup();
                resolve(true); // Resolve the promise with `true` for "Yes"
            }
    
            function handleNoClick() {
                cleanup();
                resolve(false); // Resolve the promise with `false` for "No"
            }
    
            function handleEscapeKey(event) {
                if (event.key === 'Escape') {
                    cleanup();
                    resolve(false); // Treat Escape as a "No"
                }
            }
    
            confirmYesButton.addEventListener('click', handleYesClick);
            confirmNoButton.addEventListener('click', handleNoClick);
            document.addEventListener('keydown', handleEscapeKey);
    
            // Cleanup function to remove event listeners and hide the confirm window
            function cleanup() {
                confirmYesButton.removeEventListener('click', handleYesClick);
                confirmNoButton.removeEventListener('click', handleNoClick);
                document.removeEventListener('keydown', handleEscapeKey);
                confirmWindow.style.display = 'none';
                if (removeCover) cover.style.display = 'none';
                cover.style.zIndex = 2;
            }
        });
    }

    window.electron.ipcRenderer.on('restartMusic', () => {
        window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);
    })
    
});