using ProjectDevs.Core.Models;
using System;

namespace ProjectDevs.Core.Interfaces.Repositories
{
    public interface IDashboardRepo
    {
        DashboardStats GetDashboardSummary(DateTime date);
    }
}
