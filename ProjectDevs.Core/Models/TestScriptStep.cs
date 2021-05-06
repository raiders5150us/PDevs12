using System.ComponentModel.DataAnnotations;

namespace ProjectDevs.Core.Models
{
    public class TestScriptStep
    {
        [Key]
        public int StepId { get; set; }
        public int TestScriptId { get; set; }
        public int StepNumber { get; set; }
        [Required, MaxLength(500)]
        public string Action { get; set; }
        [Required, MaxLength(500)]
        public string ExpectedResults { get; set; }
        [Required, MaxLength(1000)]
        public string Notes { get; set; }
        public int? TestScriptStatus { get; set; }

        public object GetCreateSpParams() => new { TestScriptId, StepNumber, Action, ExpectedResults, Notes, TestScriptStatus };
    }

    public class TestScriptStepDto : TestScriptStep
    {
        public string TestScriptStatusName { get; set; }
    }
}
