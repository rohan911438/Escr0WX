#!/usr/bin/env node

/**
 * Production Readiness Checker for EscrowX Frontend
 * Validates configuration and environment before deployment
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  title: (msg) => console.log(`\n${COLORS.bold}${COLORS.blue}${msg}${COLORS.reset}`)
};

class ProductionChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Check if required environment variables are set
  checkEnvironmentVariables() {
    log.title('🔧 Checking Environment Variables');
    
    const required = [
      'VITE_ETHEREUM_RPC_URL',
      'VITE_CONTRACT_ADDRESS', 
      'VITE_CHAIN_ID',
      'VITE_API_URL',
      'VITE_SOLANA_PROGRAM_ID',
      'VITE_SOLANA_NETWORK'
    ];

    const optional = [
      'VITE_WALLETCONNECT_PROJECT_ID',
      'VITE_USDC_TOKEN_ADDRESS',
      'VITE_SOLANA_RPC_URL'
    ];

    // Check required variables
    required.forEach(varName => {
      if (process.env[varName]) {
        log.success(`${varName} is set`);
        
        // Additional validation
        if (varName === 'VITE_API_URL' && process.env[varName].includes('localhost')) {
          this.errors.push(`${varName} contains localhost - not suitable for production`);
        }
      } else {
        this.errors.push(`Required environment variable ${varName} is not set`);
      }
    });

    // Check optional variables
    optional.forEach(varName => {
      if (process.env[varName]) {
        log.success(`${varName} is set (optional)`);
      } else {
        this.warnings.push(`Optional environment variable ${varName} not set`);
      }
    });
  }

  // Check if build files exist and are valid
  checkBuildOutput() {
    log.title('📦 Checking Build Output');
    
    const distDir = path.join(__dirname, 'dist');
    const indexHtml = path.join(distDir, 'index.html');
    const assetsDir = path.join(distDir, 'assets');

    if (!fs.existsSync(distDir)) {
      this.errors.push('Build output directory (dist/) does not exist. Run "npm run build" first.');
      return;
    }

    if (!fs.existsSync(indexHtml)) {
      this.errors.push('index.html not found in build output');
    } else {
      log.success('index.html exists');
    }

    if (!fs.existsSync(assetsDir)) {
      this.errors.push('Assets directory not found in build output');
    } else {
      const assets = fs.readdirSync(assetsDir);
      const jsFiles = assets.filter(f => f.endsWith('.js'));
      const cssFiles = assets.filter(f => f.endsWith('.css'));
      
      if (jsFiles.length > 0) {
        log.success(`Found ${jsFiles.length} JavaScript files`);
      } else {
        this.errors.push('No JavaScript files found in build output');
      }
      
      if (cssFiles.length > 0) {
        log.success(`Found ${cssFiles.length} CSS files`);
      } else {
        this.warnings.push('No CSS files found in build output');
      }
    }
  }

  // Check configuration files
  checkConfigFiles() {
    log.title('⚙️  Checking Configuration Files');
    
    const files = [
      { path: 'netlify.toml', required: true },
      { path: '.env.example', required: true },
      { path: 'package.json', required: true },
      { path: 'vite.config.ts', required: true }
    ];

    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        log.success(`${file.path} exists`);
      } else if (file.required) {
        this.errors.push(`Required configuration file ${file.path} not found`);
      } else {
        this.warnings.push(`Optional file ${file.path} not found`);
      }
    });
  }

  // Check for common production issues
  checkProductionIssues() {
    log.title('🔍 Checking for Production Issues');
    
    // Check for test routes in production
    const appFile = path.join(__dirname, 'src', 'App.tsx');
    if (fs.existsSync(appFile)) {
      const content = fs.readFileSync(appFile, 'utf8');
      if (content.includes('/test') && !content.includes('import.meta.env.DEV')) {
        this.warnings.push('Test routes may be accessible in production build');
      } else {
        log.success('Test routes properly guarded for production');
      }
    }

    // Check package.json for production build script
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.build) {
      log.success('Build script found in package.json');
    } else {
      this.errors.push('No build script found in package.json');
    }
  }

  // Generate deployment checklist
  generateChecklist() {
    log.title('📋 Deployment Checklist');
    
    const checklist = [
      'Set all environment variables in Netlify dashboard',
      'Verify backend API is deployed and accessible',
      'Test wallet connections work on production domain',
      'Verify contract addresses are correct for Sepolia',
      'Ensure CORS is configured for your domain on backend',
      'Test network switching to Sepolia works',
      'Verify explorer links work correctly',  
      'Check error boundaries function properly',
      'Confirm all console.logs are removed from production'
    ];

    checklist.forEach((item, index) => {
      console.log(`${index + 1}. [ ] ${item}`);
    });
  }

  // Run all checks
  async run() {
    console.log(`${COLORS.bold}${COLORS.blue}🚀 EscrowX Frontend Production Readiness Check${COLORS.reset}\n`);
    
    this.checkEnvironmentVariables();
    this.checkBuildOutput();
    this.checkConfigFiles();
    this.checkProductionIssues();
    
    // Summary
    log.title('📊 Summary');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success(`All checks passed! Ready for production deployment.`);
    } else {
      if (this.errors.length > 0) {
        log.error(`Found ${this.errors.length} error(s):`);
        this.errors.forEach(error => console.log(`  • ${error}`));
      }
      
      if (this.warnings.length > 0) {
        log.warn(`Found ${this.warnings.length} warning(s):`);
        this.warnings.forEach(warning => console.log(`  • ${warning}`));
      }
    }
    
    this.generateChecklist();
    
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Run the checker
new ProductionChecker().run();