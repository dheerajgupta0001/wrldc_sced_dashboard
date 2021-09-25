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

                NpgsqlCommand command = new(@$"SELECT id, g_name FROM public.gens ", conn);

                // Execute the query and obtain a result set
                NpgsqlDataReader dr = await command.ExecuteReaderAsync(cancellationToken);
                while (dr.HasRows)
                {
                    while (dr.Read())
                    {
                        string name = dr.GetString(1);
                        int id = dr.GetInt32(0);
                        res.Add(new GenResponse() { name = name, id = id });
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
