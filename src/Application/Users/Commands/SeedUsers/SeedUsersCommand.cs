using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Core.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Users.Commands.SeedUsers
{
    public class SeedUsersCommand : IRequest<bool>
    {
        public class SeedUsersCommandHandler : IRequestHandler<SeedUsersCommand, bool>
        {
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly RoleManager<IdentityRole> _roleManager;
            private readonly IdentityInit _identityInit;
            private readonly ILogger<SeedUsersCommandHandler> _logger;
            private readonly IAppDbContext _context;

            public SeedUsersCommandHandler(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IdentityInit identityInit, IAppDbContext context, ILogger<SeedUsersCommandHandler> logger)
            {
                _userManager = userManager;
                _roleManager = roleManager;
                _identityInit = identityInit;
                _logger = logger;
                _context = context;
            }

            public async Task<bool> Handle(SeedUsersCommand request, CancellationToken cancellationToken)
            {
                await SeedUserRoles();
                await SeedUsers();
                return true;
            }

            /**
             * This method seeds admin and guest users
             * **/
            public async Task SeedUsers()
            {

                await SeedUser(_identityInit.AdminUserName, _identityInit.AdminEmail,
                    _identityInit.AdminPassword, SecurityConstants.AdminRoleString);
                await SeedUser(_identityInit.GuestUserName, _identityInit.GuestEmail,
                    _identityInit.GuestPassword, SecurityConstants.GuestRoleString);
            }

            /**
             * This method seeds a user
             * **/
            public async Task SeedUser(string userName, string email, string password, string role)
            {
                // check if user doesn't exist
                if ((_userManager.FindByNameAsync(userName).Result) == null)
                {
                    // create desired user object
                    ApplicationUser user = new()
                    {
                        UserName = userName,
                        Email = email,
                        TwoFactorEnabled = role == SecurityConstants.AdminRoleString ? true : false
                    };

                    // push desired user object to DB
                    IdentityResult result = await _userManager.CreateAsync(user, password);

                    if (result.Succeeded)
                    {
                        _ = await _userManager.AddToRoleAsync(user, role);
                        // verify user email
                        string emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        IdentityResult emaiVerifiedResult = await _userManager.ConfirmEmailAsync(user, emailToken);
                        if (emaiVerifiedResult.Succeeded)
                        {
                            _logger.LogInformation($"Email verified for new user {user.UserName} with id {user.Id} and email {user.Email}");
                        }
                        else
                        {
                            _logger.LogInformation($"Email verify failed for {user.UserName} with id {user.Id} and email {user.Email} due to errors {emaiVerifiedResult.Errors}");
                        }
                    }
                }
            }

            /**
             * This method seeds roles
             * **/
            public async Task SeedUserRoles()
            {
                foreach (string r in SecurityConstants.GetRoles())
                {
                    await SeedRole(r);
                }
            }

            /**
             * This method seeds a role
             * **/
            public async Task SeedRole(string roleString)
            {
                // check if role doesn't exist
                if (!(_roleManager.RoleExistsAsync(roleString).Result))
                {
                    // create desired role object
                    IdentityRole role = new IdentityRole
                    {
                        Name = roleString,
                    };
                    // push desired role object to DB
                    _ = await _roleManager.CreateAsync(role);
                }
            }
        }
    }
}
