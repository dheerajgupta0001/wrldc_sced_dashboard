using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Users.Queries.GetAppUsers;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Application.Schedules.Queries.GetSchedules
{
    public class GetSchedulesQuery : IRequest<List<SchResponse>>
    {
        public string SchType { get; set; }
        public int GenId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int RevNo { get; set; }

        public class GetUserByIdQueryHandler : IRequestHandler<GetSchedulesQuery, List<SchResponse>>
        {
            private readonly string _scedConnStr;

            public GetUserByIdQueryHandler(IConfiguration configuration)
            {
                _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
            }

            public async Task<List<SchResponse>> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
            {
                List<SchResponse> res = new();

                // Connect to a PostgreSQL database
                NpgsqlConnection conn = new(_scedConnStr);
                conn.Open();

                NpgsqlCommand command = new(@$"SELECT sch_time, sch_val FROM public.gens_data 
                                                        where sch_type = @schType
                                                        and g_id = @g_id
                                                        and rev = @rev
                                                        and sch_time between @startDate and @endDate order by sch_time", conn);

                command.Parameters.AddWithValue("@schType", request.SchType);
                command.Parameters.AddWithValue("@g_id", request.GenId);
                command.Parameters.AddWithValue("@rev", request.RevNo);
                command.Parameters.AddWithValue("@startDate", request.StartTime);
                command.Parameters.AddWithValue("@endDate", request.EndTime);


                // Execute the query and obtain a result set
                NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
                while (dr.HasRows)
                {
                    while (dr.Read())
                    {
                        DateTime dt = dr.GetDateTime(0);
                        float val = dr.GetFloat(1);
                        res.Add(new SchResponse() { SchTime = dt.ToString("yyyy_MM_dd_HH_mm_ss"), SchVal = val });
                    }
                    dr.NextResult();
                }
                dr.Dispose();
                conn.Close();
                return res;
            }
        }
    }
}




