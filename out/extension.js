"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const playgroundProvider_1 = require("./playgroundProvider");
function activate(context) {
    const provider = new playgroundProvider_1.PlaygroundProvider(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(playgroundProvider_1.PlaygroundProvider.viewType, provider));
    context.subscriptions.push(vscode.commands.registerCommand('code-playground.refresh', () => {
        provider.refresh();
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map