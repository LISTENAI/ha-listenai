import { defineConfig } from 'vite';
import { exec } from 'child_process';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
const inputFiles = {};
fs.readdirSync('src').forEach((file) => {
  if (file.endsWith('.ts')) {
    const name = file.replace('.ts', '');
    inputFiles[name] = resolve(__dirname, 'src', file);
  }
});
export default defineConfig({
  resolve: {
    extensions: ['.js', '.ts'],
  },
  plugins: [
    {
      name: 'auto-build-on-ts-change',
      configureServer(server) {
        // 利用 Vite 内置的 watcher
        server.watcher.on('change', (file) => {
          // 只对 src 下的 .ts 文件触发 rebuild
          if (
            file.startsWith(path.resolve(__dirname, 'src') + path.sep) &&
            file.endsWith('.ts')
          ) {
            console.log(`${file} changed, running vite build...`);
            exec('vite build', { stdio: 'inherit' });
          }
        });
      },
    },
  ],
  base: './',
  build: {
    outDir: '../custom_components/listenai_brain/panel',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        // 忽略所有 HA 前端路径
        /^\/frontend_latest/,
        /^home-assistant-frontend/,
      ],
      input: inputFiles,
      output: {
        entryFileNames: '[name].js', // 保留原始文件名
        format: 'es',
      },
      rollupOptionsPreserveEntrySignatures: 'strict',
      manifest: false,
    },
  },
});
