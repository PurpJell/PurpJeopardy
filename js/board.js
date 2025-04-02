const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    const topBar = document.getElementById('topBar');
    const board = document.querySelector('.board');

    const backToTitleWindow = document.getElementById('backToTitleWindow');
    const backToTitleText = document.getElementById('backToTitleText');
    const confirmTitleButton = document.getElementById('confirmTitleButton');
    const cancelTitleButton = document.getElementById('cancelTitleButton');

    const leftSidebar = document.getElementById('sidebarLeft');
    const rightSidebar = document.getElementById('sidebarRight');

    const animationContainer = document.createElement('div');
    animationContainer.id = 'animations';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = 0;
    animationContainer.style.left = 0;
    animationContainer.style.width = '100vw';
    animationContainer.style.height = '100vh';
    animationContainer.style.overflow = 'hidden';
    // animationContainer.style.zIndex = 1;

    document.body.appendChild(animationContainer);

    const selectedBoard = localStorage.getItem('selectedBoard') || 'none.pjb';
    let language = localStorage.getItem('language') || 'en';

    if (language === 'lt') {
        backToTitleText.textContent = 'Ar norite grizti i meniu?';
        confirmTitleButton.innerHTML = `
                                        <svg>
                                            <text x="5vw" y="50%" text-anchor="middle" class="svg-text">
                                                Taip
                                            </text>
                                        </svg>`;
        cancelTitleButton.innerHTML = `
                                        <svg>
                                            <text x="5vw" y="50%" text-anchor="middle" class="svg-text">
                                                Ne
                                            </text>
                                        </svg>`;
    }

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

            if (player.name.length < 8) {
                playerName.style.fontSize = '3.2vw';
                playerName.style.paddingTop = '0';
                playerName.style.height = '3vw';
            } else if (player.name.length < 9) {
                playerName.style.fontSize = '2.8vw';
                playerName.style.paddingTop = '0.2vh';
                playerName.style.height = '3vw';
            }

            const icon = document.createElement('img');
            const randomIcon = player.icon;

            if (randomIcon) {
                if (randomIcon.includes("alien.png")) {
                    icon.style.width = "30%";
                    icon.style.top = "6%";
                    if (window.innerHeight <= 1067) {
                        icon.style.width = "34%";
                        icon.style.top = "8%";
                    }
                    icon.style.left = "56%";
                }
                else if (randomIcon.includes("rocket.png")) {
                    icon.style.width = "48%";
                    icon.style.top = "8%";
                    icon.style.left = "45%";
                    if (window.innerHeight <= 1067) {
                        icon.style.width = "52%";
                        icon.style.top = "11.5%";
                        icon.style.left = "48%";
                    }
                    icon.style.transform = `rotate(-27deg)`;
                    icon.style.filter = `opacity(0.6)`;
                }
                else if (randomIcon.includes("moon.png")) {
                    icon.style.width = "35%";
                    icon.style.top = "8%";
                    if (window.innerHeight <= 1067) {
                        icon.style.width = "42%";
                    }
                    icon.style.left = "52%";
                    icon.style.transform = `rotate(-27deg)`;
                    icon.style.filter = `opacity(0.9)`;
                }
                else if (randomIcon.includes("astronaut.png")) {
                    icon.style.width = "38%";
                    icon.style.top = "6%";
                    icon.style.left = "52%";
                    if (window.innerHeight <= 1067) {
                        icon.style.width = "42%";
                        icon.style.top = "12%";
                    }
                    icon.style.filter = `opacity(0.55)`;
                }
            }

            icon.src = randomIcon;
            icon.className = 'player-icon';

            playerCard.appendChild(icon);
            
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
        const filePath = `../boards/${selectedBoard.replace('.pjb','')}/${selectedBoard}`;
    
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

        const questionsContainer = document.createElement('div');
        questionsContainer.className = 'questions-container';

        board.appendChild(questionsContainer);

        currentBoard.categories[0].questions.forEach((_, questionIndex) => {
            const questionsRow = document.createElement('div');
            questionsRow.className = 'questions-row';

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
                questionDiv.textContent = '$' + category.questions[questionIndex].price;
                if (clickedQuestions.includes(questionKey)) {
                    questionDiv.classList.add('clicked');
                }
                questionsRow.appendChild(questionDiv);

                questionDiv.addEventListener('contextmenu', function() {
                    clickedQuestions.push(questionKey);
                    localStorage.setItem('clickedQuestions', JSON.stringify(clickedQuestions));
                    drawBoard(currentBoard);
                });

                questionDiv.addEventListener('click', function() {

                    price = category.questions[questionIndex].price;
                    category = questionKey.split('-')[0];
                    
                    if (!clickedQuestions.includes(questionKey)) {
                        clickedQuestions.push(questionKey);
                        localStorage.setItem('clickedQuestions', JSON.stringify(clickedQuestions));
                    }
                    const question = questionDiv;
                    if (question) {
                        // question.textContent = '';
                        localStorage.setItem('category', currentBoard.categories[category - 1].name);
                        localStorage.setItem('price', question.getAttribute('data-price'));
                        localStorage.setItem('content', question.getAttribute('content'));
                        localStorage.setItem('answer', question.getAttribute('answer'));
                        localStorage.setItem('questionImage', question.getAttribute('questionImage'));
                        localStorage.setItem('answerImage', question.getAttribute('answerImage')); 
                        localStorage.setItem('dailyDouble', question.getAttribute('dailyDouble'));
                        question.classList.add('clicked');       
                    }
                    window.location.href = 'question.html';
                    });
            });

            questionsContainer.appendChild(questionsRow);
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
        if (language === 'lt') {
            nextBoardWindow.textContent = 'Visi lentos klausimai buvo atsakyti!';
        }
        else {
            nextBoardWindow.textContent = 'All questions have been answered!';
        }

        document.body.appendChild(nextBoardWindow);
    }

    // Render the board initially
    renderBoard();

    let leftLights = [];
    let rightLights = [];

    function createLights() {
        for (let i = 0; i < numLights; i++) {
            const leftLightOff = document.createElement('img');
            leftLightOff.src = '../images/lamp_off.png';
            leftLightOff.className = 'lamp';
            leftSidebar.appendChild(leftLightOff);

            const leftLightOn = document.createElement('img');
            leftLightOn.src = '../images/lamp_on.png';
            leftLightOn.className = 'lamp';
            leftLights.push(leftLightOn);
            leftSidebar.appendChild(leftLightOn);

            leftLightOn.style.opacity = 0;
            leftLightOn.classList.add('on');

            const rightLightOff = document.createElement('img');
            rightLightOff.src = '../images/lamp_off.png';
            rightLightOff.className = 'lamp';
            rightSidebar.appendChild(rightLightOff);

            const rightLightOn = document.createElement('img');
            rightLightOn.src = '../images/lamp_on.png';
            rightLightOn.className = 'lamp';
            rightLights.push(rightLightOn);
            rightSidebar.appendChild(rightLightOn);

            rightLightOn.style.opacity = 0;
            rightLightOn.classList.add('on');

            if (window.innerHeight <= 1067) {
                console.log('height:', window.innerHeight);
                leftLightOff.style.marginTop = '0.65vh';
                leftLightOn.style.marginTop = '-8.1vh';
                rightLightOff.style.marginTop = '0.65vh';
                rightLightOn.style.marginTop = '-8.1vh';
            }
        }

        let lightIndex = 0;
        leftLights.forEach(light => {
            animateLight(light, lightIndex);
            lightIndex++;
        });

        lightIndex = numLights - 1;

        rightLights.forEach(light => {
            animateLight(light, lightIndex);
            lightIndex--;
        });
    }

    function animateLight(light, delay) {

        keyframes = [
            { opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 0, offset: 0.5 },
            { opacity: 0, offset: 1 }
        ];

        const options = {
            duration: 3 * 1000,
            easing: 'ease-in-out',
            fill: 'forwards',
            iterations: Infinity,
            delay: delay * 150
        };

        light.animate(keyframes, options);
    }

    const numLights = 9;
    createLights();

    function spawnItem() {

        let horizontalPosition = Math.random() * 80 + 8; // Random horizontal position

        const itemNormal = document.createElement('div');

        let randomItem = Math.random() * 3;

        if (randomItem < 1) {
            itemNormal.className = 'money-bag normal';
            console.log('money-bag');
        } else if (randomItem < 2) {
            itemNormal.className = 'coin normal';
        }
        else {
            itemNormal.className = 'cash normal';
        }

        itemNormal.style.left = `${horizontalPosition}vw`; // Random horizontal position

        const itemXray = document.createElement('div');
        if (randomItem < 1) {
            itemXray.className = 'money-bag xray';
        } else if (randomItem < 2) {
            itemXray.className = 'coin xray';
        }
        else {
            itemXray.className = 'cash xray';
        }

        itemXray.style.left = `${horizontalPosition - 7}vw`; // Random horizontal position
        setTimeout( () => {
            board.appendChild(itemXray);
        }, 1000);

        animationContainer.appendChild(itemNormal);
    
        spinItem(itemXray);

        // Remove the money bag after 6 seconds
        setTimeout(() => {
            itemNormal.remove();
            itemXray.remove();
        }, 5700);
    }

    function spinItem(item) {
        const keyframes = [
            { transform: 'rotate(0deg)', offset: 0 },
            { transform: `rotate(${Math.random() > 0.5 ? 360 : -360}deg)`, offset: 1 }
        ];
    
        const options = {
            duration: Math.random() * 2 * 1000 + 1000,
            easing: 'linear',
            iterations: Infinity
        };
    
        item.animate(keyframes, options);
    }
    
    // Spawn items at random intervals
    for (let i = 0; i < 7; i++){
        setInterval(spawnItem, Math.random() * 3000 + 1500); // Adjust interval as needed
    }

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
            // question.textContent = '';
            localStorage.setItem('category', currentBoard.categories[category - 1].name);
            localStorage.setItem('price', question.getAttribute('data-price'));
            localStorage.setItem('content', question.getAttribute('content'));
            localStorage.setItem('answer', question.getAttribute('answer'));
            localStorage.setItem('questionImage', question.getAttribute('questionImage'));
            localStorage.setItem('answerImage', question.getAttribute('answerImage')); 
            localStorage.setItem('dailyDouble', question.getAttribute('dailyDouble'));
            question.classList.add('clicked');       
        }
        window.location.href = 'question.html';
    });

    // Handle request to go to the next board
    ipcRenderer.on('nextBoard', function() {
        localStorage.removeItem('clickedQuestions');
        localStorage.setItem('currentBoardID', parseInt(currentBoardID) + 1);
        window.location.reload();
    });

    // Handle request to reset the board
    ipcRenderer.on('resetBoard', function() {
        clickedQuestions = [];
        localStorage.removeItem('clickedQuestions');
        currentBoardID = localStorage.getItem('currentBoardID') || 1;
        renderBoard();

        let nextBoardWindow = document.querySelector('.next-board-window');
        if (nextBoardWindow) {
            nextBoardWindow.remove();
        }
    });

    // Listen for Escape key press
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            backToTitleWindow.classList.toggle('show');
        } else if (event.key === 'N') {
            localStorage.removeItem('clickedQuestions');
            localStorage.setItem('currentBoardID', parseInt(currentBoardID) + 1);
            window.location.reload();
        } else if (event.key === 'R') {
            clickedQuestions = [];
            localStorage.removeItem('clickedQuestions');
            currentBoardID = localStorage.getItem('currentBoardID') || 1;
            renderBoard();

            let nextBoardWindow = document.querySelector('.next-board-window');
            if (nextBoardWindow) {
                nextBoardWindow.remove();
            }
        } else if (event.key === 'P') {
            localStorage.removeItem('clickedQuestions');
            localStorage.setItem('currentBoardID', parseInt(currentBoardID) - 1);
            window.location.reload();
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