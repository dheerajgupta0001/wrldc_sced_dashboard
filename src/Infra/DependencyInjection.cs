using Microsoft.Extensions.DependencyInjection;
using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Configuration;
using Infra.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.UI.Services;
using Infra.Services.Email;
using Core.Sms;
using Infra.Services.Sms;
using Application.Users;
using Application.Common.Interfaces;

namespace Infra
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            if (environment.IsEnvironment("Testing"))
            {
                // Add Persistence Infra
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase(databaseName: "HrisDb"));

            }
            else
            {
                // Add Persistence Infra
                services.AddDbContext<AppDbContext>(options =>
                    options.UseNpgsql(
                        configuration.GetConnectionString("DefaultConnection")));
            }

            services.AddScoped<IAppDbContext>(provider => provider.GetService<AppDbContext>());

            // add identity framework on top of entity framework - https://docs.microsoft.com/en-us/aspnet/core/security/authentication/customize-identity-model?view=aspnetcore-5.0#custom-user-data
            services
                .AddDefaultIdentity<ApplicationUser>(options =>
                {
                    options.SignIn.RequireConfirmedAccount = false;
                    options.Password.RequireDigit = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireNonAlphanumeric = true;
                    options.Password.RequireUppercase = false;
                    options.Password.RequiredLength = 6;
                    options.Password.RequiredUniqueChars = 2;
                })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>();

            // https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration?view=aspnetcore-5.0#cookie-settings
            services.ConfigureApplicationCookie(options =>
            {
                // configure login path for return urls
                // https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity?view=aspnetcore-3.1&tabs=visual-studio
                options.LoginPath = "/Identity/Account/Login";
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";
                options.SlidingExpiration = true;
                options.ExpireTimeSpan = TimeSpan.FromHours(2);
                options.Cookie.Name = "HrisWebAppCookie";
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.Cookie.HttpOnly = true;
            });

            // add email settings from app config
            IdentityInit identityInit = new IdentityInit();
            configuration.Bind("IdentityInit", identityInit);
            services.AddSingleton(identityInit);

            // add email settings from app config
            EmailConfiguration emailConfig = new EmailConfiguration();
            configuration.Bind("EmailSettings", emailConfig);
            services.AddSingleton(emailConfig);

            // add sms settings from app config
            SmsConfiguration smsConfig = new SmsConfiguration();
            configuration.Bind("SmsSettings", smsConfig);
            services.AddSingleton(smsConfig);

            // Add Infra services
            services.AddTransient<IEmailSender, EmailSender>();
            services.AddTransient<ISmsSender, SmsSender>();

            return services;
        }
    }
}
