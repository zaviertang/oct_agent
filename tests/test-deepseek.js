/**
 * 测试 DeepSeek API 连接
 */
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 测试 DeepSeek API...\n');

const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey || apiKey === 'sk-请替换成你的密钥') {
  console.error('❌ 未找到 API Key\n');
  console.error('📝 配置步骤:');
  console.error('1. 访问: https://platform.deepseek.com/');
  console.error('2. 注册账号（支持微信/手机号）');
  console.error('3. 进入"API Keys"页面，创建新的 Key');
  console.error('4. 在 .env 文件添加: DEEPSEEK_API_KEY=sk-xxx');
  console.error('\n💰 费用: 1元 = 500万 tokens（极便宜）\n');
  process.exit(1);
}

console.log(`✅ API Key 已配置: ${apiKey.substring(0, 15)}...`);

try {
  console.log('🔄 正在调用 API...\n');
  
  const deepseek = createOpenAICompatible({
    name: 'deepseek',
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: apiKey
  });

  const result = await generateText({
    model: deepseek('deepseek-chat'),
    prompt: '用一句话介绍你自己',
    maxTokens: 50
  });

  console.log('✅ 连接成功！');
  console.log('📝 AI 回复:', result.text);
  console.log('\n🎉 配置正确，可以正常使用！');
  console.log('▶️  运行主程序: node main-deepseek.js\n');

} catch (error) {
  console.error('\n❌ 连接失败:', error.message);
  console.error('\n💡 请检查:');
  console.error('1. API Key 是否正确');
  console.error('2. 网络连接是否正常');
  console.error('3. 账户是否有余额（最低充值1元）\n');
  
  if (error.cause) {
    console.error('详细错误:', error.cause);
  }
}

