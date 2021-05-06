using ProjectDevs.Core.Interfaces.Repositories;
using ProjectDevs.Core.Models;
using System;
using System.Data;

namespace ProjectDevs.DataAccess.Repositories
{
    public class DashboardRepo : IDashboardRepo
    {
        private readonly IDbConnection _connection;

        public DashboardRepo(IDbConnection connection) => _connection = connection;

        public DashboardStats GetDashboardSummary(DateTime date) =>
            //_connection.QueryStoredProcedureFirstOrDefault<DashboardStats>(Database.StoredProcedures.PD_DashboardSummary, new { date });
            new DashboardStats
            {
                Date = DateTime.Now,
                ActiveProjects = 15,
                AverageStoriesCompletedPerSprint = 24,
                AverageTimeToCompletionPerStory = 7.5m,
                IssuesReportedPerStory = 1.25m,
                ProjectedHoursToActualHours = 128m,
                TestScriptFirstAttemptPassRate = 77m
            };
    }
}
