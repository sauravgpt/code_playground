(function () {
    const vscode = acquireVsCodeApi();

    const state = vscode.getState() || { tab: 'input', input: '', notes: '' };

    // Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    const runBtn = document.getElementById('run-btn');
    const inputArea = document.getElementById('input-area');
    const notesArea = document.getElementById('notes-area');
    const outputArea = document.getElementById('output-area');

    // Init
    restoreState();

    // Event Listeners
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            switchTab(target);
            updateState({ tab: target });
        });
    });

    runBtn.addEventListener('click', () => {
        // Switch to output tab immediately
        switchTab('output');
        updateState({ tab: 'output' });

        outputArea.textContent = '';

        vscode.postMessage({
            type: 'runCode',
            input: inputArea.value
        });
    });

    inputArea.addEventListener('input', (e) => {
        updateState({ input: e.target.value });
    });

    notesArea.addEventListener('input', (e) => {
        updateState({ notes: e.target.value });
        // Debounce save
        clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(() => {
            vscode.postMessage({
                type: 'saveNote',
                note: e.target.value
            });
        }, 1000);
    });

    // Message Handling
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'output':
                outputArea.textContent += message.value;
                break;
            case 'initialState':
                if (message.note) {
                    notesArea.value = message.note;
                    updateState({ notes: message.note });
                }
                break;
            case 'editorChanged':
                // Flush when editor changes (as requested)
                inputArea.value = '';
                outputArea.textContent = '';
                // Only keep notes? User said "flush everything", but notes usually persist per workspace.
                // For now, let's keep notes as they are global/workspace state, not per file.
                // But clearing input/output is definitely what they meant.

                if (message.hasEditor) {
                    runBtn.style.display = 'flex';
                } else {
                    runBtn.style.display = 'none';
                }
                break;
        }
    });

    // Ask for initial state (saved notes from global store)
    vscode.postMessage({ type: 'getInitialState' });

    // Helper Functions
    function switchTab(tabName) {
        tabs.forEach(t => {
            if (t.dataset.tab === tabName) t.classList.add('active');
            else t.classList.remove('active');
        });

        contents.forEach(c => {
            if (c.id === tabName) c.classList.add('active');
            else c.classList.remove('active');
        });
    }

    function updateState(newState) {
        const current = vscode.getState() || {};
        vscode.setState({ ...current, ...newState });
    }

    function restoreState() {
        if (state.tab) switchTab(state.tab);
        if (state.input) inputArea.value = state.input;
        if (state.notes) notesArea.value = state.notes;
    }

}());
