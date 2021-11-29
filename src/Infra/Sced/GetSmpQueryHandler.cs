using Core.Sced;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Infra.Sced
{
    public partial class ScedDataFetchService
    {
        public class GetSmpQueryHandler
        {
            public static async Task<List<SchTsRow>> Handle(string scedConnStr, string regionTag, DateTime startTime, DateTime endTime, int rev, CancellationToken cancellationToken)
            {
                List<SchTsRow> res = new();

                // Connect to a PostgreSQL database
                NpgsqlConnection conn = new(scedConnStr);
                conn.Open();

                string cmdStr = @"SELECT data_time, smp_val FROM public.smp_data 
                                where region_tag = @region_tag
                                and rev = @rev
                                and data_time between @startDate and @endDate order by data_time";

                NpgsqlCommand command = new(cmdStr, conn);
                command.Parameters.AddWithValue("@region_tag", regionTag);
                command.Parameters.AddWithValue("@rev", rev);
                command.Parameters.AddWithValue("@startDate", startTime);
                command.Parameters.AddWithValue("@endDate", endTime);


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
