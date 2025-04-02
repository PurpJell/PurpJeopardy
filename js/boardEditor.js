const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', function() {

    const backButton = document.getElementById('backButton');
    const saveButton = document.getElementById('saveButton');
    const boardTitle = document.getElementById('boardTitle');
    const deleteButton = document.getElementById('deleteButton');
    const board = document.getElementById('board');

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
    
    boardCover.style.display = 'none';
    questionEditor.style.display = 'none';

    // if no board was passed as a parameter, fetch exampleBoardData.pjb
    if (passedBoard === null) {
        fetchDefaultBoardData();
    }    
    else {
        // Load the board data from the passed parameter
        fetch(`../boards/${passedBoard.replace('.pjb', '')}/${passedBoard}`)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('editorBoardData', JSON.stringify(data));
                loadBoardData(data);
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
                localStorage.setItem('editorBoardData', JSON.stringify(data));
                loadBoardData(data);
            })    
            .catch(error => console.error('Error fetching default board data:', error));
    }        

    function loadBoardData(data) {
        boardTitle.value = data.meta.title || 'New Board';
        document.getElementById('boardDescription').value = data.meta.description || 'Description';

        boardData = data;
    }    

    let language = localStorage.getItem('language') || 'en';

    let changesMade = false;

    if (language === 'lt') {
        backButton.textContent = 'Atgal';
    }

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
                priceInput.value = boardData.boards[currentBoard].categories[j].questions[i].price || '$0';
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
        window.location.href = 'boardList.html';
    });

    saveButton.addEventListener('click', function() {

        const date = new Date(data.meta.lastEdited || Date.now());
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

        boardData.meta.title = boardTitle.value;
        boardData.meta.description = "Description"; // TODO: Add description input
        boardData.meta.lastEdited = formattedDate;

        // write the boardData to the file
        fs.writeFile(`../boards/${boardTitle.value}/${boardTitle.value}.pjb`, JSON.stringify(boardData), (err) => {
            if (err) {
                console.error('Error saving board data:', err);
            } else {
                alert('Board saved successfully!');
                changesMade = false;
            }
        });
        
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
                    // Get the board name and construct the image path
                    const boardName = boardData.meta.title;
                    const imagesFolderPath = path.join(__dirname, `../boards/${boardName}/images`);
                    category = localStorage.getItem('editingQuestion').split('-')[0];
                    question = localStorage.getItem('editingQuestion').split('-')[1];
                    const fileName = 'QI_' + category + '_' + question + '.png';
                    const imagePath = path.join(imagesFolderPath, fileName);
    
                    // Ensure the images folder exists
                    if (!fs.existsSync(imagesFolderPath)) {
                        fs.mkdirSync(imagesFolderPath, { recursive: true });
                    }
    
                    // Save the image to the folder
                    const base64Data = e.target.result.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    fs.writeFile(imagePath, buffer, (err) => {
                        if (err) {
                            console.error('Error saving image:', err);
                        } else {
                            boardData.boards[currentBoard].categories[category].questions[question].questionImage = `../boards/${boardName}/images/${fileName}`;
                            questionImage.src = `../boards/${boardName}/images/${fileName}`; // Update the image preview
                        }
                    });
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
                    // Get the board name and construct the image path
                    const boardName = boardData.meta.title;
                    const imagesFolderPath = path.join(__dirname, `../boards/${boardName}/images`);
                    category = localStorage.getItem('editingQuestion').split('-')[0];
                    question = localStorage.getItem('editingQuestion').split('-')[1];
                    const fileName = 'AI_' + category + '_' + question + '.png';
                    const imagePath = path.join(imagesFolderPath, fileName);
    
                    answerImage.src = e.target.result; // Update the image preview
                    answerImageType = file.type.split('/')[1]; // Store the image path in a variable
                    console.log('answerImage.src', answerImage.src);
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    });

    removeQuestionImageButton.addEventListener('click', function() {
        questionImage.src = '../images/add_picture.png';
        category = localStorage.getItem('editingQuestion').split('-')[0];
        question = localStorage.getItem('editingQuestion').split('-')[1];
        const boardName = boardData.meta.title;
        const imagesFolderPath = path.join(__dirname, `../boards/${boardName}/images`);
        const fileName = 'QI_' + category + '_' + question + '.png';
        const imagePath = path.join(imagesFolderPath, fileName);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image:', err);
            }
        });
        boardData.boards[currentBoard].categories[category].questions[question].questionImage = null;
    });

    removeAnswerImageButton.addEventListener('click', function() {
        answerImage.src = '../images/add_picture.png';
        category = localStorage.getItem('editingQuestion').split('-')[0];
        question = localStorage.getItem('editingQuestion').split('-')[1];
        const boardName = boardData.meta.title;
        const imagesFolderPath = path.join(__dirname, `../boards/${boardName}/images`);
        const fileName = 'AI_' + category + '_' + question + '.png';
        const imagePath = path.join(imagesFolderPath, fileName);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image:', err);
            }
        });
        boardData.boards[currentBoard].categories[category].questions[question].answerImage = null;
    });

    saveQuestionButton.addEventListener('click', function() {
        const questionText = questionInput.value.trim();
        const answerText = answerInput.value.trim();
        const price = priceInput.value.trim();
        const dailyDouble = dailyDoubleCheckbox.checked;
        const questionImageSrc = questionImage.src;
        const answerImageSrc = answerImage.src;

        const boardName = boardData.meta.title;
        const imagesFolderPath = path.join(__dirname, `../boards/${boardName}/images`);
        const categoryIndex = localStorage.getItem('editingQuestion').split('-')[0];
        const questionIndex = localStorage.getItem('editingQuestion').split('-')[1];

        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].content = questionText;
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].answer = answerText;
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].price = price;
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].dailyDouble = dailyDouble;
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].questionImage = questionImageSrc;
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].answerImage = answerImageSrc;

        // Ensure the images folder exists
        if (!fs.existsSync(imagesFolderPath)) {
            fs.mkdirSync(imagesFolderPath, { recursive: true });
        }

        // Download the question image to the folder
        const questionImagePath = path.join(imagesFolderPath, `QI_${categoryIndex}_${questionIndex}.${questionImageType}`);
        const questionImageData = questionImageSrc.replace(/^data:image\/\w+;base64,/, '');
        const questionImageBuffer = Buffer.from(questionImageData, 'base64');
        fs.writeFile(questionImagePath, questionImageBuffer, (err) => {
            if (err) {
                console.error('Error saving question image:', err);
            }
        });

        // Download the answer image to the folder
        const answerImagePath = path.join(imagesFolderPath, `AI_${categoryIndex}_${questionIndex}.${answerImageType}`);
        const answerImageData = answerImageSrc.replace(/^data:image\/\w+;base64,/, '');
        const answerImageBuffer = Buffer.from(answerImageData, 'base64');
        fs.writeFile(answerImagePath, answerImageBuffer, (err) => {
            if (err) {
                console.error('Error saving answer image:', err);
            }
        });

        // Update the question and answer images in the board data
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].questionImage = questionImagePath;
        boardData.boards[currentBoard].categories[categoryIndex].questions[questionIndex].answerImage = answerImagePath;

        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';
    });

    cancelQuestionButton.addEventListener('click', function() {
        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            questionEditor.style.display = 'none';
            boardCover.style.display = 'none';
        }
    });

});