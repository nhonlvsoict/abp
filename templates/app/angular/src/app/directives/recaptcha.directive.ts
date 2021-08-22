import { Directive, Output, EventEmitter, ElementRef, NgZone, Inject, OnInit, OnDestroy} from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { environment } from "src/environments/environment";

@Directive({
  selector: '[appRecaptcha]'
})
export class RecaptchaDirective implements OnInit, OnDestroy{

  @Output() recaptchaSuccess = new EventEmitter<string>();
  @Output() recaptchaExpired = new EventEmitter<unknown>();
  @Output() recaptchaError = new EventEmitter<unknown>();

  private readonly scriptId = 'volt-recaptcha';
  widgetId: number;

  constructor(
    private elementRef: ElementRef,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private readonly dom: Document,
  ) {}

  ngOnInit() {
    this.registerCaptchaCallback();
    this.addScript();
  }

  ngOnDestroy() {
    this.widgetId = null;
  }

  private registerCaptchaCallback() {
    (window as any).recaptchaCallback = () => {
      const config = {
        sitekey: environment.reCaptchaSitekey,
        callback: this.onSuccessCallback.bind(this),
        'error-callback': this.onErrorCallback.bind(this),
        'expired-callback': this.onExpiredCallback.bind(this),
      };
      this.widgetId = this.renderCaptcha(config);
    };
  }

  private addScript() {
    if (this.dom.getElementById(this.scriptId) != null) {
      return;
    }

    const script = this.dom.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=recaptchaCallback&render=explicit';
    script.id = this.scriptId;
    script.async = true;
    script.defer = true;
    this.dom.body.appendChild(script);
  }

  private onSuccessCallback(token: string) {
    this.ngZone.run(() => {
      this.recaptchaSuccess.emit(token);
    });
  }

  private onErrorCallback() {
    this.ngZone.run(() => {
      this.recaptchaError.emit();
    });
  }

  private onExpiredCallback() {
    this.ngZone.run(() => {
      this.recaptchaExpired.emit();
    });
  }

  private renderCaptcha(config: any): number {
    return (window as any).grecaptcha.render(this.elementRef.nativeElement, config);
  }

}
