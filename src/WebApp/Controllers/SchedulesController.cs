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

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SchedulesController : ControllerBase
    {
        private readonly string _scedConnStr;
        private readonly IMediator _mediator;
        public SchedulesController(IConfiguration configuration, IMediator mediator)
        {
            _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
            _mediator = mediator;
        }


        [HttpGet("get")]
        public async Task<SchResponse> GetAsync([FromQuery] string schType = "onbar", [FromQuery] int rev = 0, [FromQuery] int genId = 2, [FromQuery] string starttime = "2021_09_01_00_00_00", [FromQuery] string endtime = "2021_09_01_23_59_59")
        {
            DateTime startDate = DateTime.ParseExact(starttime, "yyyy_MM_dd_HH_mm_ss", CultureInfo.InvariantCulture);
            DateTime endDate = DateTime.ParseExact(endtime, "yyyy_MM_dd_HH_mm_ss", CultureInfo.InvariantCulture);

            SchResponse res = await _mediator.Send(new GetSchedulesQuery() { StartTime = startDate, EndTime = endDate, SchType = schType, GenId = genId, RevNo = rev });
            return res;
        }
    }
}
