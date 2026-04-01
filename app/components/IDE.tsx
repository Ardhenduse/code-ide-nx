"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { FileNode, getFilePath } from "../data/sampleProject";
import { FileTree } from "./FileTree";
import { TabBar, TabData } from "./TabBar";
import { CodeEditor } from "./CodeEditor";
import { TerminalPanel } from "./Terminal";
import {
  CodeBracketIcon,
  FilesIcon,
  SearchIcon,
  GitBranchIcon,
  SettingsIcon,
  NewFileIcon,
  NewFolderIcon,
  CollapseAllIcon,
} from "./Icons";

interface IDEProps {
  projectId: string;
  projectName: string;
}

export default function IDE({ projectId, projectName }: IDEProps) {
  const [projectTree, setProjectTree] = useState<FileNode | null>(null);
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [activeActivity, setActiveActivity] = useState("files");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const resizeRef = useRef<HTMLDivElement>(null);

  const fetchProjectTree = useCallback(async () => {
    try {
      const res = await fetch(`/api/fs?projectName=${encodeURIComponent(projectName)}`);
      if (res.ok) {
        const data = await res.json();
        setProjectTree(data);
      }
    } catch (error) {
      console.error("Failed to load project tree", error);
    }
  }, [projectName]);

  useEffect(() => {
    fetchProjectTree();
  }, [fetchProjectTree]);

  // Active tab data
  const activeTab = tabs.find((t) => t.path === activeTabPath) || null;

  // Handle file selection from tree
  const handleFileSelect = useCallback(
    async (node: FileNode, path: string) => {
      if (node.type !== "file") return;

      const existingTab = tabs.find((t) => t.path === path);
      if (existingTab) {
        setActiveTabPath(path);
        return;
      }

      // Fetch file content
      let content = node.content || "";
      if (content === "") {
        try {
          const res = await fetch(`/api/file_content?projectName=${encodeURIComponent(projectName)}&filePath=${encodeURIComponent(path)}`);
          if (res.ok) {
             const data = await res.json();
             content = data.content;
          }
        } catch(e) {}
      }

      const newTab: TabData = {
        path,
        name: node.name,
        content: content,
        language: node.language || "plaintext",
        modified: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabPath(path);
    },
    [tabs, projectName]
  );

  const toggleTerminal = useCallback(() => {
    setTerminalOpen((prev) => !prev);
  }, []);

  const saveFile = useCallback(async () => {
     if (!activeTab || !activeTab.modified) return;
     try {
       await fetch("/api/fs", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           projectName,
           filePath: activeTab.path,
           content: activeTab.content
         })
       });
       setTabs(prev => prev.map(t => t.path === activeTab.path ? { ...t, modified: false } : t));
     } catch (e) {
       console.error("Save failed", e);
     }
  }, [activeTab, projectName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveFile, toggleTerminal]);

  // Handle tab selection
  const handleTabSelect = useCallback((path: string) => {
    setActiveTabPath(path);
  }, []);

  // Handle tab close
  const handleTabClose = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.path !== path);
        if (activeTabPath === path) {
          const closedIndex = prev.findIndex((t) => t.path === path);
          if (newTabs.length > 0) {
            const newIndex = Math.min(closedIndex, newTabs.length - 1);
            setActiveTabPath(newTabs[newIndex].path);
          } else {
            setActiveTabPath(null);
          }
        }
        return newTabs;
      });
    },
    [activeTabPath]
  );

  // Handle code change
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!activeTabPath || value === undefined) return;
      setTabs((prev) =>
        prev.map((t) =>
          t.path === activeTabPath ? { ...t, content: value, modified: true } : t
        )
      );
    },
    [activeTabPath]
  );

  const handleCreateFile = async () => {
     const p = prompt("Enter file path (e.g., folder/file.ts)");
     if (!p) return;
     await fetch("/api/fs", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ projectName, filePath: p, content: "", isFolder: false })
     });
     fetchProjectTree();
  }

  const handleCreateFolder = async () => {
     const p = prompt("Enter folder path (e.g., folder/subfolder)");
     if (!p) return;
     await fetch("/api/fs", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ projectName, filePath: p, isFolder: true })
     });
     fetchProjectTree();
  }

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        const newWidth = Math.max(180, Math.min(500, startWidth + delta));
        setSidebarWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarWidth]
  );

  const toggleSidebar = useCallback(
    (activity: string) => {
      if (activeActivity === activity && sidebarOpen) {
        setSidebarOpen(false);
      } else {
        setActiveActivity(activity);
        setSidebarOpen(true);
      }
    },
    [activeActivity, sidebarOpen]
  );

  const breadcrumbParts = activeTabPath ? activeTabPath.split("/") : [];
  const [cursorPos] = useState({ line: 1, col: 1 });

  return (
    <div className="ide-container">
      <div className="title-bar">
        <div className="title-bar__left">
          <div className="title-bar__logo">
            <CodeBracketIcon />
            <span>CodeStudio</span>
          </div>
          <div className="title-bar__menu">
            {["File", "Edit", "View", "Go", "Run", "Terminal", "Help"].map(
              (item) => (
                <button
                  key={item}
                  className="title-bar__menu-item"
                  onClick={item === "Terminal" ? toggleTerminal : undefined}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
        <div className="title-bar__center">
          {activeTab ? activeTab.name : "CodeStudio"} — {projectName}
        </div>
        <div />
      </div>

      <div className="main-area">
        <div className="activity-bar">
          <button
            className={`activity-bar__icon ${
              activeActivity === "files" && sidebarOpen
                ? "activity-bar__icon--active"
                : ""
            }`}
            onClick={() => toggleSidebar("files")}
            title="Explorer"
          >
            <FilesIcon />
          </button>
          <button
            className={`activity-bar__icon ${
              activeActivity === "search" && sidebarOpen
                ? "activity-bar__icon--active"
                : ""
            }`}
            onClick={() => toggleSidebar("search")}
            title="Search"
          >
            <SearchIcon />
          </button>
          <button
            className={`activity-bar__icon ${
              activeActivity === "git" && sidebarOpen
                ? "activity-bar__icon--active"
                : ""
            }`}
            onClick={() => toggleSidebar("git")}
            title="Source Control"
          >
            <GitBranchIcon />
          </button>
          <div style={{ flex: 1 }} />
          <button
            className="activity-bar__icon"
            title="Settings"
            onClick={() => toggleSidebar("settings")}
          >
            <SettingsIcon />
          </button>
        </div>

        <div
          className={`sidebar ${!sidebarOpen ? "sidebar--collapsed" : ""}`}
          style={sidebarOpen ? { width: sidebarWidth } : {}}
        >
          {activeActivity === "files" && (
            <>
              <div className="sidebar__header">
                <span>Explorer</span>
                <div className="sidebar__header-actions">
                  <button className="sidebar__header-action" title="New File" onClick={handleCreateFile}>
                    <NewFileIcon />
                  </button>
                  <button className="sidebar__header-action" title="New Folder" onClick={handleCreateFolder}>
                    <NewFolderIcon />
                  </button>
                  <button
                    className="sidebar__header-action"
                    title="Collapse All"
                  >
                    <CollapseAllIcon />
                  </button>
                </div>
              </div>
              <div className="sidebar__content">
                {projectTree ? (
                  <FileTree
                    root={projectTree}
                    activeFilePath={activeTabPath}
                    onFileSelect={handleFileSelect}
                  />
                ) : (
                  <div className="p-4 text-gray-500 text-sm">Loading workspace...</div>
                )}
              </div>
            </>
          )}
          {activeActivity === "search" && (
            <>
              <div className="sidebar__header">
                <span>Search</span>
              </div>
              <div className="sidebar__content" style={{ padding: "8px 12px" }}>
                <div
                  style={{
                    background: "var(--bg-hover)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  Search files...
                </div>
              </div>
            </>
          )}
          {activeActivity === "git" && (
            <>
              <div className="sidebar__header">
                <span>Source Control</span>
              </div>
              <div
                className="sidebar__content"
                style={{
                  padding: "16px 12px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                <p>No changes detected.</p>
              </div>
            </>
          )}
          {activeActivity === "settings" && (
            <>
              <div className="sidebar__header">
                <span>Settings</span>
              </div>
              <div
                className="sidebar__content"
                style={{
                  padding: "16px 12px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                <p>Settings panel</p>
              </div>
            </>
          )}
        </div>

        {sidebarOpen && (
          <div
            ref={resizeRef}
            className={`resize-handle ${isResizing ? "resize-handle--active" : ""}`}
            onMouseDown={handleResizeStart}
          />
        )}

        <div className="editor-area">
          <div className="editor-area__top">
            <TabBar
              tabs={tabs}
              activeTabPath={activeTabPath}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
            />

            {activeTab && (
              <div className="breadcrumb">
                {breadcrumbParts.map((part, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="breadcrumb__separator">›</span>}
                    <span className="breadcrumb__item">{part}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {activeTab ? (
              <CodeEditor
                key={activeTab.path}
                fileName={activeTab.name}
                content={activeTab.content}
                onChange={handleCodeChange}
              />
            ) : (
              <div className="welcome-screen">
                <div className="welcome-screen__logo">
                  <CodeBracketIcon />
                  <span>CodeStudio</span>
                </div>
                <div className="welcome-screen__shortcuts">
                  <div className="welcome-screen__shortcut">
                    <span className="welcome-screen__key">Ctrl+N</span>
                    <span>New File</span>
                  </div>
                  <div className="welcome-screen__shortcut">
                    <span className="welcome-screen__key">Ctrl+O</span>
                    <span>Open File</span>
                  </div>
                  <div className="welcome-screen__shortcut">
                    <span className="welcome-screen__key">Ctrl+S</span>
                    <span>Save File</span>
                  </div>
                  <div className="welcome-screen__shortcut">
                    <span className="welcome-screen__key">Ctrl+`</span>
                    <span>Toggle Terminal</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <TerminalPanel
            visible={terminalOpen}
            height={terminalHeight}
            projectName={projectName}
            onResize={setTerminalHeight}
            onToggle={toggleTerminal}
          />
        </div>
      </div>

      <div className="status-bar">
        <div className="status-bar__left">
          <span className="status-bar__item">
            <GitBranchIcon className="" />
            main
          </span>
          {activeTab?.modified && (
            <span className="status-bar__item">● Modified (Unsaved)</span>
          )}
        </div>
        <div className="status-bar__right">
          {activeTab && (
            <>
              <span className="status-bar__item">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <span className="status-bar__item">Spaces: 2</span>
              <span className="status-bar__item">UTF-8</span>
              <span className="status-bar__item">
                {activeTab.language || "Plain Text"}
              </span>
            </>
          )}
          <span className="status-bar__item">CodeStudio</span>
        </div>
      </div>
    </div>
  );
}
