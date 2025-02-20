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
        addShineAnimation();
    }

    function addShineAnimation() {

        playerCard = document.querySelector('.player-card'); 

        const randomDelay = Math.random() * 2 + 3;
        setTimeout(() => {

            const beforeElement = document.createElement('style');
            beforeElement.innerHTML = `
                .player-card::before {
                    animation: none;
                }
            `;
            playerCard.appendChild(beforeElement);
        
            // Force reflow to restart the animation
            playerCard.offsetHeight;
        
            beforeElement.innerHTML = `
                .player-card::before {
                    animation: shine 2s 1;
                }
            `;
    
            playerCard.addEventListener('animationend', () => {
                beforeElement.remove();
                addShineAnimation();
            }, { once: true });
        }, randomDelay * 1000);
    }

    for (let i = 0; i < 12; i++) {
        spawnFish();
    }

    function spawnFish() {
        const randomDelay = Math.random() * 3 + 0.5;

        setTimeout(() => {
            const fish = document.createElement('img');
            fish.src = '../images/fish1.png';
            fish.className = 'fish';
            document.body.appendChild(fish);
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
            // deep-blue
            fish.src = '../images/fish2.png';
        } else {
            // orange
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