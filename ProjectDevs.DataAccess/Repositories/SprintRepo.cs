using ProjectDevs.Core.Constants;
using ProjectDevs.Core.Interfaces.Repositories;
using ProjectDevs.Core.Models;
using ProjectDevs.DataAccess.Extensions;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace ProjectDevs.DataAccess.Repositories
{
    public class SprintRepo : ISprintRepo
    {
        private readonly IDbConnection _connection;

        public SprintRepo(IDbConnection connection) => _connection = connection;

        public int AddStoryToSprint(int sprintId, int projectStoryId, IDbTransaction transaction = null) =>
            _connection.ExecuteStoredProcedure(Database.StoredProcedures.PD_CreateProjectSprintMapping, new { sprintId, projectStoryId }, transaction);

        public int? CreateSprint(Sprint sprint, IDbTransaction transaction = null) =>
            _connection.QueryStoredProcedure<int>(Database.StoredProcedures.PD_CreateProjectSprint, sprint.GetCreateSpParams(), transaction)
                ?.FirstOrDefault();

        public int UpdateSprint(Sprint sprint, IDbTransaction transaction = null) =>
           _connection.ExecuteStoredProcedure(Database.StoredProcedures.PD_UpdateProjectSprint, sprint, transaction);

        public IEnumerable<SprintResult> GetSprints(int? sprintId = null) =>
             _connection.QueryStoredProcedure<SprintResult>(Database.StoredProcedures.PD_SelectProjectSprints, new { sprintId })
                ?.ToList();

        public IEnumerable<SprintStory> GetStorySprintMappings(int? sprintId = null, int? projectStoryId = null) =>
             _connection.QueryStoredProcedure<SprintStory>(Database.StoredProcedures.PD_SelectProjectSprintMapping, new { sprintId, projectStoryId })
                ?.ToList();

        public int DeleteStorySprintMapping(int projectStoryId, IDbTransaction transaction = null) =>
            _connection.ExecuteStoredProcedure(Database.StoredProcedures.PD_DeleteProjectSprintMapping, new { projectStoryId }, transaction);
    }
}
