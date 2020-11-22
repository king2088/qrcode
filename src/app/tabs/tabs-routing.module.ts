import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'scan',
                loadChildren: () => import('../scan/scan.module').then(m => m.ScanPageModule)
            },
            {
                path: 'history',
                loadChildren: () => import('../history/history.module').then(m => m.HistoryPageModule)
            },
            {
                path: '',
                redirectTo: '/tabs/scan',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/tabs/scan',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule { }
