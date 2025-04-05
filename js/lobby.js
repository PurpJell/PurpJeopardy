const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', function() {
    const ipAddress = document.getElementById('ipAddress');
    const joinGameText = document.getElementById('joinGameText');
    const playerList = document.getElementById('playerList');
    const playerCount = document.getElementById('playerCount');
    const playerCountEnding = document.getElementById('playerCountEnding');
    const hideButton = document.getElementById('hideButton');
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const backButton = document.getElementById('backButton');

    selectedBoard = localStorage.getItem('selectedBoard') || "exampleBoardData.pjb";
    language = localStorage.getItem('language') || 'en';

    if (language === 'lt') {
        hideButton.textContent = 'Rodyti';
        joinGameText.textContent = 'Prisijunkite prie zaidimo';
        backButton.textContent = 'Atgal';
        playerCountEnding.textContent = '4 zaideju';
    }

    let randomIcons = ["../images/rocket.png", "../images/alien.png", "../images/moon.png", "../images/astronaut.png"]

    let hideIpAddress = true;
    ipAddress.textContent = "***************";

    hideButton.addEventListener('click', function() {
        if (hideIpAddress) {
            hideIpAddress = false;
            ipAddress.textContent = process.env.IP_ADDRESS;
            ipAddress.textContent += ':3000';
            if (language === 'lt') {
                hideButton.textContent = 'Slepti';
            }
            else {
                hideButton.textContent = 'Hide';
            }
        } else {
            ipAddress.textContent = "***************";
            hideIpAddress = true;
            if (language === 'lt') {
                hideButton.textContent = 'Rodyti';
            }
            else {
                hideButton.textContent = 'Show';
            }
        }
    });

    // Retrieve player data from localStorage
    localStorage.removeItem('playerData');
    let playerData = [];
    // let playerData = JSON.parse(localStorage.getItem('playerData')) || [];
    localStorage.setItem('currentPageID', 1);
    localStorage.removeItem('clickedQuestions');

    let playerCards = []

    // Function to render player list
    function renderPlayerList() {
        playerList.innerHTML = ''; // Clear existing player list
        playerCards.forEach((playerCard) => {
            playerList.appendChild(playerCard);
        });
    }

    let boards = [];

    if (language === 'lt') {
        dropdownButton.textContent = "Pasirinkta lenta: " + selectedBoard.replace(".pjb", "");
    } else {
        dropdownButton.textContent = "Selected board: " + selectedBoard.replace(".pjb", "");
    }

    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    const boardsPath = ipcRenderer.sendSync('get-boards-dir');

    // Ensure the boards folder exists
    if (!fs.existsSync(boardsPath)) {
        console.error('Boards folder does not exist:', boardsPath);
        if (language === 'lt') {
            dropdownMenu.textContent = "Lentu nerasta";
        } else {
            dropdownMenu.textContent = "No boards found";
        }
        return;
    }

    fs.readdir(boardsPath, (err, files) => {
        if (err) {
            console.error('Error reading boards directory:', err);
            return;
        }
    
        // Filter files to include only .pjb files
        let boards = files.filter((file) => file.endsWith('.pjb'));
    
        // Remove unwanted files like "exampleBoardData.pjb"
        boards = boards.filter((board) => board !== 'exampleBoardData.pjb');
    
        // Check if the selected board exists
        if (!boards.includes(selectedBoard)) {
            selectedBoard = "none.pjb";
            localStorage.setItem('selectedBoard', selectedBoard);
            if (language === 'lt') {
                dropdownButton.textContent = "Pasirinkta lenta: " + selectedBoard.replace(".pjb", "");
            } else {
                dropdownButton.textContent = "Selected board: " + selectedBoard.replace(".pjb", "");
            }
        }
    
        // Check if there are no boards
        if (boards.length === 0) {
            if (language === 'lt') {
                dropdownMenu.textContent = "Lentu nerasta";
            } else {
                dropdownMenu.textContent = "No boards found";
            }
            return;
        }
    
        // Populate the dropdown menu with the .pjb files
        boards.forEach((board) => {
            const boardName = board.replace('.pjb', ''); // Remove the .pjb extension for display
            const boardOption = document.createElement('p');
            boardOption.textContent = boardName;
            boardOption.addEventListener('click', () => {
                if (language === 'lt') {
                    dropdownButton.textContent = "Pasirinkta lenta:\n" + boardName;
                } else {
                    dropdownButton.textContent = "Selected board:\n" + boardName;
                }
                dropdownMenu.classList.toggle('show');
                localStorage.setItem('selectedBoard', board);
                selectedBoard = board;
                // Send selected board to host
                ipcRenderer.send('selectedBoard', selectedBoard);
            });
            dropdownMenu.appendChild(boardOption);
        });
    });
    
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

    function addStars(rows, columns) {

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
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

    addStars(8, 14);

    for (let i = 0; i < 3; i++) {
        spawnRocket();
    }


    // Render player list initially
    renderPlayerList();

    backButton.addEventListener('click', function() {
        window.location.href = 'title.html';
    });

    // Retrieve server data from localStorage
    ipcRenderer.on('retrieveGameData', function(event) {
        serverPlayerData = JSON.parse(localStorage.getItem('playerData')) || [];
        serverCurrentPageID = localStorage.getItem('currentPageID') || 1;
        serverSelectedBoard = localStorage.getItem('selectedBoard') || 'none.pjb';
        ipcRenderer.send('retrieveGameDataResponse', { players: serverPlayerData, currentPageID: serverCurrentPageID, selectedBoard: serverSelectedBoard });
    });

    ipcRenderer.on('addPlayer', function(event, playerData_) {
        if (playerData.length < 4) {

            const icon = document.createElement('img');
            const randomIcon = randomIcons[Math.floor(Math.random() * randomIcons.length)];

            randomIcons = randomIcons.filter(icon => icon !== randomIcon);

            playerData_ = {
                name: playerData_.name,
                imgSrc: playerData_.imgSrc,
                score: 0,
                icon: randomIcon
            };

            playerData.push(playerData_);
            localStorage.setItem('playerData', JSON.stringify(playerData));

            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            const playerPicture = document.createElement('div');
            playerPicture.className = 'player-picture';
            const img = document.createElement('img');
            img.src = playerData_.imgSrc;
            playerPicture.appendChild(img);
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.innerHTML = `<b>${playerData_.name}</b>`;

            if (playerData_.name.length < 6) {
                playerName.style.fontSize = '5vw';
            }
            
            playerInfo.appendChild(playerName);
            
            playerCard.appendChild(playerPicture);
            playerCard.appendChild(playerInfo);

            if (randomIcon) {
                if (randomIcon.includes("alien.png")) {
                    icon.style.width = "30%";
                    icon.style.top = "5%";
                    icon.style.left = "53%";
                }
                else if (randomIcon.includes("rocket.png")) {
                    icon.style.width = "48%";
                    icon.style.top = "6%";
                    icon.style.left = "42%";
                    icon.style.transform = `rotate(-27deg)`;
                }
                else if (randomIcon.includes("moon.png")) {
                    icon.style.width = "35%";
                    icon.style.top = "5%";
                    icon.style.left = "47%";
                    icon.style.transform = `rotate(-27deg)`;
                }
                else if (randomIcon.includes("astronaut.png")) {
                    icon.style.width = "38%";
                    icon.style.top = "6%";
                    icon.style.left = "47%";
                }
            }

            icon.src = randomIcon;
            icon.className = 'player-icon';

            playerCard.appendChild(icon);

            playerCards.push(playerCard);

            renderPlayerList();

            playerCount.textContent = `${playerData.length}`;
            ipcRenderer.send('addPlayerResponse', { success: true, message: 'Player added successfully' });
        } else {
            ipcRenderer.send('addPlayerResponse', { success: false, message: 'Player limit reached' });
        }
    });

    ipcRenderer.on('removePlayer', function(event, playerName_) {
        playerData = playerData.filter(player => player.name !== playerName_);
        randomIcons.push(playerCards.find(playerCard => playerCard.querySelector('.player-name').textContent === playerName_).querySelector('.player-icon').src);
        playerCards = playerCards.filter(playerCard => playerCard.querySelector('.player-name').textContent !== playerName_);
        localStorage.setItem('playerData', JSON.stringify(playerData));
        renderPlayerList();
        if (language === 'lt') {
            playerCount.textContent = `${playerData.length}`;
        } else {
            playerCount.textContent = `${playerData.length}`;
        }
    });

    ipcRenderer.on('startGame', function(event) {
        window.location.href = 'board.html';
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            window.location.href = 'title.html';
        } else if (event.key === 'Enter') {
            window.location.href = 'board.html';
        }
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });
});