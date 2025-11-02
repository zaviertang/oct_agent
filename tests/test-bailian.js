/**
 * 测试阿里云百炼平台 API 连接
 */
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 测试阿里云百炼平台 API...\n');

const apiKey = process.env.BAILIAN_API_KEY || process.env.DASHSCOPE_API_KEY;

if (!apiKey || apiKey === 'sk-请替换成你的密钥') {
  console.error('❌ 未找到 API Key\n');
  console.error('📝 配置步骤:');
  console.error('1. 访问: https://bailian.console.aliyun.com/');
  console.error('2. 登录阿里云账号');
  console.error('3. 获取 API Key');
  console.error('4. 在 .env 文件添加: BAILIAN_API_KEY=sk-xxx\n');
  process.exit(1);
}

console.log(`✅ API Key 已配置: ${apiKey.substring(0, 15)}...`);

try {
  console.log('🔄 正在调用 API...\n');
  
  const bailian = createOpenAICompatible({
    name: 'bailian',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: apiKey
  });

  const result = await generateText({
    model: bailian('qwen-turbo'),
    prompt: '香港今天的天气如何',
    maxTokens: 100
  });

  console.log('✅ 连接成功！');
  console.log('📝 AI 回复:', result.text);
  console.log('\n🎉 配置正确，可以正常使用！');
  console.log('▶️  运行主程序: node main-bailian.js\n');

} catch (error) {
  console.error('\n❌ 连接失败:', error.message);
  console.error('\n💡 请检查:');
  console.error('1. API Key 是否正确');
  console.error('2. 是否有网络连接');
  console.error('3. 百炼平台是否已开通服务');
  console.error('4. 账号是否有余额/免费额度\n');
  
  if (error.cause) {
    console.error('详细错误:', error.cause);
  }
}

