# Code Playground VS Code Extension 🎢

A sleek, modern, and lightweight **Code Playground** integrated directly into your VS Code Side Bar. Run code snippets, test inputs, and keep notes without switching context.

## ✨ Features

- **Integrated Environment**: Write code in your main editor, manage Input/Output in the sidebar.
- **Multi-Language Support**: Works with Python, JavaScript, C++, Java, Rust, and more (configurable).
- **Sleek UI**: Modern, glass-like design that respects your VS Code theme.
- **Persistent Notes**: Scribble down thoughts, edge cases, or TODOs. Notes are saved automatically.
- **Local Execution**: Runs code on your machine using your own compilers/interpreters. No cloud dependencies.

## 🚀 Getting Started

1.  Open any file (e.g., `script.py`).
2.  Open the **Code Playground** view from the Activity Bar or Side Bar.
3.  Enter your program input in the **Input** tab.
4.  Click **Run Code** (or invoke the command).
5.  View results in the **Output** tab.

## ⚙️ Configuration

This extension relies on your local environment. You can configure the execution command for each language.

**Default Settings:**
```json
"codePlayground.executorMap": {
    "python": "python3 -u $fileName",
    "javascript": "node $fileName",
    "c": "gcc $fileName -o $fileNameWithoutExt && ./$fileNameWithoutExt",
    "cpp": "g++ $fileName -o $fileNameWithoutExt && ./$fileNameWithoutExt",
    "java": "javac $fileName && java $fileNameWithoutExt"
}
```

**Variables:**
- `$fileName`: The full name of the file (e.g., `main.cpp`).
- `$fileNameWithoutExt`: The file name without extension (e.g., `main`).
- `$dir`: The directory of the file.

To support **Rust**, for example, add this to your `settings.json`:
```json
"codePlayground.executorMap": {
    "rust": "rustc $fileName && ./$fileNameWithoutExt"
}
```

## 📋 Requirements

-   You must have the compiler/interpreter for your language installed locally (e.g., Python, Node.js, GCC).
