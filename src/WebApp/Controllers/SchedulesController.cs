using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        [HttpGet("get")]
        public List<object> Get([FromQuery] string schType = "onbar", [FromQuery] string starttime = "2021_09_22_00_00_00", [FromQuery] string endtime = "2021_09_22_23_59_59")
        {
            DateTime startDate = DateTime.ParseExact(starttime, "yyyy_MM_dd_HH_mm_ss", CultureInfo.InvariantCulture);
            DateTime endDate = DateTime.ParseExact(endtime, "yyyy_MM_dd_HH_mm_ss", CultureInfo.InvariantCulture);
            // TODO complete this
            return new List<object>();
        }
    }
}
