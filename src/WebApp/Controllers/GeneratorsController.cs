using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Globalization;
using Application.Generators.Queries.GetGenerators;
using Microsoft.AspNetCore.Authorization;

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeneratorsController : ControllerBase
    {
        private readonly string _scedConnStr;
        private readonly IMediator _mediator;
        public GeneratorsController(IConfiguration configuration, IMediator mediator)
        {
            _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
            _mediator = mediator;
        }


        [HttpGet("get")]
        public async Task<List<GenResponse>> GetAsync()
        {
            List<GenResponse> res = await _mediator.Send(new GetGeneratorsQuery());
            //Console.WriteLine(res);
            return res;
        }

    }
}
