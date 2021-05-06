using NLog;
using ProjectDevs.Business.Extensions;
using ProjectDevs.Core.Constants;
using ProjectDevs.Core.Interfaces.Repositories;
using ProjectDevs.Core.Interfaces.Services;
using ProjectDevs.Core.Models;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace ProjectDevs.Api.Controllers
{
    [RoutePrefix("api/storytasks/{storyId}")]
    public class TasksController : BaseApiController
    {
        private static readonly Logger _logger = LogManager.GetCurrentClassLogger();
        private readonly IRepoFactory _repoFactory;
        private readonly ICacheService _cacheService;

        public TasksController(IRepoFactory repoFactory, ICacheService cacheService)
        {
            _repoFactory = repoFactory;
            _cacheService = cacheService;
        }

        [Route("")]
        public IHttpActionResult GetStoryTasks(int storyId, int pno = 1, int psize = PdConstants.DefaultPageSize, string assignedToUserId = null, int? taskStatus = 0,string TeamId=null)
        {
            int? storyIdParam = null;
            if (storyId > 0)
                storyIdParam = storyId;
            var tasks = _repoFactory.StoryTasks.GetStoryTasks(storyId: storyIdParam, assignedToUserId: assignedToUserId,teamId:TeamId);
            if (tasks?.Any() == true)
            {
                if (taskStatus.HasValue && taskStatus.Value > 0)
                {
                    tasks = tasks.Where(t => t.TaskStatus == taskStatus);
                }
                return GetTasksPaging(tasks, pno, psize);
            }
            return Ok();
        }
        [Route("my")]
        public IHttpActionResult GetMyStoryTasks(string TeamId = null,int pno = 1, int psize = PdConstants.DefaultPageSize)
        {
            var tasks = _repoFactory.StoryTasks.GetMyTasks(base.UserId,null,null,TeamId);
            return GetTasksPaging(tasks, pno, psize);
        }
        private IHttpActionResult GetTasksPaging(IEnumerable<StoryTask> tasks, int pno, int psize)
        {
            if (tasks?.Any() == true)
            {
                var pagedData = tasks.GetPagingModel(pno, psize);

                var paged = tasks.GetPaged(pno, psize);
                if (paged?.Any() == true)
                {
                    paged.ToList().ForEach(t =>
                    {
                        t.TaskStatusName = _cacheService.GetTaskStatusName(t.TaskStatus);
                        if (!string.IsNullOrWhiteSpace(t.AssignedToUserId))
                            t.AssigneeName = _cacheService.GetUserName(t.AssignedToUserId);
                    });

                    var pagingData = new PagingModel<StoryTask>(paged, tasks.Count(), pno, psize);
                    return Ok(pagingData);
                }
            }
            return Ok();
        }

        [Route("task/{taskId}")]
        public IHttpActionResult GetTaskById(int storyId, int taskId)
        {
            var task = _repoFactory.StoryTasks.GetStoryTasks(taskId, storyId)?.FirstOrDefault();
            if (task != null)
            {
                task.TaskStatusName = _cacheService.GetTaskStatusName(task.TaskStatus);
                if (!string.IsNullOrWhiteSpace(task.AssignedToUserId))
                    task.AssigneeName = _cacheService.GetUserName(task.AssignedToUserId);
                return Ok(task);
            }
            return NotFound();
        }

        [HttpPost]
        [Route("task/create")]
        public IHttpActionResult CreateStoryTask(int storyId, StoryTask model)
        {
            if (ModelState.IsValid)
            {
                var newTaskIdd = _repoFactory.StoryTasks.CreateStoryTask(model);
                if (newTaskIdd.HasValue)
                {
                    model.TaskId = newTaskIdd.Value;
                    return Created($"/api/tasks/{storyId}/task/{model.TaskId}", model);
                }
                return BadRequest("Task could not be created.");
            }
            return BadRequest(ModelState);
        }
        [HttpPut]
        [Route("task/{taskId}")]
        public IHttpActionResult UpdateStoryTask(int storyId, int taskId, StoryTask model)
        {
            if (taskId != model.TaskId || storyId != model.StoryId)
                return NotFound();
            if (ModelState.IsValid)
            {
                _repoFactory.StoryTasks.UpdateStoryTask(model);
                return Ok();
            }
            return BadRequest(ModelState);
        }

        [Route("master/status")]
        public IHttpActionResult GetTaskStatus() => Ok(_cacheService.TaskStatusNames.Select(s => new { Value = s.Key, Text = s.Value }));
    }
}
