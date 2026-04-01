import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectName = searchParams.get('projectName');
  const filePath = searchParams.get('filePath');

  if (!projectName || !filePath) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  // Remove the root folder name from filePath since it is already 'projectName'
  // Actually, FileTree passes a path like "my-project/src/index.ts".
  // Let's strip the first path segment if it matches projectName.
  const pathParts = filePath.split('/');
  if (pathParts[0] === projectName) {
    pathParts.shift();
  }
  const relativePath = pathParts.join('/');

  const fullPath = path.join(process.cwd(), 'UserProjs', projectName, relativePath);

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
