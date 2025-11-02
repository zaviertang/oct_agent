import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { readFileTool, listFilesTool, renameFileTool } from '../../tools.js';

// 加载环境变量
dotenv.config();

// 配置 DeepSeek 模型
const deepseek = createOpenAICompatible({
  name: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || 'your_api_key_here'
});

// 选择模型
// deepseek-chat: 通用对话模型
// deepseek-coder: 代码专用模型（推荐用于编程任务）
const model = deepseek('deepseek-chat');

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

  console.log('🤖 DeepSeek AI Agent 已启动');
  console.log('📁 工作目录: ./test');
  console.log('🛠️  可用工具: 读取文件、列出文件、重命名文件');
  console.log('💡 输入 exit 退出\n');

  // 交互循环
  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question('你: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      console.log('👋 再见！');
      rl.close();
      break;
    }

    if (!userInput.trim()) {
      continue;
    }

    try {
      console.log('🤔 思考中...\n');
      
      // 调用 AI 模型
      const result = await generateText({
        model,
        tools,
        maxSteps: 5,
        system: 'You are an experienced programmer with file operation capabilities. Always respond in Chinese.',
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
      console.log(`AI: ${result.text}\n`);

      // 限制历史长度
      if (history.length > 20) {
        history.splice(0, 2);
      }

    } catch (error) {
      console.error('\n❌ 错误:', error.message);
      
      if (error.message.includes('Invalid API Key') || error.message.includes('401')) {
        console.error('\n💡 请配置 API Key:');
        console.error('   1. 访问: https://platform.deepseek.com/');
        console.error('   2. 注册并创建 API Key');
        console.error('   3. 在 .env 文件添加: DEEPSEEK_API_KEY=sk-xxx\n');
      }
    }
  }
}

// 启动应用
main();

