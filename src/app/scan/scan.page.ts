import { TranslateService } from '@ngx-translate/core';
import { Utils } from './../services/utils.service';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { IonHeader, Platform } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import jsQR from 'jsqr';


@Component({
    selector: 'app-scan',
    templateUrl: './scan.page.html',
    styleUrls: ['./scan.page.scss'],
})
export class ScanPage {
    @ViewChild('toolbar') qrcodeSanHeader: IonHeader;
    @ViewChild('canvasEl') canvasEl: ElementRef;
    base64Image = '';
    isOpenFlashlight = false;
    isBackCamera = true;
    constructor(
        private qrScanner: QRScanner,
        private imagePicker: ImagePicker,
        private router: Router,
        private utils: Utils,
        private platform: Platform,
        public storage: NativeStorage,
        private appVersion: AppVersion,
        private iab: InAppBrowser,
        private translate: TranslateService
    ) { }

    ionViewDidEnter() {
        this.platform.ready().then(() => {
            this.utils.qrScan();
        });
    }

    // 打开图片选择
    openImage() {
        const imagePickerOpt: ImagePickerOptions = {
            maximumImagesCount: 1, // 选择一张图片
            quality: 80,
            width: 800,  // 压缩
        };
        this.imagePicker.getPictures(imagePickerOpt).then(results => {
            for (const item of results) {
                // tslint:disable-next-line:no-string-literal
                const imgfilepath = window['Ionic'].WebView.convertFileSrc(item);
                this.deImageQRcode(imgfilepath);
            }
        }, err => {
            console.log('open image picker error', err);
        });
    }

    // 利用jsQR读取图片中的二维码信息
    deImageQRcode(image: string) {
        return new Promise((resolve, reject) => {
            const canvas = this.canvasEl.nativeElement;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image; // base64数据
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                // const base64Png = canvas.toDataURL('image/png');
                ctx.drawImage(img, 0, 0);
                try {
                    img.crossOrigin = 'Anonymous';
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    const code = jsQR(imageData.data, img.width, img.height);
                    if (code) {
                        this.utils.goShowPage('deQrcode', code.data);
                        resolve();
                    } else {
                        this.utils.toastMsg(this.translate.instant('PARSE_IMAGE_ERROR'));
                    }
                } catch (e) {
                    console.log('img to png err ', e);
                }
            };
        });
    }

    // 开启闪光灯
    async flashlight() {
        if (this.isOpenFlashlight) {
            await this.qrScanner.disableLight();
            this.isOpenFlashlight = !this.isOpenFlashlight;
            return;
        }
        await this.qrScanner.enableLight();
        this.isOpenFlashlight = !this.isOpenFlashlight;
    }

    // 切换摄像头
    async swaitchCamera() {
        if (this.isBackCamera) {
            await this.qrScanner.useFrontCamera();
            this.isBackCamera = !this.isBackCamera;
            return;
        }
        await this.qrScanner.useBackCamera();
        this.isBackCamera = !this.isBackCamera;
    }
    goGenerateCodePage() {
        this.router.navigate([`/show/genQrcode`]);
    }

    async goAppRate() {
        const packageName = await this.appVersion.getPackageName();
        this.iab.create(`market://details?id=${packageName}`, '_system');
    }

    ionViewWillLeave() {
        this.qrScanner.hide();
        (window.document.querySelector('app-scan') as HTMLElement).classList.remove('cameraView');
        (window.document.querySelector('body') as HTMLElement).style.backgroundColor = '#fffff';
        (window.document.querySelector('html') as HTMLElement).style.backgroundColor = '#fffff';
    }

}
