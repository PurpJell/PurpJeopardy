const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    const topBar = document.getElementById('topBar');
    const board = document.querySelector('.board');

    const backToTitleWindow = document.getElementById('backToTitleWindow');
    const confirmTitleButton = document.getElementById('confirmTitleButton');
    const cancelTitleButton = document.getElementById('cancelTitleButton');

    const animationContainer = document.createElement('div');
    animationContainer.id = 'animations';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = 0;
    animationContainer.style.left = 0;
    animationContainer.style.width = '100vw';
    animationContainer.style.height = '100vh';
    animationContainer.style.overflow = 'hidden';

    document.body.appendChild(animationContainer);

    const selectedBoard = localStorage.getItem('selectedBoard') || 'none.pjb';

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

    let currentBoardID = localStorage.getItem('currentBoardID') || 1;
    let boardData = [];
    let currentBoard;

    // Retrieve clicked questions from localStorage
    let clickedQuestions = JSON.parse(localStorage.getItem('clickedQuestions')) || [];
    // let clickedQuestions = [];

    function renderBoard() {
        const filePath = `../boards/${selectedBoard}`;
    
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(boardData_ => {
                boardData = boardData_;
                console.log("Fetched board data:", boardData);
                currentBoard = boardData.boards[currentBoardID - 1];
                drawBoard(currentBoard);
            })
            .catch(error => console.error('Error loading board data:', error));
    }

    // Function to render the board
    function drawBoard(currentBoard) {
        board.innerHTML = '';
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'categories';

        currentBoard.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.textContent = category.name;
            categoriesContainer.appendChild(categoryDiv);
        });

        board.appendChild(categoriesContainer);

        currentBoard.categories[0].questions.forEach((_, questionIndex) => {
            const questionsRow = document.createElement('div');
            questionsRow.className = 'questions';

            currentBoard.categories.forEach((category, categoryIndex) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.setAttribute('data-category', categoryIndex + 1);
                questionDiv.setAttribute('data-price', category.questions[questionIndex].price);
                questionDiv.setAttribute('content', category.questions[questionIndex].content);
                questionDiv.setAttribute('answer', category.questions[questionIndex].answer);
                const questionImage = category.questions[questionIndex].questionImage || null;
                questionDiv.setAttribute('questionImage', questionImage);
                const answerImage = category.questions[questionIndex].answerImage || null;
                questionDiv.setAttribute('answerImage', answerImage);
                const isDailyDouble = category.questions[questionIndex].dailyDouble || false;
                questionDiv.setAttribute('dailyDouble', isDailyDouble);
                const questionKey = `${categoryIndex + 1}-${category.questions[questionIndex].price}`.replace('$', '');
                questionDiv.textContent = clickedQuestions.includes(questionKey) ? '' : category.questions[questionIndex].price;
                questionsRow.appendChild(questionDiv);
            });

            board.appendChild(questionsRow);
        });

        // Check if all questions have been clicked
        if (Object.keys(clickedQuestions).length === currentBoard.categories.length * currentBoard.categories[0].questions.length) {
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

    let leftLights = [];
    let rightLights = [];

    function createLights() {
        for (let i = 0; i < 10; i++) {
            const leftLight = document.createElement('img');
            leftLight.src = '../images/lamp_off.png';
            leftLight.className = 'lamp';
            leftLights.push(leftLight);
            animationContainer.appendChild(leftLight);

            leftLight.style.left = `1.4%`;
            leftLight.style.top = `${i * 8 + 20}%`;

            const rightLight = document.createElement('img');
            rightLight.src = '../images/lamp_off.png';
            rightLight.className = 'lamp';
            rightLights.push(rightLight);
            animationContainer.appendChild(rightLight);

            rightLight.style.right = `1.7%`;
            rightLight.style.top = `${i * 8 + 20}%`;
        }

        let lightIndex = 0;
        leftLights.forEach(light => {
            animateLight(light, lightIndex%3);
            lightIndex++;
        });

        rightLights.forEach(light => {
            animateLight(light, lightIndex%3);
            lightIndex--;
        });
    }

    function animateLight(light, state) {
        const duration = 300;

        state = state || 0;

        console.log('Animating light', light.src, state);

        light.style.transition = `brightness ${100}ms`;

        setTimeout(() => {
            if (state === 2)
            {
                light.src = '../images/lamp_on.png';
                light.style.filter = 'brightness(1)';
                animateLight(light, 0);
            }
            else {
                light.src = '../images/lamp_off.png';
                light.style.filter = 'brightness(1)';
                animateLight(light, state+1);
            }
        }, duration);
    }

    createLights();

    // Retrieve server data from localStorage
    ipcRenderer.on('retrieveGameData', function(event) {
        serverPlayerData = JSON.parse(localStorage.getItem('playerData')) || [];
        serverCurrentBoardID = localStorage.getItem('currentBoardID') || 1;
        serverSelectedBoard = localStorage.getItem('selectedBoard') || 'none.pjb';
        ipcRenderer.send('retrieveGameDataResponse', { players: serverPlayerData, currentBoardID: serverCurrentBoardID, selectedBoard: serverSelectedBoard });
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
            localStorage.setItem('category', currentBoard.categories[category - 1].name);
            localStorage.setItem('price', question.getAttribute('data-price'));
            localStorage.setItem('content', question.getAttribute('content'));
            localStorage.setItem('answer', question.getAttribute('answer'));
            localStorage.setItem('questionImage', question.getAttribute('questionImage'));
            localStorage.setItem('answerImage', question.getAttribute('answerImage')); 
            localStorage.setItem('dailyDouble', question.getAttribute('dailyDouble'));           
        }
        window.location.href = 'question.html';
    });

    // Handle request to go to the next board
    ipcRenderer.on('nextBoard', function() {
        localStorage.removeItem('clickedQuestions');
        localStorage.setItem('currentBoardID', parseInt(currentBoardID) + 1);
        // renderBoard();
        window.location.reload();
    });

    // Handle request to reset the board
    ipcRenderer.on('resetBoard', function() {
        clickedQuestions = [];
        localStorage.removeItem('clickedQuestions');
        currentBoardID = localStorage.getItem('currentBoardID') || 1;
        renderBoard();
    });

    // Listen for Escape key press
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            backToTitleWindow.classList.toggle('show');
        }
    });

    confirmTitleButton.addEventListener('click', function() {
        window.location.href = 'title.html';
    });

    cancelTitleButton.addEventListener('click', function() {
        backToTitleWindow.classList.toggle('show');
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });
});