/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="Models.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Common.ts" />
/// <reference path="UserService.ts" />
var TestScriptService = /** @class */ (function () {
    function TestScriptService(apiService, ddlService, isDetailPage) {
        this.apiService = apiService;
        this.ddlService = ddlService;
        this.isDetailPage = isDetailPage;
        this.testScriptsTable = $('#test-scripts-table');
        this.testScriptsTableBody = $('#test-scripts-table > tbody');
        this.pagingContainer = $('#test-scripts-paging-container');
        this.infoContainer = $('#apdt_test-scripts_info');
        this.startFromElement = this.infoContainer.find('.apdt_startfrom');
        this.endToElement = this.infoContainer.find('.apdt_endto');
        this.totalElement = this.infoContainer.find('.apdt_total');
        this.oneClickApprovalBtn = $('#one-click-approval-btn');
        this.testScriptStepsTableBody = $('#test-script-steps-table > tbody');
        this.TestScriptStepsData = [];
        this.createEditTestScriptModal = $('#create-edit-test-script-modal');
        this.saveTestScriptModalForm = this.createEditTestScriptModal.find('#test-scripts-form');
        this.saveTestScriptBtn = this.createEditTestScriptModal.find('#save-test-script-btn');
        this.createEditTestScriptStepModal = $('#create-edit-test-script-step-modal');
        this.saveTestScriptStepModalForm = this.createEditTestScriptStepModal.find('#test-scripts-step-form');
        this.saveTestScriptStepBtn = this.createEditTestScriptStepModal.find('#save-test-script-step-btn');
        this.formProjectsDdl = this.saveTestScriptModalForm.find('#test-script-project-ddl');
        this.formStoryDdl = this.saveTestScriptModalForm.find('#test-script-story-ddl');
        this.selectedProjectId = 0;
        this.selectedStorId = 0;
        this.selectedTeamIds = "";
        this.init();
    }
    TestScriptService.prototype.clearTestScripts = function () {
        this.pagingContainer.html('');
        this.startFromElement.html("0");
        this.endToElement.html("0");
        this.totalElement.html("0");
        this.infoContainer.hide();
        this.testScriptsTableBody.empty();
        this.testScriptsTable.hide();
    };
    TestScriptService.prototype.loadTestScrips = function (projectId, storyId, teamIds, pno, psize) {
        var _this = this;
        if (pno === void 0) { pno = 1; }
        if (psize === void 0) { psize = Constants.DefaultPageSize; }
        this.selectedProjectId = projectId;
        this.selectedStorId = storyId;
        this.selectedTeamIds = teamIds;
        MainLoader.show();
        this.apiService.get(ApiUrl.TestScripts, { pno: pno, psize: psize, storyId: storyId, projectId: projectId, teamIds: teamIds })
            .done(function (s) {
            _this.clearTestScripts();
            if (s && s.Data && s.Data.length) {
                _this.testScriptsTable.show();
                _this.infoContainer.show();
                s.Data.forEach(function (s) {
                    var tr = $('<tr>');
                    var action = "\n        <a role=\"button\" title=\"View Steps\" class=\"btn btn-xs btn-success m-r-5 d-inline\" href=\"/User-Story/" + s.StoryId + "/Test-Scripts/" + s.TestScriptId + "\"><i class=\"fa fa-list\"></i></a>\n        <button type=\"button\" title=\"Edit Script\" class=\"btn btn-xs btn-primary\" ap-action-test-script-modal-form data-story-id=\"" + s.StoryId + "\"  data-test-script-id=\"" + s.TestScriptId + "\" data-project-id=\"" + s.ProjectId + "\"><i class=\"fa fa-pencil\"></i></button>";
                    tr.append("<td class=\"text-center v-middle\">" + s.TestScriptStatusName + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.CreatedByUserName + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.DeveloperName + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.DevManagerName + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.BusinessAnalystName + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.BusinessStakeholderName + "</td>");
                    tr.append("<td class=\"v-middle\">" + Utils.JsonDateToStr(s.RequestDate) + "</td>");
                    tr.append("<td class=\"v-middle\">" + Utils.JsonDateToStr(s.RequestedByDate) + "</td>");
                    tr.append("<td class=\"text-center v-middle\">" + action + "</td>");
                    _this.testScriptsTableBody.append(tr);
                });
                var pageModel = {
                    CurrentPageNumber: s.CurrentPageNumber,
                    IsLastPage: s.IsLastPage,
                    PageSize: s.PageSize,
                    TotalPages: s.Count,
                };
                var pagination = Pagination.Render(pageModel);
                _this.pagingContainer.html("" + pagination);
                var startFrom = ((s.CurrentPageNumber - 1) * s.PageSize) + 1;
                var endTo = startFrom + s.Data.length - 1;
                _this.startFromElement.html("" + startFrom);
                _this.endToElement.html("" + endTo);
                _this.totalElement.html("" + s.Count);
                if (projectId > 0) {
                    var projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, projectId);
                    _this.apiService.get(projectDetailUrl)
                        .done(function (project) {
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
            .always(function () { return MainLoader.hide(); });
    };
    TestScriptService.prototype.getTestScriptDetails = function (testScriptId) {
        var _this = this;
        var u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptDetail, testScriptId);
        MainLoader.show();
        this.apiService.get(u)
            .done(function (t) {
            $('[t-project-name]').text(t.ProjectName);
            $('[t-created-by-user]').text(t.CreatedByUserName);
            var developer = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.Developer].toString(); });
            var devManager = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.DevManager].toString(); });
            var businessAnalyst = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessAnalyst].toString(); });
            var businessStakeholder = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessStakeholder].toString(); });
            var user = UserTokenHandler.getUser();
            if (developer != undefined && developer != null && developer.length > 0) {
                setTimeout(function () {
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
                setTimeout(function () {
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
                setTimeout(function () {
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
                setTimeout(function () {
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
            var story = "<strong>As a </strong> " + t.StoryF1 + "<br />\n                                <strong>I want to </strong> " + t.StoryF2 + "<br />\n                                <strong>So I can </strong> " + t.StoryF3 + " \n                                <a href=\"/Project/" + t.ProjectId + "/user-story/" + t.StoryId + "\" title=\"View Story\" class=\"m-l-10 btn btn-xs btn-info\" target=\"_blank\"><i class=\"fa fa-share\"></i></a>";
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
                _this.oneClickApprovalBtn.removeClass('hide').show();
            }
            else {
                _this.oneClickApprovalBtn.addClass('hide').hide();
            }
            var projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, t.ProjectId);
            _this.apiService.get(projectDetailUrl)
                .done(function (project) {
                if (!(UserTokenHandler.isSuperUser() || UserTokenHandler.isUserStakeholderOrOwnerForProject(project))) {
                    $("[ap-action-test-script-modal-form]").remove();
                    $("[ap-action-test-script-step-edit-button]").remove();
                    $("[ap-action-test-script-step-modal-form]").remove();
                    $("[ap-action-test-script-save-steps]").remove();
                }
                else {
                    setTimeout(function () {
                        $("input[name=test-script-developer-status]").removeAttr("disabled");
                        $("input[name=test-script-devmgr-status]").removeAttr("disabled");
                        $("input[name=test-script-bizanalyst-status]").removeAttr("disabled");
                        $("input[name=test-script-bizrequester-status]").removeAttr("disabled");
                    }, 100);
                }
            });
        })
            .always(function () { return MainLoader.hide(); });
    };
    TestScriptService.prototype.loadTestScriptSteps = function (testScriptId, pno, psize) {
        var _this = this;
        if (pno === void 0) { pno = 1; }
        if (psize === void 0) { psize = 100; }
        MainLoader.show();
        var u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptSteps, testScriptId, 0);
        this.apiService.get(u, { pno: pno, psize: psize })
            .done(function (s) {
            _this.TestScriptStepsData = [];
            if (s && s.Data && s.Data.length) {
                s.Data.forEach(function (s) {
                    _this.TestScriptStepsData.push(s);
                });
            }
            _this.ReloadTestScriptStepsData();
        })
            .always(function () { return MainLoader.hide(); });
    };
    TestScriptService.prototype.ReloadTestScriptStepsData = function () {
        var _this = this;
        this.testScriptStepsTableBody.empty();
        if (this.TestScriptStepsData && this.TestScriptStepsData.length) {
            this.TestScriptStepsData.forEach(function (s) {
                var tr = $('<tr>');
                if (s.Editable == true) {
                    tr.append("<td class=\"text-center\">\n                    <input type=\"number\" min=\"1\" max=\"100\" class=\"form-control d-input\" placeholder=\"Step number\" name=\"StepNumber\" readonly value=\"" + s.StepNumber + "\" />                    \n                    </td>");
                    tr.append("<td class=\"\">\n                    <textarea maxlength=\"500\" class=\"form-control d-input test-script-action-input\" name=\"Action\" placeholder=\"Action\" rows=\"4\">" + s.Action + "</textarea>\n                    </td>");
                    tr.append("<td class=\"\">\n                    <textarea maxlength=\"500\" class=\"form-control d-input test-script-expectedresult-input\" name=\"ExpectedResults\" placeholder=\"Expected result\" rows=\"4\">" + s.ExpectedResults + "</textarea>\n                    </td>");
                    tr.append("<td class=\"text-center \">\n                    <select class=\"form-control d-input test-script-status-ddl\" name=\"TestScriptStatus\"><option value=\"\">Select Status</option></select>\n                    </td>");
                    tr.append("<td class=\"\">\n                    <textarea maxlength=\"1000\" class=\"form-control d-input test-script-notes-input\" name=\"Notes\" placeholder=\"Notes\" rows=\"5\">" + s.Notes + "</textarea>\n                    </td>");
                    if (s.StepId == 0) {
                        var action = "\n        <button type=\"button\" title=\"Delete Step\" class=\"btn btn-xs btn-primary\" ap-action-test-script-step-delete-button data-test-script-id=\"" + s.TestScriptId + "\" data-step-id=\"" + s.StepId + "\"><i class=\"fa fa-trash\"></i></button>";
                        tr.append("<td class=\"text-center v-middle\">" + action + "</td>");
                    }
                    else {
                        tr.append("<td class=\"text-center v-middle\"></td>");
                    }
                }
                else {
                    tr.append("<td class=\"text-center v-middle\">" + s.StepNumber + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.Action + "</td>");
                    tr.append("<td class=\"v-middle\">" + s.ExpectedResults + "</td>");
                    tr.append("<td class=\"text-center v-middle\"><label>" + s.TestScriptStatusName + "</label></td>");
                    tr.append("<td class=\"v-middle\">" + s.Notes + "</td>");
                    var action = "\n        <button type=\"button\" title=\"Edit Script\" class=\"btn btn-xs btn-primary\" ap-action-test-script-step-edit-button data-test-script-id=\"" + s.TestScriptId + "\" data-step-id=\"" + s.StepId + "\"><i class=\"fa fa-pencil\"></i></button>";
                    tr.append("<td class=\"text-center v-middle\">" + action + "</td>");
                }
                _this.testScriptStepsTableBody.append(tr);
                _this.ddlService.setTestScriptStatusesSingleDdl(false, null, $(tr).find("select"), s.TestScriptStatus);
            });
            //this.ddlService.reloadSelectors();
            $("[ap-action-test-script-save-steps]").show();
        }
        else {
            Alerts.Info('No Steps found.');
            $("[ap-action-test-script-save-steps]").hide();
        }
    };
    TestScriptService.prototype.setPopupFieldsToUpdateScript = function (t) {
        var _this = this;
        this.saveTestScriptModalForm.find('[name=TestScriptStatus]').val(t.TestScriptStatus);
        this.saveTestScriptModalForm.find('[name=RequestDate]').val(Utils.JsonDateToStr(t.RequestDate, true));
        this.saveTestScriptModalForm.find('[name=RequestedByDate]').val(Utils.JsonDateToStr(t.RequestedByDate, true));
        var developer = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.Developer].toString(); });
        var devManager = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.DevManager].toString(); });
        var businessAnalyst = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessAnalyst].toString(); });
        var businessStakeholder = t.AssigneeMappings.filter(function (a) { return a.UserType == TestScriptAssigneeMappingUserTypes[TestScriptAssigneeMappingUserTypes.BusinessStakeholder].toString(); });
        if (developer != undefined && developer != null && developer.length > 0) {
            setTimeout(function () {
                _this.saveTestScriptModalForm.find("#developer-name").val(developer[0].FullName);
                _this.saveTestScriptModalForm.find("[name=AssignedToDeveloperId]").val(developer[0].AssignedToUserId);
            }, 100);
        }
        if (devManager != undefined && devManager != null && devManager.length > 0) {
            setTimeout(function () {
                _this.saveTestScriptModalForm.find("#dev-manager-name").val(devManager[0].FullName);
                _this.saveTestScriptModalForm.find("[name=AssignedToDevManagerId]").val(devManager[0].AssignedToUserId);
            }, 100);
        }
        if (businessAnalyst != undefined && businessAnalyst != null && businessAnalyst.length > 0) {
            setTimeout(function () {
                _this.saveTestScriptModalForm.find("#business-analyst-name").val(businessAnalyst[0].FullName);
                _this.saveTestScriptModalForm.find("[name=AssignedToBusinessAnalystId]").val(businessAnalyst[0].AssignedToUserId);
            }, 100);
        }
        if (businessStakeholder != undefined && businessStakeholder != null && businessStakeholder.length > 0) {
            setTimeout(function () {
                _this.saveTestScriptModalForm.find("#business-stakeholder-name").val(businessStakeholder[0].FullName);
                _this.saveTestScriptModalForm.find("[name=AssignedToBusinessStakeholderId]").val(businessStakeholder[0].AssignedToUserId);
            }, 100);
        }
        var projectDetailUrl = UrlHelper.GetProjectsUrl(ApiUrl.ProjectDetail, t.ProjectId);
        this.apiService.get(projectDetailUrl)
            .done(function (project) {
            if (!(UserTokenHandler.isSuperUser() || UserTokenHandler.isUserStakeholderOrOwnerForProject(project))) {
                $("#save-test-script-btn").remove();
            }
        });
    };
    TestScriptService.prototype.setPopupFieldsToUpdateScriptStep = function (t) {
        this.saveTestScriptStepModalForm.find('[name=TestScriptStatus]').val(t.TestScriptStatus);
        this.saveTestScriptStepModalForm.find('[name=StepNumber]').val(t.StepNumber);
        this.saveTestScriptStepModalForm.find('[name=Action]').val(t.Action);
        this.saveTestScriptStepModalForm.find('[name=ExpectedResults]').val(t.ExpectedResults);
        this.saveTestScriptStepModalForm.find('[name=Notes]').val(t.Notes);
    };
    TestScriptService.prototype.openCreateTestScriptPopup = function (projectId, storyId, testScriptId) {
        var _this = this;
        if (projectId === void 0) { projectId = 0; }
        if (testScriptId === void 0) { testScriptId = 0; }
        if (testScriptId > 0) {
            this.formProjectsDdl.val(projectId);
            if (projectId > 0) {
                this.ddlService.setStoriesDdl(projectId, this.formStoryDdl, true, function () { _this.formStoryDdl.val(storyId); });
            }
            this.createEditTestScriptModal.find('[name=StoryId]').val(storyId);
        }
        this.createEditTestScriptModal.find('[name=TestScriptId]').val(testScriptId);
        if (testScriptId > 0) {
            var u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptDetail, testScriptId);
            MainLoader.show();
            this.apiService.get(u).done(function (t) {
                _this.setPopupFieldsToUpdateScript(t);
                _this.createEditTestScriptModal.modal('show');
            })
                .always(function () { return MainLoader.hide(); });
        }
        else {
            this.createEditTestScriptModal.modal('show');
            setTimeout(function () {
                if (testScriptId == 0) {
                    var requesteStatusVal = _this.createEditTestScriptModal.find('[name=TestScriptStatus] option').filter(function () { return $(this).html() == "Requested"; }).val();
                    _this.createEditTestScriptModal.find('[name=TestScriptStatus]').val(requesteStatusVal);
                }
            }, 200);
        }
    };
    TestScriptService.prototype.openCreateTestScriptStepPopup = function (testScriptId, stepId) {
        var _this = this;
        if (stepId === void 0) { stepId = 0; }
        this.createEditTestScriptStepModal.find('[name=StepId]').val(stepId);
        this.createEditTestScriptStepModal.find('[name=TestScriptId]').val(testScriptId);
        if (stepId > 0) {
            var u = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptStepDetail, testScriptId, stepId);
            MainLoader.show();
            this.apiService.get(u).done(function (t) {
                _this.setPopupFieldsToUpdateScriptStep(t);
                _this.createEditTestScriptStepModal.modal('show');
            })
                .always(function () { return MainLoader.hide(); });
        }
        else
            this.createEditTestScriptStepModal.modal('show');
    };
    TestScriptService.prototype.resetScriptForm = function () {
        this.saveTestScriptModalForm[0].reset();
        this.saveTestScriptModalForm.find('input:hidden').val('');
        $('#test-script-project-ddl').val(this.selectedProjectId);
        $('#test-script-story-ddl').val(this.selectedStorId);
    };
    TestScriptService.prototype.resetScriptStepForm = function () {
        this.saveTestScriptStepModalForm[0].reset();
        this.saveTestScriptStepModalForm.find('input:hidden').val('');
    };
    TestScriptService.prototype.updateAssigneeMappingStatus = function (userId, userType, statusId) {
        var u = ApiUrl.TestScriptStepUpdateAssigneeStatus;
        MainLoader.show();
        var obj = {
            testScriptId: parseInt($("#MainTestScriptId").val()),
            userId: userId,
            userType: userType,
            statusId: parseInt(statusId)
        };
        this.apiService.postJson(u, JSON.stringify(obj))
            .done(function (ret) {
            Alerts.Success('Status updated successfully.', 'Success');
            //$this.loadStories(1, Constants.DefaultPageSize, true);
        }).always(function () {
            MainLoader.hide();
        });
    };
    TestScriptService.prototype.setTestScriptStatusValue = function (ddl, stepNumber) {
        var obj = this.TestScriptStepsData.filter(function (a) { return a.StepNumber == parseInt(stepNumber); })[0];
        if (obj) {
            obj.TestScriptStatus = $("option:selected", $(ddl)).val();
            obj.TestScriptStatusName = $("option:selected", $(ddl)).text();
        }
    };
    TestScriptService.prototype.init = function () {
        var _this = this;
        this.formProjectsDdl.change(function (e) {
            var selectedProjectId = $(e.target).val() || 0;
            _this.ddlService.setStoriesDdl(selectedProjectId, _this.formStoryDdl, true);
        });
        $(document).on("change", ".test-script-status-ddl", function (e) {
            var row = $(e.currentTarget).closest("tr");
            _this.setTestScriptStatusValue($(e.currentTarget), $(row).find("input[name='StepNumber']").val());
        });
        $(document).on("change", ".test-script-action-input", function (e) {
            var row = $(e.currentTarget).closest("tr");
            var stepNumber = $(row).find("input[name='StepNumber']").val();
            var obj = _this.TestScriptStepsData.filter(function (a) { return a.StepNumber == parseInt(stepNumber); })[0];
            if (obj) {
                obj.Action = $(e.currentTarget).val();
            }
        });
        $(document).on("change", ".test-script-expectedresult-input", function (e) {
            var row = $(e.currentTarget).closest("tr");
            var stepNumber = $(row).find("input[name='StepNumber']").val();
            var obj = _this.TestScriptStepsData.filter(function (a) { return a.StepNumber == parseInt(stepNumber); })[0];
            if (obj) {
                obj.ExpectedResults = $(e.currentTarget).val();
            }
        });
        $(document).on("change", ".test-script-notes-input", function (e) {
            var row = $(e.currentTarget).closest("tr");
            var stepNumber = $(row).find("input[name='StepNumber']").val();
            var obj = _this.TestScriptStepsData.filter(function (a) { return a.StepNumber == parseInt(stepNumber); })[0];
            if (obj) {
                obj.Notes = $(e.currentTarget).val();
            }
        });
        this.createEditTestScriptModal.on('hide.bs.modal', function () {
            _this.resetScriptForm();
        });
        this.createEditTestScriptStepModal.on('hide.bs.modal', function () {
            _this.resetScriptForm();
        });
        this.oneClickApprovalBtn.on('click', function (e) {
            var btn = $(e.target).closest('#one-click-approval-btn');
            var testScriptId = btn.data('test-script-id');
            var approvalUrl = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptUpdate, testScriptId);
            MainLoader.show();
            _this.apiService.patch(approvalUrl, null)
                .done(function (data, status, xhr) {
                if (xhr.status === 200 || xhr.status === 201) {
                    Alerts.Success('Test Script Approved successfully.');
                    if (_this.isDetailPage) {
                        _this.getTestScriptDetails(testScriptId);
                        _this.loadTestScriptSteps(testScriptId);
                    }
                }
            })
                .always(function () { return MainLoader.hide(); });
        });
        $(document).on('click', '[ap-action-test-script-modal-form]', function (e) {
            var btn = $(e.target).closest('[ap-action-test-script-modal-form]');
            var projectId = btn.data('project-id');
            var storyId = btn.data('story-id');
            var testScriptId = btn.data('test-script-id') || 0;
            _this.openCreateTestScriptPopup(projectId, storyId, testScriptId);
        });
        $(document).on('click', '[ap-action-test-script-step-modal-form]', function (e) {
            var btn = $(e.target).closest('[ap-action-test-script-step-modal-form]');
            var stepId = btn.data('step-id');
            var testScriptId = btn.data('test-script-id') || 0;
            var nextStepNumber = 0;
            if (_this.TestScriptStepsData && _this.TestScriptStepsData.length > 0) {
                var lastStep = _this.TestScriptStepsData.sort(function (a, b) { return a.StepNumber < b.StepNumber ? -1 : a.StepNumber > b.StepNumber ? 1 : 0; }).reverse()[0];
                if (lastStep) {
                    nextStepNumber = lastStep.StepNumber;
                }
            }
            _this.TestScriptStepsData.push({
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
            _this.TestScriptStepsData = _this.TestScriptStepsData.sort(function (a, b) { return a.StepNumber < b.StepNumber ? -1 : a.StepNumber > b.StepNumber ? 1 : 0; });
            _this.ReloadTestScriptStepsData();
        });
        $(document).on('click', '[ap-action-test-script-step-edit-button]', function (e) {
            var btn = $(e.target).closest('[ap-action-test-script-step-edit-button]');
            var stepId = btn.data('step-id');
            var testScriptId = btn.data('test-script-id') || 0;
            var obj = _this.TestScriptStepsData.filter(function (a) { return a.StepId == stepId; })[0];
            if (obj) {
                obj.Editable = true;
            }
            _this.ReloadTestScriptStepsData();
        });
        $(document).on('click', '[ap-action-test-script-step-delete-button]', function (e) {
            var row = $(e.currentTarget).closest("tr");
            var stepNumber = $(row).find("input[name='StepNumber']").val();
            _this.TestScriptStepsData = _this.TestScriptStepsData.filter(function (a) { return a.StepNumber != stepNumber; });
            _this.ReloadTestScriptStepsData();
        });
        $(document).on('click', '[ap-action-test-script-save-steps]', function (e) {
            var btn = $(e.target).closest('[ap-action-test-script-save-steps]');
            var testScriptId = btn.data('test-script-id');
            var obj = {
                testScriptId: testScriptId,
                steps: _this.TestScriptStepsData
            };
            MainLoader.show();
            var stepSaveUrl = UrlHelper.GetTestScriptsBulkUpdateUrl(ApiUrl.TestScriptBulkStepUpdate, testScriptId);
            _this.apiService.postJson(stepSaveUrl, JSON.stringify(obj))
                .done(function (data, status, xhr) {
                if (xhr.status === 200 || xhr.status === 201) {
                    Alerts.Success('Steps updated successfully.');
                    //this.createEditTestScriptStepModal.modal('hide');
                    _this.loadTestScriptSteps(testScriptId);
                }
            })
                .always(function () { return MainLoader.hide(); });
        });
        this.saveTestScriptBtn.on('click', function () {
            var testScriptId = _this.saveTestScriptModalForm.find('[name=TestScriptId]').val() || 0;
            if (testScriptId > 0) {
                MainLoader.show();
                var sprintSaveUrl = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptUpdate, testScriptId);
                _this.apiService.put(sprintSaveUrl, _this.saveTestScriptModalForm.serialize())
                    .done(function (data, status, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        Alerts.Success('Test Script updated successfully.');
                        _this.createEditTestScriptModal.modal('hide');
                        if (_this.isDetailPage)
                            _this.getTestScriptDetails(testScriptId);
                        else if ((_this.selectedProjectId && _this.selectedStorId) || _this.selectedTeamIds) {
                            _this.loadTestScrips(_this.selectedProjectId, _this.selectedStorId, _this.selectedTeamIds);
                        }
                    }
                })
                    .always(function () { return MainLoader.hide(); });
            }
            else {
                MainLoader.show();
                var sprintSaveUrl = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptCreate, testScriptId);
                _this.apiService.post(sprintSaveUrl, _this.saveTestScriptModalForm.serialize())
                    .done(function (data, status, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        Alerts.Success('Test Script created successfully.');
                        _this.createEditTestScriptModal.modal('hide');
                        if ((_this.selectedProjectId && _this.selectedStorId) || _this.selectedTeamIds)
                            _this.loadTestScrips(_this.selectedProjectId, _this.selectedStorId, _this.selectedTeamIds);
                    }
                })
                    .always(function () { return MainLoader.hide(); });
            }
        });
        this.saveTestScriptStepBtn.on('click', function () {
            var stepId = _this.saveTestScriptStepModalForm.find('[name=StepId]').val() || 0;
            var testScriptId = _this.saveTestScriptStepModalForm.find('[name=TestScriptId]').val();
            if (stepId > 0) {
                MainLoader.show();
                var stepSaveUrl = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptStepUpdate, testScriptId, stepId);
                _this.apiService.put(stepSaveUrl, _this.saveTestScriptStepModalForm.serialize())
                    .done(function (data, status, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        Alerts.Success('Step updated successfully.');
                        _this.createEditTestScriptStepModal.modal('hide');
                        _this.loadTestScriptSteps(testScriptId);
                    }
                })
                    .always(function () { return MainLoader.hide(); });
            }
            else {
                MainLoader.show();
                var stepSaveUrl = UrlHelper.GetTestScriptsUrl(ApiUrl.TestScriptStepCreate, testScriptId, 0);
                _this.apiService.post(stepSaveUrl, _this.saveTestScriptStepModalForm.serialize())
                    .done(function (data, status, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        Alerts.Success('Step created successfully.');
                        _this.createEditTestScriptStepModal.modal('hide');
                        _this.loadTestScriptSteps(testScriptId);
                    }
                })
                    .always(function () { return MainLoader.hide(); });
            }
        });
        $("input[name=test-script-developer-status],input[name=test-script-devmgr-status],input[name=test-script-bizanalyst-status],input[name=test-script-bizrequester-status]").change(function (e) {
            var userId = $(e.target).data("userid") || "";
            var userType = $(e.target).data("usertype") || "";
            var selectedId = $(e.target).val() || 0;
            _this.updateAssigneeMappingStatus(userId, userType, selectedId);
        });
    };
    return TestScriptService;
}());
//# sourceMappingURL=TestScriptService.js.map