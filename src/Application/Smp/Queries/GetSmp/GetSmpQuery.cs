using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Sced;
using Application.Utils.TimeUtils;

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
            private readonly IScedDataFetchService _scedDataFetchService;

            public GetSmpQueryHandler(IScedDataFetchService scedDataFetchService)
            {
                _scedDataFetchService = scedDataFetchService;
            }

            public async Task<List<SchTsRow>> Handle(GetSmpQuery request, CancellationToken cancellationToken)
            {
                List<SchTsRow> res = new();
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
                        (_, int localRev) = latestRevs[curStartTime.Date];
                        List<SchTsRow> daySmpData = await _scedDataFetchService.GetSmp(request.RegionTag, curStartTime, curEndTime, localRev, cancellationToken);
                        // combine this day data into results
                        res.AddRange(daySmpData);
                    }
                }
                else
                {
                    res = await _scedDataFetchService.GetSmp(request.RegionTag, request.StartTime, request.EndTime, request.RevNo, cancellationToken);
                }
                return res;
            }
        }
    }
}




