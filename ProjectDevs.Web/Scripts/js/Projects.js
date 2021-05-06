/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="Models.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Common.ts" />
/// <reference path="ProjectService.ts" />
/// <reference path="UserService.ts" />
$(function () {
    var isMyPage = $('#IsMyPage').val() === 'True';
    var apiService = new ApiService();
    var selectedStakeholders = [];
    var projectService = new ProjectService(isMyPage, apiService, false, selectedStakeholders);
    var ddlService = new DdlService(apiService);
    //projectService.loadProjects();
    ddlService.setProjectStatusesDdl();
    ddlService.setTeamsDdl();
    MainLoader.show();
    $.when(ddlService.setTeamsDdl())
        .done(function () { return setTimeout(function () {
        filterProjects();
        //$('#filter-team-id').change(filterProjects());
    }, 1000); })
        .always(function () { return MainLoader.hide(); });
    UserService.loadUsersForAutocomplete(selectedStakeholders, 'stakeholder-txt', $('#stakeholders-box-list'));
    function filterProjects() {
        var storyTeamId = "";
        if ($('#filter-team-id').select2('data')) {
            storyTeamId = $('#filter-team-id').select2('data').map(function (a) { return a.id; }).toString();
        }
        else {
            storyTeamId = "0";
        }
        var statusId = "";
        if ($('#filter-status-id').select2('data')) {
            statusId = $('#filter-status-id').select2('data').map(function (a) { return a.id; }).toString();
        }
        else {
            statusId = "0";
        }
        projectService.projectFilterModel.storyTeamId = storyTeamId;
        projectService.projectFilterModel.statusId = statusId;
        projectService.loadProjects();
    }
    $(document).on("change", '#filter-team-id', function () { filterProjects(); });
    $(document).on("change", '#filter-status-id', function () { filterProjects(); });
    $('#filter-team-id').select2({
        placeholder: 'Select Team'
    });
    $('#filter-status-id').select2({
        placeholder: 'Select Status'
    });
    if (UserTokenHandler.isSuperUser()) {
        $("[ap-action-project-modal-form]").removeAttr("disabled");
    }
    else {
        $("[ap-action-project-modal-form]").attr("disabled", "disabled");
    }
});
//# sourceMappingURL=Projects.js.map