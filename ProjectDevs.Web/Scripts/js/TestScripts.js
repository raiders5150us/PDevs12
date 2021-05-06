/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="Models.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Common.ts" />
/// <reference path="UserService.ts" />
$(function () {
    var apiService = new ApiService();
    var ddlService = new DdlService(apiService);
    var testScriptService = new TestScriptService(apiService, ddlService, false);
    var MainStoryId = $('#MainStoryId').val() || 0;
    var filterProjectId = 0;
    var filterStoryId = MainStoryId;
    function loadTestScripts(pno) {
        if (pno === void 0) { pno = 1; }
        var storyTeamId = "0";
        if ($('#filter-team-id').select2('data')) {
            storyTeamId = $('#filter-team-id').select2('data').map(function (a) { return a.id; }).toString();
        }
        testScriptService.loadTestScrips(filterProjectId, filterStoryId, storyTeamId, pno);
    }
    $('#filter-team-id').select2({
        placeholder: 'Select',
        width: null,
        containerCssClass: ':all:'
    });
    $(document).on('change', '#filter-team-id', function (e) {
        var storyTeamId = "0";
        if ($('#filter-team-id').select2('data')) {
            storyTeamId = $('#filter-team-id').select2('data').map(function (a) { return a.id; }).toString();
        }
        $('#test-script-project-ddl').empty();
        $('#filter-story-id').empty();
        MainLoader.show();
        $.when(ddlService.setProjectsDdl(true, null, storyTeamId))
            .done(function () { return setTimeout(function () {
            loadTestScripts();
        }, 1000); })
            .always(function () { return MainLoader.hide(); });
    });
    $(document).on('click', '#test-scripts-paging-container a[data-pno]', function (e) {
        var btn = $(this);
        var pNo = btn.data('pno') || 0;
        if (pNo > 0) {
            loadTestScripts(pNo);
        }
    });
    UserService.loadUsersForAutocomplete();
    var storyDdl = $('#filter-story-id');
    $('#filter-project-id').change(function () {
        filterProjectId = $(this).val() || 0;
        storyDdl.empty();
        testScriptService.clearTestScripts();
        ddlService.setStoriesDdl(filterProjectId, storyDdl, true);
        ddlService.setStoriesDdl(filterProjectId, $('#test-script-story-ddl'));
        $('#test-script-project-ddl').val(filterProjectId);
        testScriptService.selectedProjectId = filterProjectId;
        var projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, filterProjectId);
        apiService.get(projectDetailUrl)
            .done(function (project) {
            if (!(UserTokenHandler.isSuperUser() || UserTokenHandler.isUserStakeholderOrOwnerForProject(project))) {
                $("[ap-action-test-script-modal-form]").hide();
            }
            else {
                $("[ap-action-test-script-modal-form]").show();
            }
        });
    });
    ddlService.setProjectsDdl();
    ddlService.setTeamsDdl();
    ddlService.setTestScriptStatusesDdl();
    storyDdl.change(function (e) {
        filterStoryId = $(this).val() || 0;
        loadTestScripts();
        $('#test-script-project-ddl').val(filterProjectId);
        $('#test-script-story-ddl').val(filterStoryId);
        testScriptService.selectedStorId = filterStoryId;
    });
    //if (!(UserTokenHandler.isSuperUser())) {
    //    $("[ap-action-test-script-modal-form]").remove();
    //}
});
//# sourceMappingURL=TestScripts.js.map