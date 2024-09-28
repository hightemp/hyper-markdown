console.log('webview index.js');

const editorElement = document.getElementById('editor')
const editor = HyperMD.fromTextArea(editorElement);

let isUpdatingFromVscode = false;

const api = (window.VsCodeApi = acquireVsCodeApi());

function sendToVsCode(msg) {
    api.postMessage(msg);
    // api.postMessage(JSON.stringify(msg));
}

var log = function log(...msg) {
    sendToVsCode({ type: "log", body: msg });
};

editor.setSize(null, '100%');

window.addEventListener('message', event => {
    console.log('message', event.data);
    const message = event.data;
    
    switch (message.type) {
        case 'update':
            // if (editor.getValue() != message.body) {
            isUpdatingFromVscode = true;
            editor.setValue(message.body);
            isUpdatingFromVscode = false;
            // }
            break;
    }

    if (event.source === window.frames[0]) {
        console.log("frame -> vscode", event.data);
    } else {
        console.log("vscode -> frame", event.data);
    }

});


editor.on("paste", (cm, e) => {
    e.preventDefault();
    
    console.log('paste in editor');

    let types = e.clipboardData.types;
    let paste = '';
    if (types.indexOf('text/html') !== -1) {
        paste = e.clipboardData.getData('text/html');
        paste = convertHtmlToMarkdown(paste);
    } else {
        paste = e.clipboardData.getData("text");
    }
    
    cm.replaceSelection(paste);
});

editor.on('change', () => {
    console.log('change');

    if (!isUpdatingFromVscode) {
        const text = editor.getValue();
    
        sendToVsCode({type: 'update', body: text})
    }
});

window.addEventListener('resize', () => {
    editor.setSize(null, '100%');
});
