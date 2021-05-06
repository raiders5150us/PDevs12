using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectDevs.Core.Models
{
    [Table("ProjectSprints", Schema = "dbo")]
    public class Sprint
    {
        [Key, Required]
        public int SprintId { get; set; }
        [Required, MaxLength(50)]
        public string SprintName { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }

        public int TeamID { get; set; }

        public object GetCreateSpParams() => new { SprintName, StartDate, EndDate,TeamID };
    }

    // SP Result Model - PD_SelectProjectSprintMapping
    public class SprintStory
    {
        public int SprintId { get; set; }
        public string SprintName { get; set; }
        public DateTime SprintStartDate { get; set; }
        public DateTime SprintEndDate { get; set; }

        public int StoryId { get; set; }
        public int ProjectId { get; set; }
        public int StoryStatus { get; set; }
        public string F1 { get; set; }
        public string F2 { get; set; }
        public string F3 { get; set; }
        public string AcceptanceCriteria { get; set; }
        public string RequesterId { get; set; }
        public DateTime? RequestDate { get; set; }
        public DateTime? StoryStartDate { get; set; }
        public DateTime? StoryEndDate { get; set; }
        public string AssignedToUserId { get; set; }
        public string Environment { get; set; }
        public int? PriorityRanking { get; set; }
        public int? StoryTypeId { get; set; }

        public float? ProjectedHours { get; set; }
        public float? ActualHours { get; set; }

        [NotMapped]
        public string StoryName { get; set; }
    }

    //SP Result Model - PD_SelectProjectSprints
    public class SprintResult
    {
        public int SprintId { get; set; }
        public string SprintName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalStories { get; set; }
        public int CompletedStories { get; set; }
        public int TeamID { get; set; }

        public decimal PercentageComplete => CompletedStories > 0 ? decimal.Round((CompletedStories / (decimal)TotalStories) * 100, 2) : 0;
    }
}
