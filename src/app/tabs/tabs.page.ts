import { Utils } from './../services/utils.service';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage {

    constructor(private utils: Utils, public translate: TranslateService) { }
    getTabs(ev) {
        console.log('change tabs', ev);
        const tab = ev.tab;
        if (tab === 'scan') {
            this.utils.qrScan();
        } else {
            this.utils.stopQrScan();
        }
    }
}
