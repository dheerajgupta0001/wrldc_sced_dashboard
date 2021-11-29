﻿using AutoMapper;
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
    public class GetSchedulesQuery : IRequest<SchResponse>
    {
        public string SchType { get; set; }
        public int GenId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int RevNo { get; set; }

        public class GetUserByIdQueryHandler : IRequestHandler<GetSchedulesQuery, SchResponse>
        {
            private readonly string _scedConnStr;

            public GetUserByIdQueryHandler(IConfiguration configuration)
            {
                _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
            }

            public async Task<SchResponse> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
            {
                SchResponse res = new();
                res.GenSchedules = new();

                // Connect to a PostgreSQL database
                NpgsqlConnection conn = new(_scedConnStr);
                conn.Open();

                string cmdStr = @"SELECT g_id, sch_time, sch_val FROM public.gens_data 
                                where sch_type = @schType
                                and g_id = @g_id
                                and rev = @rev
                                and sch_time between @startDate and @endDate order by sch_time";
                if (request.GenId == -1)
                {
                    // get all generators schedules individually
                    cmdStr.Replace("and g_id = @g_id", "");
                }
                else if (request.GenId == 0)
                {
                    // get all generators schedules combined
                    cmdStr = @"SELECT 0 as g_id, sch_time, sum(sch_val) FROM public.gens_data 
                                where sch_type = @schType
                                and rev = @rev
                                and sch_time between @startDate and @endDate 
                                group by sch_time 
                                order by sch_time";
                }
                
                NpgsqlCommand command = new(cmdStr, conn);
                command.Parameters.AddWithValue("@schType", request.SchType);
                if (request.GenId != -1 && request.GenId != 0)
                {
                    command.Parameters.AddWithValue("@g_id", request.GenId);
                }
                command.Parameters.AddWithValue("@rev", request.RevNo);
                command.Parameters.AddWithValue("@startDate", request.StartTime);
                command.Parameters.AddWithValue("@endDate", request.EndTime);


                // Execute the query and obtain a result set
                NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
                while (dr.HasRows)
                {
                    while (dr.Read())
                    {
                        int genId = dr.GetInt32(0);
                        DateTime dt = dr.GetDateTime(1);
                        float val = dr.GetFloat(2);
                        if (!res.GenSchedules.ContainsKey(genId))
                        {
                            res.GenSchedules[genId] = new List<SchTsRow>();
                        }
                        res.GenSchedules[genId].Add(new SchTsRow() { SchTime = dt.ToString("yyyy_MM_dd_HH_mm_ss"), SchVal = val });
                    }
                    dr.NextResult();
                }
                dr.Dispose();
                conn.Close();
                // TODO
                // if rev = -1, get the latest revision number for each desired days
                // fetch the data for each day
                // combine all days data and send to results
                return res;
            }
        }
    }
}




