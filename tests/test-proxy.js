/**
 * 简单的代理测试脚本
 */
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

console.log('🧪 代理测试开始...\n');
console.log(`📡 代理设置: ${proxyUrl || '未设置（直连）'}`);
console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '已配置' : '❌ 未配置'}\n`);

try {
  console.log('正在调用 OpenAI API (gpt-3.5-turbo)...');
  
  const result = await generateText({
    model: openai('gpt-3.5-turbo'),
    prompt: '用中文说"你好"',
    maxTokens: 20
  });
  
  console.log('\n✅ 成功！');
  console.log('📝 AI 回复:', result.text);
  console.log('\n🎉 配置正确，可以正常使用！');
  
} catch (error) {
  console.error('\n❌ 失败:', error.message);
  console.error('\n💡 解决建议:');
  
  if (error.message.includes('Cannot connect')) {
    console.error('  1. 确保代理软件（Clash/V2Ray）正在运行');
    console.error('  2. 检查代理端口是否正确');
    console.error('  3. 尝试不同的端口:');
    console.error('     - HTTPS_PROXY=http://127.0.0.1:7890 node test-proxy.js   (Clash)');
    console.error('     - HTTPS_PROXY=http://127.0.0.1:10809 node test-proxy.js  (V2Ray)');
    console.error('     - HTTPS_PROXY=http://127.0.0.1:1087 node test-proxy.js   (SS)');
  } else if (error.message.includes('API key')) {
    console.error('  API Key 有问题，请检查 .env 文件');
  } else {
    console.error('  未知错误，详细信息:', error);
  }
}


