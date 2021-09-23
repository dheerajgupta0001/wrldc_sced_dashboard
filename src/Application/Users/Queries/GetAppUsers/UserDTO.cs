using AutoMapper;
using System;
using System.Text;
using Core.Entities;
using static Application.Common.Mappings.MappingProfile;

namespace Application.Users.Queries.GetAppUsers
{
    public class UserDTO : IMapFrom<ApplicationUser>
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public string DisplayName { get; set; }
        public string Department { get; set; }
        public string Email { get; set; }
        public string UserRole { get; set; }
        public string OfficeId { get; set; }
        public string Designation { get; set; }
        public DateTime? Dob { get; set; }
        public bool IsActive { get; set; } = true;
        public string PhoneNumber { get; set; }
        public void Mapping(Profile profile)
        {
            profile.CreateMap<ApplicationUser, UserDTO>()
                .ForMember(d => d.UserId, opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.Username, opt => opt.MapFrom(s => s.UserName));
        }
    }
}
