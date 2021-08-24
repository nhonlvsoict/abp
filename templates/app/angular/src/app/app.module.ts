import { AccountConfigModule } from '@abp/ng.account/config';
import { ApiInterceptor, CoreModule } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { IdentityConfigModule } from '@abp/ng.identity/config';
import { SettingManagementConfigModule } from '@abp/ng.setting-management/config';
import { TenantManagementConfigModule } from '@abp/ng.tenant-management/config';
import { ThemeBasicModule } from '@abp/ng.theme.basic';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { CustomLoginComponent } from './components/custom-login/custom-login.component';
import { ReactiveFormsModule } from '@angular/forms';

import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { CustomRegisterComponent } from './components/custom-register/custom-register.component';
import { BotDetectCaptchaModule } from 'angular-captcha';
import { RecaptchaCommonModule } from 'ng-recaptcha/lib/recaptcha-common.module';
import { RecaptchaFormsModule } from 'ng-recaptcha';
import { RecaptchaDirective } from './directives/recaptcha.directive';
import { EnableTfaComponent } from './components/enable-tfa/enable-tfa.component';
import { TfaExtendedComponent } from './identity-extended/tfa-extended/tfa-extended.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule.forRoot({
      environment,
      registerLocaleFn: registerLocale(),
    }),
    ThemeSharedModule.forRoot(),
    // ThemeSharedModule,
    AccountConfigModule.forRoot(),
    IdentityConfigModule.forRoot(),
    TenantManagementConfigModule.forRoot(),
    SettingManagementConfigModule.forRoot(),
    NgxsModule.forRoot(),
    ThemeBasicModule.forRoot(),
    ReactiveFormsModule,
    SocialLoginModule,
    // RecaptchaCommonModule,  //this is the recaptcha main module
    // RecaptchaFormsModule, //this is the module for form incase form validation
  ],
  declarations: [AppComponent, CustomLoginComponent, CustomRegisterComponent, RecaptchaDirective, EnableTfaComponent],
  providers: [
    APP_ROUTE_PROVIDER,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '111047510702-kqvikogg72muo19pggsc8cefai6dt1pi.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig,
    } 
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
