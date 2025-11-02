/**
 * OpenAI 连接诊断脚本
 */
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 OpenAI 连接诊断开始...\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量:');
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OPENAI_API_KEY 未设置');
  process.exit(1);
} else {
  console.log(`✅ API Key 已设置 (${apiKey.substring(0, 10)}...)`);
}

// 2. 检查网络连接
console.log('\n2️⃣ 检查网络连接:');
try {
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  
  if (response.ok) {
    console.log('✅ 成功连接到 OpenAI API');
    const data = await response.json();
    console.log(`📊 可用模型数量: ${data.data.length}`);
  } else {
    console.error(`❌ API 返回错误: ${response.status} ${response.statusText}`);
    const errorData = await response.text();
    console.error('错误详情:', errorData);
  }
} catch (error) {
  console.error('❌ 网络连接失败:', error.message);
  console.error('\n可能的原因:');
  console.error('  1. 没有网络连接');
  console.error('  2. 需要设置代理（中国大陆用户）');
  console.error('  3. 防火墙阻止了连接');
  console.error('  4. OpenAI API 服务暂时不可用');
}

// 3. 测试 Vercel AI SDK
console.log('\n3️⃣ 测试 Vercel AI SDK:');
try {
  const { generateText } = await import('ai');
  const { openai } = await import('@ai-sdk/openai');
  
  console.log('正在调用 AI 模型...');
  const result = await generateText({
    model: openai('gpt-3.5-turbo'), // 使用更便宜的模型测试
    prompt: '说"你好"',
    maxTokens: 10
  });
  
  console.log('✅ Vercel AI SDK 工作正常');
  console.log('📝 AI 回复:', result.text);
} catch (error) {
  console.error('❌ Vercel AI SDK 测试失败:', error.message);
  if (error.cause) {
    console.error('原因:', error.cause);
  }
}

console.log('\n✨ 诊断完成');


