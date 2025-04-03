const { log } = require('console');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// Define a log file path
const logFilePath = path.join('C:\\Users\\kondr\\OneDrive\\Stalinis kompiuteris', 'createBoardsFolder.log');

// Helper function to write logs to the file
function logToFile(message) {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

logToFile('Starting createBoardsFolder.js');

// Get the directory where the .exe file is located
const exeDir = process.cwd(); // Use the current working directory
logToFile(`exeDir (process.cwd()): ${exeDir}`);

const boardsPath = path.join(appDir, 'boards');
logToFile(`boardsPath: ${boardsPath}`);

// Check if the "boards" folder exists, and create it if it doesn't
if (!fs.existsSync(boardsPath)) {
    try {
        fs.mkdirSync(boardsPath, { recursive: true });
        logToFile(`Boards folder created at: ${boardsPath}`);
    } catch (error) {
        logToFile(`Error creating boards folder: ${error.message}`);
    }
} else {
    logToFile(`Boards folder already exists at: ${boardsPath}`);
}