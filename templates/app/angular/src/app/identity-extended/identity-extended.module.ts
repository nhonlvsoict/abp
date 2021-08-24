import { ApiInterceptor, CoreModule } from '@abp/ng.core';
import { IdentityModule } from '@abp/ng.identity';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { identityEntityActionContributors } from './tfa-action-contributors';
import { TfaExtendedComponent } from './tfa-extended/tfa-extended.component';

@NgModule({
    imports: [
        CoreModule,
        ThemeSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: TfaExtendedComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () =>
                            IdentityModule.forLazy({
                                entityActionContributors: identityEntityActionContributors,
                            }),
                    },
                ],
            },
        ]),
    ],
    declarations: [TfaExtendedComponent],
    providers:[
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiInterceptor,
            multi: true
          }
    ]
})
export class IdentityExtendedModule { }