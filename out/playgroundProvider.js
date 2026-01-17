"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundProvider = void 0;
const vscode = require("vscode");
const executor_1 = require("./executor");
class PlaygroundProvider {
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Listen for editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            this._updateWebviewState(editor);
        });
        // Initial update
        this._updateWebviewState(vscode.window.activeTextEditor);
        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case 'runCode':
                    this._runCode(data.input || '');
                    break;
                case 'saveNote':
                    this._saveNote(data.note || '');
                    break;
                case 'getInitialState':
                    this._sendInitialState();
                    break;
            }
        });
    }
    refresh() {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }
    _updateWebviewState(editor) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'editorChanged',
                hasEditor: !!editor,
                languageId: editor?.document.languageId
            });
        }
    }
    _runCode(input) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._view?.webview.postMessage({ type: 'output', value: 'No active editor found.' });
            return;
        }
        executor_1.Executor.run(editor.document.uri, input, (data) => {
            this._view?.webview.postMessage({ type: 'output', value: data });
        }, (code) => {
            // optionally handle done
        });
    }
    _saveNote(note) {
        // Save to global state
        this._context.globalState.update('code-playground.note', note);
    }
    _sendInitialState() {
        const note = this._context.globalState.get('code-playground.note', '');
        this._view?.webview.postMessage({ type: 'initialState', note: note });
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>Code Playground</title>
			</head>
			<body>
                <div class="tabs">
                    <button class="tab-btn active" data-tab="input">Input</button>
                    <button class="tab-btn" data-tab="output">Output</button>
                    <button class="tab-btn" data-tab="notes">Notes</button>
                </div>

                <div class="content">
                    <div id="input" class="tab-content active">
                        <textarea id="input-area" placeholder="Enter program input/stdin here..."></textarea>
                    </div>
                    
                    <div id="output" class="tab-content">
                        <pre id="output-area"></pre>
                    </div>

                    <div id="notes" class="tab-content">
                        <textarea id="notes-area" placeholder="Write your notes here..."></textarea>
                    </div>
                </div>

                <div class="controls">
                    <button id="run-btn">Run Code</button>
                </div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
exports.PlaygroundProvider = PlaygroundProvider;
PlaygroundProvider.viewType = 'code-playground.sidebar';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=playgroundProvider.js.map