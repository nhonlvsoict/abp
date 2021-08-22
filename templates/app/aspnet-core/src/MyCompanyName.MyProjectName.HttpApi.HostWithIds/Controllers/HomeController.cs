using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Account.Web.Areas.Account.Controllers.Models;
using MyCompanyName.MyProjectName.Models;

namespace MyCompanyName.MyProjectName.Controllers
{
    [Authorize]
    public class HomeController : AbpController
    {
        public ActionResult Index()
        {
            return Redirect("~/swagger");
        }

        [AllowAnonymous]
        public ActionResult LoginWithCaptcha(UserLoginCaptchaInfo user)
        {
            return RedirectPermanentPreserveMethod("~/api/account/login");
        }
    }
}
