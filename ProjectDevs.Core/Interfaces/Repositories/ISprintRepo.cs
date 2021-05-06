using ProjectDevs.Core.Models;
using System.Collections.Generic;
using System.Data;

namespace ProjectDevs.Core.Interfaces.Repositories
{
    public interface ISprintRepo
    {
        int? CreateSprint(Sprint sprint, IDbTransaction transaction = null);
        int UpdateSprint(Sprint sprint, IDbTransaction transaction = null);
        IEnumerable<SprintResult> GetSprints(int? sprintId = null);

        int AddStoryToSprint(int sprintId, int projectStoryId, IDbTransaction transaction = null);
        IEnumerable<SprintStory> GetStorySprintMappings(int? sprintId = null, int? projectStoryId = null);
        int DeleteStorySprintMapping(int projectStoryId, IDbTransaction transaction = null);
    }
}
