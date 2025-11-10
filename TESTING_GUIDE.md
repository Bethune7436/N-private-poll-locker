# Testing Guide - FHE Multi-Choice Voting

This guide walks through the complete testing process for the FHE Multi-Choice Voting system.

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- MetaMask wallet extension

## Setup Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd private-poll
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Setup Hardhat variables
npx hardhat vars setup
```

When prompted, set:
- **MNEMONIC**: `test test test test test test test test test test test junk` (for local testing)
- **INFURA_API_KEY**: Press Enter to skip (not needed for local testing)
- **ETHERSCAN_API_KEY**: Press Enter to skip (not needed for local testing)

### 3. Update WalletConnect Project ID

Edit `frontend/config/wagmi.ts`:

```typescript
projectId: "YOUR_PROJECT_ID", // Get from https://cloud.walletconnect.com
```

To get a project ID:
1. Go to https://cloud.walletconnect.com
2. Sign up/Login
3. Create a new project
4. Copy the Project ID

## Local Testing (Complete Flow)

### Step 1: Start Local Hardhat Node

Open Terminal 1:

```bash
npx hardhat node
```

This will:
- Start a local Ethereum node on http://localhost:8545
- Display 20 test accounts with private keys
- Keep running (don't close this terminal)

**Important**: Copy the first account's private key for MetaMask import.

### Step 2: Deploy Smart Contracts

Open Terminal 2 (keep Terminal 1 running):

```bash
npx hardhat deploy --network localhost
```

Expected output:
```
✅ MultiChoiceVoting contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Note**: The deployment address will be automatically used by the frontend.

### Step 3: Run Contract Tests

Still in Terminal 2:

```bash
npm test
```

This tests:
- Poll creation
- Encrypted voting
- Vote counting
- Double voting prevention
- Result finalization

All tests should pass ✅

### Step 4: Setup MetaMask

1. Open MetaMask extension
2. Add Localhost network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. Import test account:
   - Click account icon → Import Account
   - Paste private key from Step 1
   - You should see ~10000 ETH

### Step 5: Start Frontend

Still in Terminal 2:

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:3000

### Step 6: Test Complete User Flow

#### A. Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet" (top-right)
3. Select MetaMask
4. Approve connection
5. You should see your address displayed

#### B. Create a Poll

1. Click "+ Create New Poll"
2. Fill in:
   - **Title**: "Favorite Programming Language"
   - **Option 1**: "JavaScript"
   - **Option 2**: "Python"
   - **Option 3**: "Rust"
   - **Duration**: 1 Hour
3. Click "Create Poll"
4. Approve transaction in MetaMask
5. Wait for confirmation
6. Poll should appear in the list

#### C. Vote on Poll

1. Find your created poll
2. Select an option (e.g., "Python")
3. Click "Cast Vote"
4. Approve transaction in MetaMask
5. Wait for confirmation
6. You should see "✓ Voted" status
7. Note: Your vote is encrypted!

#### D. Test Double Voting Prevention

1. Try to vote again on the same poll
2. You should see the poll shows "✓ Voted"
3. Voting button should be disabled

#### E. Vote with Multiple Accounts

1. Import another account from Terminal 1
2. Switch to new account in MetaMask
3. Vote on the same poll
4. Repeat with 2-3 more accounts

#### F. Finalize Poll (Decrypt Results)

**Option 1: Wait for poll to end**
- Wait 1 hour (or modify contract with shorter duration)

**Option 2: Fast-forward time (Recommended for testing)**

In Terminal 2:

```bash
# Exit frontend (Ctrl+C)
cd ..

# Fast-forward 2 hours
npx hardhat task:fastForward --hours 2 --network localhost
```

Then restart frontend:

```bash
cd frontend
npm run dev
```

#### G. Request Finalization

1. Find the ended poll
2. Click "Finalize Poll"
3. Approve transaction
4. Wait for decryption (may take 10-30 seconds)
5. Poll status changes to "Finalized"

#### H. View Results

1. Click "Show Results"
2. See vote counts for each option
3. See percentage bars
4. Results should match your test votes!

## Test Scenarios Checklist

### ✅ Contract Functionality

- [ ] Deploy contract successfully
- [ ] Create poll with valid parameters
- [ ] Reject poll with invalid parameters (empty title, <2 options)
- [ ] Cast encrypted vote
- [ ] Prevent double voting
- [ ] Count votes correctly in encrypted form
- [ ] Finalize poll and decrypt results
- [ ] View decrypted results

### ✅ Frontend Functionality

- [ ] Connect wallet with Rainbow Kit
- [ ] Display wallet address
- [ ] Show correct network (Localhost/Sepolia)
- [ ] Create poll form validation
- [ ] Submit poll creation transaction
- [ ] Display poll list with correct data
- [ ] Show poll status (Active/Ended/Finalized)
- [ ] Encrypt vote locally before submission
- [ ] Submit encrypted vote transaction
- [ ] Display voting status
- [ ] Prevent UI for double voting
- [ ] Request finalization for ended polls
- [ ] Display decrypted results with percentages
- [ ] Responsive design on mobile

### ✅ Privacy & Security

- [ ] Votes are encrypted before submission
- [ ] Contract stores only encrypted votes
- [ ] Individual votes cannot be read before finalization
- [ ] Only aggregated results revealed after finalization
- [ ] Each address can vote only once per poll
- [ ] Finalization requires voting period to end

## Troubleshooting

### Problem: MetaMask not connecting

**Solution**:
- Ensure localhost network is added to MetaMask
- Check Chain ID is `31337`
- Try resetting MetaMask account (Settings → Advanced → Reset Account)

### Problem: Transaction fails

**Solution**:
- Check Hardhat node is still running (Terminal 1)
- Ensure you have ETH in your account
- Try increasing gas limit manually in MetaMask

### Problem: Contract not found

**Solution**:
```bash
# Redeploy contract
npx hardhat deploy --network localhost --reset

# Regenerate frontend ABI
cd frontend
npm run genabi
```

### Problem: FHEVM not ready

**Solution**:
- Wait a few seconds after connecting wallet
- Refresh the page
- Check browser console for errors

### Problem: Decryption takes too long

**Solution**:
- Local decryption oracle may be slow in mock mode
- Wait up to 60 seconds
- Check Hardhat node logs for errors

## Testing on Sepolia Testnet

### Prerequisites

- Sepolia ETH (get from faucet)
- Infura API key
- WalletConnect Project ID

### Steps

1. **Configure environment:**

```bash
npx hardhat vars set MNEMONIC "your twelve word mnemonic here"
npx hardhat vars set INFURA_API_KEY "your_infura_key"
```

2. **Deploy to Sepolia:**

```bash
npm run deploy:sepolia
```

3. **Run Sepolia tests:**

```bash
npm run test:sepolia
```

4. **Update frontend config:**

The deployment script automatically updates contract addresses.

5. **Test frontend:**

```bash
cd frontend
npm run build
npm start
```

Connect MetaMask to Sepolia and test the flow!

## Performance Benchmarks

Expected transaction times on local network:

- Create Poll: ~2 seconds
- Cast Vote: ~3 seconds (includes FHE encryption)
- Request Finalization: ~2 seconds
- Decryption Callback: ~10-30 seconds

## Next Steps

After successful local testing:

1. Deploy to Sepolia testnet
2. Test with real users
3. Optimize gas costs
4. Add more features (multi-choice voting, ranked choice, etc.)
5. Deploy to mainnet

## Support

If you encounter issues:

1. Check Hardhat node logs (Terminal 1)
2. Check browser console (F12)
3. Review contract events in Hardhat logs
4. Open an issue on GitHub

## Success Criteria

✅ Your testing is complete when:

1. All contract tests pass
2. Frontend connects to wallet
3. Polls can be created
4. Encrypted votes can be cast
5. Results can be finalized and decrypted
6. UI displays correct data at all stages
7. Privacy is maintained (votes are encrypted)

Congratulations! You've successfully tested the FHE Multi-Choice Voting system! 🎉

