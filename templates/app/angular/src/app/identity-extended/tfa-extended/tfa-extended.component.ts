import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import snq from 'snq';
import { ToasterService } from '@abp/ng.theme.shared';
import { WebHttpUrlEncodingCodec } from '@abp/ng.core';

@Component({
  selector: 'app-tfa-extended',
  templateUrl: './tfa-extended.component.html',
  styleUrls: ['./tfa-extended.component.scss']
})
export class TfaExtendedComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toasterService: ToasterService) { }
  ngOnInit(): void {
    this.tfaForm = this.formBuilder.group({
      "twoFactorCode": [null, [Validators.required]]
    });

    this.inProgress = true;
    this.http
      .get(environment.apis.default.url + "/api/account/enable-twofactor-authentication")
      .subscribe((response: any) => {
        this.tfaConfig = response.value;
      }, err => {
        this.toasterService.error(snq(() => err.error.error_description) ||
          snq(() => err.error.value, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
        // this.eventsSubject.next(new OAuthErrorEvent('token_error', err));

      }, () => (this.inProgress = false));
  }
  isUserQuickViewVisible: boolean;
  tfaConfig: object = null;

  public inProgress: boolean = false;

  protected tfaForm: FormGroup;


  openEnableTFAView() {

    this.isUserQuickViewVisible = true;
  }
  submitTFA() {
    if (this.tfaForm.invalid) {
      this.toasterService.error("Please input TFA Code!", 'Error', { life: 7000 });
      return;
    }
    var { twoFactorCode } = this.tfaForm.value;
    var params = new HttpParams({ encoder: new WebHttpUrlEncodingCodec() })
    .set('inputCode', twoFactorCode);
    this.inProgress = true;
    var headers = new HttpHeaders()
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    this.http
      .post(environment.apis.default.url + "/api/account/enable-twofactor-authentication",
        params,
        { headers })
      .subscribe((response: any) => {
        this.isUserQuickViewVisible = false;
        this.toasterService.success("TFS enable successfuly!", 'Success', { life: 7000 });
      }, err => {
        this.toasterService.error(snq(() => err.error.error_description) ||
          snq(() => err.error.value, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
        // this.eventsSubject.next(new OAuthErrorEvent('token_error', err));

      }, () => (this.inProgress = false));
  }
}
