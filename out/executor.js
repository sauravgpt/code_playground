"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const cp = require("child_process");
const path = require("path");
const vscode = require("vscode");
class Executor {
    static run(fileUri, input, onOutput, onDone) {
        const config = vscode.workspace.getConfiguration('codePlayground');
        const executorMap = config.get('executorMap') || {};
        // Get language ID
        // Note: We need the editor to be active to get the language ID easily, 
        // or we can infer from extension if not opened. 
        // For now, rely on active editor or passed document.
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.uri.toString() !== fileUri.toString()) {
            onOutput('Error: The file to run must be the active editor tab.\n');
            onDone(1);
            return;
        }
        const languageId = editor.document.languageId;
        const commandTemplate = executorMap[languageId];
        if (!commandTemplate) {
            onOutput(`Error: No executor found for language '${languageId}'.\nPlease check 'codePlayground.executorMap' in settings.\n`);
            onDone(1);
            return;
        }
        // Prepare File Paths
        // We first SAVE the document to ensure latest changes are on disk
        editor.document.save().then(() => {
            const filePath = fileUri.fsPath;
            const dir = path.dirname(filePath);
            const fileName = path.basename(filePath);
            const fileNameWithoutExt = path.parse(filePath).name;
            // Replace variables
            // Supported: $fileName, $fileNameWithoutExt, $dir
            // NOTE: Order matters! Replace longer variable names first to avoid partial matches.
            const command = commandTemplate
                .replace(/\$fileNameWithoutExt/g, fileNameWithoutExt)
                .replace(/\$fileName/g, fileName)
                .replace(/\$dir/g, dir);
            // onOutput(`[Running] ${command}\n`);
            // EXECUTE
            // Use spawn with shell: true to support chained commands like "g++ ... && ./a.out"
            const child = cp.spawn(command, {
                cwd: dir,
                shell: true
            });
            if (input && child.stdin) {
                // Ensure input ends with newline to flush buffers/read commands
                if (!input.endsWith('\n')) {
                    input += '\n';
                }
                child.stdin.write(input);
                child.stdin.end();
            }
            child.stdout?.on('data', (data) => {
                onOutput(data.toString());
            });
            child.stderr?.on('data', (data) => {
                onOutput(data.toString());
            });
            child.on('close', (code) => {
                // onOutput(`\n[Done] exited with code=${code}\n`);
                onDone(code);
            });
            child.on('error', (err) => {
                onOutput(`\n[Error] ${err.message}\n`);
                onDone(1);
            });
        });
    }
}
exports.Executor = Executor;
//# sourceMappingURL=executor.js.map