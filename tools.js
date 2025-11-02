import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, 'test');

// 确保测试目录存在
try {
  await fs.mkdir(baseDir, { recursive: true });
} catch (err) {
  // 目录已存在
}

/**
 * 读取文件工具
 */
export const readFileTool = {
  description: 'Read file content from the test directory. Returns file content or error message.',
  parameters: z.object({
    name: z.string().describe('File name relative to test directory')
  }),
  execute: async ({ name }) => {
    console.log(`(read_file ${name})`);
    try {
      const filePath = path.join(baseDir, name);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      return `An error occurred: ${error.message}`;
    }
  }
};

/**
 * 列出文件工具
 */
export const listFilesTool = {
  description: 'List all files in the test directory recursively',
  parameters: z.object({}),
  execute: async () => {
    console.log('(list_files)');
    const fileList = [];
    
    async function walkDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          const relativePath = path.relative(baseDir, fullPath);
          fileList.push(relativePath);
        }
      }
    }
    
    try {
      await walkDir(baseDir);
      return fileList;
    } catch (error) {
      return [];
    }
  }
};

/**
 * 重命名文件工具
 */
export const renameFileTool = {
  description: 'Rename or move a file within the test directory. Creates target directories if needed.',
  parameters: z.object({
    name: z.string().describe('Current file name'),
    newName: z.string().describe('New file name')
  }),
  execute: async ({ name, newName }) => {
    console.log(`(rename_file ${name} -> ${newName})`);
    try {
      const oldPath = path.join(baseDir, name);
      const newPath = path.join(baseDir, newName);
      
      // 安全检查：确保新路径在 baseDir 内
      if (!newPath.startsWith(baseDir)) {
        return 'Error: new_name is outside base_dir.';
      }
      
      // 创建目标目录
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      
      // 重命名文件
      await fs.rename(oldPath, newPath);
      
      return `File '${name}' successfully renamed to '${newName}'.`;
    } catch (error) {
      return `An error occurred: ${error.message}`;
    }
  }
};


