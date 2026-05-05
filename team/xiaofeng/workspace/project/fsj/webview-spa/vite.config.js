export default {
  server: {
    port: 3002,
    host: true,
    // 开发环境禁用缓存
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // 文件变化自动刷新
    watch: {
      usePolling: true
    }
  },
  build: {
    // 生产环境文件名加哈希，避免缓存
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: '[ext]/[name].[hash].[ext]'
      }
    }
  },
  // HTML 中注入版本号（替换 BUILD_VERSION 占位符）
  define: {
    'process.env.BUILD_VERSION': JSON.stringify(Date.now())
  },
  plugins: [{
    name: 'html-version',
    transformIndexHtml(html) {
      return html.replace(/BUILD_VERSION/g, Date.now());
    }
  }]
}
