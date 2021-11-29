using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Sced
{
    public interface IScedDataFetchService
    {
        Task<SchResponse> GetSchedules(string schType, int genId, DateTime startTime, DateTime endTime, int rev, CancellationToken cancellationToken);
        Task<List<SchTsRow>> GetSmp(string regionTag, DateTime startTime, DateTime endTime, int rev, CancellationToken cancellationToken);
        Task<Dictionary<DateTime, (int gujRev, int localRev)>> GetLatestRevs(DateTime startTime, DateTime endTime, CancellationToken cancellationToken);
    }
}
