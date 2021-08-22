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
import { AccountService } from '@abp/ng.account';

@Component({
  selector: 'app-custom-register',
  templateUrl: './custom-register.component.html',
  styleUrls: ['./custom-register.component.scss']
})
export class CustomRegisterComponent implements OnInit {
  public registerForm: FormGroup;
  protected socialUser: SocialUser;
  public recaptcha: string = null;
  public inProgress: boolean = false;

  constructor(
    private formBuilder: FormBuilder, 
    private socialAuthService: SocialAuthService,
    private toasterService: ToasterService,
    private accountService: AccountService) { }

  
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });    
    
  }
  onRecaptchaSuccess(token: string) {
    this.recaptcha = token;
  }
  register(){
    if (this.registerForm.invalid) {
      this.toasterService.error("Please input User account information!", 'Error', { life: 7000 });
      return;
    }

    if(this.recaptcha === null || this.recaptcha === ""){
      this.toasterService.error("Please authorize the Captcha!", 'Error', { life: 7000 });
      return;
    }
    this.inProgress = true;
    const { username, password, email } = this.registerForm.value;
    const recaptcha = this.recaptcha;
    const redirectUrl = "/home";
   
      const newUser = {
        userName: username,
        password: password,
        emailAddress: email,
        appName: 'Angular',
        extraProperties: null
    };
    this.accountService
        .register(newUser)
        .pipe(switchMap(() => window.location.href= "/login"), catchError(err => {
      this.toasterService.error(snq(() => err.error.error_description) ||
      snq(() => err.error.value, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
        return throwError(err);
    }), finalize(() => (this.inProgress = false)))
        .subscribe();
  }
}
