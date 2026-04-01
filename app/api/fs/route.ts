import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const userProjsDir = path.join(process.cwd(), 'UserProjs');

if (!fsSync.existsSync(userProjsDir)) {
  fsSync.mkdirSync(userProjsDir, { recursive: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectName = searchParams.get('projectName');
  if (!projectName) return NextResponse.json({ error: 'projectName required' }, { status: 400 });

  const projectDir = path.join(userProjsDir, projectName);
  console.log(projectDir);
  if (!fsSync.existsSync(projectDir)) {
    await fs.mkdir(projectDir, { recursive: true });
  }

  async function buildTree(dir: string, name: string): Promise<any> {
    const stats = await fs.stat(dir);
    if (!stats.isDirectory()) {
      const parts = name.split('.');
      const ext = parts.length > 1 ? parts[parts.length - 1] : '';
      return {
        name,
        type: 'file',
        language: getLanguageFromExtension(ext),
      };
    }

    const children = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      children.push(await buildTree(path.join(dir, entry.name), entry.name));
    }

    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    return {
      name,
      type: 'folder',
      children,
    };
  }

  try {
    const tree = await buildTree(projectDir, projectName);
    return NextResponse.json(tree);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { projectName, filePath, content, isFolder } = await req.json();
  if (!projectName || !filePath) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const fullPath = path.join(userProjsDir, projectName, filePath);

  try {
    if (isFolder) {
      await fs.mkdir(fullPath, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content || '');
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { projectName, filePath, content } = await req.json();
  if (!projectName || !filePath) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const fullPath = path.join(userProjsDir, projectName, filePath);

  try {
    await fs.writeFile(fullPath, content || '');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getLanguageFromExtension(ext: string): string {
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    sh: 'shell',
    sql: 'sql',
  };
  return map[ext] || 'plaintext';
}
