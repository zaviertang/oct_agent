/**
 * 使用 undici ProxyAgent 的代理测试
 */
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { ProxyAgent } from 'node:undici';

dotenv.config();

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890';

console.log('🧪 代理测试 (使用 undici ProxyAgent)...\n');
console.log(`📡 代理地址: ${proxyUrl}`);
console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '已配置' : '❌ 未配置'}\n`);

try {
  // 创建代理 agent
  const proxyAgent = new ProxyAgent(proxyUrl);
  
  // 创建自定义 fetch
  const customFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      dispatcher: proxyAgent
    });
  };
  
  console.log('正在调用 OpenAI API...');
  
  const result = await generateText({
    model: openai('gpt-3.5-turbo', { fetch: customFetch }),
    prompt: '用中文说"你好"',
    maxTokens: 20
  });
  
  console.log('\n✅ 成功！');
  console.log('📝 AI 回复:', result.text);
  console.log('\n🎉 代理配置正确，可以正常使用了！');
  console.log('\n▶️  运行主程序: node main-proxy-fixed.js');
  
} catch (error) {
  console.error('\n❌ 失败:', error.message);
  console.error('\n💡 请检查:');
  console.error('  1. Clash/V2Ray 是否正在运行？');
  console.error('  2. 代理端口是否是 7890？');
  console.error('  3. 尝试手动指定端口:');
  console.error('     HTTPS_PROXY=http://127.0.0.1:端口号 node test-proxy-fixed.js');
}

