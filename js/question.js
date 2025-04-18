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

    language = localStorage.getItem('language') || 'en';

    // Update the category name and question price
    if (categoryName) {
        document.getElementById('categoryName').textContent = categoryName;
    }
    if (questionPrice) {
        document.getElementById('questionPrice').textContent = '$' + questionPrice;
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
    let answererQID = -1;

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
            if (buzzerQueue.length > 0 && buzzerQueue[answererQID] === player.name && !contestantsThatAnswered.includes(player.name)) {
                img.style.border = '0.4vw solid rgb(55, 185, 23)';
            } else if (contestantsThatAnswered.includes(player.name)) {
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

    // Retrieve server data from localStorage
    window.electron.ipcRenderer.on('retrieveGameData', function(event) {
        serverPlayerData = JSON.parse(localStorage.getItem('playerData')) || [];
        serverCurrentPageID = localStorage.getItem('currentPageID') || 1;
        serverSelectedBoard = localStorage.getItem('selectedBoard') || 'none.pjb';
        window.electron.ipcRenderer.send('retrieveGameDataResponse', { players: serverPlayerData, currentPageID: serverCurrentPageID, selectedBoard: serverSelectedBoard });
    });

    window.electron.ipcRenderer.on('buzzIn', function(event, playerData_) {
        // Add player to the buzzer queue
        if (playerData_ && !contestantsThatAnswered.includes(playerData_.name) && !buzzerQueue.includes(playerData_.name))
        {
            buzzerQueue.push(playerData_.name);
        }
        else return;

        if (answererQID === -1) {
            window.electron.ipcRenderer.send('buzzInResponse');
            return;
        }

    });

    window.electron.ipcRenderer.on('correctAnswer', function(event, data) {
        const playerIndex = playerData.findIndex(player => player.name === data.name);
        const questionPrice = data.price;
        playerData[playerIndex].score += parseInt(questionPrice);
        localStorage.setItem('playerData', JSON.stringify(playerData));
        renderPlayerCards();
        // showScoreChange(event, `+${questionPrice}`);
    });

    window.electron.ipcRenderer.on('incorrectAnswer', function(event, data) {
        // Update the score of the player who answered incorrectly
        const playerIndex = playerData.findIndex(player => player.name === data.name);
        const questionPrice = data.price;
        playerData[playerIndex].score -= parseInt(questionPrice);
        localStorage.setItem('playerData', JSON.stringify(playerData));
        renderPlayerCards();
        // showScoreChange(event, `-${questionPrice}`);
    });

    window.electron.ipcRenderer.on('startTimer', function() {
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

    window.electron.ipcRenderer.on('nextAnswerer', function() {
        let lastPlayer_;
        let currentPlayer_;

        if (buzzerQueue.length <= contestantsThatAnswered.length) return;

        if (answererQID >= 0 && !contestantsThatAnswered.includes(buzzerQueue[answererQID])) {
            contestantsThatAnswered.push(buzzerQueue[answererQID]);
        }
        
        if (answererQID === -1) {
            answererQID = buzzerQueue.length - 1;
        }
        else {
            answererQID++;
        }

        if (contestantsThatAnswered.length > 0) {
            lastPlayer_ = contestantsThatAnswered[contestantsThatAnswered.length - 1];
        }
        else {
            lastPlayer_ = null;
        }

        if (buzzerQueue.length > answererQID) {
            currentPlayer_ = buzzerQueue[answererQID];
        }
        else {
            currentPlayer_ = null;
            answererQID = -1;
        }

        renderPlayerCards();
        window.electron.ipcRenderer.send('nextAnswererResponse', { currentPlayer: currentPlayer_, lastPlayer: lastPlayer_ });

    });

    window.electron.ipcRenderer.on('revealAnswer', function() {
        if (answerImage !== "null") {
            questionCard.innerHTML = `<img src="${answerImage}" alt="Answer Image" class="answer-image">`;
        } else {
            if (language === 'lt') {
                questionCard.textContent = 'Atsakymas: ' + answer;
            } else {
                questionCard.textContent = 'Answer: ' + answer;
            }
        }
    });

    window.electron.ipcRenderer.on('backToBoard', function() {
        buzzerQueue = [];
        contestantsThatAnswered = [];
        answererQID = -1;
        window.location.href = 'board.html';
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            buzzerQueue = [];
            contestantsThatAnswered = [];
            answererQID = -1;
            window.location.href = 'board.html';
        }
    });

});