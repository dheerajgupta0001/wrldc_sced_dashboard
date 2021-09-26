using AutoMapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Generators.Queries.GetGenerators
{
    public class GetGeneratorsQuery : IRequest<List<GenResponse>>
    {
        public class GetUserByIdQueryHandler : IRequestHandler<GetGeneratorsQuery, List<GenResponse>>
        {
            private readonly string _scedConnStr;

            private readonly IMapper _mapper;

            public GetUserByIdQueryHandler(IConfiguration configuration, IMapper mapper)
            {
                _scedConnStr = configuration["ConnectionStrings:ScedConnection"];
                _mapper = mapper;
            }

            public async Task<List<GenResponse>> Handle(GetGeneratorsQuery request, CancellationToken cancellationToken)
            {
                List<GenResponse> res = new();

                // Connect to a PostgreSQL database
                NpgsqlConnection conn = new(_scedConnStr);
                conn.Open();

                NpgsqlCommand command = new(@$"SELECT id, g_name, vc, fuel_type, avg_pu_cap, tm_pu, rup_pu, rdn_pu FROM public.gens ", conn);

                // Execute the query and obtain a result set
                NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
                while (dr.HasRows)
                {
                    while (dr.Read())
                    {
                        int id = dr.GetInt32(0);
                        string name = dr.GetString(1);
                        float vcPu = dr.GetFloat(2);
                        string fuelType = dr.GetString(3);
                        float avgPuCap = dr.GetFloat(4);
                        float tmPu = dr.GetFloat(5);
                        float rUpPu = dr.GetFloat(6);
                        float rDnPu = dr.GetFloat(7);
                        res.Add(new GenResponse()
                        {
                            Id = id,
                            Name = name,
                            VcPu = vcPu,
                            FuelType = fuelType,
                            AvgPuCap = avgPuCap,
                            TmPu = tmPu,
                            RampUpPu = rUpPu,
                            RampDownPu = rDnPu
                        });
                    }
                    dr.NextResult();
                }
                dr.Dispose();
                conn.Close();
                return res;
            }
        }
    }
}
