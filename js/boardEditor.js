const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', function() {

    const loadingScreen = document.getElementById('loadingScreen');

    const backButton = document.getElementById('backButton');
    const saveButton = document.getElementById('saveButton');
    const boardTitle = document.getElementById('boardTitle');
    const deleteButton = document.getElementById('deleteButton');
    const board = document.getElementById('board');

    const saveBoardWindow = document.getElementById('saveBoardWindow');
    const descriptionInput = document.getElementById('boardDescription');
    const finalSaveButton = document.getElementById('saveBoardButton');
    const finalCancelButton = document.getElementById('cancelBoardButton');

    const boardCover = document.getElementById('boardCover');
    const questionEditor = document.getElementById('questionEditor');
    const priceInput = document.getElementById('priceInput');
    const dailyDoubleCheckbox = document.getElementById('dailyDoubleCheckbox');
    const questionInput = document.getElementById('questionInput');
    const answerInput = document.getElementById('answerInput');
    const questionImage = document.getElementById('questionImage');
    const removeQuestionImageButton = document.getElementById('removeQuestionImageButton');
    const answerImage = document.getElementById('answerImage');
    const removeAnswerImageButton = document.getElementById('removeAnswerImageButton');
    const saveQuestionButton = document.getElementById('saveQuestionButton');
    const cancelQuestionButton = document.getElementById('cancelQuestionButton');

    let boardData;
    let currentBoard = 0;

    let questionImageType = null;
    let answerImageType = null;
    
    // Get the current URL's query string
    const queryString = window.location.search;
    
    // Parse the query string
    const urlParams = new URLSearchParams(queryString);
    
    const passedBoard = urlParams.get('board');

    // if no board was passed as a parameter, fetch exampleBoardData.pjb
    if (passedBoard === null) {
        fetchDefaultBoardData();
    }    
    else {
        // Load the board data from the passed parameter
        fetch(`../boards/${passedBoard.replace('.pjb', '')}/${passedBoard}`)
            .then(response => response.json())
            .then(data => {
                loadBoardData(data);
                console.log('Board data loaded:', data);
            })    
            .catch(error => {
                console.error('Error fetching board data:', error);
                fetchDefaultBoardData();
            });    
    }        
    
    function fetchDefaultBoardData() {
        fetch('../boards/exampleBoardData/exampleBoardData.pjb')
            .then(response => response.json())
            .then(data => {
                loadBoardData(data);
            })    
            .catch(error => console.error('Error fetching default board data:', error));
    }        

    function loadBoardData(data) {
        boardTitle.value = data.meta.title || 'New Board';
        descriptionInput.value = data.meta.description || 'Description';

        const categoryInputs = document.getElementsByClassName('category');
        data.boards[currentBoard].categories.forEach((category, i) => {
            categoryInputs[i].value = category.name || '';
        });

        updateQuestionPrices(data);

        boardData = data;
    }

    function updateQuestionPrices(data) {
        const questionElements = document.getElementsByClassName('question');
        data.boards[currentBoard].categories.forEach((category, i) => {
            category.questions.forEach((question, j) => {
                questionElements[j * 5 + i].textContent = `$${question.price}`;
            });
        });
    }

    let language = localStorage.getItem('language') || 'en';

    let changesMade = false;

    if (language === 'lt') {
        backButton.textContent = 'Atgal';
    }

    priceInput.addEventListener('input', function() {
        let numericValue = priceInput.value.replace(/[^0-9]/g, ''); // Keep only numeric characters
        priceInput.value = numericValue ? `$${numericValue}` : ''; // Add '$' only if there's a value
        changesMade = true;
    });

    const invalidChars = /[\\/:*?"<>|]/g;

    boardTitle.addEventListener('input', function() {
        boardTitle.value = boardTitle.value.replace(invalidChars, '');
        changesMade = true;
    });

    categoriesRow = document.createElement('div');
    categoriesRow.className = 'categories-row';
    board.appendChild(categoriesRow);

    for (let i = 0; i < 5; i++) {
        const category = document.createElement('input');
        category.className = 'category';
        category.placeholder = 'Category name';
        categoriesRow.appendChild(category);
    }

    for (let i = 0; i < 5; i++) {
        questionsRow = document.createElement('div');
        questionsRow.className = 'questions-row';
        board.appendChild(questionsRow);

        for (let j = 0; j < 5; j++) {
            const question = document.createElement('div');
            question.className = 'question';
            question.textContent = '$0';
            questionsRow.appendChild(question);

            question.addEventListener('click', function() {
                questionEditor.style.display = 'flex';
                boardCover.style.display = 'flex';

                localStorage.setItem('editingQuestion', `${j}-${i}`);
                changesMade = true;

                questionInput.value = boardData.boards[currentBoard].categories[j].questions[i].content || 'Question';
                answerInput.value = boardData.boards[currentBoard].categories[j].questions[i].answer || 'Answer';
                priceInput.value = '$' + boardData.boards[currentBoard].categories[j].questions[i].price || '$0';
                dailyDoubleCheckbox.checked = boardData.boards[currentBoard].categories[j].questions[i].dailyDouble || false;
                questionImage.src = boardData.boards[currentBoard].categories[j].questions[i].questionImage || '../images/add_picture.png';
                answerImage.src = boardData.boards[currentBoard].categories[j].questions[i].answerImage || '../images/add_picture.png';
            });
        }
    }

    backButton.addEventListener('click', function() {
        if (changesMade) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                window.location.href = 'boardList.html';
            }
        }
        else {
            window.location.href = 'boardList.html';
        }
    });

    saveButton.addEventListener('click', function() {
        saveBoardWindow.style.display = 'flex';
        boardCover.style.display = 'flex';
    });

    finalSaveButton.addEventListener('click', function() {

        const date = new Date(Date.now());
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        let hours = date.getHours();
        if (hours < 10) {
            hours = '0' + hours;
        }
        let minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        
        const boardFolder = path.join(__dirname, '../boards', boardTitle.value);
        const imagesFolderPath = path.join(boardFolder, 'images');
        
        if (fs.existsSync(boardFolder)) {
            if (confirm('A board with this name already exists. Do you want to overwrite it?')) {
                fs.rmdirSync(boardFolder, { recursive: true });
            }
            else {
                return;
            }
        }

        if (boardData.meta.title !== boardTitle.value) {
            if (confirm('The board title has changed. Do you want to delete the old board folder?')) {
                fs.rmdirSync(path.join(__dirname, '../boards', boardData.meta.title), { recursive: true });
            }
        }

        boardData.meta.title = boardTitle.value;
        boardData.meta.description = descriptionInput.value;
        boardData.meta.lastEdited = formattedDate;

        // Ensure the images folder exists
        if (!fs.existsSync(imagesFolderPath)) {
            fs.mkdirSync(imagesFolderPath, { recursive: true });
        }

        // delete the old images
        fs.readdir(imagesFolderPath, (err, files) => {
            if (err) {
                console.error('Error reading images folder:', err);
            } else {
                for (const file of files) {
                    fs.unlink(path.join(imagesFolderPath, file), err => {
                        if (err) {
                            console.error('Error deleting image:', err);
                        }
                    });
                }
            }
        });

        // Save the images to the folder
        boardData.boards.forEach(board => {
            board.categories.forEach((category, i) => {
                category.questions.forEach((question, j) => {
                    if (question.questionImage && !question.questionImage.includes('add_picture.png')) {
                        const questionImagePath = path.join(imagesFolderPath, `QI_${i}_${j}.${question.questionImageType}`);
                        const questionImageData = question.questionImage.replace(/^data:image\/\w+;base64,/, '');
                        const questionImageBuffer = Buffer.from(questionImageData, 'base64');
                        fs.writeFile(questionImagePath, questionImageBuffer, (err) => {
                            if (err) {
                                console.error('Error saving question image:', err);
                            }
                        });
                        question.questionImage = '../boards/' + boardTitle.value + '/images/' + `QI_${i}_${j}.${question.questionImageType}`;
                    }
                    if (question.answerImage && !question.answerImage.includes('add_picture.png')) {
                        const answerImagePath = path.join(imagesFolderPath, `AI_${i}_${j}.${question.answerImageType}`);
                        const answerImageData = question.answerImage.replace(/^data:image\/\w+;base64,/, '');
                        const answerImageBuffer = Buffer.from(answerImageData, 'base64');
                        fs.writeFile(answerImagePath, answerImageBuffer, (err) => {
                            if (err) {
                                console.error('Error saving answer image:', err);
                            }
                        });
                        question.answerImage = '../boards/' + boardTitle.value + '/images/' + `AI_${i}_${j}.${question.answerImageType}`;
                    }
                    boardData.boards[currentBoard].categories[i].name = document.getElementsByClassName('category')[i].value;
                });
            });
        });

        // write the boardData to the file
        fs.writeFile(`./boards/${boardTitle.value}/${boardTitle.value}.pjb`, JSON.stringify(boardData, null, 4), (err) => {
            if (err) {
                console.error('Error saving board data:', err);
            } else {
                changesMade = false;
            }
        });

        saveBoardWindow.style.display = 'none';
        boardCover.style.display = 'none';

        window.location.href = 'boardEditor.html?board=' + boardTitle.value + '.pjb';
    });

    finalCancelButton.addEventListener('click', function() {
        descriptionInput.value = boardData.meta.description;
        saveBoardWindow.style.display = 'none';
        boardCover.style.display = 'none';
    });

    deleteButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this board?')) {
            fs.rmdir(`./boards/${boardTitle.value}`, { recursive: true }, (err) => {
                if (err) {
                    console.error('Error deleting board:', err);
                    alert('Error deleting board!\nMake sure the board \"' + boardTitle.value + '\" exists.');
                } else {
                    window.location.href = 'boardList.html';
                }
            });
        }
    });

    questionImage.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    questionImage.src = e.target.result; // Update the image preview
                    questionImageType = file.type.split('/')[1]; // Store the image path in a variable
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    });

    answerImage.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    answerImage.src = e.target.result; // Update the image preview
                    answerImageType = file.type.split('/')[1]; // Store the image path in a variable
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    });

    removeQuestionImageButton.addEventListener('click', function() {
        questionImage.src = '../images/add_picture.png';
        questionImageType = 'png';
    });

    removeAnswerImageButton.addEventListener('click', function() {
        answerImage.src = '../images/add_picture.png';
        answerImageType = 'png';
    });

    saveQuestionButton.addEventListener('click', function() {
        const questionText = questionInput.value.trim();
        const answerText = answerInput.value.trim();
        const price = priceInput.value.trim().replace('$', '').replace(/^0+$/, '0').replace(/^0+(?!$)/, '');
        const dailyDouble = dailyDoubleCheckbox.checked;
        const questionImageSrc = questionImage.src;
        const answerImageSrc = answerImage.src;

        const categoryIndex = localStorage.getItem('editingQuestion').split('-')[0];
        const questionIndex = localStorage.getItem('editingQuestion').split('-')[1];

        let question = boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex];

        question.content = questionText;
        question.answer = answerText;
        question.price = price;
        question.dailyDouble = dailyDouble;
        if (questionImageSrc.includes('add_picture.png')) {
            question.questionImage = null;
            question.questionImageType = null;
        }
        else {
            question.questionImage = questionImageSrc;
            question.questionImageType = questionImageType;
        }

        if (answerImageSrc.includes('add_picture.png')) {
            question.answerImage = null;
            question.answerImageType = null;
        }
        else {
            question.answerImage = answerImageSrc;
            question.answerImageType = answerImageType;
        }

        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex] = question;

        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';

        updateQuestionPrices(boardData);
    });

    cancelQuestionButton.addEventListener('click', function() {
        const categoryIndex = localStorage.getItem('editingQuestion').split('-')[0];
        const questionIndex = localStorage.getItem('editingQuestion').split('-')[1];
        let question = boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex];
        questionInput.value = question.content;
        answerInput.value = question.answer;
        priceInput.value = question.price;
        dailyDoubleCheckbox.checked = question.dailyDouble;
        questionImage.src = question.questionImage || '../images/add_picture.png';
        answerImage.src = question.answerImage || '../images/add_picture.png';
        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            questionEditor.style.display = 'none';
            boardCover.style.display = 'none';
            saveBoardWindow.style.display = 'none';
        }
    });

    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

});