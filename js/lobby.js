const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    // const startGameButton = document.getElementById('startGameButton');
    const playerList = document.getElementById('playerList');
    const playerCount = document.getElementById('playerCount');

    // Retrieve player data from localStorage
    localStorage.removeItem('playerData');
    let playerData = [];
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

    // Render player list initially
    renderPlayerList();

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