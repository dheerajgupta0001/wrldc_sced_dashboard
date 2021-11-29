using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Core.Sced;
using System.Collections.Generic;
using Application.Utils.TimeUtils;

namespace Application.Schedules.Queries.GetSchedules
{
    public class GetSchedulesQuery : IRequest<SchResponse>
    {
        public string SchType { get; set; }
        public int GenId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int RevNo { get; set; }

        public class GetSchedulesQueryHandler : IRequestHandler<GetSchedulesQuery, SchResponse>
        {
            private readonly IScedDataFetchService _scedDataFetchService;

            public GetSchedulesQueryHandler(IScedDataFetchService scedDataFetchService)
            {
                _scedDataFetchService = scedDataFetchService;
            }

            public async Task<SchResponse> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
            {
                SchResponse res = new();
                DateTime startTime = request.StartTime;
                DateTime endTime = request.EndTime;
                if (request.RevNo == -1)
                {
                    // if rev = -1, get the latest revision number for each desired days
                    var latestRevs = await _scedDataFetchService.GetLatestRevs(startTime, endTime, cancellationToken);
                    List<(DateTime, DateTime)> dateBins = SplitTimePeriodByDate.Handle(startTime, endTime);
                    foreach ((DateTime curStartTime, DateTime curEndTime) in dateBins)
                    {
                        // fetch the data for each day
                        (int _, int localRev) = latestRevs[curStartTime.Date];
                        SchResponse daySchData = await _scedDataFetchService.GetSchedules(request.SchType, request.GenId, curStartTime, curEndTime, localRev, cancellationToken);
                        // combine this day data into results
                        foreach (int gId in daySchData.GenSchedules.Keys)
                        {
                            if (!res.GenSchedules.ContainsKey(gId))
                            {
                                res.GenSchedules[gId] = new List<SchTsRow>();
                            }
                            res.GenSchedules[gId].AddRange(daySchData.GenSchedules[gId]);
                        }
                    }
                }
                else
                {
                    res = await _scedDataFetchService.GetSchedules(request.SchType, request.GenId, request.StartTime, request.EndTime, request.RevNo, cancellationToken);
                }
                return res;
            }
        }
    }
}




