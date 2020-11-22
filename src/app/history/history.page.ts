import { Utils } from './../services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { Component, NgZone } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
    selector: 'app-history',
    templateUrl: './history.page.html',
    styleUrls: ['./history.page.scss'],
})
export class HistoryPage {
    decodeHistoryList: any;
    gencodeHistoryList: any;
    isDecode = true;
    showAdTimer: any;
    constructor(
        public storage: NativeStorage,
        private alertController: AlertController,
        private translate: TranslateService,
        private zone: NgZone,
        private utils: Utils
    ) { }

    ionViewWillEnter() {
        this.getHistoryList();
        this.showAdTimer = setTimeout(() => {
            this.utils.showAds();
        }, 5000);
    }

    getHistoryList() {
        this.zone.run(async () => {
            this.decodeHistoryList = await this.storage.getItem('deHistory');
            this.gencodeHistoryList = await this.storage.getItem('genHistory');
            console.log(this.decodeHistoryList, this.gencodeHistoryList);
        });
    }

    segmentChanged(ev: any) {
        const value = ev.detail.value;
        if (value === 'deHistory') {
            this.isDecode = true;
        } else {
            this.isDecode = false;
        }
    }

    async deleteOneHistory(index: number) {
        let history: any;
        if (this.isDecode) {
            history = await this.storage.getItem('deHistory');
        } else {
            history = await this.storage.getItem('genHistory');
        }
        // 删除下标中的数据
        history.splice(index, 1);
        // 再次写入storage
        if (this.isDecode) {
            await this.storage.setItem('deHistory', history);
        } else {
            await this.storage.setItem('genHistory', history);
        }
        await this.getHistoryList();
    }

    async clear() {
        if (this.decodeHistoryList.length === 0 && this.gencodeHistoryList.length === 0) {
            return;
        }
        const alert = await this.alertController.create({
            header: this.translate.instant('TIPS'),
            message: this.translate.instant('CONFIRM_DELETE'),
            backdropDismiss: false,
            buttons: [{
                text: this.translate.instant('CANCEL'),
                role: 'cancel',
                handler: () => {
                    console.log('Do not delete all history!');
                }
            }, {
                text: this.translate.instant('DELETE'),
                handler: async () => {
                    await this.storage.setItem('deHistory', []);
                    await this.storage.setItem('genHistory', []);
                    await this.getHistoryList();
                }
            }]
        });
        alert.present();
    }

    async copy(text: string) {
        await this.utils.copy(text);
    }

    openUrl(text: string) {
        this.utils.openUrl(text);
    }

    ionViewWillLeave() {
        clearTimeout(this.showAdTimer);
    }

}
