import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'GPT-chat-mobile',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
