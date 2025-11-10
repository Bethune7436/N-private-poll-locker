# FHE 多选投票系统

基于Zama fhEVM技术构建的隐私保护投票平台，使用全同态加密（FHE）技术。

## 🎯 核心特性

- **完全加密投票**: 所有投票使用FHE技术加密，确保完全隐私
- **多选投票**: 创建2-16个选项的投票
- **透明结果**: 最终化后密码学验证的结果
- **用户友好界面**: 现代化、响应式UI，集成Rainbow Kit钱包
- **端到端加密**: 数据加密、解密闭环，与智能合约完全集成

## 🛠️ 技术栈

### 后端
- **Solidity**: 使用fhEVM的智能合约
- **Hardhat**: 开发环境
- **TypeScript**: 测试和部署脚本

### 前端
- **Next.js 15**: React框架（App Router）
- **Rainbow Kit**: 钱包连接（位于右上角）
- **Wagmi**: 以太坊交互
- **Tailwind CSS**: 样式设计
- **Zama Relayer SDK**: FHE操作

## 📁 项目结构

```
private-poll/
├── contracts/              # Solidity智能合约
│   └── MultiChoiceVoting.sol
├── test/                   # 测试文件
│   ├── MultiChoiceVoting.ts         # 本地测试
│   └── MultiChoiceVotingSepolia.ts  # Sepolia测试
├── deploy/                 # 部署脚本
│   └── deploy.ts
├── tasks/                  # Hardhat任务
│   ├── accounts.ts
│   └── MultiChoiceVoting.ts
├── frontend/               # Next.js前端
│   ├── app/               # App路由页面
│   ├── components/        # React组件
│   ├── hooks/             # 自定义Hooks
│   ├── config/            # 配置文件
│   ├── public/            # 静态资源（Logo、Favicon）
│   └── abi/               # 合约ABI（自动生成）
└── hardhat.config.ts      # Hardhat配置
```

## 🚀 快速开始

### 前置要求

- Node.js >= 20
- npm >= 7.0.0
- MetaMask或兼容的Web3钱包

### 安装步骤

1. **安装后端依赖:**
```bash
cd private-poll
npm install
```

2. **安装前端依赖:**
```bash
cd frontend
npm install
```

### 配置

1. **配置Hardhat:**
```bash
npx hardhat vars setup
```

设置以下变量:
- `MNEMONIC`: 你的钱包助记词（本地测试用: `test test test test test test test test test test test junk`）
- `INFURA_API_KEY`: Sepolia的Infura API密钥
- `ETHERSCAN_API_KEY`: （可选）用于合约验证

2. **更新WalletConnect项目ID:**

编辑 `frontend/config/wagmi.ts`:
```typescript
projectId: "YOUR_PROJECT_ID", // 从 https://cloud.walletconnect.com 获取
```

### 本地开发

1. **启动本地Hardhat节点:**
```bash
npx hardhat node
```

2. **部署合约（另一个终端）:**
```bash
npx hardhat deploy --network localhost
```

3. **生成ABI并启动前端:**
```bash
cd frontend
npm run dev
```

4. **打开浏览器:**
访问 `http://localhost:3000`

### 测试

**运行本地测试:**
```bash
npm test
```

**运行Sepolia测试:**
```bash
npm run test:sepolia
```

## 📖 使用说明

### 创建投票

1. 点击右上角按钮连接钱包
2. 点击"+ Create New Poll"
3. 输入投票标题和选项（2-16个选项）
4. 选择投票持续时间
5. 提交交易创建投票

### 投票

1. 浏览活跃的投票
2. 选择你的选项（本地加密）
3. 点击"Cast Vote"提交加密投票
4. 你的投票会被记录在链上但保持隐私

### 查看结果

1. 投票期结束后，任何人都可以请求最终化
2. 点击"Finalize Poll"触发解密
3. 解密预言机处理加密投票
4. 点击"Show Results"查看最终投票统计

## 🔒 智能合约

### MultiChoiceVoting.sol

主要合约函数:

- `createPoll(title, options, startTime, endTime)`: 创建新投票
- `vote(pollId, encryptedOptionIndex, inputProof)`: 投出加密投票
- `requestFinalization(pollId)`: 请求结果解密
- `getPollInfo(pollId)`: 获取投票信息
- `getResults(pollId)`: 获取解密结果（最终化后）
- `hasUserVoted(pollId, user)`: 检查用户是否已投票

## 🔐 安全特性

- **FHE加密**: 投票在链上加密并同态计算
- **单次投票**: 每个地址在每个投票中只能投票一次
- **可验证结果**: KMS签名验证解密的真实性
- **时间锁定**: 投票有明确的投票期限

## 💻 Hardhat任务

```bash
# 创建投票
npx hardhat task:createPoll --title "测试投票" --options "A,B,C" --duration 3600 --network localhost

# 获取投票信息
npx hardhat task:getPollInfo --pollid 0 --network localhost

# 获取投票总数
npx hardhat task:getPollCount --network localhost

# 请求最终化
npx hardhat task:requestFinalization --pollid 0 --network localhost

# 获取结果
npx hardhat task:getResults --pollid 0 --network localhost
```

## 📝 业务流程

### 数据流程（完整闭环）

1. **创建投票** → 用户创建投票，设置选项和时间
2. **投票提交** → 用户选择选项，前端加密 → 提交到合约
3. **加密计数** → 合约在加密状态下累计每个选项的票数
4. **请求解密** → 投票结束后，任何人可请求解密
5. **结果公开** → 解密预言机处理并返回明文结果
6. **查看结果** → 用户查看每个选项的最终票数和排名

### MVP功能清单

✅ **数据提交**: 创建投票、投出加密投票
✅ **数据查看**: 查看投票列表、投票详情、投票状态
✅ **数据解密**: 请求最终化、查看解密结果
✅ **完整闭环**: 从加密提交到解密查看的完整流程
✅ **合约集成**: 所有数据从合约读取和操作
✅ **无多余功能**: 仅包含核心业务功能，无开发调试组件

## 🎨 UI设计

- ✅ 专属Logo和Favicon（蓝紫渐变锁+对勾图标）
- ✅ Rainbow Kit钱包连接（右上角）
- ✅ 现代化卡片式设计
- ✅ 响应式布局（支持移动端）
- ✅ 深色主题配色
- ✅ 动态进度条（结果展示）
- ✅ 状态徽章（活跃/结束/已最终化）

## 📚 文档

- [README.md](./README.md) - 英文完整文档
- [README_CN.md](./README_CN.md) - 中文说明文档（本文档）
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 详细测试指南
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南

## 🧪 测试清单

### 合约测试

- ✅ 部署合约成功
- ✅ 创建有效参数的投票
- ✅ 拒绝无效参数（空标题、<2选项）
- ✅ 投出加密投票
- ✅ 防止重复投票
- ✅ 加密状态下正确计数
- ✅ 最终化投票并解密结果

### 前端测试

- ✅ 使用Rainbow Kit连接钱包
- ✅ 显示钱包地址
- ✅ 显示正确网络
- ✅ 创建投票表单验证
- ✅ 提交投票创建交易
- ✅ 显示投票列表
- ✅ 本地加密投票后提交
- ✅ 显示投票状态
- ✅ 请求最终化
- ✅ 显示解密结果和百分比
- ✅ 移动端响应式设计

## 🔄 开发流程

### 开发环境

1. 启动本地节点: `npx hardhat node`
2. 部署合约: `npx hardhat deploy --network localhost`
3. 运行测试: `npm test`
4. 启动前端: `cd frontend && npm run dev`

### 测试环境（Sepolia）

1. 配置Sepolia: `npx hardhat vars set MNEMONIC "..."`
2. 获取测试币: https://sepoliafaucet.com
3. 部署到Sepolia: `npm run deploy:sepolia`
4. 运行Sepolia测试: `npm run test:sepolia`

### 生产部署

1. 审计合约代码
2. 部署到主网
3. 验证合约: `npx hardhat verify --network mainnet <地址>`
4. 部署前端到Vercel/Netlify

## 🐛 常见问题

### 钱包连接失败

- 确保MetaMask已添加本地网络
- 检查Chain ID是否为`31337`
- 尝试重置MetaMask账户

### 交易失败

- 检查Hardhat节点是否运行
- 确保账户有足够ETH
- 尝试手动增加gas limit

### 合约未找到

```bash
# 重新部署合约
npx hardhat deploy --network localhost --reset

# 重新生成ABI
cd frontend && npm run genabi
```

## 📊 性能指标

本地网络预期交易时间:

- 创建投票: ~2秒
- 投票: ~3秒（包含FHE加密）
- 请求最终化: ~2秒
- 解密回调: ~10-30秒

## 🎯 验收标准

✅ **后端**
- 合约部署成功
- 所有测试通过
- 支持本地和Sepolia网络

✅ **前端**
- Rainbow Kit钱包连接（右上角）
- 完整的投票创建、投票、查看流程
- 数据加密、解密闭环
- 所有数据从合约读取
- 专属Logo和Favicon
- 响应式设计

✅ **业务流程**
- 创建投票 → 投票 → 最终化 → 查看结果
- 完整的MVP功能
- 无多余开发调试组件

## 🔗 参考资源

- [Zama fhEVM文档](https://docs.zama.ai/fhevm)
- [Rainbow Kit文档](https://www.rainbowkit.com/)
- [Hardhat文档](https://hardhat.org/)
- [Next.js文档](https://nextjs.org/)

## 📄 许可证

BSD-3-Clause-Clear

## 👥 支持

如有问题，请在GitHub上提交issue。

---

**注意**: 所有代码和文档均使用英文编写，本README_CN.md仅供中文使用者参考。

