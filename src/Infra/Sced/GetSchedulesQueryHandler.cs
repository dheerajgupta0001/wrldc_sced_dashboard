using Core.Sced;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Infra.Sced
{
    public class GetSchedulesQueryHandler
    {
        public static async Task<SchResponse> Handle(string scedConnStr, string schType, int genId, DateTime startTime, DateTime endTime, int rev, CancellationToken cancellationToken)
        {
            SchResponse res = new();
            res.GenSchedules = new();

            // Connect to a PostgreSQL database
            NpgsqlConnection conn = new(scedConnStr);
            conn.Open();

            string cmdStr = @"SELECT g_id, sch_time, sch_val FROM public.gens_data 
                                where sch_type = @schType
                                and g_id = @g_id
                                and rev = @rev
                                and sch_time between @startDate and @endDate order by sch_time";
            if (genId == -1)
            {
                // get all generators schedules individually
                cmdStr = cmdStr.Replace("and g_id = @g_id", "");
            }
            else if (genId == 0)
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
            command.Parameters.AddWithValue("@schType", schType);
            if (genId != -1 && genId != 0)
            {
                command.Parameters.AddWithValue("@g_id", genId);
            }
            command.Parameters.AddWithValue("@rev", rev);
            command.Parameters.AddWithValue("@startDate", startTime);
            command.Parameters.AddWithValue("@endDate", endTime);


            // Execute the query and obtain a result set
            NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
            while (dr.HasRows)
            {
                while (dr.Read())
                {
                    int gId = dr.GetInt32(0);
                    DateTime dt = dr.GetDateTime(1);
                    float val = dr.GetFloat(2);
                    if (!res.GenSchedules.ContainsKey(gId))
                    {
                        res.GenSchedules[gId] = new List<SchTsRow>();
                    }
                    res.GenSchedules[gId].Add(new SchTsRow() { SchTime = dt.ToString("yyyy_MM_dd_HH_mm_ss"), SchVal = val });
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
