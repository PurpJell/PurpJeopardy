const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    const topBar = document.getElementById('topBar');
    const board = document.querySelector('.board');

    // Retrieve player data from localStorage
    const playerData = JSON.parse(localStorage.getItem('playerData')) || [];

    // Function to render player cards
    function renderPlayerCards() {
        topBar.innerHTML = ''; // Clear existing player cards
        playerData.forEach(player => {
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
            const playerScore = document.createElement('div');
            playerScore.className = 'player-score';
            playerScore.textContent = `$${player.score}`;

            if (player.name.length < 6) {
                playerName.style.fontSize = '3vw';
                playerName.style.marginTop = '0vw';
                playerName.style.height = '3vw';
            } else if (player.name.length < 11) {
                playerName.style.fontSize = '2.2vw';
                playerName.style.marginTop = '0.5vw';
                playerName.style.height = '2.5vw';
            }
            
            playerInfo.appendChild(playerName);
            playerInfo.appendChild(playerScore);
            
            playerCard.appendChild(playerPicture);
            playerCard.appendChild(playerInfo);
            
            topBar.appendChild(playerCard);
        });
    }

    // Preload images
    playerData.forEach(player => {
        const img = new Image();
        img.src = player.imgSrc;
    });


    // Render player cards initially
    renderPlayerCards();

    let currentBoard = localStorage.getItem('currentBoard') || 1;
    let boardData = [];

    // Retrieve clicked questions from localStorage
    let clickedQuestions = JSON.parse(localStorage.getItem('clickedQuestions')) || [];
    // let clickedQuestions = [];

    function renderBoard() {
        fetch(`../js/boardData${currentBoard}.js`)
            .then(response => response.json())
            .then(boardData_ => {
                boardData = boardData_;
                console.log("fetched board data", boardData[4].questions[0].content);
                drawBoard(boardData_);
            })
            .catch(error => console.error('Error loading board data:', error));
    }

    // Function to render the board
    function drawBoard(boardData) {
        board.innerHTML = '';
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'categories';

        boardData.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.textContent = category.category;
            categoriesContainer.appendChild(categoryDiv);
        });

        board.appendChild(categoriesContainer);

        boardData[0].questions.forEach((_, questionIndex) => {
            const questionsRow = document.createElement('div');
            questionsRow.className = 'questions';

            boardData.forEach((category, categoryIndex) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.setAttribute('data-category', categoryIndex + 1);
                questionDiv.setAttribute('data-price', category.questions[questionIndex].price);
                questionDiv.setAttribute('content', category.questions[questionIndex].content);
                questionDiv.setAttribute('answer', category.questions[questionIndex].answer);
                const questionImage = category.questions[questionIndex].questionImage;
                questionDiv.setAttribute('questionImage', questionImage);
                const questionKey = `${categoryIndex + 1}-${category.questions[questionIndex].price}`.replace('$', '');
                questionDiv.textContent = clickedQuestions.includes(questionKey) ? '' : category.questions[questionIndex].price;
                questionsRow.appendChild(questionDiv);
            });

            board.appendChild(questionsRow);
        });

        // Check if all questions have been clicked
        if (Object.keys(clickedQuestions).length === 20) {
            showNextBoardWindow();
        }
    }

    // Function to show a window to go to the next board
    function showNextBoardWindow() {
        const nextBoardWindow = document.createElement('div');
        nextBoardWindow.className = 'next-board-window';
        nextBoardWindow.textContent = 'Visi lentos klausimai buvo atsakyti!';

        document.body.appendChild(nextBoardWindow);
    }

    // Render the board initially
    renderBoard();

    // Handle request to open question
    ipcRenderer.on('retrievePlayerData', function(event) {
        serverPlayerData = JSON.parse(localStorage.getItem('playerData')) || [];
        serverCurrentBoard = localStorage.getItem('currentBoard') || 1;
        ipcRenderer.send('retrievePlayerDataResponse', { players: serverPlayerData, currentBoard: serverCurrentBoard });
    });

    ipcRenderer.on('openQuestion', function(event, data) {
        const category = data.category;
        const price = data.price;
        const questionKey = `${category}-${price}`;
        if (!clickedQuestions.includes(questionKey)) {
            clickedQuestions.push(questionKey);
            localStorage.setItem('clickedQuestions', JSON.stringify(clickedQuestions));
        }
        const question = document.querySelector(`.question[data-category="${category}"][data-price="$${price}"]`);
        if (question) {
            question.textContent = '';
            localStorage.setItem('category', boardData[category - 1].category);
            localStorage.setItem('price', question.getAttribute('data-price'));
            localStorage.setItem('content', question.getAttribute('content'));
            localStorage.setItem('answer', question.getAttribute('answer'));
            localStorage.setItem('questionImage', question.getAttribute('questionImage'));
            
        }
        window.location.href = 'question.html';
    });

    // Handle request to go to the next board
    ipcRenderer.on('nextBoard', function() {
        localStorage.removeItem('clickedQuestions');
        localStorage.setItem('currentBoard', parseInt(currentBoard) + 1);
        // renderBoard();
        window.location.reload();
    });

    // Handle request to reset the board
    ipcRenderer.on('resetBoard', function() {
        clickedQuestions = [];
        localStorage.removeItem('clickedQuestions');
        currentBoard = localStorage.getItem('currentBoard') || 1;
        renderBoard();
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });
});