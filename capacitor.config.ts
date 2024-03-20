import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sergeikrivko.gpt',
  appName: 'GPT-chat-mobile',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
