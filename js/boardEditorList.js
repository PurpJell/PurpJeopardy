const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', function() {

    const topBar = document.getElementById('topBar');
    const backButton = document.getElementById('backButton');
    const createBoardButton = document.getElementById('createBoardButton');
    const searchBar = document.getElementById('searchBar');
    const noBoards = document.getElementById('noBoards');
    const boardList = document.getElementById('boardList');

    let language = localStorage.getItem('language') || 'en';

    if (language === 'lt') {
        backButton.textContent = 'Atgal';
        createBoardButton.textContent = 'Sukurti lenta';
        searchBar.placeholder = 'Ieskoti lentu';
    }

    searchBar.focus();

    let boards = [];

    const gamesDirectory = path.join(__dirname, '../boards');
    fs.readdir(gamesDirectory, (err, files) => {
        if (err) {
            console.error('Error reading games directory:', err);
            return;
        }

        boards = files.filter(file => file.endsWith('.pjb'));
        boards = boards.filter(board => board !== "exampleBoardData.pjb");

        if (boards.length === 0) {
            noBoards.style.display = 'block';
            if (language === 'lt') {
                noBoards.textContent = "Lentu nerasta";
            } else {
                noBoards.textContent = "No boards found";
            }
            return;
        }

        // Populate the dropdown menu with the .pjb files
        boards.forEach(board => {
            const boardCard = document.createElement('div');
            boardCard.className = 'board-card';
            const leftContainer = document.createElement('div');
            leftContainer.className = 'left-container';
            const title = document.createElement('div');
            title.className = 'board-title';
            title.textContent = board.replace('.pjb', '');
            leftContainer.appendChild(title);

            const lastEdited = document.createElement('div');
            // convert to yyyy-mm-dd hh:mm format
            const stats = fs.statSync(path.join(gamesDirectory, board));
            const date = stats.mtime;
            const year = date.getFullYear();
            let month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
            lastEdited.className = 'last-edited';
            if (language === 'lt') {
                lastEdited.textContent = 'Paskutini karta redaguota: ' + formattedDate;
            } else {
                lastEdited.textContent = 'Last edited: ' + formattedDate;
            }
            leftContainer.appendChild(lastEdited);

            boardCard.appendChild(leftContainer);

            const description = document.createElement('div');
            description.className = 'board-description';
            if (language === 'lt') {
                description.textContent = 'Aprasymas: kazkoks tekstas';
            } else
            {
                description.textContent = 'Description: some text';
            }
            boardCard.appendChild(description);

            boardCard.addEventListener('click', function() {
                window.location.href = `boardEditor.html?boardID=${board}`;
            });

            boardList.appendChild(boardCard);
        });
    });

    backButton.addEventListener('click', function() {
        window.location.href = 'title.html';
    });

    createBoardButton.addEventListener('click', function() {
        window.location.href = 'boardEditor.html';
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

});