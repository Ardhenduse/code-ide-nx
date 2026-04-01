import React from "react";
import { getFileExtension } from "../data/sampleProject";

// File type color mapping
const extensionColors: Record<string, string> = {
  ts: "#3178c6",
  tsx: "#3178c6",
  js: "#f7df1e",
  jsx: "#61dafb",
  json: "#a6e3a1",
  md: "#89b4fa",
  css: "#cba6f7",
  scss: "#f38ba8",
  html: "#fab387",
  py: "#f9e2af",
  rs: "#fab387",
  go: "#89dceb",
  env: "#f9e2af",
  local: "#f9e2af",
  gitignore: "#6c7086",
  ico: "#f9e2af",
  txt: "#a6adc8",
  sh: "#a6e3a1",
};

export function getFileIconColor(fileName: string): string {
  const ext = getFileExtension(fileName);
  return extensionColors[ext] || "#a6adc8";
}

// SVG Icons as React components
export const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FileIcon = ({ color = "#a6adc8" }: { color?: string }) => (
  <svg viewBox="0 0 16 16" fill="none">
    <path d="M4 1.5h5.5L13 5v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-13a1 1 0 011-1z" stroke={color} strokeWidth="1" fill="none" />
    <path d="M9 1.5V5h3.5" stroke={color} strokeWidth="1" fill="none" strokeLinejoin="round" />
  </svg>
);

export const FolderIcon = ({ open = false }: { open?: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none">
    {open ? (
      <>
        <path d="M1.5 4v8.5a1 1 0 001 1h11a1 1 0 001-1V6a1 1 0 00-1-1H7.5L6 3.5H2.5a1 1 0 00-1 1z" fill="#89b4fa" fillOpacity="0.15" stroke="#89b4fa" strokeWidth="1" />
        <path d="M1.5 6.5h13" stroke="#89b4fa" strokeWidth="0.5" strokeOpacity="0.3" />
      </>
    ) : (
      <path d="M1.5 4v8.5a1 1 0 001 1h11a1 1 0 001-1V6a1 1 0 00-1-1H7.5L6 3.5H2.5a1 1 0 00-1 1z" fill="#89b4fa" fillOpacity="0.2" stroke="#89b4fa" strokeWidth="1" />
    )}
  </svg>
);

export const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CodeBracketIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

export const FilesIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export const GitBranchIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 01-9 9" />
  </svg>
);

export const SettingsIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const NewFileIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M4 1.5h5.5L13 5v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-13a1 1 0 011-1z" />
    <path d="M9 1.5V5h3.5" strokeLinejoin="round" />
    <path d="M8 8v4M6 10h4" strokeLinecap="round" />
  </svg>
);

export const NewFolderIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M1.5 4v8.5a1 1 0 001 1h11a1 1 0 001-1V6a1 1 0 00-1-1H7.5L6 3.5H2.5a1 1 0 00-1 1z" />
    <path d="M8 7.5v4M6 9.5h4" strokeLinecap="round" />
  </svg>
);

export const CollapseAllIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M3 4l5 4-5 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 4l5 4-5 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
