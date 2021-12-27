using System;

namespace Core.Sced
{
    public class RevisionInfo
    {
        public DateTime RevDate { get; set; }
        public DateTime RevExecTime { get; set; }
        public int RemoteRev { get; set; }
        public int LocalRev { get; set; }
    }
}
