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

        protected virtual async Task ReplaceEmailToUsernameOfInputIfNeeds(UserLoginInfo login)
        {
            if (!ValidationHelper.IsValidEmailAddress(login.UserNameOrEmailAddress))
            {
                return;
            }

            var userByUsername = await UserManager.FindByNameAsync(login.UserNameOrEmailAddress);
            if (userByUsername != null)
            {
                return;
            }

            var userByEmail = await UserManager.FindByEmailAsync(login.UserNameOrEmailAddress);
            if (userByEmail == null)
            {
                return;
            }

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