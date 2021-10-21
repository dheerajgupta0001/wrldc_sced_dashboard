using System.Collections.Generic;

namespace Application.Schedules.Queries.GetSchedules
{
    public class SchResponse
    {
        public Dictionary<int, List<SchTsRow>> GenSchedules { get; set; } = new();
    }

    public class SchTsRow
    {
        public string SchTime { get; set; }
        public float SchVal { get; set; }

    }
}




