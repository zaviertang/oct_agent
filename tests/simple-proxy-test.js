/**
 * 最简单的方法：直接使用 OpenAI 原生 SDK + https-proxy-agent
 * 无需 Vercel AI SDK
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';

dotenv.config();

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890';

console.log('🧪 使用 OpenAI 原生 SDK 测试代理...\n');
console.log(`📡 代理地址: ${proxyUrl}`);
console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '已配置' : '❌ 未配置'}\n`);

try {
  // 创建代理agent
  const agent = new HttpsProxyAgent(proxyUrl);
  
  // 创建 OpenAI 客户端
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    httpAgent: agent
  });
  
  console.log('正在调用 OpenAI API...');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: '用中文说"你好"' }],
    max_tokens: 20
  });
  
  console.log('\n✅ 成功！');
  console.log('📝 AI 回复:', completion.choices[0].message.content);
  console.log('\n🎉 代理配置正确！');
  console.log('\n💡 现在您可以:');
  console.log('  1. 在 .env 文件添加: HTTPS_PROXY=http://127.0.0.1:7890');
  console.log('  2. 运行主程序（使用 OpenAI 原生版本）');
  
} catch (error) {
  console.error('\n❌ 失败:', error.message);
  console.error('\n💡 请检查:');
  console.error('  1. Clash/V2Ray 是否正在运行？');
  console.error('  2. 代理端口是否是 7890？');
  console.error('  3. 尝试: HTTPS_PROXY=http://127.0.0.1:端口号 node simple-proxy-test.js');
}


