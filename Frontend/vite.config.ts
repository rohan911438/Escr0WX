import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Development server configuration
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  // Production build optimization
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],  
          'web3-vendor': ['wagmi', 'viem', 'ethers'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks  
          'wallet': ['@web3modal/wagmi', '@web3modal/react'],
          'charts': ['recharts'],
          'forms': ['react-hook-form', '@hookform/resolvers'],
        },
        
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '') 
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Environment variable prefix
  envPrefix: 'VITE_',
  
  // Optimized dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'ethers',
      'wagmi',
      'viem'
    ],
  },
  
  // ESbuild options
  esbuild: {
    // Remove console.logs in production  
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
