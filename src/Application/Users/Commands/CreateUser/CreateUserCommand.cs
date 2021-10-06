using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Application.Users.Commands.CreateUser
{
    public class CreateUserCommand : IRequest<IdentityResult>
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public bool IsTwoFactorEnabled { get; set; }
        public string UserRole { get; set; }
    }
}
