using Application.Smp.Queries.GetSmp;
using Application.Schedules.Queries.GetSchedules;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Core.Sced;

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SmpController : ControllerBase
    {
        private readonly IMediator _mediator;
        public SmpController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpGet("get")]
        public async Task<List<SchTsRow>> GetAsync([FromQuery] string starttime, [FromQuery] string endtime, [FromQuery] int rev = 0, [FromQuery] string regionTag = "g")
        {
            if (string.IsNullOrWhiteSpace(starttime) || string.IsNullOrWhiteSpace(endtime))
            {
                return new List<SchTsRow>();
            }
            DateTime startDate = DateTime.ParseExact(starttime, "yyyy_MM_dd_HH_mm_ss", CultureInfo.InvariantCulture);
            DateTime endDate = DateTime.ParseExact(endtime, "yyyy_MM_dd_HH_mm_ss", CultureInfo.InvariantCulture);

            var res = await _mediator.Send(new GetSmpQuery() { StartTime = startDate, EndTime = endDate, RegionTag = regionTag, RevNo = rev });
            return res;
        }
    }
}
