import { Injectable } from '@angular/core';
import { AdMobFree } from '@ionic-native/admob-free/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { bannerConfigAndroid, interstitialConfigAndroid } from '../../environments/environment';

@Injectable()
export class AdMobService {
    constructor(
        private adMobFree: AdMobFree,
        private storage: NativeStorage
    ) { }

    // 显示banner广告,可定制上下显示
    async bannerAdShow(position?) {
        if (position === 'bottom' || !position) {
            bannerConfigAndroid.bannerAtTop = false;
            console.log('banner show bottom');
        } else {
            bannerConfigAndroid.bannerAtTop = true;
        }
        try {
            this.adMobFree.banner.config(bannerConfigAndroid);
            await this.adMobFree.banner.prepare();
            await this.adMobFree.banner.show();
        } catch (e) {
            console.log('adMobBannerShow err', e);
        }
    }

    async closeBannerAd() {
        try {
            await this.adMobFree.banner.remove();
        } catch (e) {
            console.log('hide banner is err', e);
        }
    }

    // 显示弹窗广告
    async interstitialAdShow() {
        const showNum = await this.storage.getItem('adClickNum');
        console.log('show num', showNum);
        const numPlus = showNum + 1;
        console.log('num plus', numPlus);
        if (numPlus > 10) {
            await this.storage.setItem('adClickNum', 0);
        } else {
            await this.storage.setItem('adClickNum', numPlus);
        }
        try {
            // 当前adclickNum记录为0 3 5 10的时候显示广告
            if (showNum === 0 || showNum === 3 || showNum === 5 || showNum === 10) {
                this.adMobFree.interstitial.config(interstitialConfigAndroid);
                await this.adMobFree.interstitial.prepare();
                await this.adMobFree.interstitial.show();
            }
        } catch (e) {
            console.log('interstitialAdShow is err', e);
        }
    }

}
