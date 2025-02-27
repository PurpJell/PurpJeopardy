const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');

const serverApp = express();
const port = 3000;

let hostSocket = null;
const playerSockets = new Set();

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
        console.log('Buzz in:', playerData.name);
        mainWindow.webContents.send('buzzIn', playerData);
        res.json({ success: true });
    });

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
            console.log('Received message from host');
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type === 'playerRemoved') {
                console.log('Player removed:', parsedMessage.data.name);
                mainWindow.webContents.send('removePlayer', parsedMessage.data.name);
            } else if (parsedMessage.type === 'startGame') {
                console.log('Game started');
                mainWindow.webContents.send('startGame');
            } else if (parsedMessage.type === 'openQuestion') {
                mainWindow.webContents.send('openQuestion', parsedMessage.data);
            } else if (parsedMessage.type === 'nextBoard') {
                mainWindow.webContents.send('nextBoard');
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
                mainWindow.webContents.send('nextAnswerer');
            } else if (parsedMessage.type === 'revealAnswer') {
                mainWindow.webContents.send('revealAnswer');
            } else if (parsedMessage.type === 'backToBoard') {
                mainWindow.webContents.send('backToBoard');
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
        const currentBoardID_ = response.currentBoardID;
        const selectedBoard = response.selectedBoard;
        if (hostSocket) {
            hostSocket.send(JSON.stringify(
                { 
                    type: 'gameData',
                    data: {
                        playerData: players,
                        currentBoardID: currentBoardID_,
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



