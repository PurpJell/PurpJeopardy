const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const fs = require('fs');

const serverApp = express();
const port = 3000;

let hostSocket = null;
const playerSockets = new Set();

ipcMain.on('get-exe-dir', (event) => {
    event.returnValue = path.dirname(app.getPath('exe'));
});

function createBoardsFolder() {
    // Determine the directory where the .exe file is located
    const exeDir = path.dirname(app.getPath('exe'));
    const boardsPath = path.join(exeDir, 'boards');

    // Check if the "boards" folder exists, and create it if it doesn't
    if (!fs.existsSync(boardsPath)) {
        try {
            fs.mkdirSync(boardsPath, { recursive: true });
            console.log(`Boards folder created at: ${boardsPath}`);
        } catch (error) {
            console.error(`Error creating boards folder: ${error.message}`);
        }
    } else {
        console.log(`Boards folder already exists at: ${boardsPath}`);
    }
}

// Run the script when the app is ready
app.on('ready', () => {
    createBoardsFolder();
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('./html/title.html');

    // Configure body-parser to handle larger payloads
    serverApp.use(bodyParser.json({ limit: '10mb' }));
    serverApp.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    // Serve static files from the 'public' directory
    serverApp.use(express.static(path.join(__dirname, '')));

    // Serve playerIndex.html at the root URL
    serverApp.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'html', 'playerIndex.html'));
    });

    serverApp.get('/host', (req, res) => {
        res.sendFile(path.join(__dirname, 'html', 'host.html'));
    });

    // Endpoint to get the IP address
    serverApp.get('/get-ip-address', (req, res) => {
        const ipAddress = process.env.IP_ADDRESS;
        res.json({ ipAddress });
    });

    // Add player endpoint
    serverApp.post('/addPlayer', (req, res) => {
        console.log("Adding player", req.body.name);
        const playerData = req.body;
        mainWindow.webContents.send('addPlayer', playerData);

        // Listen for response from renderer process
        ipcMain.once('addPlayerResponse', (event, response) => {
            res.json(response);
            if (hostSocket) {
                console.log('Sending playerAdded message to host');
                hostSocket.send(JSON.stringify({ type: 'playerAdded', data: playerData }));
            }
        });
    });

    serverApp.get('/buzzer', (req, res) => {
        res.sendFile(path.join(__dirname, 'html', 'playerBuzzer.html'));
    });

    serverApp.post('/buzzer', (req, res) => {
        const playerData = req.body;
        mainWindow.webContents.send('buzzIn', playerData);
        
        res.json({ success: true });
    });

    ipcMain.on('buzzInResponse', (event) => {
        nextAnswerer();
    });

    function nextAnswerer() {
        mainWindow.webContents.send('nextAnswerer');

        // get reply from main window
        ipcMain.once('nextAnswererResponse', (event, response) => {
            playerSockets.forEach(playerSocket => {
                playerSocket.send(JSON.stringify({ type: 'updateState', currentPlayer: response.currentPlayer, lastPlayer: response.lastPlayer }));
            });
        });
    }

    // Set up WebSocket server
    // const server = http.createServer(serverApp);
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws, req) => {
        const url = req.url;
        if (url === '/host') {
            hostSocket = ws;
            console.log('Host connected at', url);
            mainWindow.webContents.send('retrieveGameData');
        } else {
            playerSockets.add(ws);
            console.log('Player connected at', url);
        }

        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            console.log('Received message from host:', parsedMessage.type);

            if (parsedMessage.type === 'playerRemoved') {
                console.log('Player removed:', parsedMessage.data.name);
                mainWindow.webContents.send('removePlayer', parsedMessage.data.name);
            } else if (parsedMessage.type === 'startGame') {
                console.log('Game started');
                mainWindow.webContents.send('startGame');
            } else if (parsedMessage.type === 'openQuestion') {
                mainWindow.webContents.send('openQuestion', parsedMessage.data);
                playerSockets.forEach(playerSocket => {
                    playerSocket.send(JSON.stringify({ type: 'enableBuzzer' }));
                });
            } else if (parsedMessage.type === 'nextPage') {
                mainWindow.webContents.send('nextPage');
            } else if (parsedMessage.type === 'resetBoard') {
                mainWindow.webContents.send('resetBoard');
            } else if (parsedMessage.type === 'correctAnswer') {
                mainWindow.webContents.send('correctAnswer', parsedMessage.data);
                playerSockets.forEach(playerSocket => {
                    playerSocket.send(JSON.stringify({ type: 'correctAnswer', data: parsedMessage.data }));
                });
            } else if (parsedMessage.type === 'incorrectAnswer') {
                mainWindow.webContents.send('incorrectAnswer', parsedMessage.data);
                playerSockets.forEach(playerSocket => {
                    playerSocket.send(JSON.stringify({ type: 'incorrectAnswer', data: parsedMessage.data }));
                });
            } else if (parsedMessage.type === 'startTimer') {
                mainWindow.webContents.send('startTimer');
            } else if (parsedMessage.type === 'nextAnswerer') {
                nextAnswerer();
            } else if (parsedMessage.type === 'revealAnswer') {
                mainWindow.webContents.send('revealAnswer');
            } else if (parsedMessage.type === 'backToBoard') {
                mainWindow.webContents.send('backToBoard');
                playerSockets.forEach(playerSocket => {
                    playerSocket.send(JSON.stringify({ type: 'disableBuzzer' }));
                });
            }
        });

        ws.on('close', () => {
            if (ws === hostSocket) {
                hostSocket = null;
                console.log('Host disconnected');
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    ipcMain.on('retrieveGameDataResponse', (event, response) => {
        console.log("got game data response");
        const players = response.players;
        const currentPageID_ = response.currentPageID;
        const selectedBoard = response.selectedBoard;
        if (hostSocket) {
            hostSocket.send(JSON.stringify(
                { 
                    type: 'gameData',
                    data: {
                        playerData: players,
                        currentPageID: currentPageID_,
                        selectedBoard: selectedBoard
                    } 
                }
            ));
        }
    });

    ipcMain.on('selectedBoard', (event, selectedBoard) => {
        console.log('Selected board:', selectedBoard, ", sending to host");
        if (hostSocket) {
            hostSocket.send(JSON.stringify({ type: 'selectedBoard', data: selectedBoard }));
        }
    });

    serverApp.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});



