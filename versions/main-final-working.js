import { generateText } from 'ai';
import { openai as createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { readFileTool, listFilesTool, renameFileTool } from './tools.js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

// 加载环境变量
dotenv.config();

// 配置代理（如果需要）
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
let customFetch = undefined;

if (proxyUrl) {
  const agent = new HttpsProxyAgent(proxyUrl);
  customFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      agent
    });
  };
  console.log(`🌐 使用代理: ${proxyUrl}`);
}

// 配置模型 - 使用 ChatGPT（带可选代理支持）
const model = createOpenAI('gpt-4o', customFetch ? { fetch: customFetch } : {});

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

  console.log('🤖 AI Agent 已启动 (输入 exit 退出)\n');
  console.log('💡 提示: 如果遇到配额错误，可以：');
  console.log('   1. 充值 OpenAI 账户');
  console.log('   2. 使用国内免费模型（见 FINAL_SOLUTION.md）\n');

  // 交互循环
  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question('Input: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      console.log('👋 再见！');
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
      console.error('\n❌ Error:', error.message);
      
      if (error.message.includes('quota') || error.message.includes('429')) {
        console.error('\n💡 API 配额已用完，解决方案：');
        console.error('   1. 充值 OpenAI 账户：https://platform.openai.com/account/billing');
        console.error('   2. 使用免费的国内模型（推荐）：查看 FINAL_SOLUTION.md\n');
      } else if (error.message.includes('Cannot connect')) {
        console.error('\n💡 网络连接失败，请检查：');
        console.error('   1. 代理软件是否运行');
        console.error('   2. 在 .env 添加: HTTPS_PROXY=http://127.0.0.1:7890\n');
      }
    }
  }
}

// 启动应用
main();


