import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'tests/e2e',
 fullyParallel:false,
 workers:1,
 timeout:45000,
 reporter:'list',
 use:{
  baseURL:process.env.E2E_BASE_URL||'http://127.0.0.1:3002',
  viewport:{width:1440,height:1000},
  launchOptions:{
   executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  },
  trace:'retain-on-failure'
 }
});
