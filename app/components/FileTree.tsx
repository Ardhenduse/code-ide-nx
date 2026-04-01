"use client";

import React, { useState, useCallback } from "react";
import { FileNode, getFilePath } from "../data/sampleProject";
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  getFileIconColor,
} from "./Icons";

interface FileTreeProps {
  node: FileNode;
  depth?: number;
  parentPath?: string;
  activeFilePath: string | null;
  onFileSelect: (node: FileNode, path: string) => void;
}

export const FileTreeItem: React.FC<FileTreeProps> = ({
  node,
  depth = 0,
  parentPath = "",
  activeFilePath,
  onFileSelect,
}) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const fullPath = getFilePath(node, parentPath);
  const isFolder = node.type === "folder";
  const isActive = activeFilePath === fullPath;

  const handleClick = useCallback(() => {
    if (isFolder) {
      setIsOpen((prev) => !prev);
    } else {
      onFileSelect(node, fullPath);
    }
  }, [isFolder, node, fullPath, onFileSelect]);

  return (
    <div className="animate-slide-in" style={{ animationDelay: `${depth * 15}ms` }}>
      <div
        className={`file-tree__item ${isActive ? "file-tree__item--active" : ""}`}
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        role="treeitem"
        aria-expanded={isFolder ? isOpen : undefined}
        aria-selected={isActive}
        title={fullPath}
      >
        {/* Chevron for folders */}
        <span
          className={`file-tree__chevron ${
            isFolder
              ? isOpen
                ? "file-tree__chevron--open"
                : ""
              : "file-tree__chevron--hidden"
          }`}
        >
          <ChevronRightIcon />
        </span>

        {/* Icon */}
        <span className="file-tree__icon">
          {isFolder ? (
            <FolderIcon open={isOpen} />
          ) : (
            <FileIcon color={getFileIconColor(node.name)} />
          )}
        </span>

        {/* Name */}
        <span className="file-tree__name">{node.name}</span>
      </div>

      {/* Children */}
      {isFolder && isOpen && node.children && (
        <div role="group">
          {sortFileNodes(node.children).map((child) => (
            <FileTreeItem
              key={getFilePath(child, fullPath)}
              node={child}
              depth={depth + 1}
              parentPath={fullPath}
              activeFilePath={activeFilePath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Sort: folders first, then files, alphabetically
function sortFileNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });
}

interface FileTreeRootProps {
  root: FileNode;
  activeFilePath: string | null;
  onFileSelect: (node: FileNode, path: string) => void;
}

export const FileTree: React.FC<FileTreeRootProps> = ({
  root,
  activeFilePath,
  onFileSelect,
}) => {
  return (
    <div role="tree" aria-label="File Explorer">
      {root.children &&
        sortFileNodes(root.children).map((child) => (
          <FileTreeItem
            key={getFilePath(child, root.name)}
            node={child}
            depth={0}
            parentPath={root.name}
            activeFilePath={activeFilePath}
            onFileSelect={onFileSelect}
          />
        ))}
    </div>
  );
};
