/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="Models.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Common.ts" />
/// <reference path="UserService.ts" />

$(function () {
    const apiService = new ApiService();
    const ddlService = new DdlService(apiService);
    const testScriptService = new TestScriptService(apiService, ddlService, false);

    const MainStoryId: number = $('#MainStoryId').val() || 0;

    

    let filterProjectId = 0;
    let filterStoryId = MainStoryId;

    function loadTestScripts(pno = 1) {       
        let storyTeamId: string = "0";
        if ($('#filter-team-id').select2('data')) {
            storyTeamId = $('#filter-team-id').select2('data').map(a => a.id).toString();
        }

        testScriptService.loadTestScrips(filterProjectId, filterStoryId,storyTeamId, pno);
    }


    $('#filter-team-id').select2({
        placeholder: 'Select',
        width: null,
        containerCssClass: ':all:'
    });
    $(document).on('change', '#filter-team-id', function (e) {        
        let storyTeamId: string = "0";
        if ($('#filter-team-id').select2('data')) {
            storyTeamId = $('#filter-team-id').select2('data').map(a => a.id).toString();
        }

        $('#test-script-project-ddl').empty();
        $('#filter-story-id').empty();
        MainLoader.show();
        $.when(ddlService.setProjectsDdl(true, null, storyTeamId))
            .done(() => setTimeout(() => {
                loadTestScripts();
            }, 1000))
            .always(() => MainLoader.hide());
    });
    $(document).on('click', '#test-scripts-paging-container a[data-pno]', function (e) {
        const btn = $(this);
        const pNo: number = btn.data('pno') || 0;
        if (pNo > 0) {
            loadTestScripts(pNo);
        }
    });

    

    UserService.loadUsersForAutocomplete();

    const storyDdl = $('#filter-story-id');
    $('#filter-project-id').change(function () {
        filterProjectId = $(this).val() || 0;
        storyDdl.empty();
        testScriptService.clearTestScripts();

        ddlService.setStoriesDdl(filterProjectId, storyDdl, true);

        ddlService.setStoriesDdl(filterProjectId, $('#test-script-story-ddl'));
        $('#test-script-project-ddl').val(filterProjectId);

        testScriptService.selectedProjectId = filterProjectId;        
        const projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, filterProjectId);
        apiService.get(projectDetailUrl)
            .done((project: IProjectDto) => {
                
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
    })

    //if (!(UserTokenHandler.isSuperUser())) {
    //    $("[ap-action-test-script-modal-form]").remove();
    //}
});