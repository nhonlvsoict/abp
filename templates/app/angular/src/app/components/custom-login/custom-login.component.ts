import { Component, OnInit } from '@angular/core';
import { AuthService } from '@abp/ng.core';
import { OAuthService } from 'angular-oauth2-oidc';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { RouterLink } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { environment } from 'src/environments/environment';
import { finalize, catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import snq from 'snq';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-custom-login',
  templateUrl: './custom-login.component.html',
  styleUrls: ['./custom-login.component.scss']
})
export class CustomLoginComponent implements OnInit {
  protected loginForm: FormGroup;
  protected tfaForm: FormGroup;
  protected socialUser: SocialUser;
  public isLoggedin: boolean = false;
  public inProgress: boolean = false;
  public recaptcha: string = null;
  public isModalOpen: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private socialAuthService: SocialAuthService,
    private toasterService: ToasterService,
    private authService: AuthService) { }


  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
    this.tfaForm = this.formBuilder.group({
      "twoFactorCode": [null, [Validators.required]]
    });

    this.socialAuthService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = (user != null);
      console.log(this.socialUser);
    });
  }
  onRecaptchaSuccess(token: string) {
    this.recaptcha = token;
  }

  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);

  }
  submitTFA() {
    if (this.tfaForm.invalid) {
      this.toasterService.error("Please input TFA Code!", 'Error', { life: 7000 });
      return;
    }
    this.isModalOpen = false;
    var {twoFactorCode} = this.tfaForm.value;
    this.logIn(twoFactorCode)
  }
  verifyCaptcha(twoFactorCode) {
    if (this.recaptcha === null || this.recaptcha === "") {
      this.toasterService.error("Please authorize the Captcha!", 'Error', { life: 7000 });
      return;
    }
    this.inProgress = true;
    this.authService
      .verifyreCaptcha( this.recaptcha)
      .pipe(catchError(err => {
        this.toasterService.error(snq(() => err.error.error_description) ||
          snq(() => err.error.value, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
        return throwError(err);
      }), finalize(() => (this.inProgress = false)))
      .subscribe({
        next: () => {
        this.logIn(twoFactorCode);
      }});
    
    
  }
  logIn(twoFactorCode: string = ""): void {
    if (this.loginForm.invalid) {
      this.toasterService.error("Please input User account information!", 'Error', { life: 7000 });
      return;
    }


    this.inProgress = true;
    const { username, password, rememberMe } = this.loginForm.value;
    const recaptcha = this.recaptcha;
    const redirectUrl = "/home";
    this.authService
      .loginCaptcha({ username, password, rememberMe, redirectUrl, recaptcha, twoFactorCode })
      .pipe(catchError(err => {
        if (err.error?.error_description == "RequiresTwoFactor") {
          this.isModalOpen = true;
          return
        }
        this.toasterService.error(snq(() => err.error.error_description) ||
          snq(() => err.error.value, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
        return throwError(err);
      }), finalize(() => (this.inProgress = false)))
      .subscribe();
  }
  logOut(): void {
    this.socialAuthService.signOut();
  }


}
