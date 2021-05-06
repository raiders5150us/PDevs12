using ProjectDevs.Core.Interfaces.Repositories;
using System;
using System.Web.Http;

namespace ProjectDevs.Api.Controllers
{
    [RoutePrefix("api/dashboard")]
    public class DashboardController : BaseApiController
    {
        private readonly IRepoFactory _repoFactory;

        public DashboardController(IRepoFactory repoFactory)
        {
            _repoFactory = repoFactory;
        }
        [Route("summary")]
        public IHttpActionResult GetSummary()
        {
            var summary = _repoFactory.Dashboard.GetDashboardSummary(DateTime.Now);
            return Ok(summary);
        }
    }
}
