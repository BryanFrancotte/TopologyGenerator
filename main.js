'use strict';
const { app, ipcMain } = require('electron');
const Window = require('./core/Window.class');
const Export = require('./core/Export.class');

function main() {
    let mainWindow = new Window({
        file: 'index.html'
    });
    
    configureListeners();
}

function configureListeners() {
    ipcMain.on('export-network', (event, network) => {
        new Export().export(network);
    })
}

app.on('ready', main);

app.on('window-all-closed', function() {
    app.quit();
});