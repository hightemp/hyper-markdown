const editor = HyperMD.fromTextArea(document.getElementById('editor'));

const api = (window.VsCodeApi = acquireVsCodeApi());

function sendToVsCode(msg) {
    api.postMessage(JSON.stringify(msg));
}

var log = function log(...msg) {
    sendToVsCode({ type: "log", body: msg });
};

editor.setSize(null, '100%');

window.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
        case 'update':
            editor.setValue(message.body);
            break;
    }

    if (event.source === window.frames[0]) {
        console.log("frame -> vscode", event.data);
    } else {
        console.log("vscode -> frame", event.data);
    }

});

editor.on('change', () => {
    const text = editor.getValue();
    
    sendToVsCode({type: 'update', body: text})
});

window.addEventListener('resize', () => {
    editor.setSize(null, '100%');
});
