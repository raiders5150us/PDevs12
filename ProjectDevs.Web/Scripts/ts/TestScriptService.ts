﻿/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="Models.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Common.ts" />
/// <reference path="UserService.ts" />

class TestScriptService {
    private testScriptsTable = $('#test-scripts-table');
    private testScriptsTableBody = $('#test-scripts-table > tbody');
    private pagingContainer = $('#test-scripts-paging-container');
    private infoContainer = $('#apdt_test-scripts_info');
    private startFromElement = this.infoContainer.find('.apdt_startfrom');
    private endToElement = this.infoContainer.find('.apdt_endto');
    private totalElement = this.infoContainer.find('.apdt_total');

    private oneClickApprovalBtn = $('#one-click-approval-btn');

    private testScriptStepsTableBody = $('#test-script-steps-table > tbody');
    private TestScriptStepsData: ITestScriptStepDto[] = [];
    private createEditTestScriptModal = $('#create-edit-test-script-modal');
    private saveTestScriptModalForm = this.createEditTestScriptModal.find('#test-scripts-form');
    private saveTestScriptBtn = this.createEditTestScriptModal.find('#save-test-script-btn');

    private createEditTestScriptStepModal = $('#create-edit-test-script-step-modal');
    private saveTestScriptStepModalForm = this.createEditTestScriptStepModal.find('#test-scripts-step-form');
    private saveTestScriptStepBtn = this.createEditTestScriptStepModal.find('#save-test-script-step-btn');

    private formProjectsDdl = this.saveTestScriptModalForm.find('#test-script-project-ddl');
    private formStoryDdl = this.saveTestScriptModalForm.find('#test-script-story-ddl');

    selectedProjectId = 0;
    selectedStorId = 0;
    selectedTeamIds = "";

    constructor(private apiService: ApiService, private ddlService: DdlService, private isDetailPage: boolean) {
        this.init();
    }

    clearTestScripts() {
        this.pagingContainer.html('');
        this.startFromElement.html(`0`);
        this.endToElement.html(`0`);
        this.totalElement.html(`0`);
        this.infoContainer.hide();

        this.testScriptsTableBody.empty();
        this.testScriptsTable.hide();
    }

    loadTestScrips(projectId: number, storyId: number, teamIds: string, pno: number = 1, psize: number = Constants.DefaultPageSize) {

        this.selectedProjectId = projectId;
        this.selectedStorId = storyId;
        this.selectedTeamIds = teamIds;

        MainLoader.show();
        this.apiService.get(ApiUrl.TestScripts, { pno, psize, storyId: storyId, projectId: projectId, teamIds: teamIds })
            .done((s: IPagingModel<ITestScriptDto>) => {


                this.clearTestScripts();

                if (s && s.Data && s.Data.length) {
                    this.testScriptsTable.show();
                    this.infoContainer.show();

                    s.Data.forEach(s => {
                        const tr = $('<tr>');

                        const action = `
        <a role="button" title="View Steps" class="btn btn-xs btn-success m-r-5 d-inline" href="/User-Story/${s.StoryId}/Test-Scripts/${s.TestScriptId}"><i class="fa fa-list"></i></a>
        <button type="button" title="Edit Script" class="btn btn-xs btn-primary" ap-action-test-script-modal-form data-story-id="${s.StoryId}"  data-test-script-id="${s.TestScriptId}" data-project-id="${s.ProjectId}"><i class="fa fa-pencil"></i></button>`;

                        tr.append(`<td class="text-center v-middle">${s.TestScriptStatusName}</td>`);
                        tr.append(`<td class="v-middle">${s.CreatedByUserName}</td>`);
                        tr.append(`<td class="v-middle">${s.DeveloperName}</td>`);

                        tr.append(`<td class="v-middle">${s.DevManagerName}</td>`);
                        tr.append(`<td class="v-middle">${s.BusinessAnalystName}</td>`);
                        tr.append(`<td class="v-middle">${s.BusinessStakeholderName}</td>`);

                        tr.append(`<td class="v-middle">${Utils.JsonDateToStr(s.RequestDate)}</td>`);
                        tr.append(`<td class="v-middle">${Utils.JsonDateToStr(s.RequestedByDate)}</td>`);
                        tr.append(`<td class="text-center v-middle">${action}</td>`);

                        this.testScriptsTableBody.append(tr);
                    });
                    const pageModel: IPaginationModel = {
                        CurrentPageNumber: s.CurrentPageNumber,
                        IsLastPage: s.IsLastPage,
                        PageSize: s.PageSize,
                        TotalPages: s.Count,
                    };
                    const pagination = Pagination.Render(pageModel);
                    this.pagingContainer.html(`${pagination}`);

                    const startFrom = ((s.CurrentPageNumber - 1) * s.PageSize) + 1;
                    const endTo = startFrom + s.Data.length - 1;

                    this.startFromElement.html(`${startFrom}`);
                    this.endToElement.html(`${endTo}`);
                    this.totalElement.html(`${s.Count}`);

                    if (projectId > 0) {
                        const projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, projectId);
                        this.apiService.get(projectDetailUrl)
                            .done((project: IProjectDto) => {
                                if (!(UserTokenHandler.isSuperUser() || UserTokenHandler.isUserStakeholderOrOwnerForProject(project))) {
                                    $("[ap-action-test-script-modal-form]").hide();
                                }
                                else {
                                    $("[ap-action-test-script-modal-form]").show();
                                }
                            });
                    }
                    else {
                        if (!(UserTokenHandler.isSuperUser())) {
                            $("[ap-action-test-script-modal-form]").hide();
                        }
                        else {
                            $("[ap-action-test-script-modal-form]").show();
                        }
                    }
                }
                else {
                    Alerts.Info('No Test Scripts found.');
                }
            })
            .always(() => MainLoader.hide());
    }

    getTestScriptDetails(testScriptId: number) {
        const u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptDetail, testScriptId);
        MainLoader.show();
        this.apiService.get(u)
            .done((t: ITestScriptDto) => {
                $('[t-project-name]').text(t.ProjectName);
                $('[t-created-by-user]').text(t.CreatedByUserName);

                var developer = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.Developer].toString());
                var devManager = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.DevManager].toString());
                var businessAnalyst = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessAnalyst].toString());
                var businessStakeholder = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessStakeholder].toString());
                const user = UserTokenHandler.getUser();

                if (developer != undefined && developer != null && developer.length > 0) {
                    setTimeout(() => {
                        $("input[name=test-script-developer-status]").attr("data-userid", developer[0].AssignedToUserId);
                        $("input[name=test-script-developer-status]").attr("data-usertype", developer[0].UserType);
                        $("input[name=test-script-developer-status][value=" + developer[0].TestScriptStatus + "]").attr("checked", "checked");

                        if (!(user.UserId == developer[0].AssignedToUserId)) {
                            $("input[name=test-script-developer-status]").attr("disabled", "");
                        }
                    }, 100);
                    $('[t-assigned-to-developer]').text(developer[0].FullName);

                }
                else {
                    $('[t-assigned-to-developer]').text("");
                    $("input[name=test-script-developer-status]").attr("disabled", "");
                }

                if (devManager != undefined && devManager != null && devManager.length > 0) {

                    setTimeout(() => {
                        $("input[name=test-script-devmgr-status]").attr("data-userid", devManager[0].AssignedToUserId);
                        $("input[name=test-script-devmgr-status]").attr("data-usertype", devManager[0].UserType);
                        $("input[name=test-script-devmgr-status][value=" + devManager[0].TestScriptStatus + "]").attr("checked", "checked");
                        if (!(user.UserId == devManager[0].AssignedToUserId)) {
                            $("input[name=test-script-devmgr-status]").attr("disabled", "");
                        }
                    }, 100);

                    $('[t-assigned-to-dev-mgr]').text(devManager[0].FullName);
                }
                else {
                    $('[t-assigned-to-dev-mgr]').text("");
                    $("input[name=test-script-devmgr-status]").attr("disabled", "");
                }

                if (businessAnalyst != undefined && businessAnalyst != null && businessAnalyst.length > 0) {
                    setTimeout(() => {
                        $("input[name=test-script-bizanalyst-status]").attr("data-userid", businessAnalyst[0].AssignedToUserId);
                        $("input[name=test-script-bizanalyst-status]").attr("data-usertype", businessAnalyst[0].UserType);
                        $("input[name=test-script-bizanalyst-status][value=" + businessAnalyst[0].TestScriptStatus + "]").attr("checked", "checked");
                        if (!(user.UserId == businessAnalyst[0].AssignedToUserId)) {
                            $("input[name=test-script-bizanalyst-status]").attr("disabled", "");
                        }
                    }, 100);


                    $('[t-assigned-to-biz-analyst]').text(businessAnalyst[0].FullName);
                }
                else {
                    $('[t-assigned-to-biz-analyst]').text("");
                    $("input[name=test-script-bizanalyst-status]").attr("disabled", "");
                }

                if (businessStakeholder != undefined && businessStakeholder != null && businessStakeholder.length > 0) {
                    setTimeout(() => {
                        $("input[name=test-script-bizrequester-status]").attr("data-userid", businessStakeholder[0].AssignedToUserId);
                        $("input[name=test-script-bizrequester-status]").attr("data-usertype", businessStakeholder[0].UserType);
                        $("input[name=test-script-bizrequester-status][value=" + businessStakeholder[0].TestScriptStatus + "]").attr("checked", "checked");
                        if (!(user.UserId == businessStakeholder[0].AssignedToUserId)) {
                            $("input[name=test-script-bizrequester-status]").attr("disabled", "");
                        }
                    }, 100);

                    $('[t-assigned-to-biz-requester]').text(businessStakeholder[0].FullName);
                }
                else {
                    $('[t-assigned-to-biz-requester]').text("");
                    $("input[name=test-script-bizrequester-status]").attr("disabled", "");
                }


                $('[t-request-date]').text(Utils.JsonDateToStr(t.RequestDate));
                $('[t-requested-by-date]').text(Utils.JsonDateToStr(t.RequestedByDate));
                $('[t-test-script-status]').text(t.TestScriptStatusName);

                const story = `<strong>As a </strong> ${t.StoryF1}<br />
                                <strong>I want to </strong> ${t.StoryF2}<br />
                                <strong>So I can </strong> ${t.StoryF3} 
                                <a href="/Project/${t.ProjectId}/user-story/${t.StoryId}" title="View Story" class="m-l-10 btn btn-xs btn-info" target="_blank"><i class="fa fa-share"></i></a>`;

                $('[t-user-story]').html(story);

                $('[t-data-project-id]').attr('data-project-id', t.ProjectId);

                if (t.LastModifiedBy && t.LastModifiedByName && t.LastModifiedOn) {
                    $('.modified-field').show();
                    $('[t-modified-by-user]').text(t.LastModifiedByName);
                    $('[t-modified-date]').text(Utils.JsonDateToStr(t.LastModifiedOn));
                }
                else {
                    $('.modified-field').hide();
                }
                if (t.AssignedToUserId === UserTokenHandler.getUser().UserId
                    && t.TestScriptStatusName.toLowerCase() !== 'approve'
                    && t.TestScriptStatusName.toLowerCase() !== 'pass') {
                    this.oneClickApprovalBtn.removeClass('hide').show();
                }
                else {
                    this.oneClickApprovalBtn.addClass('hide').hide();
                }


                const projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, t.ProjectId);
                this.apiService.get(projectDetailUrl)
                    .done((project: IProjectDto) => {

                        if (!(UserTokenHandler.isSuperUser() || UserTokenHandler.isUserStakeholderOrOwnerForProject(project))) {
                            $("[ap-action-test-script-modal-form]").remove();
                            $("[ap-action-test-script-step-edit-button]").remove();
                            $("[ap-action-test-script-step-modal-form]").remove();
                            $("[ap-action-test-script-save-steps]").remove();
                        }
                        else {
                            setTimeout(() => {
                                $("input[name=test-script-developer-status]").removeAttr("disabled");
                                $("input[name=test-script-devmgr-status]").removeAttr("disabled");
                                $("input[name=test-script-bizanalyst-status]").removeAttr("disabled");
                                $("input[name=test-script-bizrequester-status]").removeAttr("disabled");
                            }, 100);
                        }
                    });

            })
            .always(() => MainLoader.hide());
    }

    loadTestScriptSteps(testScriptId, pno: number = 1, psize: number = 100) {
        MainLoader.show();
        const u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptSteps, testScriptId, 0);
        this.apiService.get(u, { pno, psize })
            .done((s: IPagingModel<ITestScriptStepDto>) => {

                this.TestScriptStepsData = [];
                if (s && s.Data && s.Data.length) {
                    s.Data.forEach(s => {
                        this.TestScriptStepsData.push(s);
                    });
                }
                this.ReloadTestScriptStepsData();
            })
            .always(() => MainLoader.hide());
    }
    ReloadTestScriptStepsData() {
        this.testScriptStepsTableBody.empty();

        if (this.TestScriptStepsData && this.TestScriptStepsData.length) {
            this.TestScriptStepsData.forEach(s => {
                const tr = $('<tr>');
                if (s.Editable == true) {
                    tr.append(`<td class="text-center">
                    <input type="number" min="1" max="100" class="form-control d-input" placeholder="Step number" name="StepNumber" readonly value="${s.StepNumber}" />                    
                    </td>`);

                    tr.append(`<td class="">
                    <textarea maxlength="500" class="form-control d-input test-script-action-input" name="Action" placeholder="Action" rows="4">${s.Action}</textarea>
                    </td>`);
                    tr.append(`<td class="">
                    <textarea maxlength="500" class="form-control d-input test-script-expectedresult-input" name="ExpectedResults" placeholder="Expected result" rows="4">${s.ExpectedResults}</textarea>
                    </td>`);
                    tr.append(`<td class="text-center ">
                    <select class="form-control d-input test-script-status-ddl" name="TestScriptStatus"><option value="">Select Status</option></select>
                    </td>`);
                    tr.append(`<td class="">
                    <textarea maxlength="1000" class="form-control d-input test-script-notes-input" name="Notes" placeholder="Notes" rows="5">${s.Notes}</textarea>
                    </td>`);

                    if (s.StepId == 0) {
                        const action = `
        <button type="button" title="Delete Step" class="btn btn-xs btn-primary" ap-action-test-script-step-delete-button data-test-script-id="${s.TestScriptId}" data-step-id="${s.StepId}"><i class="fa fa-trash"></i></button>`;

                        tr.append(`<td class="text-center v-middle">${action}</td>`);
                    }
                    else {
                        tr.append(`<td class="text-center v-middle"></td>`);
                    }
                }
                else {
                    tr.append(`<td class="text-center v-middle">${s.StepNumber}</td>`);
                    tr.append(`<td class="v-middle">${s.Action}</td>`);
                    tr.append(`<td class="v-middle">${s.ExpectedResults}</td>`);
                    tr.append(`<td class="text-center v-middle"><label>${s.TestScriptStatusName}</label></td>`);
                    tr.append(`<td class="v-middle">${s.Notes}</td>`);

                    const action = `
        <button type="button" title="Edit Script" class="btn btn-xs btn-primary" ap-action-test-script-step-edit-button data-test-script-id="${s.TestScriptId}" data-step-id="${s.StepId}"><i class="fa fa-pencil"></i></button>`;

                    tr.append(`<td class="text-center v-middle">${action}</td>`);
                }


                this.testScriptStepsTableBody.append(tr);
                this.ddlService.setTestScriptStatusesSingleDdl(false, null, $(tr).find("select"), s.TestScriptStatus);
            });
            //this.ddlService.reloadSelectors();
            $("[ap-action-test-script-save-steps]").show();
        }
        else {
            Alerts.Info('No Steps found.');
            $("[ap-action-test-script-save-steps]").hide();
        }
    }
    setPopupFieldsToUpdateScript(t: ITestScriptDto) {
        this.saveTestScriptModalForm.find('[name=TestScriptStatus]').val(t.TestScriptStatus);
        this.saveTestScriptModalForm.find('[name=RequestDate]').val(Utils.JsonDateToStr(t.RequestDate, true));
        this.saveTestScriptModalForm.find('[name=RequestedByDate]').val(Utils.JsonDateToStr(t.RequestedByDate, true));


        var developer = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.Developer].toString());
        var devManager = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.DevManager].toString());
        var businessAnalyst = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessAnalyst].toString());
        var businessStakeholder = t.AssigneeMappings.filter(a => a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessStakeholder].toString());

        if (developer != undefined && developer != null && developer.length > 0) {
            setTimeout(() => {
                this.saveTestScriptModalForm.find("#developer-name").val(developer[0].FullName);
                this.saveTestScriptModalForm.find("[name=AssignedToDeveloperId]").val(developer[0].AssignedToUserId);
            }, 100);

        }

        if (devManager != undefined && devManager != null && devManager.length > 0) {
            setTimeout(() => {
                this.saveTestScriptModalForm.find("#dev-manager-name").val(devManager[0].FullName);
                this.saveTestScriptModalForm.find("[name=AssignedToDevManagerId]").val(devManager[0].AssignedToUserId);
            }, 100);
        }


        if (businessAnalyst != undefined && businessAnalyst != null && businessAnalyst.length > 0) {
            setTimeout(() => {
                this.saveTestScriptModalForm.find("#business-analyst-name").val(businessAnalyst[0].FullName);
                this.saveTestScriptModalForm.find("[name=AssignedToBusinessAnalystId]").val(businessAnalyst[0].AssignedToUserId);
            }, 100);
        }

        if (businessStakeholder != undefined && businessStakeholder != null && businessStakeholder.length > 0) {
            setTimeout(() => {
                this.saveTestScriptModalForm.find("#business-stakeholder-name").val(businessStakeholder[0].FullName);
                this.saveTestScriptModalForm.find("[name=AssignedToBusinessStakeholderId]").val(businessStakeholder[0].AssignedToUserId);
            }, 100);
        }


        const projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, t.ProjectId);
        this.apiService.get(projectDetailUrl)
            .done((project: IProjectDto) => {
                if (!(UserTokenHandler.isSuperUser() || UserTokenHandler.isUserStakeholderOrOwnerForProject(project))) {
                    $("#save-test-script-btn").remove();
                }
            });

    }

    setPopupFieldsToUpdateScriptStep(t: ITestScriptStepDto) {
        this.saveTestScriptStepModalForm.find('[name=TestScriptStatus]').val(t.TestScriptStatus);
        this.saveTestScriptStepModalForm.find('[name=StepNumber]').val(t.StepNumber);
        this.saveTestScriptStepModalForm.find('[name=Action]').val(t.Action);
        this.saveTestScriptStepModalForm.find('[name=ExpectedResults]').val(t.ExpectedResults);
        this.saveTestScriptStepModalForm.find('[name=Notes]').val(t.Notes);
    }

    openCreateTestScriptPopup(projectId = 0, storyId: number, testScriptId: number = 0) {
        if (testScriptId > 0) {
            this.formProjectsDdl.val(projectId);
            if (projectId > 0) {
                this.ddlService.setStoriesDdl(projectId, this.formStoryDdl, true, () => { this.formStoryDdl.val(storyId); });
            }
            this.createEditTestScriptModal.find('[name=StoryId]').val(storyId);
        }
        this.createEditTestScriptModal.find('[name=TestScriptId]').val(testScriptId);


        if (testScriptId > 0) {
            const u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptDetail, testScriptId);
            MainLoader.show();
            this.apiService.get(u).done((t: ITestScriptDto) => {

                this.setPopupFieldsToUpdateScript(t);
                this.createEditTestScriptModal.modal('show');
            })
                .always(() => MainLoader.hide());
        }
        else {
            this.createEditTestScriptModal.modal('show');
            setTimeout(() => {
                if (testScriptId == 0) {
                    var requesteStatusVal = this.createEditTestScriptModal.find('[name=TestScriptStatus] option').filter(function () { return $(this).html() == "Requested" }).val();
                    this.createEditTestScriptModal.find('[name=TestScriptStatus]').val(requesteStatusVal);
                }
            }, 200);
        }
    }

    openCreateTestScriptStepPopup(testScriptId: number, stepId = 0) {
        this.createEditTestScriptStepModal.find('[name=StepId]').val(stepId);
        this.createEditTestScriptStepModal.find('[name=TestScriptId]').val(testScriptId);
        if (stepId > 0) {
            const u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptStepDetail, testScriptId, stepId);
            MainLoader.show();
            this.apiService.get(u).done((t: ITestScriptStepDto) => {
                this.setPopupFieldsToUpdateScriptStep(t);
                this.createEditTestScriptStepModal.modal('show');
            })
                .always(() => MainLoader.hide());
        }
        else
            this.createEditTestScriptStepModal.modal('show');
    }
    resetScriptForm() {
        (this.saveTestScriptModalForm[0] as HTMLFormElement).reset();
        this.saveTestScriptModalForm.find('input:hidden').val('');

        $('#test-script-project-ddl').val(this.selectedProjectId);
        $('#test-script-story-ddl').val(this.selectedStorId);
    }
    resetScriptStepForm() {
        (this.saveTestScriptStepModalForm[0] as HTMLFormElement).reset();
        this.saveTestScriptStepModalForm.find('input:hidden').val('');
    }

    updateAssigneeMappingStatus(userId, userType, statusId) {
        const u = ApiUrl.TestScriptStepUpdateAssigneeStatus;
        MainLoader.show();
        let obj = {
            testScriptId: parseInt($("#MainTestScriptId").val()),
            userId: userId,
            userType: userType,
            statusId: parseInt(statusId)
        };
        this.apiService.postJson(u, JSON.stringify(obj))
            .done((ret) => {
                Alerts.Success('Status updated successfully.', 'Success');
                //$this.loadStories(1, Constants.DefaultPageSize, true);
            }).always(() => {
                MainLoader.hide();
            });
    }

    private setTestScriptStatusValue(ddl, stepNumber) {
        const obj = this.TestScriptStepsData.filter(a => a.StepNumber == parseInt(stepNumber))[0];
        if (obj) {
            obj.TestScriptStatus = $("option:selected", $(ddl)).val();
            obj.TestScriptStatusName = $("option:selected", $(ddl)).text();
        }
    }

    private init() {
        this.formProjectsDdl.change((e) => {
            const selectedProjectId = $(e.target).val() || 0;
            this.ddlService.setStoriesDdl(selectedProjectId, this.formStoryDdl, true);
        });

        $(document).on("change", ".test-script-status-ddl", (e) => {
            const row = $(e.currentTarget).closest("tr");
            this.setTestScriptStatusValue($(e.currentTarget), $(row).find("input[name='StepNumber']").val());
        })

        $(document).on("change", ".test-script-action-input", (e) => {
            const row = $(e.currentTarget).closest("tr");
            const stepNumber = $(row).find("input[name='StepNumber']").val();
            const obj = this.TestScriptStepsData.filter(a => a.StepNumber == parseInt(stepNumber))[0];
            if (obj) {
                obj.Action = $(e.currentTarget).val();
            }
        })
        $(document).on("change", ".test-script-expectedresult-input", (e) => {
            const row = $(e.currentTarget).closest("tr");
            const stepNumber = $(row).find("input[name='StepNumber']").val();
            const obj = this.TestScriptStepsData.filter(a => a.StepNumber == parseInt(stepNumber))[0];
            if (obj) {
                obj.ExpectedResults = $(e.currentTarget).val();
            }
        })

        $(document).on("change", ".test-script-notes-input", (e) => {
            const row = $(e.currentTarget).closest("tr");
            const stepNumber = $(row).find("input[name='StepNumber']").val();
            const obj = this.TestScriptStepsData.filter(a => a.StepNumber == parseInt(stepNumber))[0];
            if (obj) {
                obj.Notes = $(e.currentTarget).val();
            }
        })

        this.createEditTestScriptModal.on('hide.bs.modal', () => {
            this.resetScriptForm();
        });
        this.createEditTestScriptStepModal.on('hide.bs.modal', () => {
            this.resetScriptForm();
        });

        this.oneClickApprovalBtn.on('click', e => {
            const btn = $(e.target).closest('#one-click-approval-btn');
            const testScriptId: number = btn.data('test-script-id');
            const approvalUrl: string = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptUpdate, testScriptId);
            MainLoader.show();
            this.apiService.patch(approvalUrl, null)
                .done((data: any, status: string, xhr: JQueryXHR) => {
                    if (xhr.status === 200 || xhr.status === 201) {
                        Alerts.Success('Test Script Approved successfully.');
                        if (this.isDetailPage) {
                            this.getTestScriptDetails(testScriptId);
                            this.loadTestScriptSteps(testScriptId);
                        }
                    }
                })
                .always(() => MainLoader.hide());
        });

        $(document).on('click', '[ap-action-test-script-modal-form]', e => {
            const btn = $(e.target).closest('[ap-action-test-script-modal-form]');
            const projectId: number = btn.data('project-id');
            const storyId: number = btn.data('story-id');
            const testScriptId: number = btn.data('test-script-id') || 0;

            this.openCreateTestScriptPopup(projectId, storyId, testScriptId);
        });

        $(document).on('click', '[ap-action-test-script-step-modal-form]', e => {
            const btn = $(e.target).closest('[ap-action-test-script-step-modal-form]');
            const stepId: number = btn.data('step-id');
            const testScriptId: number = btn.data('test-script-id') || 0;

            let nextStepNumber = 0;
            if (this.TestScriptStepsData && this.TestScriptStepsData.length > 0) {
                var lastStep = this.TestScriptStepsData.sort((a, b) => a.StepNumber < b.StepNumber ? -1 : a.StepNumber > b.StepNumber ? 1 : 0).reverse()[0];
                if (lastStep) {
                    nextStepNumber = lastStep.StepNumber;
                }
            }

            this.TestScriptStepsData.push({
                StepId: stepId,
                TestScriptId: testScriptId,
                StepNumber: nextStepNumber + 1,
                Action: "",
                ExpectedResults: "",
                TestScriptStatus: 10,
                TestScriptStatusName: "",
                Notes: '',
                Editable: true
            });
            this.TestScriptStepsData = this.TestScriptStepsData.sort((a, b) => a.StepNumber < b.StepNumber ? -1 : a.StepNumber > b.StepNumber ? 1 : 0);
            this.ReloadTestScriptStepsData();
        });
        $(document).on('click', '[ap-action-test-script-step-edit-button]', e => {
            const btn = $(e.target).closest('[ap-action-test-script-step-edit-button]');
            const stepId: number = btn.data('step-id');
            const testScriptId: number = btn.data('test-script-id') || 0;

            const obj = this.TestScriptStepsData.filter(a => a.StepId == stepId)[0];
            if (obj) {
                obj.Editable = true;
            }

            this.ReloadTestScriptStepsData();
        });
        $(document).on('click', '[ap-action-test-script-step-delete-button]', e => {
            const row = $(e.currentTarget).closest("tr");
            const stepNumber = $(row).find("input[name='StepNumber']").val();
            this.TestScriptStepsData = this.TestScriptStepsData.filter(a => a.StepNumber != stepNumber);
            this.ReloadTestScriptStepsData();
        });
        $(document).on('click', '[ap-action-test-script-save-steps]', e => {
            const btn = $(e.target).closest('[ap-action-test-script-save-steps]');
            const testScriptId: number = btn.data('test-script-id');

            const obj = {
                testScriptId: testScriptId,
                steps: this.TestScriptStepsData
            };

            MainLoader.show();
            const stepSaveUrl: string = UrlHelper.GetTestScriptsBulkUpdateUrl(ApiUrl.TestScriptBulkStepUpdate, testScriptId);
            this.apiService.postJson(stepSaveUrl, JSON.stringify(obj))
                .done((data: any, status: string, xhr: JQueryXHR) => {
                    if (xhr.status === 200 || xhr.status === 201) {
                        Alerts.Success('Steps updated successfully.');
                        //this.createEditTestScriptStepModal.modal('hide');
                        this.loadTestScriptSteps(testScriptId);
                    }
                })
                .always(() => MainLoader.hide());

        });


        this.saveTestScriptBtn.on('click', () => {

            const testScriptId: number = this.saveTestScriptModalForm.find('[name=TestScriptId]').val() || 0;

            if (testScriptId > 0) {
                MainLoader.show();
                const sprintSaveUrl: string = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptUpdate, testScriptId);
                this.apiService.put(sprintSaveUrl, this.saveTestScriptModalForm.serialize())
                    .done((data: any, status: string, xhr: JQueryXHR) => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            Alerts.Success('Test Script updated successfully.');
                            this.createEditTestScriptModal.modal('hide');
                            if (this.isDetailPage)
                                this.getTestScriptDetails(testScriptId);
                            else if ((this.selectedProjectId && this.selectedStorId) || this.selectedTeamIds) {
                                this.loadTestScrips(this.selectedProjectId, this.selectedStorId, this.selectedTeamIds);
                            }
                        }
                    })
                    .always(() => MainLoader.hide());
            }
            else {
                MainLoader.show();
                const sprintSaveUrl: string = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptCreate, testScriptId);
                this.apiService.post(sprintSaveUrl, this.saveTestScriptModalForm.serialize())
                    .done((data: any, status: string, xhr: JQueryXHR) => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            Alerts.Success('Test Script created successfully.');
                            this.createEditTestScriptModal.modal('hide');
                            if ((this.selectedProjectId && this.selectedStorId) || this.selectedTeamIds)
                                this.loadTestScrips(this.selectedProjectId, this.selectedStorId, this.selectedTeamIds);
                        }
                    })
                    .always(() => MainLoader.hide());
            }
        });

        this.saveTestScriptStepBtn.on('click', () => {

            const stepId: number = this.saveTestScriptStepModalForm.find('[name=StepId]').val() || 0;
            const testScriptId: number = this.saveTestScriptStepModalForm.find('[name=TestScriptId]').val();

            if (stepId > 0) {
                MainLoader.show();
                const stepSaveUrl: string = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptStepUpdate, testScriptId, stepId);
                this.apiService.put(stepSaveUrl, this.saveTestScriptStepModalForm.serialize())
                    .done((data: any, status: string, xhr: JQueryXHR) => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            Alerts.Success('Step updated successfully.');
                            this.createEditTestScriptStepModal.modal('hide');
                            this.loadTestScriptSteps(testScriptId);
                        }
                    })
                    .always(() => MainLoader.hide());
            }
            else {
                MainLoader.show();
                const stepSaveUrl: string = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptStepCreate, testScriptId, 0);
                this.apiService.post(stepSaveUrl, this.saveTestScriptStepModalForm.serialize())
                    .done((data: any, status: string, xhr: JQueryXHR) => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            Alerts.Success('Step created successfully.');
                            this.createEditTestScriptStepModal.modal('hide');
                            this.loadTestScriptSteps(testScriptId);
                        }
                    })
                    .always(() => MainLoader.hide());
            }
        });

        $("input[name=test-script-developer-status],input[name=test-script-devmgr-status],input[name=test-script-bizanalyst-status],input[name=test-script-bizrequester-status]").change((e) => {
            const userId = $(e.target).data("userid") || "";
            const userType = $(e.target).data("usertype") || "";
            const selectedId = $(e.target).val() || 0;
            this.updateAssigneeMappingStatus(userId, userType, selectedId);
        });
    }
}