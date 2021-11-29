using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Utils.TimeUtils
{
    public class SplitTimePeriodByDate
    {
        public static List<(DateTime, DateTime)> Handle(DateTime startTime, DateTime endTime)
        {
            // TODO create test 
            List<(DateTime, DateTime)> res = new();

            if (startTime > endTime)
            {
                return res;
            }

            DateTime curStartTime = startTime;
            while (curStartTime < endTime)
            {
                DateTime curEndTime = curStartTime.Date.AddDays(1).AddMinutes(-1);
                curEndTime = (curEndTime > endTime) ? endTime : curEndTime;
                res.Add((curStartTime, curEndTime));
                curStartTime = curEndTime.AddMinutes(1);
            }

            return res;
        }

    }
}
