'use strict';
const { dialog } = require('electron');
const fs = require('fs');

const networkConfiguration = {
    title: 'exporter la topologie',
    defaultPath: 'topologie.txt',
    buttonLabel: 'exporter',
    filters: [
        { name: 'txt', extensions: ['txt'] },
        { name: 'All files', extensions: ['*'] }
    ]
}

class Export {
    export(fileContent) {
        dialog.showSaveDialog(networkConfiguration).then(
            (result) => {
                if(result.filePath != ''){
                    fs.writeFile(result.filePath, fileContent, (err) => {
                        if(err != null) {
                            console.log(err);
                            return;
                        }
                    });
                }
            }
        )
    }
}

module.exports = Export;