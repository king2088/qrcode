import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { qrcanvas, QRCanvasOptions } from 'qrcanvas';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from './../services/utils.service';

@Component({
    selector: 'app-show',
    templateUrl: './show.page.html',
    styleUrls: ['./show.page.scss'],
})
export class ShowPage {
    @ViewChild('QRcodeCanvas') canvasElement: ElementRef;
    type: any;
    title: any;
    qrcodeText: string;
    codeFormat: string;
    textType: string;
    isUrl = false;
    base64Data: string;
    firstInitQRcode = true;
    textContent: string;
    selectType = 'text';
    showAdTimer: any;
    constructor(
        private activatedRoute: ActivatedRoute,
        private base64ToGallery: Base64ToGallery,
        private utils: Utils,
        private storage: NativeStorage,
        private translate: TranslateService,
        private androidPermissions: AndroidPermissions
    ) {
        this.textType = this.translate.instant('TEXT');
    }

    ionViewWillEnter() {
        this.type = this.activatedRoute.snapshot.params.type;
        if (this.type === 'deQrcode') {
            this.title = this.translate.instant('DECODE_QR_CODE');
            this.activatedRoute.params.subscribe((params: Params) => {
                this.qrcodeText = params.text;
                this.codeFormat = params.format;
            });
            const isUrl = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(this.qrcodeText);
            const isEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(this.qrcodeText);
            const isDate = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/.test(this.qrcodeText);
            if (isUrl) {
                this.textType = this.translate.instant('URL');
                this.isUrl = true;
            } else if (isEmail) {
                this.textType = this.translate.instant('EMAIL');
                this.isUrl = false;
            } else if (isDate) {
                this.textType = this.translate.instant('DATE');
                this.isUrl = false;
            } else {
                this.isUrl = false;
                switch (this.codeFormat) {
                    case 'EAN':
                        this.textType = this.translate.instant('PRODUCT_CODE');
                        break;
                    case 'UPC':
                        this.textType = this.translate.instant('PRODUCT_CODE');
                        break;
                    case 'CODE':
                        this.textType = this.translate.instant('BAR_CODE');
                        break;
                    case 'ITF':
                        this.textType = this.translate.instant('OUT_BOX_BARCODE');
                        break;
                    case 'PDF_417':
                        this.textType = this.translate.instant('PDF_QR_CODE');
                        break;
                }
            }

        } else {
            this.title = this.translate.instant('GENERATE_QR_CODE');
        }
    }

    ionViewDidEnter() {
        if (this.qrcodeText) {
            this.generateQrcode();
        }
        this.showAdTimer = setTimeout(() => {
            this.utils.showAds();
        }, 5000);
    }

    // copy qrcode text
    async copy() {
        await this.utils.copy(this.qrcodeText);
    }

    openUrl() {
        this.utils.openUrl(this.qrcodeText);
    }

    saveQrcode() {
        const date = new Date().toString();
        const option: Base64ToGalleryOptions = {
            prefix: 'QRcode' + Date.parse(date),
            mediaScanner: false  //
        };
        this.base64ToGallery.base64ToGallery(this.base64Data, option).then(res => {
            console.log('save image success', res);
            this.utils.toastMsg(this.translate.instant('SAVE_IMAGE_TO_GALLERY_SUCCESS'));
            this.utils.showAds();
        }, err => {
            console.log('Save qrcode error', err);
            // 请求写入文件权限
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                result => {
                    if (!result.hasPermission) {
                        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
                    }
                },
                err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            );
        });
    }

    genSelectChange(ev: any) {
        console.log(ev);
        this.textContent = '';
        const value = ev.detail.value;
        if (value === 'url') {
            this.textContent = 'http://';
        }
    }

    async generateQrcode() {
        if (this.textContent) {
            this.qrcodeText = this.textContent;
            const genHistory = await this.storage.getItem('genHistory');
            const currentCode = {
                format: this.selectType,
                text: this.qrcodeText
            };
            console.log('currentCode', currentCode);
            genHistory.push(currentCode);
            await this.storage.setItem('genHistory', genHistory);
        }
        const canvas = this.canvasElement.nativeElement;
        const option: QRCanvasOptions = {
            correctLevel: 'H',
            data: this.qrcodeText,
            canvas,
            size: 512,
            // background: QRCanvasLayerValue,
            // foreground: QRCanvasLayerValue,
            // padding: number,
            // effect: QRCanvasEffect,
            // logo: QRCanvasLayer,
        };
        qrcanvas(option);
        canvas.style.position = 'absolute';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'scale(0.4) translate(-50%)';
        canvas.style.transformOrigin = 'top left';
        const ctx = canvas.getContext('2d');
        // 把画布的内容转换为base64编码格式的图片
        const data = canvas.toDataURL('image/png', 1);  // 1表示质量(无损压缩)
        this.base64Data = data;
        // console.log(data);
    }

    ionViewDidLeave() {
        clearTimeout(this.showAdTimer);
    }

}
