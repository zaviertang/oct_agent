#!/bin/bash
# 启动阿里云百炼版本

cd "$(dirname "$0")"

echo "🚀 启动阿里云百炼 AI Agent..."
echo ""

node models/bailian/main-bailian.js

