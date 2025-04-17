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
    const downloadQuestionImageButton = document.getElementById('downloadQuestionImageButton');
    const answerImage = document.getElementById('answerImage');
    const removeAnswerImageButton = document.getElementById('removeAnswerImageButton');
    const downloadAnswerImageButton = document.getElementById('downloadAnswerImageButton');
    const saveQuestionButton = document.getElementById('saveQuestionButton');
    const cancelQuestionButton = document.getElementById('cancelQuestionButton');

    let boardData;
    let currentPage = 0;

    let musicVolume = localStorage.getItem('musicVolume') || 1;

    boardCover.style.display = 'none'; // Set initial display to none for Escape key functionality
    
    // Get the current URL's query string
    const queryString = window.location.search;
    
    // Parse the query string
    const urlParams = new URLSearchParams(queryString);
    
    const passedBoard = urlParams.get('board');

    const language = localStorage.getItem('language') || 'en';

    let changesMade = false;
    const invalidChars = /[\\/:*?"<>|\u0105\u010d\u0119\u0117\u012f\u0161\u0173\u016b\u017e\u0104\u010c\u0118\u0116\u012e\u0160\u0172\u016a\u017d\`\'\"\:\;]/g;

    const BOARDS_DIR = window.electron.ipcRenderer.sendSync('get-boards-dir'); // Synchronous IPC call to get the boards directory


    if (language === 'lt') {
        backButton.textContent = 'Atgal';
        saveButton.textContent = 'I\u0161saugoti';
        deleteButton.textContent = 'I\u0161trinti';
        questionInput.placeholder = 'Klausimas';
        answerInput.placeholder = 'Atsakymas';
        dailyDoubleText.textContent = 'Dvigubi ta\u0161kai?';
        saveQuestionButton.textContent = 'I\u0161saugoti';
        cancelQuestionButton.textContent = 'At\u0161aukti';
        descriptionLabel.textContent = 'Apra\u0161ymas';
        descriptionInput.placeholder = 'Apra\u0161ymas';
        finalSaveButton.textContent = 'I\u0161saugoti';
        finalCancelButton.textContent = 'At\u0161aukti';
    }

    // if no board was passed as a parameter, fetch exampleBoardData.pjb
    if (passedBoard === null) {
        fetchDefaultBoardData();
    }    
    else {

        let filePath = BOARDS_DIR + '/' + passedBoard;

        // Load the board data from the passed parameter
        fetch(filePath)
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
        let filePath = window.fileSystem.joinPath(window.appPaths.__dirname, 'boards/exampleBoard/exampleBoardData.pjb');

        // Read the file using window.fileSystem
        window.fileSystem.readFile(filePath, 'utf8')
            .then((data) => {
                try {
                    const boardData = JSON.parse(data);
                    loadBoardData(boardData);
                } catch (parseError) {
                    console.error('Error parsing default board data:', parseError);
                }
            })
            .catch((err) => {
                console.error('Error reading default board data:', err);
            });
    }        

    // Load the board data into the editor
    function loadBoardData(data) {
        boardTitle.value = data.meta.title || 'New Board';
        descriptionInput.value = data.meta.description || 'Description';

        const categoryInputs = document.getElementsByClassName('category');

        data.pages[currentPage].categories.forEach((category, i) => {
            categoryInputs[i].value = category.name || '';
            categoryInputs[i].addEventListener('input', function() {
                boardData.pages[currentPage].categories[i].name = categoryInputs[i].value;
                changesMade = true;
                if (categoryInputs[i].value.length > 23)
                {
                    categoryInputs[i].style.fontSize = '1.7vw';
                }
                else {
                    categoryInputs[i].style.fontSize = '2vw';
                }
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

    // Update the question prices in the UI
    function updateQuestionPrices(data) {
        const questionElements = document.getElementsByClassName('question');
        data.pages[currentPage].categories.forEach((category, i) => {
            category.questions.forEach((question, j) => {
                questionElements[j * 5 + i].textContent = `$${question.price}`;
            });
        });
    }

    // Add event listeners to the inputs
    boardTitle.addEventListener('input', function() {
        boardTitle.value = boardTitle.value.replace(invalidChars, '');  // Don't allow invalid characters
        changesMade = true;
    });

    // Create the board layout
    categoriesRow = document.createElement('div');
    categoriesRow.className = 'categories-row';
    board.appendChild(categoriesRow);

    // Create the category inputs
    for (let i = 0; i < 5; i++) {
        const category = document.createElement('textarea'); // Use <textarea> instead of <input>
        category.className = 'category';
        category.placeholder = 'Category name';
        category.maxLength = 30;
        category.rows = 1;
        category.style.resize = 'none';
        category.spellcheck = false;
        categoriesRow.appendChild(category);
    }

    // Create the question cards
    for (let i = 0; i < 5; i++) {
        questionsRow = document.createElement('div');
        questionsRow.className = 'questions-row';
        board.appendChild(questionsRow);

        for (let j = 0; j < 5; j++) {
            const question = document.createElement('div');
            question.className = 'question';
            question.textContent = '$0';
            questionsRow.appendChild(question);

            // Open the question editor when the question is clicked
            question.addEventListener('click', function() {
                questionEditor.style.display = 'flex';
                boardCover.style.display = 'flex';

                localStorage.setItem('editingQuestion', `${j}-${i}`);

                questionInput.value = boardData.pages[currentPage].categories[j].questions[i].content || 'Question';
                answerInput.value = boardData.pages[currentPage].categories[j].questions[i].answer || 'Answer';
                priceInput.value = '$' + boardData.pages[currentPage].categories[j].questions[i].price || '$0';
                dailyDoubleCheckbox.checked = boardData.pages[currentPage].categories[j].questions[i].dailyDouble || false;
                questionImage.src = boardData.pages[currentPage].categories[j].questions[i].questionImageData || '../images/add_picture.png';
                answerImage.src = boardData.pages[currentPage].categories[j].questions[i].answerImageData || '../images/add_picture.png';
            });
        }
    }

    // Back button functionality
    backButton.addEventListener('click', function() {
        if (changesMade) {
            let confirmText = 'You have unsaved changes. Are you sure you want to leave?';
            let yesText = 'Yes';
            let noText = 'No';
            if (language === 'lt') {
                confirmText = 'Yra nei\u0161saugot\u0173 pakeitim\u0173. Ar tikrai norite i\u0161eiti?';
                yesText = 'Taip';
                noText = 'Ne';
            }
            customConfirm(confirmText, yesText, noText)
                .then((confirmed) => {
                    if (confirmed) {
                        window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);
                        window.location.href = 'boardList.html';
                    }
                });
        }
        else {
            window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);
            window.location.href = 'boardList.html';
        }
    });

    // Save button functionality (opens the save window)
    saveButton.addEventListener('click', function() {
        saveBoardWindow.style.display = 'flex';
        boardCover.style.display = 'flex';
    });

    // Final save button functionality (saves the board)
    finalSaveButton.addEventListener('click', function() {
        handleFinalSave();
    });

    // Handle the saving of the board
    async function handleFinalSave() {

        let currentBoardFile = window.fileSystem.joinPath(BOARDS_DIR, `${boardTitle.value}.pjb`);
        let exampleBoardFile = window.fileSystem.joinPath(BOARDS_DIR, 'New Board.pjb');

        // Overwrite the board if it already exists?
        if (window.fileSystem.existsSync(currentBoardFile)) {
            let confirmed = await async function() {
                let confirmText = 'A board with this name already exists. Do you want to overwrite it?';
                let yesText = 'Yes';
                let noText = 'No';
                if (language === 'lt') {
                    confirmText = 'Lenta su tokiu pavadinimu jau egzistuoja. Ar norite j\u0105 perra\u0161yti?';
                    yesText = 'Taip';
                    noText = 'Ne';
                }
                return await customConfirm(confirmText, yesText, noText, false);
            }();
            if (!confirmed) {
                return;
            }
        }
        
        // Delete the old board folder if it exists after detecting a rename?
        if (boardData.meta.title !== boardTitle.value && !(boardData.meta.title === 'New Board' && !window.fileSystem.existsSync(exampleBoardFile))) {
            let confirmed = await async function() {
                let confirmText = 'The board name has changed. Do you want to delete or keep the old board folder?';
                let yesText = 'Delete';
                let noText = 'Keep';
                if (language === 'lt') {
                    confirmText = 'Lentos pavadinimas pasikeit\u0117. Ar norite i\u0161trinti, ar palikti sen\u0105 lent\u0105?';
                    yesText = 'I\u0161trinti';
                    noText = 'Palikti';
                }
                return await customConfirm(confirmText, yesText, noText, false);
            }();
            if (confirmed) {
                window.fileSystem.rmSync(window.fileSystem.joinPath(BOARDS_DIR, `${boardData.meta.title}.pjb`), { force: true });
            }
        }

        finalizeSave();
    }

    // Save the board data to a file
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

        boardData.meta.title = boardTitle.value;
        boardData.meta.description = descriptionInput.value;
        boardData.meta.lastEdited = formattedDate;

        // write the boardData to the file
        await window.fileSystem.writeFile(
            window.fileSystem.joinPath(BOARDS_DIR, `${boardTitle.value}.pjb`),
            JSON.stringify(boardData, null, 4)
        );

        console.log('Board data saved successfully!', boardData);

        // Hide the save window
        saveBoardWindow.style.display = 'none';
        boardCover.style.display = 'none';

        window.location.href = 'boardEditor.html' + '?board=' + `${boardTitle.value}.pjb`;
    }

    // Cancel button functionality (closes the save window)
    finalCancelButton.addEventListener('click', function() {
        descriptionInput.value = boardData.meta.description;
        saveBoardWindow.style.display = 'none';
        boardCover.style.display = 'none';
    });

    // Custom confirm function
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

    // Delete button functionality (deletes the board)
    deleteButton.addEventListener('click', function() {
        let confirmText = 'Are you sure you want to delete this board?';
        let yesText = 'Yes';
        let noText = 'No';
        if (language === 'lt') {
            confirmText = 'Ar tikrai norite i\u0161trinti \u0161i\u0105 lent\u0105?';
            yesText = 'Taip';
            noText = 'Ne';
        }
        customConfirm(confirmText, yesText, noText)
            .then((confirmed) => {
                if (confirmed) {
                    let boardPath = window.fileSystem.joinPath(BOARDS_DIR, `${boardData.meta.title}.pjb`);
                    window.fileSystem.rm(boardPath, { recursive: true, force: true })
                        .then(() => {
                            // Successfully deleted the board
                            window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);
                            window.location.href = 'boardList.html';
                        })
                        .catch((err) => {
                            // Handle the error
                            console.error('Error deleting board:', err);
                            alert('Error deleting board!\nMake sure the board "' + boardData.meta.title + '" exists.');
                        });
                }
            });
    });

    // Previous and next board page button functionality
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

    // Question editor inputs
    priceInput.addEventListener('input', function() {
        let numericValue = priceInput.value.replace(/[^0-9]/g, ''); // Keep only numeric characters
        priceInput.value = numericValue ? `$${numericValue}` : ''; // Add '$' only if there's a value
        changesMade = true;
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
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    });

    removeQuestionImageButton.addEventListener('click', function() {
        questionImage.src = '../images/add_picture.png';
    });

    downloadQuestionImageButton.addEventListener('click', async function() {

        let questionImageSrc = questionImage.src;
        if (questionImageSrc.includes('add_picture.png')) {
            alert('No image to download!');
            return;
        }

        let downloadsDir = window.electron.ipcRenderer.sendSync('get-downloads-dir');
        // Rename file to QI_yyyy_mm-dd_hh-mm-ss.png
        let fileType = questionImageSrc.split(';')[0].split('/')[1];
        let fileName = "QI_" + new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T','_') + `.${fileType}`;
        let filePath = window.fileSystem.joinPath(downloadsDir, fileName);
        const base64Data = questionImageSrc.split(',')[1];
        const buffer = window.nodeUtils.Buffer(base64Data, 'base64');
        window.fileSystem.writeFile(filePath, buffer)
            .then(() => {
                alert('Image saved to Downloads folder');
            })
            .catch((err) => {
                console.error('Error saving image:', err);
                alert('Error saving image');
            });
    });

    removeAnswerImageButton.addEventListener('click', function() {
        answerImage.src = '../images/add_picture.png';
    });

    downloadAnswerImageButton.addEventListener('click', async function() {
        let answerImageSrc = answerImage.src;
        if (answerImageSrc.includes('add_picture.png')) {
            alert('No image to download!');
            return;
        }

        let downloadsDir = window.electron.ipcRenderer.sendSync('get-downloads-dir');
        // Rename file to AI_yyyy_mm-dd_hh-mm-ss.png
        let fileType = answerImageSrc.split(';')[0].split('/')[1];
        let fileName = "AI_" + new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T','_') + `.${fileType}`;
        let filePath = window.fileSystem.joinPath(downloadsDir, fileName);
        const base64Data = answerImageSrc.split(',')[1];
        const buffer = window.nodeUtils.Buffer(base64Data, 'base64');
        window.fileSystem.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving image:', err);
                alert('Error saving image');
            } else {
                alert('Image saved to Downloads folder');
            }
        });
    });

    saveQuestionButton.addEventListener('click', function() {
        changesMade = true;

        // Get the values from the inputs
        const questionText = questionInput.value.trim();
        const answerText = answerInput.value.trim();
        const price = priceInput.value.trim().replace('$', '').replace(/^0+$/, '0').replace(/^0+(?!$)/, '');  // Remove leading zeros
        const dailyDouble = dailyDoubleCheckbox.checked;
        const questionImageSrc = questionImage.src;
        const answerImageSrc = answerImage.src;

        const categoryIndex = localStorage.getItem('editingQuestion').split('-')[0];
        const questionIndex = localStorage.getItem('editingQuestion').split('-')[1];

        let question = boardData.pages[currentPage].categories[categoryIndex].questions[questionIndex];

        // Set the question data
        question.content = questionText;
        question.answer = answerText;
        question.price = price;
        question.dailyDouble = dailyDouble;
        question.questionImageData = questionImageSrc.includes('add_picture.png') ? null : questionImageSrc;
        question.answerImageData = answerImageSrc.includes('add_picture.png') ? null : answerImageSrc;

        // console.log(currentPage, categoryIndex, questionIndex);

        // Update the question in the board data
        boardData.pages[currentPage].categories[categoryIndex].questions[questionIndex] = question;

        // console.log(boardData.pages[0].categories[0].questions[0].questionImage);

        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';

        updateQuestionPrices(boardData);
    });

    // Cancel button functionality (closes the question editor without saving)
    cancelQuestionButton.addEventListener('click', function() {
        questionEditor.style.display = 'none';
        boardCover.style.display = 'none';
    });

    // Escape key functionality
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (boardCover.style.display === 'none') {
                if (changesMade) {
                    let confirmText = 'You have unsaved changes. Are you sure you want to leave?';
                    let yesText = 'Yes';
                    let noText = 'No';
                    if (language === 'lt') {
                        confirmText = 'Yra nei\u0161saugot\u0173 pakeitim\u0173. Ar tikrai norite i\u0161eiti?';
                        yesText = 'Taip';
                        noText = 'Ne';
                    }
                    customConfirm(confirmText, yesText, noText)
                        .then((confirmed) => {
                            if (confirmed) {
                                window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);
                                window.location.href = 'boardList.html';
                            }
                        });
                }
                else {
                    window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100 || 1, true);
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
        loadingScreen.style.display = 'none';
    });

});