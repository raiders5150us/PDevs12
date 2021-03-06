/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="Models.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Common.ts" />
/// <reference path="UserService.ts" />
$(function () {
    var apiService = new ApiService();
    var ddlService = new DdlService(apiService);
    var sprintsTableBody = $('#sprints-table > tbody');
    var sprintsTableFooter = $('#sprints-table > tfoot');
    var pagingContainer = $('#sprints-paging-container');
    var infoContainer = $('#apdt_sprints_info');
    var startFromElement = infoContainer.find('.apdt_startfrom');
    var endToElement = infoContainer.find('.apdt_endto');
    var totalElement = infoContainer.find('.apdt_total');
    ddlService.setTeamsDdl();
    function loadSprints(pno, psize) {
        if (pno === void 0) { pno = 1; }
        if (psize === void 0) { psize = Constants.DefaultPageSize; }
        var storyTeamId = "";
        if ($('#filter-team-id').select2('data')) {
            storyTeamId = $('#filter-team-id').select2('data').map(function (a) { return a.id; }).toString();
        }
        sprintsTableBody.empty();
        sprintsTableFooter.hide();
        pagingContainer.html('');
        startFromElement.html("0");
        endToElement.html("0");
        totalElement.html("0");
        if (storyTeamId != "") {
            MainLoader.show();
            apiService.get(ApiUrl.Sprints, { pno: pno, psize: psize, storyTeamId: storyTeamId })
                .done(function (sprints) {
                if (sprints && sprints.Data && sprints.Data.length) {
                    sprintsTableFooter.show();
                    sprints.Data.forEach(function (s) {
                        var tr = $('<tr>');
                        tr.append("<td>" + s.SprintName + "</td>");
                        tr.append("<td>" + s.TeamName + "</td>");
                        tr.append("<td>" + Utils.JsonDateToStr(s.StartDate) + "</td>");
                        tr.append("<td>" + Utils.JsonDateToStr(s.EndDate) + "</td>");
                        tr.append("<td class=\"text-center\">" + s.TotalStories + "</td>");
                        tr.append("<td class=\"text-center\">" + s.CompletedStories + "</td>");
                        tr.append("<td class=\"text-center\">" + s.PercentageComplete + "%</td>");
                        var actionColumn = "\n    <a role=\"button\" title=\"View user stories\" class=\"btn btn-xs btn-success m-r-5\" href=\"/Sprint/" + s.SprintId + "/User-Stories\"><i class=\"fa fa-list\"></i></a>\n    <button type=\"button\" title=\"Edit details\" class=\"btn btn-xs btn-primary m-r-5\" ap-action-sprint-modal-form data-sprint-id=\"" + s.SprintId + "\"><i class=\"fa fa-pencil\"></i></button>";
                        tr.append("<td class=\"text-center\">" + actionColumn + "</td>");
                        sprintsTableBody.append(tr);
                    });
                    var pageModel = {
                        CurrentPageNumber: sprints.CurrentPageNumber,
                        IsLastPage: sprints.IsLastPage,
                        PageSize: sprints.PageSize,
                        TotalPages: sprints.Count,
                    };
                    var pagination = Pagination.Render(pageModel);
                    pagingContainer.html("" + pagination);
                    var startFrom = ((sprints.CurrentPageNumber - 1) * sprints.PageSize) + 1;
                    var endTo = startFrom + sprints.Data.length - 1;
                    startFromElement.html("" + startFrom);
                    endToElement.html("" + endTo);
                    totalElement.html("" + sprints.Count);
                    if (!(UserTokenHandler.isSuperUser())) {
                        $("[ap-action-sprint-modal-form]").remove();
                    }
                }
                else {
                    Alerts.Info('No sprints found.');
                    sprintsTableFooter.hide();
                    pagingContainer.html('');
                    startFromElement.html("0");
                    endToElement.html("0");
                    totalElement.html("0");
                }
            })
                .always(function () { return MainLoader.hide(); });
        }
    }
    $(document).on("change", '#filter-team-id', function () { loadSprints(); });
    $('#filter-team-id').select2({
        placeholder: 'Select',
        width: null,
        containerCssClass: ':all:'
    });
    //loadSprints();
    $(document).on('click', '#sprints-paging-container a[data-pno]', function (e) {
        var btn = $(this);
        var pNo = btn.data('pno') || 0;
        if (pNo > 0) {
            loadSprints(pNo);
        }
    });
    /**** Create/Edit Sprints ****/
    var createEditSprintModal = $('#create-edit-sprint-modal');
    var saveSprintModalForm = createEditSprintModal.find('#sprints-form');
    var saveSprintBtn = createEditSprintModal.find('#save-sprint-btn');
    function openCreateSprintPopup(sprintId) {
        if (sprintId === void 0) { sprintId = 0; }
        var sprintIdElement = createEditSprintModal.find('[name=SprintId]');
        sprintIdElement.val(sprintId);
        if (sprintId > 0) {
            MainLoader.show();
            var sprintDetailUrl = UrlHelper.GetSprintsUrl(ApiUrl.SprintDetail, sprintId);
            apiService.get(sprintDetailUrl)
                .done(function (s) {
                createEditSprintModal.find('[name=SprintName]').val(s.SprintName);
                createEditSprintModal.find('[name=TeamId]').val(s.TeamID);
                createEditSprintModal.find('[name=StartDate]').val(Utils.JsonDateToStr(s.StartDate, true));
                createEditSprintModal.find('[name=EndDate]').val(Utils.JsonDateToStr(s.EndDate, true));
                createEditSprintModal.modal('show');
            }).always(function () { return MainLoader.hide(); });
        }
        else
            createEditSprintModal.modal('show');
    }
    function resetStorySprintForm() {
        saveSprintModalForm[0].reset();
        saveSprintModalForm.find('input:hidden').val('');
    }
    createEditSprintModal.on('hide.bs.modal', function () {
        resetStorySprintForm();
    });
    $(document).on('click', '[ap-action-sprint-modal-form]', function (e) {
        var btn = $(this);
        var sprintId = btn.data('sprint-id') || 0;
        openCreateSprintPopup(sprintId);
    });
    saveSprintBtn.on('click', function (e) {
        var sprintId = saveSprintModalForm.find('[name=SprintId]').val() || 0;
        MainLoader.show();
        if (sprintId > 0) {
            var sprintSaveUrl = UrlHelper.GetSprintsUrl(ApiUrl.SprintUpdate, sprintId);
            apiService.put(sprintSaveUrl, saveSprintModalForm.serialize())
                .done(function (data, status, xhr) {
                if (xhr.status === 200 || xhr.status === 201) {
                    Alerts.Success('Sprint updated successfully.');
                    createEditSprintModal.modal('hide');
                    loadSprints();
                }
            })
                .always(function () { return MainLoader.hide(); });
        }
        else {
            var sprintSaveUrl = UrlHelper.GetSprintsUrl(ApiUrl.SprintCreate, 0);
            apiService.post(sprintSaveUrl, saveSprintModalForm.serialize())
                .done(function (data, status, xhr) {
                if (xhr.status === 200 || xhr.status === 201) {
                    Alerts.Success('Sprint created successfully.');
                    createEditSprintModal.modal('hide');
                    loadSprints();
                }
            })
                .always(function () { return MainLoader.hide(); });
        }
    });
    if (!(UserTokenHandler.isSuperUser())) {
        $("[ap-action-sprint-modal-form]").hide();
    }
    /**** Create/Edit Sprints END ****/
});
//# sourceMappingURL=Sprints.js.map