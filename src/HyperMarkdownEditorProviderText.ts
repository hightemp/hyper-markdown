import { CancellationToken, CustomTextEditorProvider, TextDocument, WebviewPanel } from 'vscode'
import * as vscode from 'vscode';
import * as path from 'path';
import { Message } from './Message';

export class HyperMarkdownEditorProviderText implements CustomTextEditorProvider {
    
    private extensionUri: vscode.Uri;
    private extensionPath: string;
    private context: vscode.ExtensionContext;
    private log: vscode.OutputChannel;
    private isUpdatingFromWebview = false;

    constructor(context: vscode.ExtensionContext, log: vscode.OutputChannel) {
        this.extensionUri = context.extensionUri;
        this.extensionPath = context.extensionPath;
        this.context = context;
        this.log = log;
    }

    resolveCustomTextEditor(
        document: vscode.TextDocument, 
        webviewPanel: vscode.WebviewPanel, 
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.extensionPath, 'node_modules')),
                vscode.Uri.file(this.extensionPath)
            ]
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

        const updateWebview = () => {
            this.log.appendLine('vscode -> frame: postMessage');
            webviewPanel.webview.postMessage({
                type: 'update',
                body: document.getText(),
            });
        };

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            console.log("onDidChangeTextDocument", e)
            if (e.document.uri.toString() === document.uri.toString() && !this.isUpdatingFromWebview) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Обработка сообщений от webview
        webviewPanel.webview.onDidReceiveMessage(msg => {
            console.log("vscode <- frame: ", msg)

            // var data: Message = JSON.parse(msg) as Message
            var data: Message = msg as Message
            switch (data.type) {
                case 'update':
                    this.isUpdatingFromWebview = true;
                    this.updateTextDocument(document, data.body)
                        .then(() => { this.isUpdatingFromWebview = false; });
                    return;
                case 'log':
                    this.log.appendLine(data.body);
                    return;
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        var hypermdScriptUri = vscode.Uri.joinPath(this.extensionUri, 'out/hypermd_bundle.js')
        var turndownScriptUri = vscode.Uri.joinPath(this.extensionUri, 'out/turndown_bundle.js')
        var codemirrorModesScriptUri = vscode.Uri.joinPath(this.extensionUri, 'out/codemirror_modes_bundle.js')
        var webviewScriptUri = vscode.Uri.joinPath(this.extensionUri, 'out/webview_bundle.js')

        hypermdScriptUri = webview.asWebviewUri(hypermdScriptUri);
        webviewScriptUri = webview.asWebviewUri(webviewScriptUri);
        turndownScriptUri = webview.asWebviewUri(turndownScriptUri);
        codemirrorModesScriptUri = webview.asWebviewUri(codemirrorModesScriptUri);

        const nonce = this.getNonce();

        // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

        return /* html */`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                
                <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'; worker-src * data: 'unsafe-inline' 'unsafe-eval'; font-src * data: 'unsafe-inline' 'unsafe-eval';">
                <style>
				    html { height: 100%; width: 100%; padding: 0; margin: 0; }
				    body { height: 100%; width: 100%; padding: 0; margin: 0; }
			    </style>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HyperMD Editor</title>
            </head>
            <body>
                <textarea id="editor" style="width:100%;height:100%">${document.getText()}</textarea>
                <script nonce="${nonce}" src="${hypermdScriptUri}"></script>
                <script nonce="${nonce}" src="${turndownScriptUri}"></script>
                <script nonce="${nonce}" src="${codemirrorModesScriptUri}"></script>

                <script nonce="${nonce}" src="${webviewScriptUri}"></script>
            </body>
            </html>
        `;
    }

    private updateTextDocument(document: vscode.TextDocument, text: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );
        return vscode.workspace.applyEdit(edit);
    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}