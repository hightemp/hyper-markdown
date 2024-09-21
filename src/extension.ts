import * as vscode from 'vscode';
import path from 'path'
import { HyperMarkdownEditorProviderText } from './HyperMarkdownEditorProviderText';

export function activate(context: vscode.ExtensionContext) {
	var log = vscode.window.createOutputChannel("hyper-markdown");
    log.appendLine("hyper-markdown extension activated");

	vscode.window.registerCustomEditorProvider(
		"hyper-markdown.editor",
		new HyperMarkdownEditorProviderText(context, log),
		{ webviewOptions: { retainContextWhenHidden: true } }
	)
}

export function deactivate() {}

