using Application.Utils.TimeUtils;
using Core.Sced;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Revisions.Queries.GetRevisions
{
    public class GetRevisionsQuery : IRequest<List<RevisionInfo>>
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public class GetRevisionsQueryHandler : IRequestHandler<GetRevisionsQuery, List<RevisionInfo>>
        {
            private readonly IScedDataFetchService _scedDataFetchService;

            public GetRevisionsQueryHandler(IScedDataFetchService scedDataFetchService)
            {
                _scedDataFetchService = scedDataFetchService;
            }

            public async Task<List<RevisionInfo>> Handle(GetRevisionsQuery request, CancellationToken cancellationToken)
            {
                DateTime startTime = request.StartTime;
                DateTime endTime = request.EndTime;
                List<RevisionInfo> revs = await _scedDataFetchService.GetRevs(startTime, endTime, cancellationToken);
                return revs;
            }
        }
    }
}
