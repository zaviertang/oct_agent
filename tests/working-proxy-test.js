/**
 * 正确的 OpenAI SDK 代理配置
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

dotenv.config();

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890';

console.log('🧪 测试正确的代理配置...\n');
console.log(`📡 代理地址: ${proxyUrl}`);
console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '已配置' : '❌ 未配置'}\n`);

try {
  // 创建代理agent
  const agent = new HttpsProxyAgent(proxyUrl);
  
  // 创建自定义 fetch 函数
  const proxyFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      agent
    });
  };
  
  // 创建 OpenAI 客户端
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: proxyFetch  // 使用自定义 fetch
  });
  
  console.log('正在调用 OpenAI API...');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: '用中文说"你好"' }],
    max_tokens: 20
  });
  
  console.log('\n✅ 成功！');
  console.log('📝 AI 回复:', completion.choices[0].message.content);
  console.log('\n🎉 代理配置正确，可以正常使用了！');
  
} catch (error) {
  console.error('\n❌ 失败:', error.message);
  if (error.cause) {
    console.error('原因:', error.cause.message);
  }
}


