"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

// We import xterm CSS via a link tag dynamically to avoid SSR issues
const XTERM_CSS_URL =
  "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.min.css";

interface TerminalPanelProps {
  visible: boolean;
  height: number;
  onResize: (newHeight: number) => void;
  onToggle: () => void;
  projectName?: string;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  visible,
  height,
  onResize,
  onToggle,
  projectName = "",
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTermTab, setActiveTermTab] = useState(0);
  const isResizingRef = useRef(false);

  // Load xterm CSS
  useEffect(() => {
    if (document.querySelector(`link[href="${XTERM_CSS_URL}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = XTERM_CSS_URL;
    document.head.appendChild(link);
  }, []);

  // Initialize xterm + WebSocket
  useEffect(() => {
    if (!visible || !terminalRef.current) return;

    let cleanup = false;

    const initTerminal = async () => {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      if (cleanup) return;

      // If already initialized, just fit
      if (xtermRef.current) {
        fitAddonRef.current?.fit();
        return;
      }

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 13,
        fontFamily:
          "'GeistMono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, monospace",
        lineHeight: 1.4,
        letterSpacing: 0,
        theme: {
          background: "#11111b",
          foreground: "#cdd6f4",
          cursor: "#f5e0dc",
          cursorAccent: "#11111b",
          selectionBackground: "#45475a80",
          selectionForeground: "#cdd6f4",
          black: "#45475a",
          red: "#f38ba8",
          green: "#a6e3a1",
          yellow: "#f9e2af",
          blue: "#89b4fa",
          magenta: "#cba6f7",
          cyan: "#89dceb",
          white: "#bac2de",
          brightBlack: "#585b70",
          brightRed: "#f38ba8",
          brightGreen: "#a6e3a1",
          brightYellow: "#f9e2af",
          brightBlue: "#89b4fa",
          brightMagenta: "#cba6f7",
          brightCyan: "#89dceb",
          brightWhite: "#a6adc8",
        },
        allowProposedApi: true,
        scrollback: 5000,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);

      term.open(terminalRef.current!);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Connect WebSocket
      connectWS(term);
    };

    const connectWS = (term: any) => {
      const wsUrl = projectName ? `ws://localhost:3001?projectName=${encodeURIComponent(projectName)}` : "ws://localhost:3001";
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Send initial size
        if (fitAddonRef.current) {
          const dims = fitAddonRef.current.proposeDimensions();
          if (dims) {
            ws.send(
              JSON.stringify({ type: "resize", cols: dims.cols, rows: dims.rows })
            );
          }
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "output") {
            term.write(msg.data);
          } else if (msg.type === "exit") {
            term.writeln("\r\n\x1b[33m[Process exited]\x1b[0m");
            setIsConnected(false);
          }
        } catch {
          // Ignore
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
        term.writeln(
          "\r\n\x1b[31m[Connection failed — make sure the terminal server is running]\x1b[0m"
        );
      };

      // Terminal input → WebSocket
      term.onData((data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "input", data }));
        }
      });
    };

    initTerminal();

    return () => {
      cleanup = true;
    };
  }, [visible]);

  // Re-fit on height change
  useEffect(() => {
    if (!visible || !fitAddonRef.current) return;
    const timer = setTimeout(() => {
      fitAddonRef.current?.fit();
      // Send resize to server
      if (wsRef.current?.readyState === WebSocket.OPEN && fitAddonRef.current) {
        const dims = fitAddonRef.current.proposeDimensions();
        if (dims) {
          wsRef.current.send(
            JSON.stringify({ type: "resize", cols: dims.cols, rows: dims.rows })
          );
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [height, visible]);

  // Window resize handler
  useEffect(() => {
    if (!visible) return;
    const handleResize = () => {
      fitAddonRef.current?.fit();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visible]);

  // Vertical resize
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      const startY = e.clientY;
      const startHeight = height;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = startY - e.clientY;
        const newHeight = Math.max(100, Math.min(600, startHeight + delta));
        onResize(newHeight);
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        // Refit after resize
        setTimeout(() => fitAddonRef.current?.fit(), 50);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [height, onResize]
  );

  if (!visible) return null;

  return (
    <div className="terminal-panel" style={{ height }}>
      {/* Resize handle */}
      <div className="terminal-resize-handle" onMouseDown={handleResizeStart} />

      {/* Terminal header */}
      <div className="terminal-header">
        <div className="terminal-header__tabs">
          <button
            className={`terminal-header__tab ${
              activeTermTab === 0 ? "terminal-header__tab--active" : ""
            }`}
            onClick={() => setActiveTermTab(0)}
          >
            <TerminalIcon />
            Terminal
          </button>
          <button className="terminal-header__tab">
            <ProblemsIcon />
            Problems
          </button>
          <button className="terminal-header__tab">
            <OutputIcon />
            Output
          </button>
        </div>

        <div className="terminal-header__actions">
          <span
            className={`terminal-header__status ${
              isConnected
                ? "terminal-header__status--connected"
                : "terminal-header__status--disconnected"
            }`}
          >
            {isConnected ? "● Connected" : "○ Disconnected"}
          </span>
          <button className="terminal-header__action" title="New Terminal">
            <PlusIcon />
          </button>
          <button className="terminal-header__action" title="Split Terminal">
            <SplitIcon />
          </button>
          <button
            className="terminal-header__action"
            title="Close Panel"
            onClick={onToggle}
          >
            <CloseSmallIcon />
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div className="terminal-body" ref={terminalRef} />
    </div>
  );
};

/* ── Small inline icons ──────────────────── */

const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ProblemsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3.5M8 10.5v.5" strokeLinecap="round" />
  </svg>
);

const OutputIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M5 7h6M5 9.5h4" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const SplitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M8 3v10" />
  </svg>
);

const CloseSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
