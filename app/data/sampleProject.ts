export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  language?: string;
}

export const sampleProject: FileNode = {
  name: "my-project",
  type: "folder",
  children: [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "components",
          type: "folder",
          children: [
            {
              name: "Button.tsx",
              type: "file",
              language: "typescript",
              content: `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200';
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};`,
            },
            {
              name: "Card.tsx",
              type: "file",
              language: "typescript",
              content: `import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  children,
  className = '',
}) => {
  return (
    <div className={\`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden \${className}\`}>
      {image && (
        <div className="aspect-video overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
};`,
            },
            {
              name: "Navbar.tsx",
              type: "file",
              language: "typescript",
              content: `import React, { useState } from 'react';
import { Button } from './Button';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  brand: string;
  items: NavItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ brand, items }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-gray-900">
          {brand}
        </a>
        
        <div className="hidden md:flex items-center gap-6">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={\`text-sm font-medium transition-colors \${
                item.active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }\`}
            >
              {item.label}
            </a>
          ))}
          <Button size="sm">Get Started</Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
};`,
            },
          ],
        },
        {
          name: "hooks",
          type: "folder",
          children: [
            {
              name: "useTheme.ts",
              type: "file",
              language: "typescript",
              content: `import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme, getSystemTheme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () =>
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, resolvedTheme, setTheme, toggleTheme };
}`,
            },
            {
              name: "useLocalStorage.ts",
              type: "file",
              language: "typescript",
              content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}`,
            },
          ],
        },
        {
          name: "utils",
          type: "folder",
          children: [
            {
              name: "helpers.ts",
              type: "file",
              language: "typescript",
              content: `/**
 * Utility helper functions for the application
 */

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}`,
            },
          ],
        },
        {
          name: "App.tsx",
          type: "file",
          language: "typescript",
          content: `import React from 'react';
import { Navbar } from './components/Navbar';
import { Card } from './components/Card';
import { Button } from './components/Button';

const navItems = [
  { label: 'Home', href: '/', active: true },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar brand="MyApp" items={navItems} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Build Something Amazing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A modern application built with React and TypeScript.
            Fast, reliable, and beautifully designed.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" size="lg">Get Started</Button>
            <Button variant="secondary" size="lg">Learn More</Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Lightning Fast"
            description="Optimized for performance with lazy loading and code splitting."
          />
          <Card
            title="Type Safe"
            description="Built with TypeScript for better developer experience and fewer bugs."
          />
          <Card
            title="Beautiful UI"
            description="Crafted with attention to detail using modern design principles."
          />
        </section>
      </main>
    </div>
  );
}`,
        },
        {
          name: "index.ts",
          type: "file",
          language: "typescript",
          content: `export { Button } from './components/Button';
export { Card } from './components/Card';
export { Navbar } from './components/Navbar';
export { useTheme } from './hooks/useTheme';
export { useLocalStorage } from './hooks/useLocalStorage';
export * from './utils/helpers';`,
        },
      ],
    },
    {
      name: "public",
      type: "folder",
      children: [
        {
          name: "favicon.ico",
          type: "file",
          language: "plaintext",
          content: "// Binary file - favicon.ico",
        },
      ],
    },
    {
      name: "package.json",
      type: "file",
      language: "json",
      content: `{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest",
    "format": "prettier --write ."
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}`,
    },
    {
      name: "tsconfig.json",
      type: "file",
      language: "json",
      content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`,
    },
    {
      name: "README.md",
      type: "file",
      language: "markdown",
      content: `# My Project

A modern web application built with **Next.js**, **React**, and **TypeScript**.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── utils/        # Utility functions
├── App.tsx       # Main application component
└── index.ts      # Public API exports
\`\`\`

## Features

- ⚡ **Fast** — Optimized build and runtime performance
- 🔒 **Type Safe** — Full TypeScript support
- 🎨 **Beautiful** — Modern, responsive design
- 📱 **Responsive** — Works on all devices
- ♿ **Accessible** — WCAG 2.1 compliant

## License

MIT © 2024
`,
    },
    {
      name: ".gitignore",
      type: "file",
      language: "plaintext",
      content: `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
build/
dist/

# Misc
.DS_Store
*.pem
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo`,
    },
    {
      name: ".env.local",
      type: "file",
      language: "plaintext",
      content: `# Environment variables
NEXT_PUBLIC_APP_NAME=MyProject
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://localhost:5432/mydb
SECRET_KEY=your-secret-key-here`,
    },
  ],
};

// Helper: get file extension
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

// Helper: determine language from file extension
export function getLanguageFromExtension(ext: string): string {
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    scss: "scss",
    html: "html",
    yml: "yaml",
    yaml: "yaml",
    py: "python",
    rs: "rust",
    go: "go",
    sh: "shell",
    bash: "shell",
    sql: "sql",
    graphql: "graphql",
    env: "plaintext",
    gitignore: "plaintext",
    txt: "plaintext",
    local: "plaintext",
  };
  return map[ext] || "plaintext";
}

// Helper: get file path from tree
export function getFilePath(node: FileNode, parentPath = ""): string {
  return parentPath ? `${parentPath}/${node.name}` : node.name;
}
