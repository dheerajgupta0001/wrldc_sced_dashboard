using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Infra.Sced
{
    public class GetLatestRevsQueryHandler
    {
        public static async Task<Dictionary<DateTime, (int gujRev, int localRev)>> Handle(string scedConnStr, DateTime startTime, DateTime endTime, CancellationToken cancellationToken)
        {
            Dictionary<DateTime, (int gujRev, int localRev)> res = new();

            // Connect to a PostgreSQL database
            NpgsqlConnection conn = new(scedConnStr);
            conn.Open();

            string cmdStr = @"SELECT rev_date, latest_guj_rev, latest_rev FROM public.daywise_latest_revs 
                                where rev_date between @startDate and @endDate order by data_time";

            NpgsqlCommand command = new(cmdStr, conn);
            command.Parameters.AddWithValue("@startDate", startTime.Date);
            command.Parameters.AddWithValue("@endDate", endTime.Date);


            // Execute the query and obtain a result set
            NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
            while (dr.HasRows)
            {
                while (dr.Read())
                {
                    DateTime dt = dr.GetDateTime(0);
                    int gujRev = dr.GetInt32(1);
                    int localRev = dr.GetInt32(2);
                    res[dt] = (gujRev, localRev);
                }
                dr.NextResult();
            }
            dr.Dispose();
            conn.Close();
            return res;
        }
    }
}
