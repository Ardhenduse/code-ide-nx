import { WebSocketServer } from "ws";
import os from "os";
import pty from "node-pty";
import path from "path";
import fs from "fs";

const PORT = 3001;

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

const wss = new WebSocketServer({ port: PORT });
const userProjsDir = path.join(process.cwd(), "UserProjs");

if (!fs.existsSync(userProjsDir)) {
  fs.mkdirSync(userProjsDir, { recursive: true });
}

console.log(`\x1b[36m✓ Terminal server running on ws://localhost:${PORT}\x1b[0m`);

wss.on("connection", (ws, req) => {
  console.log("\x1b[32m● Terminal client connected\x1b[0m");

  const urlParams = new URLSearchParams(req.url.split('?')[1] || "");
  const projectName = urlParams.get("projectName");

  let cwd = process.env.HOME || process.env.USERPROFILE || ".";
  if (projectName) {
    cwd = path.join(userProjsDir, projectName);
    if (!fs.existsSync(cwd)) {
      fs.mkdirSync(cwd, { recursive: true });
    }
  }

  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-256color",
    cols: 120,
    rows: 30,
    cwd,
    env: { ...process.env },
  });

  // PTY → Client
  ptyProcess.onData((data) => {
    try {
      ws.send(JSON.stringify({ type: "output", data }));
    } catch (e) {
      // Client disconnected
    }
  });

  ptyProcess.onExit(({ exitCode }) => {
    console.log(`\x1b[33m○ PTY exited with code ${exitCode}\x1b[0m`);
    try {
      ws.send(JSON.stringify({ type: "exit", code: exitCode }));
      ws.close();
    } catch (e) {
      // Already closed
    }
  });

  // Client → PTY
  ws.on("message", (message) => {
    try {
      const msg = JSON.parse(message.toString());
      switch (msg.type) {
        case "input":
          ptyProcess.write(msg.data);
          break;
        case "resize":
          if (msg.cols && msg.rows) {
            ptyProcess.resize(msg.cols, msg.rows);
          }
          break;
      }
    } catch (e) {
      // Ignore malformed messages
    }
  });

  ws.on("close", () => {
    console.log("\x1b[31m○ Terminal client disconnected\x1b[0m");
    ptyProcess.kill();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
    ptyProcess.kill();
  });
});

wss.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\x1b[31m✗ Port ${PORT} is already in use\x1b[0m`);
    process.exit(1);
  }
  console.error("Server error:", err);
});
