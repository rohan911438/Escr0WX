# 🚀 Solana Playground Deployment Steps

## ❌ Current Issue
**Error**: "Attempt to load a program that does not exist"

**Solution**: The program needs to be built and deployed first!

## ✅ Step-by-Step Fix

### 1. **Build the Program**
```bash
anchor build
```
**Expected Output**:
```
Building...
Build successful. Completed in X.XXs.
```

### 2. **Deploy the Program**
```bash
anchor deploy
```
**Expected Output**:
```
Deploying...
Deploy successful. Program ID: [YOUR_PROGRAM_ID]
```

### 3. **Run Tests**
```bash
anchor test
```
**Expected Output**:
```
✅ EscrowX Audit Ledger
  ✅ Should write a lifecycle record
  ✅ Should write a dispute record  
  ✅ Should validate input lengths

3 passing
```

## 🔧 Alternative: Use Client Script

If you prefer interactive testing:

1. **Use the client script**: Copy [playground-client.js](playground-client.js) content
2. **Run**: Click "Run" button  
3. **Test**: Use `runDemo()` or `quickTest()` in console

## 💡 Common Issues

### Issue: "Program that does not exist"
- **Cause**: Program not deployed
- **Fix**: Run `anchor build` then `anchor deploy`

### Issue: "Insufficient funds"  
- **Cause**: Low SOL balance
- **Fix**: `solana airdrop 2` or use Playground's airdrop

### Issue: "Account already exists"
- **Cause**: Reusing same account keypair
- **Fix**: Tests generate new keypairs automatically

## 🎯 Quick Commands

| Action | Command |
|--------|---------|
| **Build** | `anchor build` |
| **Deploy** | `anchor deploy` |
| **Test** | `anchor test` |
| **Airdrop** | `solana airdrop 2` |

Once you complete steps 1-2, your tests will pass! 🚀