"use client";

import React, { useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { getFileExtension, getLanguageFromExtension } from "../data/sampleProject";

interface CodeEditorProps {
  fileName: string;
  content: string;
  onChange?: (value: string | undefined) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  fileName,
  content,
  onChange,
}) => {
  const ext = getFileExtension(fileName);
  const language = getLanguageFromExtension(ext);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    // Define custom Catppuccin-inspired theme
    monaco.editor.defineTheme("catppuccin-mocha", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "cdd6f4", background: "1e1e2e" },
        { token: "comment", foreground: "6c7086", fontStyle: "italic" },
        { token: "keyword", foreground: "cba6f7" },
        { token: "string", foreground: "a6e3a1" },
        { token: "number", foreground: "fab387" },
        { token: "type", foreground: "f9e2af" },
        { token: "class", foreground: "f9e2af" },
        { token: "function", foreground: "89b4fa" },
        { token: "variable", foreground: "cdd6f4" },
        { token: "constant", foreground: "fab387" },
        { token: "operator", foreground: "89dceb" },
        { token: "punctuation", foreground: "9399b2" },
        { token: "tag", foreground: "cba6f7" },
        { token: "attribute.name", foreground: "f9e2af" },
        { token: "attribute.value", foreground: "a6e3a1" },
        { token: "delimiter", foreground: "9399b2" },
        { token: "delimiter.bracket", foreground: "9399b2" },
        { token: "meta", foreground: "f38ba8" },
        { token: "regexp", foreground: "f38ba8" },
      ],
      colors: {
        "editor.background": "#1e1e2e",
        "editor.foreground": "#cdd6f4",
        "editor.lineHighlightBackground": "#2a2b3d",
        "editor.selectionBackground": "#45475a80",
        "editor.inactiveSelectionBackground": "#31324450",
        "editorLineNumber.foreground": "#45475a",
        "editorLineNumber.activeForeground": "#a6adc8",
        "editorCursor.foreground": "#f5e0dc",
        "editor.selectionHighlightBackground": "#45475a40",
        "editorIndentGuide.background": "#31324480",
        "editorIndentGuide.activeBackground": "#45475a80",
        "editorBracketMatch.background": "#45475a40",
        "editorBracketMatch.border": "#89b4fa50",
        "editorGutter.background": "#1e1e2e",
        "scrollbar.shadow": "#11111b",
        "scrollbarSlider.background": "#45475a50",
        "scrollbarSlider.hoverBackground": "#45475a80",
        "scrollbarSlider.activeBackground": "#45475aa0",
        "editorWidget.background": "#181825",
        "editorWidget.border": "#313244",
        "editorSuggestWidget.background": "#181825",
        "editorSuggestWidget.border": "#313244",
        "editorSuggestWidget.selectedBackground": "#313244",
        "editorHoverWidget.background": "#181825",
        "editorHoverWidget.border": "#313244",
        "minimap.background": "#1e1e2e",
      },
    });

    monaco.editor.setTheme("catppuccin-mocha");

    // Editor settings
    editor.updateOptions({
      fontFamily: "'GeistMono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, monospace",
      fontSize: 14,
      lineHeight: 22,
      fontLigatures: true,
      minimap: { enabled: true, scale: 1 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      renderWhitespace: "selection",
      bracketPairColorization: { enabled: true },
      padding: { top: 12 },
      renderLineHighlight: "all",
      guides: {
        indentation: true,
        bracketPairs: true,
      },
    });

    // Auto-size
    editor.layout();
  }, []);

  return (
    <div className="editor-content">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={onChange}
        onMount={handleMount}
        theme="catppuccin-mocha"
        loading={
          <div className="welcome-screen">
            <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Loading editor...
            </div>
          </div>
        }
        options={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          fontSize: 14,
          lineHeight: 22,
          padding: { top: 12 },
          renderLineHighlight: "all",
        }}
      />
    </div>
  );
};
