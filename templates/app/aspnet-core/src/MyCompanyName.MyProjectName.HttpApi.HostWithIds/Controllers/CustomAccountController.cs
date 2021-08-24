using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Volo.Abp.Account.Localization;
using Volo.Abp.Account.Settings;
using Volo.Abp.Account.Web.Areas.Account.Controllers.Models;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Identity;
using Volo.Abp.Identity.AspNetCore;
using Volo.Abp.Settings;
using Volo.Abp.Validation;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;
using UserLoginInfo = Volo.Abp.Account.Web.Areas.Account.Controllers.Models.UserLoginInfo;
using IdentityUser = Volo.Abp.Identity.IdentityUser;
using Volo.Abp;
using MyCompanyName.MyProjectName.Models;
using Google.Authenticator;
using Microsoft.AspNetCore.Authorization;

namespace MyCompanyName.MyProjectName.Controllers
{
    [Controller]
    [ControllerName("Login")]
    [Route("api/account")]
    public class CustomAccountController : AbpController
    {
        protected SignInManager<IdentityUser> SignInManager { get; }
        protected IdentityUserManager UserManager { get; }
        protected ISettingProvider SettingProvider { get; }
        protected IdentitySecurityLogManager IdentitySecurityLogManager { get; }
        protected IOptions<IdentityOptions> IdentityOptions { get; }

        public CustomAccountController(
            SignInManager<IdentityUser> signInManager,
            IdentityUserManager userManager,
            ISettingProvider settingProvider,
            IdentitySecurityLogManager identitySecurityLogManager,
            IOptions<IdentityOptions> identityOptions)
        {
            LocalizationResource = typeof(AccountResource);

            SignInManager = signInManager;
            UserManager = userManager;
            SettingProvider = settingProvider;
            IdentitySecurityLogManager = identitySecurityLogManager;
            IdentityOptions = identityOptions;
        }
        [HttpPost]
        [Route("login-captcha")]
        public virtual async Task<AbpLoginResult> LoginCaptcha(UserLoginCaptchaInfo login)
        {
            await CheckLocalLoginAsync();

            ValidateLoginInfo(login);

            await ReplaceEmailToUsernameOfInputIfNeeds(login);
            var signInResult = await SignInManager.PasswordSignInAsync(
                login.UserNameOrEmailAddress,
                login.Password,
                login.RememberMe,
                true
            );

            await IdentitySecurityLogManager.SaveAsync(new IdentitySecurityLogContext()
            {
                Identity = IdentitySecurityLogIdentityConsts.Identity,
                Action = signInResult.ToIdentitySecurityLogAction(),
                UserName = login.UserNameOrEmailAddress
            });

            return GetAbpLoginResult(signInResult);
        }
        [HttpPost]
        [Route("recapcha-token-verify")]
        public virtual ActionResult RecapchaTokenVerify(CaptchaInfo token)
        {
            if (!ModelState.IsValid)
            {
                return Unauthorized(Json("Google reCAPTCHA validation failed!"));
            }
            // token verified in model declaration
            return Ok(Json("Success"));
        }
        [Authorize]
        [HttpGet]
        [Route("enable-twofactor-authentication")]
        public virtual async Task<ActionResult> EnableTwoFactorAuthentication()
        {
            // CurrentUser
            var user = await UserManager.GetUserAsync(HttpContext.User);
            TwoFactorAuthenticator twoFactor = new TwoFactorAuthenticator();
            var setupInfo =
                twoFactor.GenerateSetupCode("my-app", user.Email, TwoFactorKey(user), false, 3);
            var data = new {
                ManualEntryKey = setupInfo.ManualEntryKey,
                QrCodeSetupImageUrl = setupInfo.QrCodeSetupImageUrl
            };
            return Ok(Json(data));
        }
        [Authorize]
        [HttpPost]
        [Route("enable-twofactor-authentication")]
        public virtual async Task<ActionResult>  EnableTwoFactorAuthentication(string inputCode)
        {
            // inputCode = context.Request?.Raw?["inputCode"];
            var user = await UserManager.GetUserAsync(HttpContext.User);
            TwoFactorAuthenticator twoFactor = new TwoFactorAuthenticator();
            bool isValid = twoFactor.ValidateTwoFactorPIN(TwoFactorKey(user), inputCode);
            if (!isValid)
            {
                return Unauthorized(Json("TFA Code validation failed!"));
            }

            await UserManager.SetTwoFactorEnabledAsync(user, true);

            return Ok();
        }
        private static string TwoFactorKey(IdentityUser user)
        {
            return $"myverysecretkey+{user.UserName}";
        }
        protected virtual async Task ReplaceEmailToUsernameOfInputIfNeeds(UserLoginInfo login)
        {
            // neu ko phai valid email thi la username
            if (!ValidationHelper.IsValidEmailAddress(login.UserNameOrEmailAddress))
            {
                return;
            }
            //tim theo username
            var userByUsername = await UserManager.FindByNameAsync(login.UserNameOrEmailAddress);
            if (userByUsername != null)
            {
                return;
            }
            //tim theo email
            var userByEmail = await UserManager.FindByEmailAsync(login.UserNameOrEmailAddress);
            // neu bang null thi loi, khac null tuc la nguoi dung nhap vao email
            if (userByEmail == null)
            {
                return;
            }
            // gan bang username
            login.UserNameOrEmailAddress = userByEmail.UserName;
        }
        private static AbpLoginResult GetAbpLoginResult(SignInResult result)
        {
            if (result.IsLockedOut)
            {
                return new AbpLoginResult(LoginResultType.LockedOut);
            }

            if (result.RequiresTwoFactor)
            {
                return new AbpLoginResult(LoginResultType.RequiresTwoFactor);
            }

            if (result.IsNotAllowed)
            {
                return new AbpLoginResult(LoginResultType.NotAllowed);
            }

            if (!result.Succeeded)
            {
                return new AbpLoginResult(LoginResultType.InvalidUserNameOrPassword);
            }

            return new AbpLoginResult(LoginResultType.Success);
        }

        protected virtual void ValidateLoginInfo(UserLoginInfo login)
        {
            if (login == null)
            {
                throw new ArgumentException(nameof(login));
            }

            if (login.UserNameOrEmailAddress.IsNullOrEmpty())
            {
                throw new ArgumentNullException(nameof(login.UserNameOrEmailAddress));
            }

            if (login.Password.IsNullOrEmpty())
            {
                throw new ArgumentNullException(nameof(login.Password));
            }
        }

        protected virtual async Task CheckLocalLoginAsync()
        {
            if (!await SettingProvider.IsTrueAsync(AccountSettingNames.EnableLocalLogin))
            {
                throw new UserFriendlyException(L["LocalLoginDisabledMessage"]);
            }
        }
    }
}