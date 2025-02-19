const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve parameters from localStorage
    const categoryName = localStorage.getItem('category');
    const questionPrice = localStorage.getItem('price');
    const content = localStorage.getItem('content');
    const questionImage = localStorage.getItem('questionImage');
    const questionCard = document.getElementById('questionCard');
    const answer = localStorage.getItem('answer');
    const answerImage = localStorage.getItem('answerImage');
    const dailyDouble = localStorage.getItem('dailyDouble');

    // Update the category name and question price
    if (categoryName) {
        document.getElementById('categoryName').textContent = categoryName;
    }
    if (questionPrice) {
        document.getElementById('questionPrice').textContent = questionPrice;
        if (dailyDouble === 'true') {
            document.getElementById('priceMultiplier').textContent = ' x2!'; 
        }
    }
    if (questionImage !== "null") {
        questionCard.innerHTML = `<img src="${questionImage}" alt="Question Image" class="question-image">`;
    } else if (content) {
        questionCard.innerHTML = `<b>${content}</b>`;
    }


    const bottomBar = document.getElementById('bottomBar');

    // Retrieve player data from localStorage
    const playerData = JSON.parse(localStorage.getItem('playerData')) || [];
    let buzzerQueue = [];
    let contestantsThatAnswered = [];

    // Function to render player cards
    function renderPlayerCards() {
        bottomBar.innerHTML = ''; // Clear existing player cards
        playerData.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            const playerPicture = document.createElement('div');
            playerPicture.className = 'player-picture';
            const img = document.createElement('img');
            img.src = player.imgSrc;

            // Apply styles based on buzzerQueue and contestantsThatAnswered
            if (buzzerQueue.length > 0 && buzzerQueue[0] === player.name) {
                img.style.border = '0.4vw solid rgb(55, 185, 23)';
            } else if (contestantsThatAnswered.includes(player.name) && !buzzerQueue.includes(player.name)) {
                img.style.filter = 'brightness(20%)';
                img.style.border = '0.4vw solid red';
            }

            playerPicture.appendChild(img);
            playerCard.appendChild(playerPicture);
            bottomBar.appendChild(playerCard);
        });
    }

    // Function to show score change animation
    function showScoreChange(event, text) {
        const scoreChange = document.createElement('div');
        scoreChange.className = 'score-change';
        scoreChange.textContent = text;
        document.body.appendChild(scoreChange);
        
        scoreChange.style.position = 'absolute';
        scoreChange.style.left = `${event.clientX}px`;
        scoreChange.style.top = `${event.clientY}px`;
        
        scoreChange.addEventListener('animationend', () => {
            scoreChange.remove();
        });
    }
    
    // Preload images
    playerData.forEach(player => {
        const img = new Image();
        img.src = player.imgSrc;
    });
    
    // Render player cards initially
    renderPlayerCards();

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

    // Listen for messages from the main process
    ipcRenderer.on('retrievePlayerData', function(event) {
        serverPlayerData = JSON.parse(localStorage.getItem('playerData')) || [];
        servercurrentBoardID = localStorage.getItem('currentBoardID') || 1;
        ipcRenderer.send('retrievePlayerDataResponse', { players: serverPlayerData, currentBoardID: servercurrentBoardID });
    });

    ipcRenderer.on('buzzIn', function(event, playerData_) {
        console.log('buzzedIn', playerData_);

        // Add player to the buzzer queue
        if (playerData_ && !contestantsThatAnswered.includes(playerData_.name))
        {
            buzzerQueue.push(playerData_.name);
            contestantsThatAnswered.push(playerData_.name);
        }
        if (buzzerQueue.length === 1)
        {
            renderPlayerCards();
        }
    });

    ipcRenderer.on('correctAnswer', function(event, data) {
        console.log('correctAnswer', data.name);

        const playerIndex = playerData.findIndex(player => player.name === data.name);
        let dailyDouble = localStorage.getItem('dailyDouble');
        if (dailyDouble === 'true') {
            playerData[playerIndex].score += parseInt(questionPrice.replace('$', '')) * 2;
        } else {
            playerData[playerIndex].score += parseInt(questionPrice.replace('$', ''));
        }
        localStorage.setItem('playerData', JSON.stringify(playerData));
        renderPlayerCards();
        // showScoreChange(event, `+${questionPrice}`);
    });

    ipcRenderer.on('incorrectAnswer', function(event, data) {
        console.log('incorrectAnswer', data.name);

        // Update the score of the player who answered incorrectly
        const playerIndex = playerData.findIndex(player => player.name === data.name);
        let dailyDouble = localStorage.getItem('dailyDouble');
        if (dailyDouble === 'true') {
            playerData[playerIndex].score -= parseInt(questionPrice.replace('$', '')) * 2;
        } else {
            playerData[playerIndex].score -= parseInt(questionPrice.replace('$', ''));
        }
        localStorage.setItem('playerData', JSON.stringify(playerData));
        renderPlayerCards();
        // showScoreChange(event, `-${questionPrice}`);
    });

    ipcRenderer.on('startTimer', function() {
        console.log('startTimer');
        const timer = document.querySelector('.timer');

        let timeLeft = 30;
        const countdown = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            if (timeLeft === 0) {
                clearInterval(countdown);
            }
        }, 1000);
    });

    ipcRenderer.on('nextAnswerer', function() {
        console.log('nextAnswerer');
        buzzerQueue.shift();
        renderPlayerCards();
    });

    ipcRenderer.on('revealAnswer', function() {
        console.log('revealAnswer');
        if (answerImage !== "null") {
            questionCard.innerHTML = `<img src="${answerImage}" alt="Answer Image" class="answer-image">`;
        } else {
        questionCard.textContent = 'Atsakymas: ' + answer;
        }
    });

    ipcRenderer.on('backToBoard', function() {
        buzzerQueue = [];
        contestantsThatAnswered = [];
        window.location.href = 'board.html';
    });

});