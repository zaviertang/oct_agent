/**
 * 使用 LangChain.js 的实现示例
 * npm install langchain @langchain/openai dotenv
 */
import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from 'langchain/tools';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { z } from 'zod';
import dotenv from 'dotenv';
import * as readline from 'readline';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const baseDir = './test';

// 创建工具
const readFileTool = new DynamicStructuredTool({
  name: 'read_file',
  description: 'Read file content from the test directory',
  schema: z.object({
    name: z.string().describe('File name relative to test directory')
  }),
  func: async ({ name }) => {
    console.log(`(read_file ${name})`);
    try {
      return await fs.readFile(path.join(baseDir, name), 'utf-8');
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});

const listFilesTool = new DynamicStructuredTool({
  name: 'list_files',
  description: 'List all files in the test directory',
  schema: z.object({}),
  func: async () => {
    console.log('(list_files)');
    try {
      const files = [];
      async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isFile()) {
            files.push(path.relative(baseDir, fullPath));
          } else if (entry.isDirectory()) {
            await walk(fullPath);
          }
        }
      }
      await walk(baseDir);
      return JSON.stringify(files);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});

const renameFileTool = new DynamicStructuredTool({
  name: 'rename_file',
  description: 'Rename or move a file within the test directory',
  schema: z.object({
    name: z.string().describe('Current file name'),
    newName: z.string().describe('New file name')
  }),
  func: async ({ name, newName }) => {
    console.log(`(rename_file ${name} -> ${newName})`);
    try {
      const oldPath = path.join(baseDir, name);
      const newPath = path.join(baseDir, newName);
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.rename(oldPath, newPath);
      return `File '${name}' successfully renamed to '${newName}'.`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});

async function main() {
  // 创建 LLM
  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    temperature: 0
  });

  // 创建提示模板
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an experienced programmer with file operation capabilities.'],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad')
  ]);

  // 创建工具列表
  const tools = [readFileTool, listFilesTool, renameFileTool];

  // 创建 Agent
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt
  });

  // 创建 Agent Executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: false
  });

  // 交互循环
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const chatHistory = [];

  console.log('LangChain Agent 已启动\n');

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question('Input: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      break;
    }

    try {
      const result = await agentExecutor.invoke({
        input: userInput,
        chat_history: chatHistory
      });

      console.log(`\n${result.output}\n`);

      // 更新历史
      chatHistory.push(['human', userInput]);
      chatHistory.push(['assistant', result.output]);

      // 限制历史长度
      if (chatHistory.length > 20) {
        chatHistory.splice(0, 2);
      }

    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

main();


