import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { readFileTool, listFilesTool, renameFileTool } from './tools.js';
import { ProxyAgent } from 'node:undici';

// 加载环境变量
dotenv.config();

// 配置代理
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890';
const proxyAgent = new ProxyAgent(proxyUrl);

// 创建支持代理的 fetch
const customFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    dispatcher: proxyAgent
  });
};

// 配置模型 - 使用自定义 fetch
const model = openai('gpt-4o', {
  fetch: customFetch
});

// 配置 Agent 工具
const tools = {
  read_file: readFileTool,
  list_files: listFilesTool,
  rename_file: renameFileTool
};

/**
 * 主函数：交互式对话循环
 */
async function main() {
  const history = [];
  
  // 创建 readline 接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`🌐 使用代理: ${proxyUrl}`);
  console.log('AI Agent 已启动 (输入 exit 退出)\n');

  // 交互循环
  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question('Input: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      console.log('再见！');
      rl.close();
      break;
    }

    try {
      // 调用 AI 模型
      const result = await generateText({
        model,
        tools,
        maxSteps: 5, // 允许多步工具调用
        system: 'You are an experienced programmer with file operation capabilities.',
        messages: [
          ...history,
          { role: 'user', content: userInput }
        ]
      });

      // 更新历史记录
      history.push(
        { role: 'user', content: userInput },
        { role: 'assistant', content: result.text }
      );

      // 输出回复
      console.log(`\n${result.text}\n`);

      // 如果历史太长，可以考虑截断（可选）
      if (history.length > 20) {
        history.splice(0, 2);
      }

    } catch (error) {
      console.error('Error:', error.message);
      if (error.cause) {
        console.error('原因:', error.cause);
      }
    }
  }
}

// 启动应用
main();

