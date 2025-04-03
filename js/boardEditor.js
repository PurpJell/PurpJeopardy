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
    const descriptionLabel = document.getElementById('descriptionLabel');
    const descriptionInput = document.getElementById('boardDescription');
    const finalSaveButton = document.getElementById('saveBoardButton');
    const finalCancelButton = document.getElementById('cancelBoardButton');

    const confirmWindow = document.getElementById('confirmWindow');
    const confirmText = document.getElementById('confirmText');
    const confirmYesButton = document.getElementById('confirmYesButton');
    const confirmNoButton = document.getElementById('confirmNoButton');

    const previousPageButton = document.getElementById('previousPageButton');
    const nextPageButton = document.getElementById('nextPageButton');

    const boardCover = document.getElementById('boardCover');
    const questionEditor = document.getElementById('questionEditor');
    const priceInput = document.getElementById('priceInput');
    const dailyDoubleText = document.getElementById('dailyDoubleText');
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
    let currentPage = 0;

    let questionImageType = null;
    let answerImageType = null;

    boardCover.style.display = 'none'; // Set initial display to none for Escape key functionality
    
    // Get the current URL's query string
    const queryString = window.location.search;
    
    // Parse the query string
    const urlParams = new URLSearchParams(queryString);
    
    const passedBoard = urlParams.get('board');

    const language = localStorage.getItem('language') || 'en';

    if (language === 'lt') {
        backButton.textContent = 'Atgal';
        saveButton.textContent = 'Issaugoti';
        deleteButton.textContent = 'Istrinti';
        questionInput.placeholder = 'Klausimas';
        answerInput.placeholder = 'Atsakymas';
        dailyDoubleText.textContent = 'Dvigubi taskai?';
        saveQuestionButton.textContent = 'Issaugoti';
        cancelQuestionButton.textContent = 'Atsaukti';
        descriptionLabel.textContent = 'Aprasymas';
        descriptionInput.placeholder = 'Aprasymas';
        finalSaveButton.textContent = 'Issaugoti';
        finalCancelButton.textContent = 'Atsaukti';
    }

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

        data.pages[currentPage].categories.forEach((category, i) => {
            categoryInputs[i].value = category.name || '';
            categoryInputs[i].addEventListener('input', function() {
                boardData.pages[currentPage].categories[i].name = categoryInputs[i].value;
                changesMade = true;
            });
        });

        updateQuestionPrices(data);

        boardData = data;

        if (currentPage === 0) {
            previousPageButton.style.display = 'none';
        }
    
        if (currentPage === boardData.pages.length - 1) {
            nextPageButton.style.display = 'none';
        }
    }

    function updateQuestionPrices(data) {
        const questionElements = document.getElementsByClassName('question');
        data.pages[currentPage].categories.forEach((category, i) => {
            category.questions.forEach((question, j) => {
                questionElements[j * 5 + i].textContent = `$${question.price}`;
            });
        });
    }

    let changesMade = false;

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

                questionInput.value = boardData.pages[currentPage].categories[j].questions[i].content || 'Question';
                answerInput.value = boardData.pages[currentPage].categories[j].questions[i].answer || 'Answer';
                priceInput.value = '$' + boardData.pages[currentPage].categories[j].questions[i].price || '$0';
                dailyDoubleCheckbox.checked = boardData.pages[currentPage].categories[j].questions[i].dailyDouble || false;
                questionImage.src = boardData.pages[currentPage].categories[j].questions[i].questionImage || '../images/add_picture.png';
                answerImage.src = boardData.pages[currentPage].categories[j].questions[i].answerImage || '../images/add_picture.png';
                questionImageType = boardData.pages[currentPage].categories[j].questions[i].questionImageType || 'png';
                answerImageType = boardData.pages[currentPage].categories[j].questions[i].answerImageType || 'png';
            });
        }
    }

    backButton.addEventListener('click', function() {
        if (changesMade) {
            let confirmText = 'You have unsaved changes. Are you sure you want to leave?';
            let yesText = 'Yes';
            let noText = 'No';
            if (language === 'lt') {
                confirmText = 'Yra neissaugotu pakeitimu. Ar tikrai norite iseiti?';
                yesText = 'Taip';
                noText = 'Ne';
            }
            customConfirm(confirmText, yesText, noText)
                .then((confirmed) => {
                    if (confirmed) {
                        window.location.href = 'boardList.html';
                    }
                });
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
        handleFinalSave();
    });

    async function handleFinalSave() {
        const boardFolder = path.join(__dirname, '../boards', boardTitle.value);
        
        async function overwriteConfirmation() {
            let confirmText = 'A board with this name already exists. Do you want to overwrite it?';
            let yesText = 'Yes';
            let noText = 'No';
            if (language === 'lt') {
                confirmText = 'Lenta su tokiu pavadinimu jau egzistuoja. Ar norite ja perrasyti?';
                yesText = 'Taip';
                noText = 'Ne';
            }
            return await customConfirm(confirmText, yesText, noText, false);
        }

        if (fs.existsSync(boardFolder)) {
            let confirmed = await overwriteConfirmation();
            if (confirmed) {
                try {
                    fs.rmSync(boardFolder, { recursive: true, force: true });
                } catch (error) {
                    console.error('Error deleting board folder:', error);
                    return; // Exit the function if folder deletion fails
                }
            }
            else {
                return;
            }
        }

        async function removeOldFolder() {
            let confirmText = 'The board name has changed. Do you want to delete or keep the old board folder?';
            let yesText = 'Delete';
            let noText = 'Keep';
            if (language === 'lt') {
                confirmText = 'Lentos pavadinimas pasikeite. Ar norite istrinti ar palikti sena lenta?';
                yesText = 'Istrinti';
                noText = 'Palikti';
            }
            return await customConfirm(confirmText, yesText, noText, false);
        }
        
        if (boardData.meta.title !== boardTitle.value) {
            let confirmed = await removeOldFolder();
            if (confirmed) {
                fs.rmSync(path.join(__dirname, '../boards', boardData.meta.title), { recursive: true, force: true });
            }
        }

        finalizeSave();
    }

    async function finalizeSave() {

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

        const BOARDS_DIR = path.join(__dirname, '../boards');
        const IMAGES_DIR = path.join(BOARDS_DIR, boardTitle.value, 'images');
    
        boardData.meta.title = boardTitle.value;
        boardData.meta.description = descriptionInput.value;
        boardData.meta.lastEdited = formattedDate;

        // Ensure the images folder exists
        await fs.promises.mkdir(IMAGES_DIR, { recursive: true });

        // delete the old images
        try {
            const files = await fs.promises.readdir(IMAGES_DIR);
            for (const file of files) {
                await fs.promises.unlink(path.join(IMAGES_DIR, file));
            }
        } catch (err) {
            console.error('Error deleting old images:', err);
        }

        // Save the images to the folder
        await Promise.all(
            boardData.pages.map((page) =>
                Promise.all(
                    page.categories.map((category, i) =>
                        Promise.all(
                            category.questions.map(async (question, j) => {
                                if (question.questionImage && !question.questionImage.includes('add_picture.png')) {
                                    const questionImagePath = path.join(IMAGES_DIR, `QI_${i}_${j}.${question.questionImageType}`);
                                    const questionImageData = question.questionImage.replace(/^data:image\/\w+;base64,/, '');
                                    await fs.promises.writeFile(questionImagePath, Buffer.from(questionImageData, 'base64'));
                                    question.questionImage = `../boards/${boardTitle.value}/images/QI_${i}_${j}.${question.questionImageType}`;
                                }
                                if (question.answerImage && !question.answerImage.includes('add_picture.png')) {
                                    const answerImagePath = path.join(IMAGES_DIR, `AI_${i}_${j}.${question.answerImageType}`);
                                    const answerImageData = question.answerImage.replace(/^data:image\/\w+;base64,/, '');
                                    await fs.promises.writeFile(answerImagePath, Buffer.from(answerImageData, 'base64'));
                                    question.answerImage = `../boards/${boardTitle.value}/images/AI_${i}_${j}.${question.answerImageType}`;
                                }
                            })
                        )
                    )
                )
            )
        );

        // write the boardData to the file
        await fs.promises.writeFile(
            path.join(BOARDS_DIR, boardTitle.value, `${boardTitle.value}.pjb`),
            JSON.stringify(boardData, null, 4)
        );

        // Hide the save window
        saveBoardWindow.style.display = 'none';
        boardCover.style.display = 'none';

        window.location.href = 'boardEditor.html' + '?board=' + `${boardTitle.value}.pjb`;
    }

    finalCancelButton.addEventListener('click', function() {
        descriptionInput.value = boardData.meta.description;
        saveBoardWindow.style.display = 'none';
        boardCover.style.display = 'none';
    });

    function customConfirm(message, yesText, noText, removeCover = true) {
        return new Promise((resolve) => {
            confirmText.textContent = message;
            confirmYesButton.textContent = yesText;
            confirmNoButton.textContent = noText;
            confirmWindow.style.display = 'flex';
            boardCover.style.display = 'flex';
            boardCover.style.zIndex = 103;
    
            function handleYesClick() {
                cleanup();
                resolve(true); // Resolve the promise with `true` for "Yes"
            }
    
            function handleNoClick() {
                cleanup();
                resolve(false); // Resolve the promise with `false` for "No"
            }
    
            function handleEscapeKey(event) {
                if (event.key === 'Escape') {
                    cleanup();
                    resolve(false); // Treat Escape as a "No"
                }
            }
    
            confirmYesButton.addEventListener('click', handleYesClick);
            confirmNoButton.addEventListener('click', handleNoClick);
            document.addEventListener('keydown', handleEscapeKey);
    
            // Cleanup function to remove event listeners and hide the confirm window
            function cleanup() {
                confirmYesButton.removeEventListener('click', handleYesClick);
                confirmNoButton.removeEventListener('click', handleNoClick);
                document.removeEventListener('keydown', handleEscapeKey);
                confirmWindow.style.display = 'none';
                if (removeCover) boardCover.style.display = 'none';
                boardCover.style.zIndex = 101;
            }
        });
    }

    deleteButton.addEventListener('click', function() {
        let confirmText = 'Are you sure you want to delete this board?';
        let yesText = 'Yes';
        let noText = 'No';
        if (language === 'lt') {
            confirmText = 'Ar tikrai norite istrinti sia lenta?';
            yesText = 'Taip';
            noText = 'Ne';
        }
        customConfirm(confirmText, yesText, noText)
            .then((confirmed) => {
                if (confirmed) {
                    fs.rm(`./boards/${boardTitle.value}`, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error('Error deleting board:', err);
                            alert('Error deleting board!\nMake sure the board "' + boardTitle.value + '" exists.');
                        } else {
                            window.location.href = 'boardList.html';
                        }
                    });
                }
            });
    });

    previousPageButton.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            loadBoardData(boardData);
            if (currentPage === 0) {
                previousPageButton.style.display = 'none';
            }
            nextPageButton.style.display = 'flex';
        }
    });

    nextPageButton.addEventListener('click', function() {
        if (currentPage < boardData.pages.length - 1) {
            currentPage++;
            loadBoardData(boardData);
            if (currentPage === boardData.pages.length - 1) {
                nextPageButton.style.display = 'none';
            }
            previousPageButton.style.display = 'flex';
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

        let question = boardData.pages[currentPage].categories[categoryIndex].questions[questionIndex];

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

        boardData.pages[currentPage].categories[categoryIndex].questions[questionIndex] = question;

        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';

        updateQuestionPrices(boardData);
    });

    cancelQuestionButton.addEventListener('click', function() {
        const categoryIndex = localStorage.getItem('editingQuestion').split('-')[0];
        const questionIndex = localStorage.getItem('editingQuestion').split('-')[1];
        let question = boardData.pages[currentPage].categories[categoryIndex].questions[questionIndex];
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
            if (boardCover.style.display === 'none') {
                if (changesMade) {
                    let confirmText = 'You have unsaved changes. Are you sure you want to leave?';
                    let yesText = 'Yes';
                    let noText = 'No';
                    if (language === 'lt') {
                        confirmText = 'Yra neissaugotu pakeitimu. Ar tikrai norite iseiti?';
                        yesText = 'Taip';
                        noText = 'Ne';
                    }
                    customConfirm(confirmText, yesText, noText)
                        .then((confirmed) => {
                            if (confirmed) {
                                window.location.href = 'boardList.html';
                            }
                        });
                }
                else {
                    window.location.href = 'boardList.html';
                }
            }
            else {
                questionEditor.style.display = 'none';
                boardCover.style.display = 'none';
                saveBoardWindow.style.display = 'none';
            }
        }
    });

    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

});