/**
 * 使用 OpenAI 原生 SDK 的实现示例
 * npm install openai dotenv
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as readline from 'readline';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const baseDir = './test';

// 定义工具
const tools = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read file content from the test directory',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'File name relative to test directory'
          }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List all files in the test directory',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'rename_file',
      description: 'Rename or move a file within the test directory',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Current file name' },
          newName: { type: 'string', description: 'New file name' }
        },
        required: ['name', 'newName']
      }
    }
  }
];

// 工具执行函数
async function executeFunction(name, args) {
  console.log(`(${name} ${JSON.stringify(args)})`);
  
  switch (name) {
    case 'read_file':
      try {
        const content = await fs.readFile(path.join(baseDir, args.name), 'utf-8');
        return content;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    
    case 'list_files':
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
    
    case 'rename_file':
      try {
        const oldPath = path.join(baseDir, args.name);
        const newPath = path.join(baseDir, args.newName);
        await fs.mkdir(path.dirname(newPath), { recursive: true });
        await fs.rename(oldPath, newPath);
        return `File '${args.name}' successfully renamed to '${args.newName}'.`;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    
    default:
      return 'Unknown function';
  }
}

async function main() {
  const messages = [
    { role: 'system', content: 'You are an experienced programmer with file operation capabilities.' }
  ];
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('OpenAI Agent 已启动\n');

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question('Input: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      break;
    }

    messages.push({ role: 'user', content: userInput });

    try {
      // 调用 OpenAI API
      let response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
        tools,
        tool_choice: 'auto'
      });

      // 处理工具调用循环
      while (response.choices[0].message.tool_calls) {
        const assistantMessage = response.choices[0].message;
        messages.push(assistantMessage);

        // 执行所有工具调用
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          const functionResult = await executeFunction(functionName, functionArgs);

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: functionResult
          });
        }

        // 再次调用获取最终回复
        response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages,
          tools,
          tool_choice: 'auto'
        });
      }

      const finalMessage = response.choices[0].message;
      messages.push(finalMessage);
      console.log(`\n${finalMessage.content}\n`);

    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

main();


