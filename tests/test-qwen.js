/**
 * 测试阿里云通义千问 API 连接
 */
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai-compatible';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 测试阿里云通义千问 API...\n');

const apiKey = process.env.DASHSCOPE_API_KEY;

if (!apiKey) {
  console.error('❌ 未找到 API Key');
  console.error('\n📝 配置步骤:');
  console.error('1. 访问: https://dashscope.console.aliyun.com/');
  console.error('2. 注册/登录阿里云账号');
  console.error('3. 进入"API-KEY管理"，创建新的 API Key');
  console.error('4. 在 .env 文件添加: DASHSCOPE_API_KEY=sk-xxx');
  process.exit(1);
}

console.log(`✅ API Key 已配置: ${apiKey.substring(0, 10)}...`);

try {
  console.log('🔄 正在调用 API...\n');
  
  const qwen = createOpenAI({
    name: 'qwen',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: apiKey,
    headers: {
      'X-DashScope-SSE': 'enable'
    }
  });

  const result = await generateText({
    model: qwen('qwen-turbo'),
    prompt: '用一句话介绍你自己',
    maxTokens: 100
  });

  console.log('✅ 连接成功！');
  console.log('📝 AI 回复:', result.text);
  console.log('\n🎉 配置正确，可以正常使用！');
  console.log('▶️  运行主程序: node main-qwen.js\n');

} catch (error) {
  console.error('\n❌ 连接失败:', error.message);
  console.error('\n💡 请检查:');
  console.error('1. API Key 是否正确');
  console.error('2. 是否有网络连接');
  console.error('3. 阿里云账号是否有余额/免费额度');
  
  if (error.cause) {
    console.error('\n详细错误:', error.cause);
  }
}

