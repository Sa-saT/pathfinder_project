import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/style.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@nuxt/test-utils', '@nuxt/ui', '@pinia/nuxt'],
  
  // 環境変数の設定
  runtimeConfig: {
    // サーバーサイドでのみ利用可能
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN,
    
    // クライアントサイドでも利用可能
    public: {
      nodeEnv: process.env.NODE_ENV
    }
  },
  
  // content: {
  // },
});