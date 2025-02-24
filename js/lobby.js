const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    const ipAddress = document.getElementById('ipAddress');
    const playerList = document.getElementById('playerList');
    const playerCount = document.getElementById('playerCount');
    const hideButton = document.getElementById('hideButton');
    const backButton = document.getElementById('backButton');

    let hideIpAddress = true;
    ipAddress.textContent = "xxx.xxx.xxx.xxx:xxxx";

    hideButton.addEventListener('click', function() {
        if (hideIpAddress) {
            hideIpAddress = false;
            ipAddress.textContent = process.env.IP_ADDRESS;
            ipAddress.textContent += ':3000';
            hideButton.textContent = 'Hide';
        } else {
            ipAddress.textContent = "xxx.xxx.xxx.xxx:xxxx";
            hideIpAddress = true;
            hideButton.textContent = 'Show';
        }
    });

    // Retrieve player data from localStorage
    // localStorage.removeItem('playerData');
    // let playerData = [];
    let playerData = JSON.parse(localStorage.getItem('playerData')) || [];
    localStorage.setItem('currentBoardID', 1);
    localStorage.removeItem('clickedQuestions');

    // Function to render player list
    function renderPlayerList() {
        playerList.innerHTML = ''; // Clear existing player list
        playerData.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            const playerPicture = document.createElement('div');
            playerPicture.className = 'player-picture';
            const img = document.createElement('img');
            img.src = player.imgSrc;
            playerPicture.appendChild(img);
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.innerHTML = `<b>${player.name}</b>`;

            if (player.name.length < 6) {
                playerName.style.fontSize = '6vw';
            } else if (player.name.length < 11) {
                playerName.style.fontSize = '5.4vw';
            }
            
            playerInfo.appendChild(playerName);
            
            playerCard.appendChild(playerPicture);
            playerCard.appendChild(playerInfo);
            
            playerList.appendChild(playerCard);

        });
    }
    
    addShineAnimation();

    function addShineAnimation() {

        // playerCard = document.querySelector('.player-card'); 

        const randomDelay = Math.random() * 2 + 3;
        setTimeout(() => {

            const beforeElement = document.createElement('style');
            beforeElement.innerHTML = `
                .player-card::before {
                    animation: none;
                }
            `;
            document.body.appendChild(beforeElement);
        
            // Force reflow to restart the animation
            document.body.offsetHeight;
        
            beforeElement.innerHTML = `
                .player-card::before {
                    animation: shine 2s 1;
                }
            `;
    
            document.body.addEventListener('animationend', () => {
                beforeElement.remove();
                addShineAnimation();
            }, { once: true });
        }, randomDelay * 1000);
    }

    const visualsContainer = document.createElement('div');
    visualsContainer.className = 'visuals-container';
    document.body.appendChild(visualsContainer);

    function addStars() {

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 14; c++) {
                const star = document.createElement('img');
                star.className = 'star';

                star.dataset.column = c;
                star.dataset.row = r;
                star.style.filter = 'opacity(0)';

                visualsContainer.appendChild(star);

                starAnimation(star);
            }
        }
    }

    function starAnimation(star) {

        star.style.left = `${star.dataset.row * 12.5 + Math.random() * 9.5 + 1.5}%`;
        star.style.top = `${20 + star.dataset.column * 5.35 + Math.random() * 4 + 0.5}%`;
        star.style.scale = Math.random() + 1;

        const variant = Math.random() * 100;
        if (variant < 90) 
        {
            star.src = `../images/star${Math.ceil(variant/11.25)}.png`;
        }
        else if (variant < 95)
        {
            star.src = '../images/star9.png';
        }
        else
        {
            star.src = '../images/star10.png';
        }

        const keyframes = [
            { filter: 'opacity(0)', offset: 0},
            { filter: 'opacity(1)', offset: 0.06},
            { filter: 'opacity(1)', offset: 0.94},
            { filter: 'opacity(0)', offset: 1}
        ];

        const options = {
            duration: (Math.random() * 10 + 10)* 1000, // 10-20 seconds
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        const animation = star.animate(keyframes, options);

        animation.onfinish = () => {
            starAnimation(star);
        };
    }

    function spawnRocket() {

        const rocket = document.createElement('img');
        rocket.src = '../images/rocket.png';
        rocket.className = 'rocket';
        visualsContainer.appendChild(rocket);

        rocketAnimation(rocket);
    }

    function rocketAnimation(rocket) {

        const radius = 40; // Radius of the circle in vw
        const centerX = 50; // Center of the circle in %
        const centerY = 50; // Center of the circle in %

        const direction = Math.random() > 0.5 ? 1 : -1;

        const xSide = Math.random() > 0.5 ? 1 : -1;
        const ySide = Math.random() > 0.5 ? 1 : -1;

        rocket.style.left = `${xSide * (Math.random() * 20 + 40)}vw`;
        rocket.style.top = `${ySide * (Math.random() * 20 + 40)}vh`;

        const keyframes = [
            { transform: `translate(${centerX}vw, ${centerY}vh) rotate(0deg) translate(${radius}vw) rotate(${direction * 90}deg)`, offset: 0 },
            { transform: `translate(${centerX}vw, ${centerY}vh) rotate(${direction * 90}deg) translate(${radius}vw) rotate(${direction * 90}deg)`, offset: 0.25 },
            { transform: `translate(${centerX}vw, ${centerY}vh) rotate(${direction * 180}deg) translate(${radius}vw) rotate(${direction * 90}deg)`, offset: 0.5 },
            { transform: `translate(${centerX}vw, ${centerY}vh) rotate(${direction * 270}deg) translate(${radius}vw) rotate(${direction * 90}deg)`, offset: 0.75 },
            { transform: `translate(${centerX}vw, ${centerY}vh) rotate(${direction * 360}deg) translate(${radius}vw) rotate(${direction * 90}deg)`, offset: 1 }
        ];

        const options = {
            duration: 10000, // 10 seconds
            easing: 'linear',
            fill: 'forwards'
        };

        const animation = rocket.animate(keyframes, options);

        animation.onfinish = () => {
            rocket.remove();
            
            setTimeout(() => {
                spawnRocket();
            }, Math.random() * 5 * 1000 + 5000);
        };
    }

    addStars();

    for (let i = 0; i < 2; i++) {
        spawnRocket();
    }


    // Render player list initially
    renderPlayerList();

    backButton.addEventListener('click', function() {
        window.location.href = 'title.html';
    });

    // Listen for messages from the server
    ipcRenderer.on('retrievePlayerData', function(event) {
        serverPlayerData = JSON.parse(localStorage.getItem('playerData')) || [];
        servercurrentBoardID = localStorage.getItem('currentBoardID') || 1;
        ipcRenderer.send('retrievePlayerDataResponse', { players: serverPlayerData, currentBoardID: servercurrentBoardID });
    });

    ipcRenderer.on('addPlayer', function(event, playerData_) {
        if (playerData.length < 4) {
            playerData.push(playerData_);
            localStorage.setItem('playerData', JSON.stringify(playerData));
            renderPlayerList();
            playerCount.textContent = `${playerData.length}/4 players`;
            ipcRenderer.send('addPlayerResponse', { success: true, message: 'Player added successfully' });
        } else {
            ipcRenderer.send('addPlayerResponse', { success: false, message: 'Player limit reached' });
        }
    });

    ipcRenderer.on('removePlayer', function(event, playerName_) {
        playerData = playerData.filter(player => player.name !== playerName_);
        localStorage.setItem('playerData', JSON.stringify(playerData));
        renderPlayerList();
        playerCount.textContent = `${playerData.length}/4 players`;
    });

    ipcRenderer.on('startGame', function(event) {
        window.location.href = 'board.html';
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });
});