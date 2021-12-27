using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Revisions.Queries.GetRevisions;
using Core.Sced;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApp.Pages.Sced
{
    public class RevisionsModel : PageModel
    {
        private readonly IMediator _mediator;
        public RevisionsModel(IMediator mediator)
        {
            _mediator = mediator;
        }

        [BindProperty]
        public GetRevisionsQuery Query { get; set; }

        public List<RevisionInfo> Revisions { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            Query = new()
            {
                StartTime = DateTime.Now.Date,
                EndTime = DateTime.Now.Date
            };
            Revisions = await _mediator.Send(Query);
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            Revisions = await _mediator.Send(Query);
            return Page();
        }
    }
}