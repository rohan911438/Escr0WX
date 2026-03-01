# EscrowX Frontend - Production Deployment Guide

## 🚀 Netlify Deployment Steps

### 1. Environment Variables Setup

Set these environment variables in your **Netlify dashboard** under `Site settings > Environment variables`:

```bash
# Required Environment Variables
VITE_ETHEREUM_RPC_URL=https://rpc.sepolia.org
VITE_CONTRACT_ADDRESS=0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615  
VITE_CHAIN_ID=11155111
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOLANA_PROGRAM_ID=6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj
VITE_SOLANA_NETWORK=devnet

# Optional Environment Variables
VITE_USDC_TOKEN_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_APP_NAME=EscrowX
VITE_APP_DESCRIPTION=Ethereum-native escrow protocol with Solana audit trail
VITE_APP_URL=https://your-netlify-domain.netlify.app
VITE_APP_ICON=/logo.png
```

### 2. Deploy to Netlify

#### Option A: Git Integration (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables from above
5. Deploy automatically on git push

#### Option B: Manual Deploy
1. Build locally: `npm run build`
2. Drag & drop the `dist/` folder to Netlify
3. Set environment variables in Netlify dashboard

### 3. DNS & Custom Domain (Optional)
1. Add your custom domain in Netlify
2. Update `VITE_APP_URL` to your custom domain
3. Set up SSL certificate (automatic with Netlify)

## ✅ Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Backend API URL updated to production
- [ ] Contract addresses verified on Sepolia
- [ ] WalletConnect project ID obtained
- [ ] Build passes without errors
- [ ] No localhost URLs in production bundle

### Post-Deployment  
- [ ] Application loads correctly
- [ ] Wallet connections work (MetaMask, Coinbase, etc.)
- [ ] Network switching to Sepolia works
- [ ] API calls reach backend successfully
- [ ] Contract interactions work on Sepolia
- [ ] Error boundaries trigger correctly
- [ ] Explorer links work (Etherscan, Solana Explorer)

### Security
- [ ] No private keys in frontend code
- [ ] Environment variables follow `VITE_` prefix convention
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Security headers configured (see netlify.toml)

## 🛠️ Backend CORS Configuration

Ensure your backend allows your Netlify domain:

```javascript
// Express.js example
app.use(cors({
  origin: [
    'https://your-netlify-domain.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## 📊 Performance Optimizations

### Implemented
- [x] Dynamic imports for test routes (dev only)
- [x] Error boundaries for graceful error handling  
- [x] Optimized chunk sizes
- [x] Static asset caching
- [x] Bundle analysis and tree shaking

### Monitoring
- Monitor Core Web Vitals in Netlify Analytics
- Set up error tracking (e.g., Sentry) 
- Monitor API response times
- Track wallet connection success rates

## 🔧 Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Runtime Errors
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Test network connectivity to backend API
4. Check wallet browser extension is installed

### Network Issues
1. Verify user is on Sepolia testnet
2. Check RPC endpoint availability
3. Test contract address on Etherscan
4. Verify WalletConnect project ID

## 📱 Browser Support

Supported browsers:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)