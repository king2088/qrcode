import { AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free/ngx';

export const environment = {
    production: false
};

export const bannerConfigAndroid: AdMobFreeBannerConfig = {
    id: '',
    isTesting: true,
    autoShow: true,
    bannerAtTop: false,
};
export const interstitialConfigAndroid: AdMobFreeInterstitialConfig = {
    id: '',
    isTesting: true,
    autoShow: true
};
