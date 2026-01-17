import * as vscode from 'vscode';
import { PlaygroundProvider } from './playgroundProvider';

export function activate(context: vscode.ExtensionContext) {

    const provider = new PlaygroundProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(PlaygroundProvider.viewType, provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('code-playground.refresh', () => {
            provider.refresh();
        })
    );
}

export function deactivate() { }
