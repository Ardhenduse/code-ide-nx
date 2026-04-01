"use client";

import React from "react";
import { CloseIcon, FileIcon, getFileIconColor } from "./Icons";

export interface TabData {
  path: string;
  name: string;
  content: string;
  language?: string;
  modified?: boolean;
}

interface TabBarProps {
  tabs: TabData[];
  activeTabPath: string | null;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabPath,
  onTabSelect,
  onTabClose,
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="tab-bar" role="tablist" aria-label="Open files">
      {tabs.map((tab) => {
        const isActive = activeTabPath === tab.path;
        return (
          <div
            key={tab.path}
            className={`tab ${isActive ? "tab--active" : ""}`}
            onClick={() => onTabSelect(tab.path)}
            role="tab"
            aria-selected={isActive}
            title={tab.path}
          >
            <span className="tab__icon">
              <FileIcon color={getFileIconColor(tab.name)} />
            </span>
            <span className="tab__name">{tab.name}</span>
            {tab.modified && <span className="tab__modified" />}
            <button
              className="tab__close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.path);
              }}
              aria-label={`Close ${tab.name}`}
            >
              <CloseIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
};
