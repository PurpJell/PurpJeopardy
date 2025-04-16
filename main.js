const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const fs = require('fs');
const { execSync } = require('child_process');
const { get } = require('http');

const serverApp = express();
const port = 3000;

let hostSocket = null;
const playerSockets = new Set();

ipcMain.on('get-boards-dir', (event) => {

    let boardsDir = getBoardsDir();
    
    event.returnValue = boardsDir;
});

ipcMain.on('get-downloads-dir', (event) => {
    let downloadDir = app.getPath('downloads');
    event.returnValue = downloadDir;
});

function getPlaylist(directory) {
    try {
        let playlistDir;
        if (process.env.NODE_ENV === 'development') {
            // Development mode: Use the boards folder in the project directory
            playlistDir = path.join(__dirname, 'audio', directory);
        } else {
            // Production mode: Use the boards folder in appData/Roaming/PurpJeopardy
            playlistDir = path.join(__dirname, 'audio', directory);
        }
        let files = fs.readdirSync(playlistDir);
        files = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => path.join(playlistDir, file)); // Convert to full paths

        return files;

    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

ipcMain.on('set-config-ip', (event, ipAddress) => {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    const config = { ipAddress: ipAddress };

    // Write the configuration to the file
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
    app.relaunch();
    app.exit(0);
});

ipcMain.on('get-ip-list', (event) => {
    const ips = localIPs;
    event.returnValue = localIPs;
});

ipcMain.on('get-ip-address', (event) => {
    const ipAddress = process.env.IP_ADDRESS;
    event.returnValue = ipAddress;
});

function getBoardsDir() {
    let boardsDir;
    if (process.env.NODE_ENV === 'development') {
        // Development mode: Use the boards folder in the project directory
        boardsDir = path.join(__dirname, `boards`);
    } else {
        // Production mode: Use the boards folder in appData/Roaming/PurpJeopardy
        boardsDir = path.join(app.getPath('userData'), 'boards');
    }

    if (!fs.existsSync(boardsDir)) {
        fs.mkdirSync(boardsDir, { recursive: true });
    }
    return boardsDir;
}

function getAllIPs() {
    try {
        const output = execSync('ipconfig', { encoding: 'utf8' });
        const lines = output.split('\n');

        let IPs = [];

        for (let line of lines) {
            line = line.trim();
            if (line.includes('IPv4 Address')) {
                const ipMatch = line.split(':')[1].trim();
                if (ipMatch && !IPs.includes(ipMatch)) {
                    IPs.push(ipMatch);
                }
            }
        }

        return IPs;
    }
    catch (error) {
        console.error('Error retrieving IP addresses using ipconfig:', error.message);
    }
}

// Function to get the local IP address of an adapter with 'LAN' in its name
function getExpectedIPAddress() {
    try {
        // Execute the ipconfig command and parse its output
        const output = execSync('ipconfig', { encoding: 'utf8' });
        const lines = output.split('\n');

        let currentAdapter = null;
        let currentIP = null;

        for (let line of lines) {
            line = line.trim();

            // Detect the adapter name
            if (line.includes('adapter ') && line.includes('LAN')) {
                currentAdapter = line.split('adapter ')[1]?.replace(':', '').trim();
                currentIP = null; // Reset current IP for the new adapter
            }
            else if (line.includes('adapter ') && !line.includes('LAN')) {
                currentAdapter = null; // Reset current adapter if not LAN
            }

            // Detect the IPv4 address for the current adapter
            if (currentAdapter && line.includes('IPv4 Address')) {
                const ipMatch = line.split(':')[1].trim();
                if (ipMatch) {
                    currentIP = ipMatch;
                    return currentIP; // Return the first valid IP address
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving LAN adapters using ipconfig:', error.message);
    }

    return '127.0.0.1'; // Fallback to localhost if no matching IP is found
}

function getConfigIP () {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.ipAddress || null;
    }
    return null;
}

let localIPs = getAllIPs();
let IP_ADDRESS = getConfigIP();

if (IP_ADDRESS === null) {  // No IP address in config
    IP_ADDRESS = getExpectedIPAddress();
    if (!checkIPvalidity(IP_ADDRESS)) {
        console.log("Expected IP Address is not valid, using default IP Address");
    }
}
else {  // IP address in config
    if (!checkIPvalidity(IP_ADDRESS)) {  // IP address in config is not valid
        console.log("IP Address from config is not valid, trying expected IP Address");
        IP_ADDRESS = getExpectedIPAddress();  // Try to get the expected IP address
        if (!checkIPvalidity(IP_ADDRESS)) {
            console.log("Expected IP Address is not valid, using default IP Address");
        }
    }
}

// Check if the IP address is valid and set it in the environment variable
// If not valid, set it to the first local IP address or localhost
function checkIPvalidity(ipAddress)
{
    if (localIPs.includes(ipAddress)) {
        process.env.IP_ADDRESS = ipAddress;
        return true;
    }
    else if (localIPs.length > 0) {
        process.env.IP_ADDRESS = localIPs[0];
    }
    else {
        process.env.IP_ADDRESS = '127.0.0.1';
    }
    return false;
}

console.log(`IP Address set to: ${process.env.IP_ADDRESS}`);

function createBoardsFolder() {
    // Determine the directory where the .exe file is located
    const boardsDir = path.join(app.getPath('userData'), 'boards');

    // Check if the "boards" folder exists, and create it if it doesn't
    if (!fs.existsSync(boardsDir)) {
        try {
            fs.mkdirSync(boardsDir, { recursive: true });
            console.log(`Boards folder created at: ${boardsDir}`);
        } catch (error) {
            console.error(`Error creating boards folder: ${error.message}`);
        }
    } else {
        console.log(`Boards folder already exists at: ${boardsDir}`);
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
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: false
        }
    });

    mainWindow.loadFile('./html/title.html');

    mainWindow.on('closed', () => {
        if (musicWindow) {
            musicWindow.close(); // Close the music window
            musicWindow = null; // Set it to null
        }
    });

    // Configure body-parser to handle larger payloads
    serverApp.use(bodyParser.json({ limit: '10mb' }));
    serverApp.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    serverApp.use('/boards', express.static(getBoardsDir()));

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
            } else if (parsedMessage.type === 'getBoardsDir') {
                let boardsDir = getBoardsDir();
                console.log("Boards dir:", boardsDir);
                hostSocket.send(JSON.stringify({ type: 'boardsDir', data: boardsDir }));
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
                        selectedBoard: selectedBoard,
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
        console.log(`Server listening at ${process.env.IP_ADDRESS}:${port}`);
    });

    return mainWindow;
}

function createMusicWindow() {
    musicWindow = new BrowserWindow({
        show: false, // Hidden window
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: false
        }
    });

    musicWindow.loadFile('./html/music.html'); // A simple HTML file for music playback
    musicWindow.on('closed', () => {
        musicWindow = null;
    });
}

ipcMain.on('play-music', (event, { src, volume, loop }) => {
    if (musicWindow) {
        musicWindow.webContents.send('play', { src, volume, loop });
    }
});

ipcMain.on('set-music-volume', (event, { volume }) => {
    if (musicWindow) {
        musicWindow.webContents.send('setVolume', { volume });
    }
});

ipcMain.on('stop-music', () => {
    if (musicWindow) {
        musicWindow.webContents.send('stop');
    }
});

ipcMain.on('play-list', (event, { directory, volume }) => {
    if (musicWindow) {
        files = getPlaylist(directory);
        musicWindow.webContents.send('playlist', { files, volume });
    }
});

app.whenReady().then(() => {
    mainWindow = createWindow(); // Assign the created window to mainWindow
    createMusicWindow(); // Create the music window

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



