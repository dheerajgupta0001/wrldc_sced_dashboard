using Core.Sced;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Infra.Sced
{
    public class GetRevsQueryHandler
    {
        public static async Task<List<RevisionInfo>> Handle(string scedConnStr, DateTime startTime, DateTime endTime, CancellationToken cancellationToken)
        {
            List<RevisionInfo> res = new();

            // Connect to a PostgreSQL database
            NpgsqlConnection conn = new(scedConnStr);
            conn.Open();

            string cmdStr = @"SELECT rev_date, guj_rev, rev_num, rev_time FROM public.revs_info 
                                where rev_date between @startDate and @endDate order by rev_date, rev_num";

            NpgsqlCommand command = new(cmdStr, conn);
            command.Parameters.AddWithValue("@startDate", startTime.Date);
            command.Parameters.AddWithValue("@endDate", endTime.Date);


            // Execute the query and obtain a result set
            NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
            while (dr.HasRows)
            {
                while (dr.Read())
                {
                    DateTime revDt = dr.GetDateTime(0);
                    int gujRev = dr.GetInt32(1);
                    int localRev = dr.GetInt32(2);
                    DateTime revExecTime = dr.GetDateTime(3);
                    res.Add(new RevisionInfo()
                    {
                        RevDate = revDt,
                        RevExecTime = revExecTime,
                        LocalRev = localRev,
                        RemoteRev = gujRev
                    });
                }
                dr.NextResult();
            }
            dr.Dispose();
            conn.Close();
            return res;
        }
    }
}
