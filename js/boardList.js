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
    fs.readdir(gamesDirectory, (err, directories) => {
        if (err) {
            console.error('Error reading games directory:', err);
            return;
        }

        // Filter directories and check for .pjb files inside them
        const boardPromises = directories.map((directory) => {
            const boardPath = path.join(gamesDirectory, directory, `${directory}.pjb`);
            return new Promise((resolve) => {
                fs.access(boardPath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        resolve(directory); // Directory is valid if the .pjb file exists
                    } else {
                        resolve(null); // Skip invalid directories
                    }
                });
            });
        });

        Promise.all(boardPromises).then((validBoards) => {
            boards = validBoards.filter(Boolean); // Remove null values

            boards = boards.filter(board => board !== "exampleBoardData");

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
                board = board + '.pjb';
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
                const stats = fs.statSync(path.join(gamesDirectory, board.replace('.pjb',''), board));
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
                    window.location.href = `boardEditor.html?board=${board}`;
                });

                boardList.appendChild(boardCard);
            })
        });
    });

    backButton.addEventListener('click', function() {
        window.location.href = 'title.html';
    });

    createBoardButton.addEventListener('click', function() {
        window.location.href = 'boardEditor.html';
    });

    searchBar.addEventListener('input', function() {
        const searchValue = searchBar.value.toLowerCase();
        const boardCards = document.getElementsByClassName('board-card');
        let hiddenBoards = 0;
        for (let i = 0; i < boardCards.length; i++) {
            const title = boardCards[i].getElementsByClassName('board-title')[0].textContent.toLowerCase();
            if (title.includes(searchValue)) {
                boardCards[i].style.display = 'flex';
            } else {
                boardCards[i].style.display = 'none';
                hiddenBoards++;
            }
        }

        if (hiddenBoards === boardCards.length) {
            noBoards.style.display = 'block';
            if (language === 'lt') {
                noBoards.textContent = "Lentu nerasta";
            } else {
                noBoards.textContent = "No boards found";
            }
        } else {
            noBoards.style.display = 'none';
        }
        
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

});