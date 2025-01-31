document.addEventListener('DOMContentLoaded', function() {
    const startGameButton = document.getElementById('startGameButton');
    const playerList = document.getElementById('playerList');

    let players = [];
    let currentBoard = 1;
    let playerPictures = [];
    let boardData = [];

    let questionPrice = JSON.parse(localStorage.getItem('questionPrice')) || 0;
    let state = 'lobby';

    let socket;

    let ip_address = '';

    let categories = [];
    let prices = [];


    fetch('/get-ip-address')
        .then(response => response.json())
        .then(data => {
            ip_address = data.ipAddress;
            setupWebSocket(ip_address);
        })
        .catch(error => alert('Error fetching IP address:', error));

    function setupWebSocket(ip_address_) {
        socket = new WebSocket(`ws://${ip_address_}:8080/host`);

        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'playerAdded' && state === 'lobby') {
                handlePlayerAdded(message.data);
            } else if (message.type === 'gameData') {
                players = [];
                players_ = message.data.playerData;
                currentBoard = message.data.currentBoard;
                localStorage.setItem('currentBoard', currentBoard);
                fetchBoardData();
                if (players_.length === 0) {
                    players = players_;
                    localStorage.setItem('players', JSON.stringify(players));
                } else {
                    players_.forEach(player => {
                        handlePlayerAdded(player);
                    });
                }
            }
        };

        socket.onclose = function() {
            console.log('WebSocket connection closed');
        };
    }

    function fetchBoardData() {
        fetch(`../js/boardData${currentBoard}.js`)
            .then(response => response.json())
            .then(boardData_ => {
                boardData = boardData_;
                categories = [];
                prices = [];
                boardData.forEach(category => {
                    categories.push(category.category);
                });
                boardData[0].questions.forEach(question => {
                    prices.push(question.price);
                });
                if (state === 'board') {
                    changeToBoardView();
                }
            })
            .catch(error => alert('Error loading board data:', error));
    }

    // fetchBoardData();

    function handlePlayerAdded(playerData) {
        players.push({name: playerData.name, score: playerData.score});
        // Push the player's image source to the playerPictures array of dictionaries
        playerPictures.push({ name: playerData.name, imgSrc: playerData.imgSrc });
        localStorage.setItem('players', JSON.stringify(players));

        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';

        const playerPicture = document.createElement('div');
        playerPicture.className = 'player-picture';
        const img = document.createElement('img');
        img.src = playerData.imgSrc;
        playerPicture.appendChild(img);

        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.innerHTML = `<b>${playerData.name}</b>`;
        if (playerData.name.length > 10) {
            playerName.style.marginTop = '5vw';
        }

        const kickButton = document.createElement('button');
        kickButton.className = 'kick-button';
        const imgKick = document.createElement('img');
        imgKick.src = '../images/icons/kick.png';
        kickButton.appendChild(imgKick);
        
        playerCard.appendChild(playerPicture);
        playerCard.appendChild(playerName);
        playerCard.appendChild(kickButton);

        playerList.appendChild(playerCard);

        kickButton.addEventListener('click', function() {
            playerList.removeChild(playerCard);
            socket.send(JSON.stringify({ type: 'playerRemoved', data: playerData }));
            players = players.filter(player => player.name !== playerData.name);
            localStorage.setItem('players', JSON.stringify(players));
            playerPictures = playerPictures.filter(player => player.name !== playerData.name);
        });
    }

    startGameButton.addEventListener('click', function() {
        socket.send(JSON.stringify({ type: 'startGame' }));
        changeToBoardView();
    });

    function changeToBoardView() {
        state = 'board';
        document.body.innerHTML = `
            <label for="categorySelect">Select Category:</label>
            <select id="categorySelect"></select>

            <label for="priceSelect">Select Price:</label>
            <select id="priceSelect"></select>
        `;
        document.body.className = 'board-view';

        const categorySelect = document.getElementById('categorySelect');
        const priceSelect = document.getElementById('priceSelect');

        populateCategories();
        populatePrices();

        // Populate dropdown with categories and prices
        function populateCategories() {
            categorySelect.innerHTML = ''; // Clear existing options
            categories.forEach((category, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        function populatePrices() {
            priceSelect.innerHTML = ''; // Clear existing options
            prices.forEach(price => {
                const option = document.createElement('option');
                option.value = price.replace('$', '');
                option.textContent = price;
                priceSelect.appendChild(option);
            });
        }
        
        const openQuestionButton = document.createElement('button');
        openQuestionButton.textContent = 'Open Question';
        openQuestionButton.className = 'open-question-button';
        document.body.appendChild(openQuestionButton);

        openQuestionButton.addEventListener('click', function() {
            const categoryName = boardData[categorySelect.value - 1].category;
            const category = categorySelect.value;
            const price = priceSelect.value;
            socket.send(JSON.stringify({ type: 'openQuestion', data: { category, price } }));
            localStorage.setItem('categoryName', JSON.stringify(categoryName));
            localStorage.setItem('questionPrice', JSON.stringify(price));
            
            const questionContent = boardData[category - 1].questions.find(q => q.price === `$${price}`).content;
            localStorage.setItem('questionContent', JSON.stringify(questionContent));
            const answer = boardData[category - 1].questions.find(q => q.price === `$${price}`).answer;
            localStorage.setItem('answer', JSON.stringify(answer));
            changeToQuestionView();
            
        });

        nextBoardButton = document.createElement('button');
        nextBoardButton.textContent = 'Next Board';
        nextBoardButton.className = 'next-board-button';
        document.body.appendChild(nextBoardButton);

        nextBoardButton.addEventListener('click', function() {
            socket.send(JSON.stringify({ type: 'nextBoard' }));
            currentBoard++;
            localStorage.setItem('currentBoard', currentBoard);
            fetchBoardData();
            // changeToBoardView();
        });

        resetBoardButton = document.createElement('button');
        resetBoardButton.textContent = 'Reset Board';
        resetBoardButton.className = 'reset-board-button';
        document.body.appendChild(resetBoardButton);

        resetBoardButton.addEventListener('click', function() {
            socket.send(JSON.stringify({ type: 'resetBoard' }));
        });
    }

    function changeToQuestionView(){
        state = 'question';
        document.body.innerHTML = `
            <h1 id="categoryName"></h1>
            <h2 id="question" class="question"></h1>
            <h2 id="answer" class="answer"></h2>
            <div class="player-list-2" id="playerList"></div>
            <button id="startTimerButton" class="start-timer-button">Start Timer</button>
            <button id="nextAnswererButton" class="next-answerer-button">Next Answerer</button>
            <button id="revealAnswerButton" class="reveal-answer-button">Reveal Answer</button>
            <button id="backToBoardButton" class="back-to-board-button">Back to Board</button>
        `;
        document.body.className = 'question-view';

        const categoryName = document.getElementById('categoryName');
        const question = document.getElementById('question');
        const answer = document.getElementById('answer');
        const playerList = document.getElementById('playerList');
        const startTimerButton = document.getElementById('startTimerButton');
        const nextAnswererButton = document.getElementById('nextAnswererButton');
        const revealAnswerButton = document.getElementById('revealAnswerButton');
        const backToBoardButton = document.getElementById('backToBoardButton');

        categoryName.textContent = JSON.parse(localStorage.getItem('categoryName'));
        question.textContent = "Question: " + JSON.parse(localStorage.getItem('questionContent'));
        answer.textContent = "Answer: " + JSON.parse(localStorage.getItem('answer'));

        function drawPlayerCards() {
            playerList.innerHTML = '';
            players.forEach((player, index) => {
                const playerContainer = document.createElement('div');
                playerContainer.className = 'player-container';

                const incorrectButton = document.createElement('button');
                incorrectButton.textContent = '-';
                incorrectButton.className = 'incorrect-button';

                const playerCard = document.createElement('div');
                playerCard.className = 'player-card-2';

                const playerPicture = document.createElement('div');
                playerPicture.className = 'player-picture-2';
                const img = document.createElement('img');
                if (playerPictures.find(p => p.name === player.name))
                {
                    img.src = playerPictures.find(p => p.name === player.name).imgSrc;
                }
                else {
                    img.src = '../images/default-profile.png';
                }
                playerPicture.appendChild(img);

                const playerInfo = document.createElement('div');
                playerInfo.className = 'player-info-2';

                const playerName = document.createElement('div');
                playerName.className = 'player-name-2';
                playerName.innerHTML = `<b>${player.name}</b>`;
                if (player.name.length < 10) {
                    playerName.style.marginTop = '5vw';
                }

                const score = document.createElement('div');
                score.className = 'score';
                score.textContent = `$${player.score}`;

                const correctButton = document.createElement('button');
                correctButton.textContent = '+';
                correctButton.className = 'correct-button';
                
                playerInfo.appendChild(playerName);
                playerInfo.appendChild(score);

                playerCard.appendChild(playerPicture);
                playerCard.appendChild(playerInfo);

                playerContainer.appendChild(incorrectButton);
                playerContainer.appendChild(playerCard);
                playerContainer.appendChild(correctButton);

                playerList.appendChild(playerContainer);

                correctButton.addEventListener('click', function() {
                    questionPrice = JSON.parse(localStorage.getItem('questionPrice'));
                    socket.send(JSON.stringify({ type: 'correctAnswer', data: {name: player.name, price: questionPrice} }));
                    players[index].score += parseInt(questionPrice.replace('$', ''));
                    localStorage.setItem('players', JSON.stringify(players));
                    drawPlayerCards();
                });
        
                incorrectButton.addEventListener('click', function() {
                    questionPrice = JSON.parse(localStorage.getItem('questionPrice'));
                    socket.send(JSON.stringify({ type: 'incorrectAnswer', data: {name: player.name, price: questionPrice} }));
                    players[index].score -= parseInt(questionPrice.replace('$', ''));
                    localStorage.setItem('players', JSON.stringify(players));
                    drawPlayerCards();
                });
            });
        }

        drawPlayerCards();

        startTimerButton.addEventListener('click', function() {
            socket.send(JSON.stringify({ type: 'startTimer' }));
        });

        nextAnswererButton.addEventListener('click', function() {
            socket.send(JSON.stringify({ type: 'nextAnswerer' }));
        });

        revealAnswerButton.addEventListener('click', function() {
            socket.send(JSON.stringify({ type: 'revealAnswer' }));
        });

        backToBoardButton.addEventListener('click', function() {
            socket.send(JSON.stringify({ type: 'backToBoard' }));
            changeToBoardView();
        });

    }

    window.onload = setupWebSocket;

});