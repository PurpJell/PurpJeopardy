const { dir } = require('console');
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose `fs` and `path` to the renderer process
contextBridge.exposeInMainWorld('fileSystem', {
    // Path methods
    joinPath: (...args) => path.join(...args),

    // FS synchronous methods
    existsSync: (filePath) => fs.existsSync(filePath),
    rmSync: (filePath, options = {}) => fs.rmSync(filePath, options),

    // FS asynchronous methods
    rm: (filePath, options = {}) => fs.promises.rm(filePath, options),
    writeFile: (filePath, data, options = {}) => fs.promises.writeFile(filePath, data, options),
    readFile: (filePath, options = 'utf8') => fs.promises.readFile(filePath, options), // Added readFile
    mkdir: (dirPath, options = {}) => fs.promises.mkdir(dirPath, options),
    stat: (filePath) => fs.promises.stat(filePath),

    // FS synchronous write
    writeFileSync: (filePath, data) => fs.writeFileSync(filePath, data),

    // FS asynchronous directory read
    readdir: (dirPath, options = {}) => fs.promises.readdir(dirPath, options)
});

contextBridge.exposeInMainWorld('nodeUtils', {
    Buffer: (data, encoding) => Buffer.from(data, encoding)
});

// Expose ipcRenderer methods to the renderer process
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        sendSync: (channel, data) => ipcRenderer.sendSync(channel, data),
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        once: (channel, listener) => ipcRenderer.once(channel, listener),
        invoke: (channel, data) => ipcRenderer.invoke(channel, data)
    }
});

contextBridge.exposeInMainWorld('musicManager', {
    playMusic: (src, volume = 1, loop = false) => {
        ipcRenderer.send('play-music', { src, volume, loop });
    },
    setVolume: (volume) => {
        ipcRenderer.send('set-music-volume', { volume });
    },
    stopMusic: () => {
        ipcRenderer.send('stop-music');
    },
    playlist: (directory = "game", volume = 1) => {
        ipcRenderer.send('play-list', { directory, volume });
    }
});

contextBridge.exposeInMainWorld('env', {
    NODE_ENV: process.env.NODE_ENV
});

contextBridge.exposeInMainWorld('appPaths', {
    __dirname: __dirname // Expose the directory where preload.js is located
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});