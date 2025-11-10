# Deployment Guide - FHE Multi-Choice Voting

Complete guide for deploying the FHE Multi-Choice Voting system to local and Sepolia testnet.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Verification](#verification)

## Prerequisites

### Required Tools

- Node.js >= 20
- npm >= 7.0.0
- Git

### Required Accounts & Keys

1. **Ethereum Wallet**
   - MetaMask or similar
   - Private key/mnemonic for deployment

2. **Infura Account** (for Sepolia)
   - Sign up at https://infura.io
   - Create new project
   - Get API key

3. **WalletConnect Project** (for frontend)
   - Sign up at https://cloud.walletconnect.com
   - Create project
   - Get Project ID

4. **Sepolia ETH** (for testnet)
   - Get from faucets:
     - https://sepoliafaucet.com
     - https://www.alchemy.com/faucets/ethereum-sepolia

## Local Deployment

### Step 1: Clone and Install

```bash
# Clone repository
cd private-poll

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment

```bash
# Setup Hardhat configuration
npx hardhat vars setup
```

Set variables:
- `MNEMONIC`: `test test test test test test test test test test test junk`
- `INFURA_API_KEY`: (press Enter to skip)
- `ETHERSCAN_API_KEY`: (press Enter to skip)

### Step 3: Start Local Node

```bash
# Terminal 1: Start Hardhat node
npx hardhat node
```

Keep this terminal running!

### Step 4: Deploy Contract

```bash
# Terminal 2: Deploy contract
npx hardhat deploy --network localhost
```

Expected output:
```
MultiChoiceVoting contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✨ Done in 2.34s.
```

### Step 5: Generate Frontend ABI

```bash
cd frontend
npm run genabi
```

This creates:
- `frontend/abi/MultiChoiceVotingABI.ts`
- `frontend/abi/MultiChoiceVotingAddresses.ts`

### Step 6: Start Frontend

```bash
# In frontend directory
npm run dev
```

Open http://localhost:3000

✅ **Local deployment complete!**

## Sepolia Testnet Deployment

### Step 1: Prepare Wallet

1. **Get Sepolia ETH**
   - Need ~0.1 ETH for deployment and testing
   - Use faucets listed in prerequisites

2. **Export Mnemonic/Private Key**
   - From MetaMask: Settings → Security & Privacy → Reveal Secret Recovery Phrase
   - Save securely (NEVER commit to Git!)

### Step 2: Configure Environment

```bash
# Set deployment mnemonic
npx hardhat vars set MNEMONIC "your twelve word mnemonic phrase here"

# Set Infura API key
npx hardhat vars set INFURA_API_KEY "your_infura_api_key"

# (Optional) Set Etherscan API key for verification
npx hardhat vars set ETHERSCAN_API_KEY "your_etherscan_key"
```

**Security Note**: These values are stored in `~/.hardhat/vars.json` and are NOT committed to Git.

### Step 3: Test Connection

```bash
# Check Sepolia connection
npx hardhat accounts --network sepolia
```

Should display your accounts.

### Step 4: Deploy to Sepolia

```bash
# Deploy contract
npm run deploy:sepolia
```

Expected output:
```
Deploying contracts with the account: 0xYourAddress
Account balance: 0.1 ETH
MultiChoiceVoting contract deployed at: 0xContractAddress
✨ Done
```

**Important**: Save the contract address!

### Step 5: Verify Contract (Optional)

```bash
# Verify on Etherscan
npx hardhat verify --network sepolia 0xContractAddress
```

### Step 6: Run Tests

```bash
# Test deployed contract
npm run test:sepolia
```

All tests should pass ✅

### Step 7: Update Frontend

```bash
cd frontend

# Regenerate ABI with Sepolia address
npm run genabi

# Build frontend
npm run build
```

### Step 8: Update WalletConnect Config

Edit `frontend/config/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: "FHE Multi-Choice Voting",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Update this!
  chains: [localhost, sepolia],
  ssr: true,
});
```

✅ **Sepolia deployment complete!**

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
cd frontend
vercel
```

Follow prompts:
- Set up new project: Yes
- Link to existing project: No
- Project name: fhe-voting
- Directory: ./
- Build command: `npm run build`
- Output directory: `.next`
- Development command: `npm run dev`

3. **Set Environment Variables**

```bash
# In Vercel dashboard
PROJECT_ID=your_walletconnect_project_id
```

4. **Deploy Production**

```bash
vercel --prod
```

Your site will be live at: `https://fhe-voting.vercel.app`

### Option 2: Netlify

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Build**

```bash
cd frontend
npm run build
```

3. **Deploy**

```bash
netlify deploy
```

Follow prompts and deploy the `.next` directory.

### Option 3: Self-Hosted

1. **Build**

```bash
cd frontend
npm run build
```

2. **Start Production Server**

```bash
npm start
```

3. **Use Process Manager (PM2)**

```bash
npm install -g pm2
pm2 start npm --name "fhe-voting" -- start
pm2 save
pm2 startup
```

### Option 4: Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY package*.json ./
RUN npm ci

# Copy frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy source
COPY . .

# Build contracts
RUN npm run compile

# Build frontend
RUN cd frontend && npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t fhe-voting .
docker run -p 3000:3000 fhe-voting
```

## Verification

### Contract Verification

1. **Check on Etherscan**
   - Go to https://sepolia.etherscan.io
   - Search for your contract address
   - Should see contract code and transactions

2. **Test Contract Functions**

```bash
# Create test poll
npx hardhat task:createPoll \
  --title "Test Poll" \
  --options "A,B,C" \
  --duration 3600 \
  --network sepolia

# Get poll info
npx hardhat task:getPollInfo --pollid 0 --network sepolia
```

### Frontend Verification

1. **Test Wallet Connection**
   - Open deployed site
   - Click "Connect Wallet"
   - Connect MetaMask to Sepolia
   - Verify address displays

2. **Test Poll Creation**
   - Click "Create New Poll"
   - Fill form
   - Submit transaction
   - Verify poll appears

3. **Test Voting**
   - Select a poll
   - Choose option
   - Cast vote
   - Verify vote recorded

4. **Test Results**
   - Wait for poll to end (or use short duration)
   - Click "Finalize"
   - View decrypted results

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract verified on Etherscan
- [ ] Tests pass on Sepolia
- [ ] Frontend deployed and accessible
- [ ] Wallet connects correctly
- [ ] Can create polls
- [ ] Can vote on polls
- [ ] Can finalize and view results
- [ ] Mobile responsive
- [ ] Logo and branding correct
- [ ] All links working

## Monitoring

### Contract Events

Monitor events on Etherscan:
- `PollCreated`
- `VoteCast`
- `FinalizationRequested`
- `PollFinalized`

### Frontend Analytics

Add analytics to `frontend/app/layout.tsx`:

```typescript
// Google Analytics
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
  `}
</Script>
```

## Troubleshooting

### Deployment Fails

**Error**: `insufficient funds`
- **Solution**: Get more Sepolia ETH from faucets

**Error**: `nonce too high`
- **Solution**: Reset MetaMask account

**Error**: `network timeout`
- **Solution**: Check Infura API key, try again

### Frontend Issues

**Error**: `Contract not deployed`
- **Solution**: Run `npm run genabi` after deployment

**Error**: `WalletConnect error`
- **Solution**: Check Project ID in `wagmi.ts`

**Error**: `Build fails`
- **Solution**: Check all dependencies installed

## Maintenance

### Updating Contract

1. Modify contract code
2. Increment version in comments
3. Deploy new contract
4. Update frontend ABI
5. Update contract address in docs

### Updating Frontend

1. Make changes
2. Test locally
3. Build: `npm run build`
4. Deploy: `vercel --prod`

## Security Considerations

### Contract Security

- ✅ Access control implemented
- ✅ Reentrancy protection (via fhEVM)
- ✅ Input validation
- ✅ Time locks on voting
- ✅ Single vote per address

### Frontend Security

- ✅ HTTPS only in production
- ✅ Input sanitization
- ✅ No private keys in code
- ✅ Environment variables for secrets
- ✅ Content Security Policy

### Best Practices

1. **Never commit secrets**
   - Use `.gitignore`
   - Use environment variables
   - Use Hardhat vars

2. **Test before mainnet**
   - Test extensively on Sepolia
   - Run security audits
   - Get community feedback

3. **Monitor deployment**
   - Watch contract events
   - Monitor gas usage
   - Track user activity

## Cost Estimates

### Sepolia Testnet

- Contract Deployment: ~0.02 ETH
- Create Poll: ~0.001 ETH
- Cast Vote: ~0.002 ETH
- Finalize Poll: ~0.003 ETH

### Ethereum Mainnet (Future)

Multiply Sepolia costs by 10-50x depending on gas prices.

## Support

For deployment issues:

1. Check logs in terminal
2. Review Etherscan transactions
3. Check browser console (F12)
4. Review documentation
5. Open GitHub issue

## Next Steps

After successful deployment:

1. Share with community
2. Gather feedback
3. Iterate on features
4. Optimize gas costs
5. Plan mainnet deployment

Congratulations on your deployment! 🚀

