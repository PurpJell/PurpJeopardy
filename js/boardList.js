document.addEventListener('DOMContentLoaded', function() {

    const backButton = document.getElementById('backButton');
    const createBoardButton = document.getElementById('createBoardButton');
    const searchBar = document.getElementById('searchBar');
    const noBoards = document.getElementById('noBoards');
    const boardList = document.getElementById('boardList');

    let language = localStorage.getItem('language') || 'en';

    let musicVolume = localStorage.getItem('musicVolume') || 100;
    window.musicManager.playMusic('../audio/menu/Chad Crouch - Game.mp3', musicVolume / 100, true);

    if (language === 'lt') {
        backButton.textContent = 'Atgal';
        createBoardButton.textContent = 'Sukurti nauj\u0105 lent\u0105';
        searchBar.placeholder = 'Ie\u0161koti lent\u0173';
    }

    searchBar.focus();

    let boards = [];

    const boardsPath = window.electron.ipcRenderer.sendSync('get-boards-dir');

    // Get the list of .pjb files in the boards directory
    window.fileSystem.readdir(boardsPath)
        .then((files) => {

            console.log("Files in boards directory:", files);
    
            // Filter files to include only .pjb files
            const boardFiles = files.filter((file) => file.endsWith('.pjb'));
        
            // Remove unwanted files like "exampleBoardData.pjb"
            boards = boardFiles.filter((board) => board !== 'exampleBoardData.pjb'); // Exclude specific files

            console.log("Filtered boards:", boards);

            // Check if there are no boards
            if (boards.length === 0) {
                noBoards.style.display = 'block';
                if (language === 'lt') {
                    noBoards.textContent = "Lent\u0173 nerasta";
                } else {
                    noBoards.textContent = "No boards found";
                }
                return;
            }

            // Populate the list with the .pjb files
            boards.forEach(boardFile => {
                console.log("Board file:", boardFile);
                const boardCard = document.createElement('div');
                boardCard.className = 'board-card';
                const leftContainer = document.createElement('div');
                leftContainer.className = 'left-container';
                const title = document.createElement('div');
                title.className = 'board-title';
                title.textContent = boardFile.replace('.pjb', '');
                leftContainer.appendChild(title);

                let metaData = {};

                const lastEdited = document.createElement('div');
                lastEdited.className = 'last-edited';
                if (language === 'lt') {
                    lastEdited.textContent = 'Paskutin\u012F kart\u0105 redaguota: ' + metaData.lastEdited;
                } else {
                    lastEdited.textContent = 'Last edited: ' + metaData.lastEdited;
                }
                leftContainer.appendChild(lastEdited);

                boardCard.appendChild(leftContainer);

                const description = document.createElement('div');
                description.className = 'board-description';
                if (language === 'lt') {
                    description.textContent = 'Apra\u0161ymas: ' + metaData.description;
                } else
                {
                    description.textContent = 'Description: ' + metaData.description;
                }
                boardCard.appendChild(description);

                boardCard.addEventListener('click', function() {
                    window.musicManager.playlist('editor', musicVolume / 100 || 1);
                    window.location.href = `boardEditor.html?board=${boardFile}`;
                });

                boardList.appendChild(boardCard);

                fetch(`${boardsPath}/${boardFile}`)
                .then(response => response.json())
                .then(data => {
                    metaData = data.meta;
                    if (language === 'lt') {
                        lastEdited.textContent = 'Paskutin\u012F kart\u0105 redaguota: ' + metaData.lastEdited;
                    } else {
                        lastEdited.textContent = 'Last edited: ' + metaData.lastEdited;
                    }
                    if (language === 'lt') {
                        description.textContent = 'Apra\u0161ymas: ' + metaData.description;
                    } else
                    {
                        description.textContent = 'Description: ' + metaData.description;
                    }
                })    
                .catch(error => console.error('Error fetching default board data:', error, boardFile));
            });
    
        });

    backButton.addEventListener('click', function() {
        window.location.href = 'title.html';
    });

    createBoardButton.addEventListener('click', function() {
        window.musicManager.playlist('editor', musicVolume / 100 || 1);
        window.location.href = 'boardEditor.html';
    });

    searchBar.addEventListener('input', function() {
        const searchValue = searchBar.value.toLowerCase();
        const boardCards = document.getElementsByClassName('board-card');
        let hiddenBoards = 0;
        for (let i = 0; i < boardCards.length; i++) {
            const title = boardCards[i].getElementsByClassName('board-title')[0].textContent.toLowerCase();
            const description = boardCards[i].getElementsByClassName('board-description')[0].textContent.toLowerCase();
            if (title.includes(searchValue) || description.includes(searchValue)) {
                boardCards[i].style.display = 'flex';
            } else {
                boardCards[i].style.display = 'none';
                hiddenBoards++;
            }
        }

        if (hiddenBoards === boardCards.length) {
            noBoards.style.display = 'block';
            if (language === 'lt') {
                noBoards.textContent = "Lent\u0173 nerasta";
            } else {
                noBoards.textContent = "No boards found";
            }
        } else {
            noBoards.style.display = 'none';
        }
        
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            window.location.href = 'title.html';
        }
    });

    // Show content once fully loaded
    window.addEventListener('load', function() {
        document.getElementById('loadingScreen').style.display = 'none';
    });

});