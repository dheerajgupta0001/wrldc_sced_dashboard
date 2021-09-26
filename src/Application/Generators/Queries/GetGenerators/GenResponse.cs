namespace Application.Generators.Queries.GetGenerators
{
    public class GenResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public float VcPu { get; set; }
        public string FuelType { get; set; }
        public float AvgPuCap { get; set; }
        public float TmPu { get; set; }
        public float RampUpPu { get; set; }
        public float RampDownPu { get; set; }
    }
}
