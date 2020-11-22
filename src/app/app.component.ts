import { TranslateService } from '@ngx-translate/core';
import { Utils } from './services/utils.service';
import { Component } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Location } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public storage: NativeStorage,
        private location: Location,
        private alertController: AlertController,
        private utils: Utils,
        private translate: TranslateService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // this.statusBar.styleDefault();
            this.statusBar.backgroundColorByHexString('#3880ff');
            this.splashScreen.hide();
            this.hardwareBackButton();
            this.initStorage();
        });
        this.setLocalLang();
    }

    initStorage() {
        this.storage.getItem('deHistory').then(res => {
            console.log('get deHistory success');
        }, error => {
            this.storage.setItem('deHistory', []).then(() => {
                console.log('create history success');
            }, err => {
                console.log('create de history err', err);
            });
        });
        this.storage.getItem('genHistory').then(res => {
            console.log('get genHistory success');
        }, error => {
            this.storage.setItem('genHistory', []).then(() => {
                console.log('create gen code history');
            }, err => {
                console.log('create gen code history err', err);
            });
        });
        this.storage.getItem('adClickNum').then(res => {

        }, error => {
            this.storage.setItem('adClickNum', 0).then(() => {
                console.log('ad click num storage create success');
            }, err => {
                console.log('ad click num storage create error');
            });
        });
    }

    setLocalLang() {
        const langArray: any = [
            'af', // 荷兰语
            'ar', // 阿拉伯语
            'hy', // 亚美尼亚
            'be', // 白俄罗斯
            'zh-CN', // 中国
            'zh-TW',
            'zh-HK',
            'cs', // 捷克
            'da', // 丹麦
            'en', // 英语
            'fr', // 法语
            'de', // 德国
            'it', // 意大利
            'ja', // 日语
            'ko', // 韩语
            'ru', // 俄罗斯
            'es', // 西班牙
            'sv', // 瑞典
            'th', // 泰国
            'uk', // 乌克兰
            'vi', // 越南
        ];
        this.translate.addLangs(langArray);
        // 设置默认语言，一般在无法匹配的时候使用
        this.translate.setDefaultLang('en');
        // 获取当前浏览器环境的语言比如en、 zh
        const browserLang = this.translate.getBrowserLang();
        // 将所有语言重组为正则表达式
        let regString = '';
        for (const item of langArray) {
            regString += item + '|';
        }
        regString = regString.substring(0, regString.length - 1);
        this.translate.use(browserLang.match(RegExp(regString)) ? browserLang : 'en');
        if (browserLang === 'zh') {
            this.translate.use('zh-CN');
        }
    }

    hardwareBackButton() {
        // 返回按钮
        this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
            console.log('Back press handler!');
            if (this.location.isCurrentPathEqualTo('/tabs/scan')) {
                // Show Exit Alert!
                this.showExitConfirm();
                processNextHandler();
            } else {
                // Navigate to back page
                console.log('Navigate to back page');
                this.location.subscribe(res => {
                    console.log('res', res);
                    if (res.url === '/tabs/scan') {
                        this.utils.qrScan();
                        console.log('back scan');
                    }
                }, ss => {
                    console.log('ss', ss);
                });
                this.location.back();

            }

        });

        this.platform.backButton.subscribeWithPriority(5, () => {
            console.log('Handler called to force close!');
            this.alertController.getTop().then(r => {
                if (r) {
                    // tslint:disable-next-line:no-string-literal
                    navigator['app'].exitApp();
                }
            }).catch(e => {
                console.log(e);
            });
        });
    }

    // 退出APP 提示
    async showExitConfirm() {
        const alert = await this.alertController.create({
            header: this.translate.instant('APP_TERMINATION'),
            message: this.translate.instant('EXIT_APP'),
            backdropDismiss: false,
            buttons: [{
                text: this.translate.instant('STAY'),
                role: 'cancel',
                handler: () => {
                    console.log('Application exit prevented!');
                }
            }, {
                text: this.translate.instant('EXIT'),
                handler: () => {
                    // tslint:disable-next-line:no-string-literal
                    navigator['app'].exitApp();
                }
            }]
        });
        alert.present();
    }
}
