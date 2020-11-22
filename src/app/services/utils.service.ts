import { TranslateService } from '@ngx-translate/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { AdMobService } from './adMob.service';
import { Router } from '@angular/router';
@Injectable()

export class Utils {
    constructor(
        private toastCtrl: ToastController,
        private qrScanner: QRScanner,
        private androidPermissions: AndroidPermissions,
        private storage: NativeStorage,
        private router: Router,
        private clipboard: Clipboard,
        private iab: InAppBrowser,
        private translate: TranslateService,
        private adMobFreeService: AdMobService
    ) {

    }

    async toastMsg(msg) {
        const toast = await this.toastCtrl.create({
            message: msg,
            position: 'bottom',
            duration: 2000
        });
        toast.present();
    }

    qrScan() {
        (window.document.querySelector('app-scan') as HTMLElement).classList.add('cameraView');
        this.qrScanner.prepare().then((status: QRScannerStatus) => {
            console.log('扫码', status);
            if (status.authorized) {
                // tslint:disable-next-line:no-shadowed-variable
                this.qrScanner.show();
                console.log('will scan');
                const scanSub = this.qrScanner.scan().subscribe((result: any) => {
                    console.log(result);
                    this.qrScanner.hide();
                    scanSub.unsubscribe();
                    let text: string;
                    let format: string;
                    if (typeof result === 'string') {
                        text = result;
                    } else {
                        text = result.text;
                        format = result.format;
                    }
                    this.goShowPage('deQrcode', text, format);
                });
            } else if (status.denied) {
                this.qrScanner.openSettings();
            } else {
                console.log('无法获取权限', status);
                this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
                    result => {
                        if (!result.hasPermission) {
                            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);
                        }
                    },
                    err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
                );
            }
        }).catch((e: any) => console.log('scan qr code err', e));
    }

    stopQrScan() {
        this.qrScanner.hide();
        this.qrScanner.destroy();
    }

    async goShowPage(type: string, text: string, format?: string) {
        const history: any = await this.storage.getItem('deHistory');
        const qrInfo = {
            text,
            format
        };
        let hasSame = false;
        history.forEach(item => {
            if (item.text === text) {
                hasSame = true;
            }
        });
        if (!hasSame) {
            history.push(qrInfo);
            await this.storage.setItem('deHistory', history);
        }

        this.router.navigate([`/show/${type}`, { text, format }]);
    }

    // copy qrcode text
    async copy(text: string) {
        await this.clipboard.copy(text);
        this.toastMsg(this.translate.instant('COPY_SUCCESS'));
        this.showAds();
    }

    openUrl(text: string) {
        const option: InAppBrowserOptions = {
            hidenavigationbuttons: 'yes',
            hardwareback: 'yes',
            toolbarcolor: '#3880ff',
            hideurlbar: 'yes',
            clearcache: 'yes',
            location: 'yes',
        };
        const browser = this.iab.create(text, '_blank', option);
        browser.show();
        this.showAds();
    }

    // 展示banner广告
    async showAds() {
        await this.adMobFreeService.interstitialAdShow();
    }
}
