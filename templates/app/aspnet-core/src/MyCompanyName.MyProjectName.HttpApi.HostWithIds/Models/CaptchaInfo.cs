

using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MyCompanyName.MyProjectName.Validation;
using Volo.Abp.Account.Web.Areas.Account.Controllers.Models;

namespace MyCompanyName.MyProjectName.Models
{
    public class CaptchaInfo {
        [Required]  
        [GoogleReCaptchaValidation]  
        [BindProperty(Name = "captchaToken")]  
        public String GoogleReCaptchaResponse { get; set; }  
    }
}