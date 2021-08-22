
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
namespace MyCompanyName.MyProjectName.Middlewares
{
    public class CaptchaMiddleware
    {
        private readonly RequestDelegate _next;


        public CaptchaMiddleware(RequestDelegate next)
        {
            _next = next;

        }

        public async Task Invoke(HttpContext httpContext)
        {

            await _next(httpContext); // calling next middleware

        }
    }
}