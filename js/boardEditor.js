document.addEventListener('DOMContentLoaded', function() {

    const backButton = document.getElementById('backButton');
    const saveButton = document.getElementById('saveButton');
    const boardTitle = document.getElementById('boardTitle');
    const deleteButton = document.getElementById('deleteButton');
    const board = document.getElementById('board');

    const boardCover = document.getElementById('boardCover');
    const questionEditor = document.getElementById('questionEditor');
    const priceInput = document.getElementById('priceInput');
    const dailyDoubleButton = document.getElementById('dailyDoubleButton');
    const questionInput = document.getElementById('questionInput');
    const answerInput = document.getElementById('answerInput');
    const questionImage = document.getElementById('questionImage');
    const answerImage = document.getElementById('answerImage');
    const saveQuestionButton = document.getElementById('saveQuestionButton');
    const cancelQuestionButton = document.getElementById('cancelQuestionButton');

    boardCover.style.hidden = true;
    // questionEditor.style.hidden = true;

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
                questionEditor.style.hidden = false;
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
        ipcRenderer.send('saveBoard', {
            title: document.getElementById('boardTitle').value,
            description: document.getElementById('boardDescription').value,
            categories: document.getElementById('boardCategories').value,
            questions: questions
        });
    });

});