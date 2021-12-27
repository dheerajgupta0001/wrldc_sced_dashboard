using Application.Schedules.Queries.GetSchedules;
using Core.Sced;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Infra.Sced
{
    public partial class ScedDataFetchService : IScedDataFetchService
    {
        private readonly string _scedConnStr;

        public ScedDataFetchService(IConfiguration configuration)
        {
            _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
        }

        public async Task<SchResponse> GetSchedules(string schType, int genId, DateTime startTime, DateTime endTime, int rev, CancellationToken cancellationToken)
        {
            SchResponse res = await GetSchedulesQueryHandler.Handle(_scedConnStr, schType, genId, startTime, endTime, rev, cancellationToken);
            return res;
        }

        public async Task<List<SchTsRow>> GetSmp(string regionTag, DateTime startTime, DateTime endTime, int rev, CancellationToken cancellationToken)
        {
            List<SchTsRow> res = await GetSmpQueryHandler.Handle(_scedConnStr, regionTag, startTime, endTime, rev, cancellationToken);
            return res;
        }

        public async Task<Dictionary<DateTime, (int gujRev, int localRev)>> GetLatestRevs(DateTime startTime, DateTime endTime, CancellationToken cancellationToken)
        {
            Dictionary<DateTime, (int gujRev, int localRev)> res = await GetLatestRevsQueryHandler.Handle(_scedConnStr, startTime, endTime, cancellationToken);
            return res;
        }

        public async Task<List<RevisionInfo>> GetRevs(DateTime startTime, DateTime endTime, CancellationToken cancellationToken)
        {
            List<RevisionInfo> res = await GetRevsQueryHandler.Handle(_scedConnStr, startTime, endTime, cancellationToken);
            return res;
        }
    }
}
