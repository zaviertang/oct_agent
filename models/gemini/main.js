import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { readFileTool, listFilesTool, renameFileTool } from '../../tools.js';

// 加载环境变量
dotenv.config();

// 配置模型 - 使用 ChatGPT
const model = openai('gpt-4o'); // 或使用 'gpt-4-turbo', 'gpt-3.5-turbo'

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
    }
  }
}

// 启动应用
main();


