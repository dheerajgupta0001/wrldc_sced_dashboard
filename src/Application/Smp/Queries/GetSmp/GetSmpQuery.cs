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
using Application.Schedules.Queries.GetSchedules;

namespace Application.Smp.Queries.GetSmp
{
    public class GetSmpQuery : IRequest<List<SchTsRow>>
    {
        public string RegionTag { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int RevNo { get; set; }

        public class GetSmpQueryHandler : IRequestHandler<GetSmpQuery, List<SchTsRow>>
        {
            private readonly string _scedConnStr;

            public GetSmpQueryHandler(IConfiguration configuration)
            {
                _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
            }

            public async Task<List<SchTsRow>> Handle(GetSmpQuery request, CancellationToken cancellationToken)
            {
                List<SchTsRow> res = new();

                // Connect to a PostgreSQL database
                NpgsqlConnection conn = new(_scedConnStr);
                conn.Open();

                string cmdStr = @"SELECT data_time, smp_val FROM public.smp_data 
                                where region_tag = @region_tag
                                and rev = @rev
                                and data_time between @startDate and @endDate order by data_time";

                NpgsqlCommand command = new(cmdStr, conn);
                command.Parameters.AddWithValue("@region_tag", request.RegionTag);
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
                        res.Add(new SchTsRow() { SchTime = dt.ToString("yyyy_MM_dd_HH_mm_ss"), SchVal = val });
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




