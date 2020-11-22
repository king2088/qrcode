import { AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free/ngx';

export const environment = {
    production: true
};

export const bannerConfigAndroid: AdMobFreeBannerConfig = {
    id: 'ca-app-pub-8243351208300995/1636095274',
    isTesting: false,
    autoShow: true,
    bannerAtTop: false,
};

export const interstitialConfigAndroid: AdMobFreeInterstitialConfig = {
    id: 'ca-app-pub-8243351208300995/3144618069',
    isTesting: false,
    autoShow: true
};
