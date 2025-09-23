sap.ui.define([
	"hcm/fab/myleaverequest/utils/formatters",
	"hcm/fab/myleaverequest/utils/utils",
	"hcm/fab/myleaverequest/controller/BaseController",
	"hcm/fab/myleaverequest/utils/DataUtil",
	"hcm/fab/myleaverequest/utils/CalendarUtil",
	"sap/ui/Device",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Context",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/base/Event",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Title",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/ToolbarSpacer",
	"sap/m/ProgressIndicator",
	"sap/m/OverflowToolbar",
	"sap/m/ObjectAttribute",
	"sap/m/UploadCollection",
	"sap/m/UploadCollectionItem",
	"sap/m/UploadCollectionParameter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"hcm/fab/lib/common/controls/TeamCalendarControl",
	"hcm/fab/lib/common/util/DateUtil",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/StandardListItem",
	"sap/m/DateRangeSelection",
	"sap/m/DatePicker"
], function (f, u, B, D, C, a, H, F, b, c, d, E, L, I, T, M, e, g, h, j, P, O, k, U, l, m, J, n, o, q, r, s, S, t, v) {
	"use strict";
	var w = 5;
	var x = 5;
	var y = [
		"notes",
		"AdditionalFields",
		"oLeaveStartDate",
		"oLeaveEndDate"
	];
	var z = {
		"CompCode": {
			keyField: "CompanyCodeID",
			titleField: "CompanyCodeID",
			descriptionField: "CompanyCodeText",
			searchFields: "CompanyCodeID,CompanyCodeText"
		},
		"DescIllness": {
			keyField: "IllnessCode",
			titleField: "IllnessCode",
			descriptionField: "IllnessDescTxt",
			searchFields: "IllnessCode,IllnessDescTxt"
		},
		"CostCenter": {
			keyField: "CostCenterID",
			titleField: "CostCenterID",
			descriptionField: "CostCenterText",
			searchFields: "CostCenterID,CostCenterText"
		},
		"OtCompType": {
			keyField: "OverTimeCompID",
			titleField: "OverTimeCompID",
			descriptionField: "OverTimeCompText",
			searchFields: "OverTimeCompID,OverTimeCompText"
		},
		"TaxArea": {
			keyField: "WorkTaxAreaID",
			titleField: "WorkTaxAreaID",
			descriptionField: "WorkTaxAreaDesciption",
			searchFields: "WorkTaxAreaDesciption"
		},
		"ObjectType": {
			keyField: "ObjtypeID",
			titleField: "ObjtypeID",
			descriptionField: "ObjTypetext",
			searchFields: "ObjtypeID,ObjTypetext"
		},
		"WageType": {
			keyField: "WageTypeID",
			titleField: "WageTypeID",
			descriptionField: "WageTypeText",
			searchFields: "WageTypeID,WageTypeText"
		},
		"OrderID": {
			keyField: "OrderNumID",
			titleField: "OrderNumID",
			descriptionField: "OrderNumText",
			searchFields: "OrderNumID,OrderNumText"
		}
	};
	return sap.ui.controller("hcm.fab.myleaverequest.HCMFAB_LEAV_MANExtension.controller.CreationCustom", {
		    oCreateModel: null,
		    sCEEmployeeId: undefined,
		    formatter: f,
		    utils: u,
		    oUploadCollection: null,
		    oUploadSet: null,
		    _notesBuffer: null,
		    _oMessagePopover: null,
		    _oNewFileData: {},
		    _oControlToFocus: null,
		    _bCheckboxFieldsAreBoolean: false,
		    _bApproverOnBehalfPropertyExists: false,
		    _oSearchApproverItemTemplate: null,
		    _bCheckLeaveSpanFIDateIsEdmTime: false,
		    _bQuotaAvailabilityFIHasDateParams: false,
		    onInit: function () {
		        var i = this.getOwnerComponent(), R = i.getRouter();
		        this._oAdditionalFieldsControls = {};
		        this._absenceTypeReceivedDeferred = u.createDeferred();
		        R.getTarget("creation").attachDisplay(this._onCreateTargetDisplay, this);
		        R.getTarget("creationWithParams").attachDisplay(this._onCreateTargetDisplayParams, this);
		        R.getTarget("edit").attachDisplay(this._onEditTargetDisplay, this);
		        R.getTarget("delete").attachDisplay(this._onDeletePostedLeaveTargetDisplay, this);
		        R.getRoute("creation").attachPatternMatched(this._onCreateRouteMatched, this);
		        R.getRoute("creationWithParams").attachPatternMatched(this._onCreateRouteMatchedParams, this);
		        R.getRoute("edit").attachPatternMatched(this._onEditRouteMatched, this);
		        R.getRoute("delete").attachPatternMatched(this._onDeletePostedLeaveRouteMatched, this);
		        this._oNotesModel = new J({ NoteCollection: [] });
		        this.setModel(this._oNotesModel, "noteModel");
		        this.oCreateModel = new J();
		        this.setModel(this.oCreateModel, "create");
		        this.initLocalModel();
		        this.oODataModel = i.getModel();
		        this.oErrorHandler = i.getErrorHandler();
		        this._oAttachmentsContainer = this.byId("attachmentsContainer");
		        if (a.system.phone) {
		            this.byId("leaveTypeSelectionForm").addDependent(this.byId("absDescText"));
		            this.byId("leaveTypeSelectionForm").addDependent(this.byId("absDescLabel"));
		        } else {
		            this.byId("leaveTypeSelectionForm").addDependent(this.byId("absDescLink"));
		        }
		        this.oCreateModel.attachPropertyChange(this._revalidateSaveButtonStatus, this);
		        this.oODataModel.attachPropertyChange(this._revalidateSaveButtonStatus, this);
		        if (v.getMetadata().hasEvent("navigate")) {
		            this.getView().byId("startDate").attachNavigate(this.onCalendarNavigate, this);
		        }
		        if (t.getMetadata().hasEvent("navigate")) {
		            this.getView().byId("dateRange").attachNavigate(this.onCalendarNavigate, this);
		        }
		        this.oODataModel.getMetaModel().loaded().then(function () {
		            var A = this._getAdditionalFieldMetaInfo("PrevDay");
		            this._bCheckboxFieldsAreBoolean = A.type === "Edm.Boolean";
		            var p = this._getLeaveSpanDateFieldMetaInfo("EndDate");
		            this._bCheckLeaveSpanFIDateIsEdmTime = p.type === "Edm.DateTime";
		            this._bApproverOnBehalfPropertyExists = this._checkForSearchApproverPropertyExistence();
		            this._bQuotaAvailabilityFIHasDateParams = this._quotaAvailabilityFIHasDateParams();
		            var G = this.byId("deleteButton");
		            if (G && G._getControl) {
		                var K = G._getControl();
		                if (K) {
		                    K.setType(sap.m.ButtonType.Reject);
		                }
		            }
		        }.bind(this));
		    },
		    initLocalModel: function () {
		        this.setModelProperties(this.oCreateModel, {
		            "uploadPercentage": 0,
		            "multiOrSingleDayRadioGroupIndex": 0,
		            "isQuotaCalculated": false,
		            "BalanceAvailableQuantityText": undefined,
		            "TimeUnitName": undefined,
		            "attachments": [],
		            "isAttachmentMandatory": false,
		            "isAttachmentUploadEnabled": true,
		            "isAttachmentExplanationVisible": false,
		            "isEndDateCalculated": false,
		            "notes": "",
		            "showDatePicker": false,
		            "showRange": true,
		            "usedWorkingTime": undefined,
		            "usedWorkingTimeUnit": undefined,
		            "aProposedApprovers": [],
		            "AdditionalFields": [],
		            "showTimePicker": false,
		            "showInputHours": false,
		            "timePickerFilled": false,
		            "inputHoursFilled": false,
		            "viewTitle": null,
		            "busy": false,
		            "sEditMode": null,
		            "sAttachmentsTitle": this.getResourceBundle().getText("attachmentToolbarTitle", [0]),
		            "iMaxApproverLevel": 0,
		            "iCurrentApproverLevel": 0,
		            "IsMultiLevelApproval": false,
		            "isApproverEditable": false,
		            "isApproverVisible": false,
		            "isLoadingApprovers": false,
		            "isAddDeleteApproverAllowed": false,
		            "isCalculatingQuota": false,
		            "isCalculatingLeaveDays": false,
		            "isNoteVisible": false,
		            "AbsenceDescription": "",
		            "AbsenceTypeName": "",
		            "bUseDateDefaults": true,
		            "oLeaveStartDate": null,
		            "oLeaveEndDate": null,
		            "sDateRangeValueState": sap.ui.core.ValueState.None,
		            "isSaveRequestPending": false,
		            "saveButtonEnabled": false,
		            "calendar": {
		                overlapNumber: 0,
		                assignmentId: this.sCEEmployeeId,
		                opened: false
		            }
		        }, undefined, false);
		    },
		    onAbsenceTypeReceived: function (i) {
		        var p = i.getParameter("data");
		        if (!p || p && !p.results) {
		            this.sCEEmployeeId = null;
		            return;
		        }
		        this._absenceTypeReceivedDeferred.resolve(p.results);
		    },
		    onNumberChange: function (i) {
		        var p = i.getSource(), N = p.getValue();
		        if (N === "") {
		            p.setValue("0");
		        }
		    },
		    onExit: function () {
		        this.oErrorHandler.clearErrors();
		        this.oCreateModel.detachPropertyChange(this._revalidateSaveButtonStatus, this);
		        this.oODataModel.detachPropertyChange(this._revalidateSaveButtonStatus, this);
		        if (this._oDialog) {
		            this._oDialog.destroy();
		        }
		        if (this._oSearchHelperDialog) {
		            this._oSearchHelperDialog.destroy();
		        }
		        if (this._oOverlapCalendar) {
		            this._oOverlapCalendar.destroy();
		        }
		        if (this._overlapDialog) {
		            this._overlapDialog.destroy();
		        }
		        this._destroyAdditionalFields();
		        this._cleanupUnsubmittedViewChanges();
		    },
		    onSendRequest: function () {
		        var p = {}, A = this.getView().getBindingContext().getPath();
		        this._copyDateFieldsIntoModel(this.oODataModel, A);
		        this._copyAdditionalFieldsIntoModel(this.oCreateModel.getProperty("/AdditionalFields"), this.oODataModel, A);
		        if (!this._requiredAdditionalFieldsAreFilled()) {
		            this.byId("createMessagesIndicator").focus();
		            return;
		        }
		        if (this._checkFormFieldsForError()) {
		            this.byId("createMessagesIndicator").focus();
		            return;
		        }
		        var G = function (i, V) {
		            var R = this.oODataModel.getProperty(i);
		            if (V === R) {
		                return;
		            }
		            if (V && V.equals && V.equals(R)) {
		                return;
		            }
		            p[i] = R;
		            this.oODataModel.setProperty(i, V);
		        }.bind(this);
		        if (this.oCreateModel.getProperty("/notes")) {
		            G(A + "/Notes", this.oCreateModel.getProperty("/notes"));
		        } else {
		            G(A + "/Notes", this._notesBuffer);
		        }
		        var K = [];
		        if (this.oUploadCollection) {
		            K = this.oUploadCollection.getItems();
		            if (K.length > x) {
		                this.oErrorHandler.pushError(this.getResourceBundle().getText("txtMaxAttachmentsReached"));
		                this.oErrorHandler.displayErrorPopup();
		                this.oErrorHandler.setShowErrors("immediately");
		                return;
		            }
		        } else if (this.oUploadSet) {
		            K = this.oUploadSet.getItems().concat(this.oUploadSet.getIncompleteItems());
		        }
		        if (this.oCreateModel.getProperty("/isAttachmentMandatory") && K.length === 0) {
		            this.oErrorHandler.pushError(this.getResourceBundle().getText("txtAttachmentsRequired"));
		            this.oErrorHandler.displayErrorPopup();
		            this.oErrorHandler.setShowErrors("immediately");
		            return;
		        }
		        this._updateLeaveRequestWithModifiedAttachments(this.oODataModel, A);
		        if (this.oCreateModel.getProperty("/multiOrSingleDayRadioGroupIndex") === null || this.oCreateModel.getProperty("/multiOrSingleDayRadioGroupIndex") === 0) {
		            this.oODataModel.setProperty(A + "/PlannedWorkingHours", "0.00");
		            this.oODataModel.setProperty(A + "/StartTime", "");
		            this.oODataModel.setProperty(A + "/EndTime", "");
		        }
		        if (this.oCreateModel.getProperty("/sEditMode") === "DELETE") {
		            this.oODataModel.setProperty(A + "/ActionID", 3);
		        }
		        var N = function (R) {
		            this.oCreateModel.setProperty("/busy", false);
		            this.oCreateModel.setProperty("/uploadPercentage", 0);
		            Object.keys(p).forEach(function (Y) {
		                var Z = p[Y];
		                this.oODataModel.setProperty(Y, Z);
		            }.bind(this));
		            var V = this.oODataModel.getProperty(A), W = "", X = "";
		            for (var i = 0; i < x; i++) {
		                X = "Attachment" + (i + 1);
		                W = A + "/" + X;
		                if (V[X] && !this.oODataModel.getProperty(W + "/AttachmentStatus")) {
		                    this.oODataModel.setProperty(W, {
		                        FileName: "",
		                        FileType: "",
		                        FileSize: "0"
		                    });
		                }
		            }
		        };
		        if (this.oODataModel.hasPendingChanges()) {
		            var Q = {
		                requestID: this.oODataModel.getProperty(A + "/RequestID"),
		                aUploadedFiles: [],
		                leavePath: A,
		                showSuccess: true
		            };
		            this.oODataModel.setProperty(A + "/IsMultiLevelApproval", this.oCreateModel.getProperty("/IsMultiLevelApproval"));
		            this.oCreateModel.setProperty("/busy", true);
		            this.submitLeaveRequest(Q).then(this._uploadAttachments.bind(this)).then(this._showSuccessStatusMessage.bind(this)).catch(N.bind(this));
		        } else if (this.oODataModel.getProperty(A + "/StatusID") === "REJECTED") {
		            this.oCreateModel.setProperty("/busy", true);
		            this.oODataModel.update(A, this.oODataModel.getObject(A), {
		                success: function () {
		                    this._showSuccessStatusMessage();
		                }.bind(this),
		                error: function () {
		                    N.call(this);
		                }.bind(this)
		            });
		        } else {
		            g.show(this.getResourceBundle().getText("noChangesFound"));
		        }
		    },
		    onCancel: function () {
		        this._confirmCancel();
		    },
		    submitLeaveRequest: function (p) {
		        return new Promise(function (R, i) {
		            this.oCreateModel.setProperty("/isSaveRequestPending", true);
		            this.oODataModel.submitChanges({
		                success: function (A, G) {
		                    this.oCreateModel.setProperty("/isSaveRequestPending", false);
		                    var K = G.data.__batchResponses[0], N = {};
		                    if (K.response) {
		                        N = K.response;
		                    } else if (K.__changeResponses) {
		                        N = K.__changeResponses[0];
		                    }
		                    if (N.statusCode.substr(0, 1) === "2") {
		                        if (N.headers.requestid) {
		                            p.requestID = N.headers.requestid;
		                        }
		                        R(p);
		                    } else {
		                        i();
		                    }
		                }.bind(this),
		                error: function (A) {
		                    this.oCreateModel.setProperty("/isSaveRequestPending", false);
		                    i(A);
		                }.bind(this)
		            });
		        }.bind(this));
		    },
		    createLeaveRequestCollection: function () {
		        return this.oODataModel.createEntry("/LeaveRequestSet", {
		            properties: {
		                StartDate: null,
		                EndDate: null,
		                StartTime: "",
		                EndTime: ""
		            }
		        });
		    },
		    onAbsenceTypeChange: function (i) {
		        var A, p = i.getParameter("selectedItem"), G = this.getView().getBindingContext().getPath();
		        if (p) {
		            A = p.getBindingContext();
		            this.updateOdataModel(A.getObject());
		            var K = A.getProperty("toAdditionalFieldsDefinition") || [], N = this._getAdditionalFieldValues(K, this._getCurrentAdditionalFieldValues()), Q = {
		                    definition: K,
		                    values: N
		                };
		            this._destroyAdditionalFields();
		            var R = A.getObject({ expand: "toApprover" });
		            this._handleApprovers(G, R.toApprover);
		            this._updateLocalModel(Q, R);
		            if (!(R.IsRecordInClockTimesAllowed && R.IsAllowedDurationPartialDay)) {
		                this.oODataModel.setProperty(G + "/StartTime", "");
		                this.oODataModel.setProperty(G + "/EndTime", "");
		            }
		            if (!(R.IsRecordInClockHoursAllowed && R.IsAllowedDurationPartialDay)) {
		                this.oODataModel.setProperty(G + "/PlannedWorkingHours", "0.00");
		            }
		            this._handleAttachments(A.getObject());
		            this._fillAdditionalFields(this.oCreateModel, A.getProperty("AbsenceTypeCode"), this._getAdditionalFieldsContainer());
		            this._fillAdditionalFieldTexts(K, N);
		            this._updateCalcLeaveDays();
		        }
		    },
		    onShowLeaveTypeDescriptionPressed: function (i) {
		        if (!this._oLeaveTypeDescriptionDialog) {
		            var V = this.getView();
		            this._oLeaveTypeDescriptionDialog = u.setResizableDraggableForDialog(sap.ui.xmlfragment("hcm.fab.myleaverequest.view.fragments.LeaveTypeDescriptionDialog", this));
		            jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), V, this._oLeaveTypeDescriptionDialog);
		            V.addDependent(this._oLeaveTypeDescriptionDialog);
		        }
		        this._oLeaveTypeDescriptionDialog.openBy(i.getSource());
		    },
		    onSingleMultiDayRadioSelected: function (i) {
		        var p = q.convertToUTC(this.oCreateModel.getProperty("/oLeaveStartDate")), A = q.convertToUTC(this.oCreateModel.getProperty("/oLeaveEndDate")), G = i.getSource().getSelectedIndex() === 0;
		        if (p && p.getTime() !== A.getTime()) {
		            this._updateCalcLeaveDays();
		            if (!G) {
		                this.oCreateModel.setProperty("/oLeaveEndDate", q.convertToLocal(p));
		                this._updateApprovers(this.getSelectedAbsenceTypeControl().getBindingContext().getObject());
		                this._revalidateSaveButtonStatus();
		            }
		        }
		        
		        // custom extension
		        let iSelectedIndex = i.getSource().getSelectedIndex();
		        if (iSelectedIndex === 0) {
		        	this.getView().byId("singleDayBtnGroup").setEnabled(false);
		        } else {
		        	this.getView().byId("singleDayBtnGroup").setEnabled(true);
		        	this.getView().byId("startTimePick").setEnabled(false);
		        	this.getView().byId("endTimePick").setEnabled(false);
		        }
		    },
		    
		    onSingleDayRadioSelected: function (i) {
		    	let iSelectedIndex = i.getSource().getSelectedIndex();
		    	if (iSelectedIndex === 0) { 
		    		this.getView().byId("hoursValue").setValue("7.60");
		    	} else {
		    		this.getView().byId("hoursValue").setValue("3.80");
		    	}
		    	
		    },
		    
		    onDateRangeChanged: function (i) {
		        var V = i.getParameter("valid"), p = i.getParameter("from"), A = i.getParameter("to");
		        if (V) {
		            this.oCreateModel.setProperty("/bUseDateDefaults", false);
		            if (p) {
		                if (!A) {
		                    this.oCreateModel.setProperty("/oLeaveEndDate", p);
		                }
		                this._updateCalcLeaveDays();
		                this._updateAvailableQuota(this.getSelectedAbsenceTypeControl().getBindingContext().getObject());
		                this._updateApprovers(this.getSelectedAbsenceTypeControl().getBindingContext().getObject());
		                this._showBusyDialog(i.getSource());
		            }
		        }
		        this.oCreateModel.setProperty("/sDateRangeValueState", V ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error);
		        this._revalidateSaveButtonStatus();
		    },
		    onInputHoursChange: function (i) {
		        var V, p, A = this.getView().getBindingContext();
		        if (this.getModel("global").getProperty("/bShowIndustryHours")) {
		            V = f.convertInputHoursStringToFloat(i.getParameter("value"));
		            p = !isNaN(V);
		            V = p ? V : 0;
		        } else {
		            V = this._convertHoursMinutesFromDateToDecimal(i.getSource().getDateValue());
		            p = true;
		            this.oODataModel.setProperty(A.getPath("PlannedWorkingHours"), V.toFixed(2));
		        }
		        this.oCreateModel.setProperty("/inputHoursFilled", !p || V !== "" && V !== 0);
		        if (p && V <= 24) {
		            this.oODataModel.setProperty(A.getPath("StartTime"), "");
		            this.oODataModel.setProperty(A.getPath("EndTime"), "");
		            this._updateCalcLeaveDays();
		            this._showBusyDialog(i.getSource());
		        }
		        this._revalidateSaveButtonStatus();
		    },
		    onDatePickChanged: function (i) {
		        var V = i.getParameter("valid"), p = i.getSource();
		        if (V) {
		            var A = n.getDateInstance({ UTC: true }).parse(i.getParameter("newValue"), true);
		            this.oCreateModel.setProperty("/bUseDateDefaults", false);
		            if (A) {
		                if (!this.oCreateModel.getProperty("/isEndDateCalculated")) {
		                    this.oCreateModel.setProperty("/oLeaveEndDate", q.convertToLocal(A));
		                    this._updateAvailableQuota(this.getSelectedAbsenceTypeControl().getBindingContext().getObject());
		                }
		                this._updateCalcLeaveDays();
		                this._showBusyDialog(p);
		            }
		        }
		        p.setValueState(V ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error);
		        this._revalidateSaveButtonStatus();
		    },
		    onTimeChange: function (i) {
		        var p = i.getSource(), A = p.getBindingContext().getPath(p.getBinding("value").getPath());
		        this.oCreateModel.setProperty("/timePickerFilled", i.getParameter("newValue") ? true : false);
		        this.oODataModel.setProperty(A, i.getParameter("newValue"));
		        this._updateCalcLeaveDays();
		        this._showBusyDialog(i.getSource());
		        this._revalidateSaveButtonStatus();
		    },
		    onAddFieldDateTimeChange: function (i) {
		        this._checkRequiredField(i.getSource());
		        this._revalidateSaveButtonStatus();
		    },
		    onApproverValueHelp: function (i) {
		        if (!this._oDialog) {
		            this._oDialog = u.setResizableDraggableForDialog(sap.ui.xmlfragment("hcm.fab.myleaverequest.view.fragments.ApproverDialog", this));
		            jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), this._oDialog);
		            this.getView().addDependent(this._oDialog);
		            this._oSearchApproverItemTemplate = new S({
		                title: "{ApproverEmployeeName}",
		                description: {
		                    parts: [
		                        "global>/showEmployeeNumber",
		                        "global>/bShowEmployeeNumberWithoutZeros",
		                        "ApproverEmployeeID"
		                    ],
		                    formatter: f.formatApproverDescription
		                },
		                info: "{ApproverUserID}",
		                customData: [
		                    {
		                        key: "ApproverEmployeeID",
		                        value: "{ApproverEmployeeID}"
		                    },
		                    {
		                        key: "ApproverEmployeeName",
		                        value: "{ApproverEmployeeName}"
		                    }
		                ]
		            });
		            if (this._oSearchApproverItemTemplate.setWrapping) {
		                this._oSearchApproverItemTemplate.setWrapping(true);
		            }
		        }
		        this._oDialog.data("initiator", i.getSource());
		        this._oDialog.data("approverLevel", i.getSource().data("approverLevel"));
		        this._oDialog.bindAggregation("items", {
		            path: "/SearchApproverSet",
		            filters: this._getApproverSearchFilters(),
		            parameters: { custom: {} },
		            templateShareable: true,
		            template: this._oSearchApproverItemTemplate
		        });
		        this._oDialog.open();
		    },
		    onRemoveApproverClicked: function (i) {
		        var p = this.oCreateModel.getProperty("/iCurrentApproverLevel"), A = this.getView().getBindingContext().getPath(), G = A + "/ApproverLvl" + p;
		        this.oODataModel.setProperty(G + "/Name", "");
		        this.oODataModel.setProperty(G + "/Pernr", "000000");
		        this.oODataModel.setProperty(G + "/Seqnr", "000");
		        this.oODataModel.setProperty(G + "/DefaultFlag", false);
		        this.oCreateModel.setProperty("/iCurrentApproverLevel", p - 1);
		    },
		    onAddApproverClicked: function (i) {
		        var p = this.oCreateModel.getProperty("/iCurrentApproverLevel"), A = this.oCreateModel.getProperty("/aProposedApprovers"), G = A[p];
		        if (G) {
		            var K = this.getView().getBindingContext().getPath(), N = K + "/ApproverLvl" + (p + 1);
		            this.oODataModel.setProperty(N + "/Name", G.Name);
		            this.oODataModel.setProperty(N + "/Pernr", G.Pernr);
		            this.oODataModel.setProperty(N + "/Seqnr", G.Seqnr);
		            this.oODataModel.setProperty(N + "/DefaultFlag", G.DefaultFlag);
		        }
		        this.oCreateModel.setProperty("/iCurrentApproverLevel", p + 1);
		    },
		    onNotesLiveChange: function (i) {
		        var p = i.getParameter("newValue");
		        if (p.length < 2) {
		            return;
		        }
		        if (p.indexOf("::") > -1) {
		            var A = i.getSource().getFocusDomRef().selectionStart;
		            i.getSource().setValue(p.replace(/(:)+/g, "$1"));
		            i.getSource().getFocusDomRef().setSelectionRange(A, A - 1);
		        }
		    },
		    onAdditionalFieldLiveChange: function (i) {
		        if (!i.getParameter("newValue")) {
		            this.oCreateModel.setProperty(i.getSource().getBinding("value").getContext().getPath() + "/descriptionText", "");
		        }
		        this._checkRequiredField(i.getSource());
		    },
		    onFileSizeExceeded: function (i) {
		        var p = {}, A = "", G = 0, K = 0;
		        if (i.getSource().getMetadata().getName() === "sap.m.UploadCollection") {
		            p = i.getParameter("files")[0];
		            A = p.name;
		            G = p.fileSize * 1024;
		            K = i.getSource().getMaximumFileSize();
		        } else {
		            var N = i.getParameter("item");
		            p = N.getFileObject();
		            if (!p) {
		                return;
		            }
		            A = p.name;
		            G = p.size / 1024;
		            K = i.getSource().getMaxFileSize();
		            i.getSource().removeIncompleteItem(N);
		        }
		        h.warning(this.getResourceBundle().getText("attachmentFileSizeTooBig", [
		            A,
		            f.formatFileSize(G),
		            K
		        ]));
		    },
		    onFileTypeMissmatch: function (i) {
		        var p = "", A = "", G = [];
		        if (i.getSource().getMetadata().getName() === "sap.m.UploadCollection") {
		            p = i.getParameter("files")[0].fileType;
		            G = i.getSource().getFileType();
		            A = G.join(", ");
		        } else {
		            var K = i.getParameter("item");
		            G = i.getSource().getFileTypes();
		            p = this._getFileTypeFromFileName(K.getFileName());
		            A = G.join(", ");
		            i.getSource().removeIncompleteItem(K);
		        }
		        h.warning(this.getResourceBundle().getText(G.length > 1 ? "attachmentWrongFileTypeMult" : "attachmentWrongFileType", [
		            p,
		            A
		        ]));
		    },
		    onBeforeUploadStartsSet: function (i) {
		        var p = i.getSource(), A = jQuery.sap.encodeURL(i.getParameter("item").getFileName());
		        p.destroyHeaderFields();
		        p.addHeaderField(new sap.ui.core.Item({
		            key: "slug",
		            text: A
		        }));
		        p.addHeaderField(new sap.ui.core.Item({
		            key: "x-csrf-token",
		            text: this.oODataModel.getSecurityToken()
		        }));
		        p.addHeaderField(new sap.ui.core.Item({
		            key: "Content-Disposition",
		            text: "attachment;filename=" + A
		        }));
		    },
		    onBeforeAttachmentItemAdded: function (i) {
		        var p = i.getParameter("item"), N = p.getFileObject(), A = false, G = i.getSource().getItems(), K = i.getSource().getIncompleteItems(), Q = function (R) {
		                if (!A && R.getProperty("fileName") === N.name) {
		                    h.warning(this.getResourceBundle().getText("duplicateAttachment"));
		                    A = true;
		                    return;
		                }
		            }.bind(this);
		        this._oItemToRemove = p;
		        if (N.type === "") {
		            this.onFileTypeMissmatch(i);
		            return;
		        }
		        G.forEach(Q);
		        if (A) {
		            return;
		        }
		        K.forEach(Q);
		        if (A) {
		            return;
		        }
		        this._oItemToRemove = null;
		    },
		    onAfterAttachmentItemAdded: function (i) {
		        if (this._oItemToRemove) {
		            this.oUploadSet.removeIncompleteItem(this._oItemToRemove);
		            this._oItemToRemove = null;
		        }
		        this.oCreateModel.setProperty("/isAttachmentExplanationVisible", true);
		        var A = i.getSource().getItems().concat(i.getSource().getIncompleteItems());
		        if (A.length === x) {
		            g.show(this.getResourceBundle().getText("maxAttachment"));
		        }
		    },
		    onAttachmentChange: function (i) {
		        var p = false, A = this.oUploadCollection.getItems(), G = A[0], N = i.getParameter("files")[0];
		        this._oNewFileData[N.name] = N;
		        A.forEach(function (Q) {
		            if (Q.getProperty("fileName") === N.name) {
		                h.warning(this.getResourceBundle().getText("duplicateAttachment"), {
		                    onClose: function () {
		                        this.oUploadCollection.removeItem(Q);
		                    }.bind(this)
		                });
		                p = true;
		                return;
		            }
		        }.bind(this));
		        if (!p) {
		            if (A.length === x - 1) {
		                g.show(this.getResourceBundle().getText("maxAttachment"));
		            } else {
		                var K = this.oUploadCollection._aFileUploadersForPendingUpload;
		                if (K.length >= 1 && G && G._status !== "display") {
		                    h.warning(this.getResourceBundle().getText("oneAttachmentAllowed"), {
		                        onClose: function () {
		                            this.oUploadCollection.removeItem(G);
		                        }.bind(this)
		                    });
		                }
		            }
		        }
		    },
		    onBeforeUploadStarts: function (i) {
		        var p = i.getParameters(), A = jQuery.sap.encodeURL(i.getParameter("fileName"));
		        p.addHeaderParameter(new m({
		            name: "slug",
		            value: A
		        }));
		        p.addHeaderParameter(new m({
		            name: "x-csrf-token",
		            value: this.oODataModel.getSecurityToken()
		        }));
		        p.addHeaderParameter(new m({
		            name: "Content-Disposition",
		            value: "attachment;filename=" + A
		        }));
		    },
		    onHandlePopover: function (i) {
		        var p = i.getSource(), V = this.getView();
		        if (!this._oMessagePopover) {
		            this._oMessagePopover = new M({
		                items: {
		                    path: "message>/",
		                    template: new e({
		                        description: "{message>description}",
		                        type: "{message>type}",
		                        title: "{message>message}",
		                        subtitle: "{message>additionalText}"
		                    })
		                }
		            });
		            jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), V, this._oMessagePopover);
		            V.addDependent(this._oMessagePopover);
		        }
		        this._oMessagePopover.toggle(p);
		    },
		    handleApproverDialogSearch: function (i) {
		        var p = i.getParameter("value");
		        i.getSource().removeAllItems();
		        i.getSource().bindAggregation("items", {
		            path: "/SearchApproverSet",
		            filters: this._getApproverSearchFilters(),
		            parameters: { custom: p ? { search: encodeURIComponent(p) } : {} },
		            template: this._oSearchApproverItemTemplate
		        });
		    },
		    handleApproverDialogClose: function (i) {
		        var p = i.getParameter("selectedItem");
		        if (p) {
		            var A = i.getSource().data("approverLevel"), G = this.getView().getBindingContext().getPath() + "/ApproverLvl" + A;
		            this.oODataModel.setProperty(G + "/Pernr", p.data("ApproverEmployeeID"));
		            this.oODataModel.setProperty(G + "/Name", p.data("ApproverEmployeeName"));
		        }
		        i.getSource().removeAllItems();
		    },
		    handleApproverDialogCancel: function (i) {
		        i.getSource().removeAllItems();
		    },
		    handleSearchHelperDialogSearch: function (i) {
		        var p, A, G;
		        G = i.getSource().data("initiator");
		        A = i.getParameter("value");
		        var K = new F({
		            filters: G.data("helperCollectionFilterFields").split(",").map(function (N) {
		                return new F(N, b.Contains, A);
		            }),
		            and: false
		        });
		        p = i.getSource().getBinding("items");
		        p.filter([K]);
		    },
		    handleSearchHelperDialogClose: function (i) {
		        var p, A, G = i.getParameter("selectedItem");
		        if (!G) {
		            return;
		        }
		        A = i.getSource().data("initiator");
		        p = G.getProperty("title") === this.getResourceBundle().getText("txtNoneListItem") ? "" : G.getProperty("title");
		        var K = A.getBindingContext("create").getPath();
		        this.oCreateModel.setProperty(K + "/fieldValue", p);
		        var N = G.getProperty("description");
		        this.oCreateModel.setProperty(K + "/descriptionText", N);
		        this._checkRequiredField(A);
		        this._revalidateSaveButtonStatus();
		    },
		    onSearchHelperRequest: function (i) {
		        var p = i.getSource(), A = p.getValue();
		        if (!this._oSearchHelperDialog) {
		            this._oSearchHelperDialog = u.setResizableDraggableForDialog(sap.ui.xmlfragment("hcm.fab.myleaverequest.view.fragments.SearchHelperDialog", {
		                handleSearch: this.handleSearchHelperDialogSearch.bind(this),
		                handleClose: this.handleSearchHelperDialogClose.bind(this)
		            }));
		        }
		        this.getSearchHelperDialogModel(p.data("helperTitleText"), p.data("helperNoDataFoundText"), p.data("helperCollection"), p.data("helperCollectionTitleField"), p.data("helperCollectionDescriptionField"), p.getRequired()).then(function (G) {
		            this._oSearchHelperDialog.setModel(G);
		            this._oSearchHelperDialog.data("initiator", p);
		            this.handleSearchHelperDialogSearch(new E("initSearch", this._oSearchHelperDialog, { value: A }));
		            this._oSearchHelperDialog.open(A);
		        }.bind(this));
		    },
		    onNavBack: function () {
		        this._confirmCancel();
		    },
		    getSelectedAbsenceTypeControl: function () {
		        return this.getView().byId("absenceType").getSelectedItem();
		    },
		    getSearchHelperDialogModel: function (i, p, A, G, K, N) {
		        return new Promise(function (R, Q) {
		            var V = this.getModel("global").getProperty("/sCountryGrouping");
		            this.oODataModel.read("/" + A, {
		                filters: A === "SearchWageTypeSet" && V ? [new F("CountryGrouping", b.EQ, V)] : [],
		                success: function (W) {
		                    if (!W.hasOwnProperty("results")) {
		                        Q("Cannot find 'results' member in the " + A + " collection");
		                        return;
		                    }
		                    var X = {
		                            DialogTitle: i,
		                            NoDataText: p,
		                            Collection: []
		                        }, Y = {}, Z = false;
		                    X.Collection = W.results.map(function (_) {
		                        Y = jQuery.extend({}, _, true);
		                        Y.Title = _[G] === "" ? this.getResourceBundle().getText("txtNoneListItem") : _[G];
		                        Y.Description = _[K];
		                        Z = Z || _[G] === "";
		                        return Y;
		                    }.bind(this));
		                    if (!N && !Z) {
		                        var $ = {
		                            Title: this.getResourceBundle().getText("txtNoneListItem"),
		                            Description: ""
		                        };
		                        $[G] = "";
		                        $[K] = "";
		                        X.Collection.unshift($);
		                    }
		                    R(new J(X));
		                }.bind(this),
		                error: function (W) {
		                    Q(W);
		                }
		            });
		        }.bind(this));
		    },
		    setModelProperties: function (i, p, A, G) {
		        var K = Object.keys(p);
		        var N = K.length;
		        K.forEach(function (Q, R) {
		            var V = true;
		            var W = (A || "") + "/" + Q;
		            if (R === N - 1 && G) {
		                V = false;
		            }
		            i.setProperty(W, p[Q], V);
		        });
		    },
		    updateOdataModel: function (A, R) {
		        this.setModelProperties(this.oODataModel, {
		            "EmployeeID": A.EmployeeID,
		            "AbsenceTypeName": A.AbsenceTypeName,
		            "AbsenceTypeCode": R && R !== "default" ? R : A.AbsenceTypeCode
		        }, this.getView().getBindingContext().getPath(), false);
		    },
		    onOverlapOpen: function () {
		        if (!this._overlapDialog) {
		            this.getView().removeDependent(this._oOverlapCalendar);
		            this._overlapDialog = new r({
		                title: "{i18n>overlapCalendarLabel}",
		                contentWidth: "80rem",
		                contentHeight: "44rem",
		                draggable: true,
		                resizable: true,
		                stretch: a.system.phone,
		                content: [this._oOverlapCalendar],
		                beginButton: [new s({
		                        text: "{i18n>calendarOverlapCloseButtonText}",
		                        tooltip: "{i18n>calendarOverlapCloseButtonText}",
		                        press: function () {
		                            this._overlapDialog.close();
		                            this.oCreateModel.setProperty("/calendar/opened", false);
		                        }.bind(this)
		                    })]
		            });
		            this.getView().addDependent(this._overlapDialog);
		        }
		        this.oCreateModel.setProperty("/calendar/opened", true);
		        this._overlapDialog.open();
		    },
		    onCalendarNavigate: function (i) {
		        var p = i.getSource(), A = i.getParameter("dateRange").getStartDate(), G = i.getParameter("dateRange").getEndDate();
		        if (A.getDate() > 20) {
		            A.setDate(1);
		            A.setMonth(A.getMonth() + 1);
		        }
		        if (G.getDate() < 10) {
		            G.setDate(0);
		        }
		        C.configureCalendar(i.getSource()._oCalendar, this.getModel(), this.getResourceBundle(), this.getAppController());
		        p.setBusy(true);
		        p.removeAllSpecialDates();
		        this._oDataUtil.getCalendarEvents(A, G).then(function (R) {
		            p.setBusy(false);
		            C.fillCalendarData(p, A, G, R.leaveRequests, R.workSchedule, this.getAppController());
		        }.bind(this));
		    },
		    _navBack: function () {
		        this.oErrorHandler.setShowErrors("immediately");
		        this.oErrorHandler.clearErrors();
		        this.getView().unbindElement();
		        this.getView().setBindingContext(null);
		        this.initLocalModel();
		        this._doAttachmentCleanup();
		        if (this._sFromTarget) {
		            this.getRouter().getTargets().display(this._sFromTarget);
		            delete this._sFromTarget;
		            return;
		        }
		        var p = H.getInstance().getPreviousHash();
		        if (p !== undefined) {
		            window.history.go(-1);
		        } else {
		            var R = this.getOwnerComponent().getRouter();
		            R.navTo("overview", {}, true);
		        }
		    },
		    _confirmCancel: function () {
		        var i = this.getOwnerComponent();
		        if (this._hasPendingChanges()) {
		            h.confirm(this.getResourceBundle().getText("cancelPopover"), {
		                styleClass: i.getContentDensityClass(),
		                initialFocus: h.Action.CANCEL,
		                onClose: function (A) {
		                    if (A === h.Action.OK) {
		                        this._cleanupUnsubmittedViewChanges();
		                        this._navBack();
		                    }
		                }.bind(this)
		            });
		        } else {
		            this._navBack();
		        }
		    },
		    _updateChangeRelevantLocalModelProperty: function (p, i) {
		        y.forEach(function (A) {
		            if (A === p) {
		                this._oLocalModelProperties[A] = JSON.stringify(i);
		            }
		        }.bind(this));
		    },
		    _rememberChangeRelevantLocalModelProperties: function () {
		        this._oLocalModelProperties = {};
		        y.forEach(function (A) {
		            var p = this.oCreateModel.getProperty("/" + A);
		            this._oLocalModelProperties[A] = JSON.stringify(p);
		        }.bind(this));
		        var i = this._getAttachmentItemList();
		        this._oLocalModelProperties.AttachmentList = JSON.stringify(i);
		    },
		    _hasPendingChanges: function () {
		        if (this.oODataModel.hasPendingChanges())
		            return true;
		        if (!this._oLocalModelProperties)
		            return false;
		        for (var i = 0; i < y.length; i++) {
		            var p = y[i];
		            var A = JSON.stringify(this.oCreateModel.getProperty("/" + p));
		            if (this._oLocalModelProperties[p] !== A)
		                return true;
		        }
		        var G = this._getAttachmentItemList();
		        if (this._oLocalModelProperties.AttachmentList !== JSON.stringify(G))
		            return true;
		        return false;
		    },
		    _revalidateSaveButtonStatus: function () {
		        setTimeout(function () {
		            var i = this.getView().getBindingContext().getObject(), p = this.oCreateModel.getProperty("/oLeaveStartDate");
		            if (!i || !i.AbsenceTypeCode || !p) {
		                this.oCreateModel.setProperty("/saveButtonEnabled", false);
		                return;
		            }
		            if (this._checkFormFieldsForError()) {
		                this.oCreateModel.setProperty("/saveButtonEnabled", false);
		                return;
		            }
		            if (i.StatusID === "REJECTED" || this.oCreateModel.getProperty("/sEditMode") === "DELETE") {
		                this.oCreateModel.setProperty("/saveButtonEnabled", true);
		                return;
		            }
		            this.oCreateModel.setProperty("/saveButtonEnabled", this._hasPendingChanges());
		        }.bind(this), 0);
		    },
		    _onCreateTargetDisplayParams: function (i) {
		        var R = i.getParameter("data");
		        this._sFromTarget = R.fromTarget;
		        this._onCreateHandleParameters(R);
		        this._onCreateRouteMatchedInternal(R.absenceType);
		    },
		    _onCreateTargetDisplay: function (i) {
		        this.oCreateModel.setProperty("/bUseDateDefaults", true);
		        this._sFromTarget = i.getParameter("data").fromTarget;
		        this._onCreateRouteMatchedInternal();
		    },
		    _onCreateRouteMatchedParams: function (i) {
		        var R = i.getParameter("arguments");
		        this._onCreateHandleParameters(R);
		        this._onCreateRouteMatchedInternal(R.absenceType);
		    },
		    _onCreateHandleParameters: function (R) {
		        var i = R.dateFrom ? new Date(parseInt(R.dateFrom, 10)) : null, p = R.dateTo ? new Date(parseInt(R.dateTo, 10)) : null;
		        this.oCreateModel.setProperty("/bUseDateDefaults", !R.dateFrom && !R.dateTo);
		        if (i) {
		            this.oCreateModel.setProperty("/oLeaveStartDate", q.convertToLocal(i));
		        }
		        if (p) {
		            this.oCreateModel.setProperty("/oLeaveEndDate", q.convertToLocal(p));
		        }
		    },
		    _onCreateRouteMatched: function (i) {
		        this.oCreateModel.setProperty("/bUseDateDefaults", true);
		        this._onCreateRouteMatchedInternal();
		    },
		    _onCreateRouteMatchedInternal: function (R) {
		        var A = this.getOwnerComponent().getAssignmentPromise();
		        this.oErrorHandler.setShowErrors("immediately");
		        this.oErrorHandler.clearErrors();
		        this.oCreateModel.setProperty("/sEditMode", "CREATE");
		        this._notesBuffer = "";
		        this._destroyAdditionalFields();
		        this._cleanupUnsubmittedViewChanges();
		        this.oCreateModel.setProperty("/viewTitle", this.getResourceBundle().getText("createViewTitle"));
		        Promise.all([
		            this.oODataModel.metadataLoaded(),
		            A,
		            this.oODataModel.getMetaModel().loaded()
		        ]).then(function (p) {
		            this._absenceTypeReceivedDeferred = u.createDeferred();
		            this.sCEEmployeeId = p[1];
		            this._oSelectionItemTemplate = this.getView().byId("selectionTypeItem");
		            this.oCreateModel.setProperty("/busy", true);
		            this.getView().byId("absenceType").bindItems({
		                path: "/AbsenceTypeSet",
		                template: this._oSelectionItemTemplate,
		                filters: [new F("EmployeeID", b.EQ, this.sCEEmployeeId)],
		                parameters: { expand: "toAdditionalFieldsDefinition,toApprover" },
		                events: { dataReceived: this.onAbsenceTypeReceived.bind(this) }
		            });
		            this._oDataUtil = D.getInstance(this.sCEEmployeeId, this.getModel());
		            this._initOverlapCalendar();
		            this._absenceTypeReceivedDeferred.promise.then(function (i) {
		                var V = this.createLeaveRequestCollection(), G = V.getPath(), K = i.filter(function ($) {
		                        if (R && R !== "default") {
		                            return $.AbsenceTypeCode === R;
		                        } else {
		                            return $.DefaultType;
		                        }
		                    }), N = K.length !== 0 ? K[0] : i[0];
		                this.getView().setBindingContext(V);
		                this.updateOdataModel(N, R);
		                var Q = jQuery.extend(true, {}, N), W = this.getSelectedAbsenceTypeControl().getBindingContext(), X = W.getProperty("toAdditionalFieldsDefinition") || [], Y = this._getAdditionalFieldValues(X, {}), Z = {
		                        definition: X,
		                        values: Y
		                    };
		                this._handleApprovers(G, N.toApprover.results);
		                this._updateLocalModel(Z, Q);
		                this._handleAttachments(Q);
		                this._fillAdditionalFields(this.oCreateModel, Q.AbsenceTypeCode, this._getAdditionalFieldsContainer());
		                this._fillAdditionalFieldTexts(X, Y);
		                this._updateCalcLeaveDays();
		                this.oCreateModel.setProperty("/busy", false);
		                this._rememberChangeRelevantLocalModelProperties();
		                this._revalidateSaveButtonStatus();
		            }.bind(this));
		        }.bind(this));
		    },
		    _onDeletePostedLeaveTargetDisplay: function (i) {
		        this.oCreateModel.setProperty("/sEditMode", "DELETE");
		        this._sFromTarget = i.getParameter("data").fromTarget;
		        this._onEditRouteMatchedInternal(i.getParameter("data"));
		    },
		    _onEditTargetDisplay: function (i) {
		        this.oCreateModel.setProperty("/sEditMode", "EDIT");
		        this._sFromTarget = i.getParameter("data").fromTarget;
		        this._onEditRouteMatchedInternal(i.getParameter("data"));
		    },
		    _onDeletePostedLeaveRouteMatched: function (i) {
		        this.oCreateModel.setProperty("/sEditMode", "DELETE");
		        this._onEditRouteMatchedInternal(i.getParameter("arguments"));
		    },
		    _onEditRouteMatched: function (i) {
		        this.oCreateModel.setProperty("/sEditMode", "EDIT");
		        this._onEditRouteMatchedInternal(i.getParameter("arguments"));
		    },
		    _onEditRouteMatchedInternal: function (R) {
		        var i = "/" + R.leavePath, A = this.getOwnerComponent().getAssignmentPromise(), V = this.getView();
		        this.oErrorHandler.setShowErrors("immediately");
		        this.oErrorHandler.clearErrors();
		        this._destroyAdditionalFields();
		        this.oCreateModel.setProperty("/bUseDateDefaults", false);
		        this.oCreateModel.setProperty("/viewTitle", this.getResourceBundle().getText(this.oCreateModel.getProperty("/sEditMode") === "DELETE" ? "deleteLeaveRequest" : "editViewTitle"));
		        this._cleanupUnsubmittedViewChanges();
		        this.oCreateModel.setProperty("/busy", true);
		        Promise.all([
		            this.oODataModel.metadataLoaded(),
		            A,
		            this.oODataModel.getMetaModel().loaded()
		        ]).then(function (p) {
		            if (this.sCEEmployeeId !== p[1]) {
		                this._absenceTypeReceivedDeferred = u.createDeferred();
		                this.sCEEmployeeId = p[1];
		                this._oSelectionItemTemplate = V.byId("selectionTypeItem");
		                V.byId("absenceType").bindItems({
		                    path: "/AbsenceTypeSet",
		                    template: this._oSelectionItemTemplate,
		                    filters: [new F("EmployeeID", b.EQ, this.sCEEmployeeId)],
		                    parameters: { expand: "toAdditionalFieldsDefinition,toApprover" },
		                    events: { dataReceived: this.onAbsenceTypeReceived.bind(this) }
		                });
		            }
		            this._oDataUtil = D.getInstance(this.sCEEmployeeId, this.getModel());
		            this._initOverlapCalendar();
		            this._absenceTypeReceivedDeferred.promise.then(function (G) {
		                var K = V.getModel().getProperty(i), N = function (Q) {
		                        var W = this.getSelectedAbsenceTypeControl();
		                        this._notesBuffer = Q.Notes;
		                        var X = this.formatter.formatNotes(this._notesBuffer);
		                        this._oNotesModel.setProperty("/NoteCollection", X);
		                        var Y = W.getBindingContext(), Z = Y.getObject(), $ = Y.getProperty("toAdditionalFieldsDefinition"), _ = this._getAdditionalFieldValues($, Q.AdditionalFields), a1 = {
		                                definition: $,
		                                values: _
		                            };
		                        var b1 = Array.apply(null, { length: w }).map(function (c1, d1) {
		                            return Q["ApproverLvl" + (d1 + 1)];
		                        }).filter(function (c1) {
		                            return c1 && c1.Pernr !== "00000000";
		                        });
		                        this.oCreateModel.setProperty("/iCurrentApproverLevel", b1.length);
		                        this.oCreateModel.setProperty("/aProposedApprovers", b1);
		                        this._updateLocalModel(a1, Y.getObject(), Q.StartDate, Q.EndDate);
		                        this._handleAttachments(Y.getObject(), Q);
		                        this._fillAdditionalFields(this.oCreateModel, Z.AbsenceTypeCode, this._getAdditionalFieldsContainer());
		                        this._fillAdditionalFieldTexts($, _);
		                        this._updateCalcLeaveDays();
		                        this.oErrorHandler.setShowErrors("immediately");
		                        this._rememberChangeRelevantLocalModelProperties();
		                        this.oCreateModel.setProperty("/busy", false);
		                        this._revalidateSaveButtonStatus();
		                    }.bind(this);
		                if (!K || K.hasOwnProperty("ReqOrInfty")) {
		                    this.oErrorHandler.setShowErrors("manual");
		                    V.bindElement({
		                        path: i,
		                        events: {
		                            change: function (Q) {
		                                if (!V.getElementBinding().getBoundContext()) {
		                                    setTimeout(function () {
		                                        this.oErrorHandler.displayErrorPopup(function () {
		                                            this.getRouter().getTargets().display("overview");
		                                            this.oCreateModel.setProperty("/busy", false);
		                                            this.oErrorHandler.setShowErrors("immediately");
		                                        }.bind(this));
		                                    }.bind(this), 0);
		                                    return;
		                                }
		                                var W = V.getBindingContext().getObject();
		                                if (W) {
		                                    N(W);
		                                }
		                            }.bind(this)
		                        }
		                    });
		                } else {
		                    V.setBindingContext(new sap.ui.model.Context(V.getModel(), i));
		                    N(K);
		                }
		            }.bind(this));
		        }.bind(this));
		    },
		    _destroyAdditionalFields: function () {
		        Object.keys(this._oAdditionalFieldsControls).forEach(function (i) {
		            var p = this._oAdditionalFieldsControls[i];
		            p.forEach(function (A, G) {
		                A.destroy();
		                if (G > 0) {
		                    delete this._oAdditionalFieldsControls[i];
		                }
		            }.bind(this));
		        }.bind(this));
		    },
		    _getAdditionalFieldsContainer: function () {
		        return this.getView().byId("additionalFieldsSimpleForm");
		    },
		    _getAdditionalFieldFragmentName: function (A, i) {
		        var p = "";
		        switch (A.Type_Kind) {
		        case "C":
		            p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldInput";
		            var G = this.oODataModel.getProperty(i + "/AdditionalFields/" + A.Fieldname);
		            if (typeof G === "boolean" || this._isFieldShownAsCheckbox(A)) {
		                p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldCheckbox";
		            } else if (A.HasF4) {
		                p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldSearchHelperInput";
		            }
		            break;
		        case "P":
		            p = null;
		            break;
		        case "N":
		            p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldInputInteger";
		            break;
		        case "D":
		            p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldDatePicker";
		            break;
		        case "T":
		            p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldTimePicker";
		            break;
		        default:
		            p = "hcm.fab.myleaverequest.view.fragments.AdditionalFieldInput";
		        }
		        return p;
		    },
		    _callCalcLeaveDaysFunctionImport: function (p) {
		        return new Promise(function (R, i) {
		            this.oCreateModel.setProperty("/isCalculatingLeaveDays", true);
		            this.oODataModel.callFunction("/CalculateLeaveSpan", {
		                method: "GET",
		                groupId: "leaveDuration",
		                urlParameters: p,
		                success: function (A) {
		                    R(A);
		                },
		                error: function (A) {
		                    i(A);
		                }
		            });
		        }.bind(this));
		    },
		    _callAvailableQuotaFunctionImport: function (p) {
		        return new Promise(function (R, i) {
		            this.oCreateModel.setProperty("/isCalculatingQuota", true);
		            this.oODataModel.callFunction("/CalculateQuotaAvailable", {
		                method: "GET",
		                groupId: "quotaAvailability",
		                urlParameters: p,
		                success: function (A) {
		                    R(A);
		                },
		                error: function (A) {
		                    i(A);
		                }
		            });
		        }.bind(this));
		    },
		    _callGetMultiApproversFunctionImport: function (p) {
		        return new Promise(function (R, i) {
		            this.oCreateModel.setProperty("/isLoadingApprovers", true);
		            this.oODataModel.callFunction("/GetMultiLevelApprovers", {
		                method: "GET",
		                groupId: "getMultiApprovers",
		                urlParameters: p,
		                success: function (A) {
		                    R(A);
		                },
		                error: function (A) {
		                    i(A);
		                }
		            });
		        }.bind(this));
		    },
		    _cleanupUnsubmittedViewChanges: function () {
		        var i = this.getView().getBindingContext();
		        if (i) {
		            if (this.oCreateModel.getProperty("/sEditMode") !== "CREATE") {
		                if (this.oODataModel.hasPendingChanges()) {
		                    this.oODataModel.resetChanges([i.getPath()]);
		                }
		            } else if (i) {
		                this.oODataModel.deleteCreatedEntry(i);
		            }
		        }
		        this.getView().unbindElement();
		    },
		    _updateCalcLeaveDays: function () {
		        var i = this.getView().getBindingContext().getPath(), R = q.convertToUTC(this.oCreateModel.getProperty("/oLeaveStartDate")), p = u.dateToUTC(this.oCreateModel.getProperty("/oLeaveEndDate")), A = this.oODataModel.getProperty(i + "/AbsenceTypeCode");
		        if (!R || !f.isGroupEnabled(R, A)) {
		            return;
		        }
		        var G = null, K = null, N = n.getDateTimeInstance({
		                pattern: "yyyyMMdd",
		                UTC: true
		            });
		        if (this._bCheckLeaveSpanFIDateIsEdmTime) {
		            G = R;
		            K = p;
		        } else {
		            G = N.format(R);
		            K = N.format(p);
		        }
		        this.oCreateModel.setProperty("/usedWorkingTime", this.getResourceBundle().getText("durationCalculation"));
		        var Q = null, V = null;
		        if (this.oCreateModel.getProperty("/multiOrSingleDayRadioGroupIndex") === 0) {
		            Q = "";
		            V = "";
		        } else {
		            Q = this.oODataModel.getProperty(i + "/StartTime");
		            if (!Q) {
		                Q = "";
		            }
		            V = this.oODataModel.getProperty(i + "/EndTime");
		            if (!V) {
		                V = "";
		            }
		            K = G;
		        }
		        var W = "0.00", X = parseInt(Q, 10) || 0, Y = parseInt(V, 10) || 0, Z = this.oCreateModel.getProperty("/sEditMode"), $ = this.oCreateModel.getProperty("/inputHoursFilled");
		        if (this.oCreateModel.getProperty("/multiOrSingleDayRadioGroupIndex") === 1 && ($ || X === 0 && Y === 0 && Z === "EDIT")) {
		            W = this.oODataModel.getProperty(i + "/PlannedWorkingHours");
		            if (!W || W <= 0 || W > 24) {
		                W = "0.00";
		            }
		        }
		        var _ = this.oODataModel.getProperty(i + "/StatusID");
		        if (!_) {
		            _ = "";
		        }
		        this._callCalcLeaveDaysFunctionImport({
		            AbsenceTypeCode: A,
		            EmployeeID: this.oODataModel.getProperty(i + "/EmployeeID"),
		            InfoType: this.getSelectedAbsenceTypeControl().getBindingContext().getObject().InfoType,
		            StartDate: G,
		            EndDate: K,
		            BeginTime: Q,
		            EndTime: V,
		            RequestID: Z !== "CREATE" ? this.oODataModel.getProperty(i + "/RequestID") : "",
		            InputHours: W,
		            StatusID: _,
		            LeaveKey: Z !== "CREATE" ? this.oODataModel.getProperty(i + "/LeaveKey") : ""
		        }).then(function (a1) {
		            if (!a1) {
		                this.oCreateModel.setProperty("/usedWorkingTime", null);
		                this.oCreateModel.setProperty("/isCalculatingLeaveDays", false);
		                this._closeBusyDialog();
		                return;
		            }
		            if (this.oCreateModel.getProperty("/isSaveRequestPending")) {
		                return;
		            }
		            this._updateAdditionalFieldsFromFunctionImport(this.oCreateModel, a1.CalculateLeaveSpan);
		            if (a1.CalculateLeaveSpan.hasOwnProperty("TimeUnit")) {
		                switch (a1.CalculateLeaveSpan.TimeUnit) {
		                case "001":
		                    this.oCreateModel.setProperty("/usedWorkingTime", parseFloat(a1.CalculateLeaveSpan.PayrollHours));
		                    break;
		                case "010":
		                    this.oCreateModel.setProperty("/usedWorkingTime", parseFloat(a1.CalculateLeaveSpan.QuotaUsed));
		                    break;
		                default:
		                    this.oCreateModel.setProperty("/usedWorkingTime", parseFloat(a1.CalculateLeaveSpan.QuotaUsed));
		                    break;
		                }
		            } else {
		                this.oCreateModel.setProperty("/usedWorkingTime", parseFloat(a1.CalculateLeaveSpan.QuotaUsed));
		            }
		            this.oCreateModel.setProperty("/usedWorkingTimeUnit", a1.CalculateLeaveSpan.TimeUnitText);
		            if (this.oCreateModel.getProperty("/isEndDateCalculated") && a1.CalculateLeaveSpan.EndDate.getTime() !== p.getTime()) {
		                this.oCreateModel.setProperty("/oLeaveEndDate", q.convertToLocal(a1.CalculateLeaveSpan.EndDate));
		                this._updateAvailableQuota(this.getSelectedAbsenceTypeControl().getBindingContext().getObject());
		            }
		            if (this.oCreateModel.getProperty("/multiOrSingleDayRadioGroupIndex") === 1) {
		                var b1 = 0;
		                if (this.oCreateModel.getProperty("/showInputHours")) {
		                    if (this.getModel("global").getProperty("/bShowIndustryHours")) {
		                        b1 = this._getDecimalHoursFromInputControl();
		                    } else {
		                        b1 = this._getDecimalHoursFromTimepicker();
		                    }
		                }
		                if ($ && b1 !== 0) {
		                    if (this.byId("startTimePick").getVisible()) {
		                        if (a1.CalculateLeaveSpan.BeginTime) {
		                            this.oODataModel.setProperty(i + "/StartTime", a1.CalculateLeaveSpan.BeginTime);
		                        } else {
		                            this.oODataModel.setProperty(i + "/StartTime", "");
		                        }
		                    }
		                    if (this.byId("endTimePick").getVisible()) {
		                        if (a1.CalculateLeaveSpan.EndTime) {
		                            this.oODataModel.setProperty(i + "/EndTime", a1.CalculateLeaveSpan.EndTime);
		                        } else {
		                            this.oODataModel.setProperty(i + "/EndTime", "");
		                        }
		                    }
		                }
		                if (this.oCreateModel.getProperty("/showInputHours") && a1.CalculateLeaveSpan.AttabsHours && a1.CalculateLeaveSpan.AttabsHours !== "0.00" && this.oODataModel.getProperty(i + "/PlannedWorkingHours") !== a1.CalculateLeaveSpan.AttabsHours) {
		                    this.oODataModel.setProperty(i + "/PlannedWorkingHours", a1.CalculateLeaveSpan.AttabsHours);
		                }
		            }
		            this.oCreateModel.setProperty("/isCalculatingLeaveDays", false);
		            this._closeBusyDialog();
		        }.bind(this), function (a1) {
		            this.oCreateModel.setProperty("/usedWorkingTime", null);
		            this.oCreateModel.setProperty("/usedWorkingTimeUnit", null);
		            this.oCreateModel.setProperty("/isCalculatingLeaveDays", false);
		            this._closeBusyDialog();
		        }.bind(this));
		    },
		    _updateAdditionalFieldsFromFunctionImport: function (i, p) {
		        var A = i.getProperty("/AdditionalFields"), G = false;
		        A.forEach(function (K) {
		            switch (K.Fieldname) {
		            case "AttAbsDays":
		                K.fieldValue = p.AttAbsDays ? p.AttAbsDays : K.fieldValue;
		                G = true;
		                break;
		            case "CaleDays":
		                K.fieldValue = p.CalendarDays ? p.CalendarDays : K.fieldValue;
		                G = true;
		                break;
		            case "PayrDays":
		                K.fieldValue = p.QuotaUsed ? p.QuotaUsed : K.fieldValue;
		                G = true;
		                break;
		            case "PayrHrs":
		                K.fieldValue = p.PayrollHours ? p.PayrollHours : K.fieldValue;
		                G = true;
		                break;
		            default:
		                break;
		            }
		        });
		        if (G) {
		            this._updateChangeRelevantLocalModelProperty("AdditionalFields", A);
		            i.setProperty("/AdditionalFields", A);
		        }
		    },
		    _updateAvailableQuota: function (A) {
		        var p = {
		                AbsenceTypeCode: A.AbsenceTypeCode,
		                EmployeeID: A.EmployeeID,
		                InfoType: A.InfoType
		            }, i = q.convertToUTC(this.oCreateModel.getProperty("/oLeaveStartDate")), G = u.dateToUTC(this.oCreateModel.getProperty("/oLeaveEndDate"));
		        this.oCreateModel.setProperty("/BalanceAvailableQuantityText", this.getResourceBundle().getText("availabilityCalculation"));
		        this._showBusyDialog();
		        if (this._bQuotaAvailabilityFIHasDateParams && i && G) {
		            p.StartDate = i;
		            p.EndDate = G;
		            if (this.oCreateModel.getProperty("/multiOrSingleDayRadioGroupIndex") === 1) {
		                p.EndDate = i;
		            }
		        }
		        this._callAvailableQuotaFunctionImport(p).then(function (K) {
		            if (!K) {
		                this.oCreateModel.setProperty("/BalanceAvailableQuantityText", null);
		            } else {
		                this.oCreateModel.setProperty("/BalanceAvailableQuantityText", parseFloat(K.CalculateQuotaAvailable.BalanceRestPostedRequested));
		                this.oCreateModel.setProperty("/TimeUnitName", K.CalculateQuotaAvailable.TimeUnitText);
		            }
		            this.oCreateModel.setProperty("/isCalculatingQuota", false);
		            this._closeBusyDialog();
		        }.bind(this), function (K) {
		            this.oCreateModel.setProperty("/BalanceAvailableQuantityText", null);
		            this.oCreateModel.setProperty("/isCalculatingQuota", false);
		            this._closeBusyDialog();
		        }.bind(this));
		    },
		    _updateApprovers: function (A) {
		        var i = q.convertToUTC(this.oCreateModel.getProperty("/oLeaveStartDate"));
		        if (this.getModel("global").getProperty("/bReloadApproversUponDateChange") && A.IsMultiLevelApproval && f.isGroupEnabled(i, A.AbsenceTypeCode)) {
		            var p = {
		                AbsenceTypeCode: A.AbsenceTypeCode,
		                EmployeeID: A.EmployeeID,
		                Infotype: A.InfoType,
		                StartDate: i,
		                EndDate: u.dateToUTC(this.oCreateModel.getProperty("/oLeaveEndDate"))
		            };
		            this._callGetMultiApproversFunctionImport(p).then(function (G) {
		                this._handleApprovers(this.getView().getBindingContext().getPath(), G.results);
		                if (G.results.length > 0) {
		                    this.oCreateModel.setProperty("/iMaxApproverLevel", G.results.length);
		                    this.oCreateModel.setProperty("/isAddDeleteApproverAllowed", G.results[0].IsAddDele);
		                }
		                this.oCreateModel.setProperty("/isLoadingApprovers", false);
		            }.bind(this), function (G) {
		                this.oCreateModel.setProperty("/isLoadingApprovers", false);
		            }.bind(this));
		        }
		    },
		    _getAttachmentsUploadUrl: function (p) {
		        return [
		            this.oODataModel.sServiceUrl,
		            p,
		            "/toAttachments"
		        ].join("");
		    },
		    _updateUploadUrlsUploadCollection: function (i, p) {
		        var A = "", G = {};
		        i.forEach(function (K) {
		            A = K.getFileUploader();
		            if (A) {
		                G = sap.ui.getCore().byId(A);
		                G.setUploadUrl(p);
		            }
		        }.bind(this));
		        if (this.oUploadCollection.hasOwnProperty("_oFileUploader")) {
		            this.oUploadCollection._oFileUploader.setUploadUrl(p);
		        }
		    },
		    _getAttachmentsFromModel: function (i) {
		        return Array.apply(null, { length: x }).map(function (p, A) {
		            return i["Attachment" + (A + 1)];
		        }).filter(function (A) {
		            return A.FileName !== "";
		        });
		    },
		    _getAttachmentItemList: function () {
		        var i = [];
		        if (this.oUploadCollection) {
		            i = this.oUploadCollection.getItems().map(function (A) {
		                return {
		                    id: A.getId(),
		                    fileName: A.getFileName(),
		                    mimeType: A.getMimeType(),
		                    uploadedDate: A.getUploadedDate(),
		                    url: A.getUrl()
		                };
		            });
		        } else if (this.oUploadSet) {
		            i = this.oUploadSet.getItems().concat(this.oUploadSet.getIncompleteItems());
		            i = i.map(function (A) {
		                return {
		                    id: A.getId(),
		                    fileName: A.getFileName(),
		                    url: A.getUrl()
		                };
		            });
		        }
		        return i;
		    },
		    _handleAttachments: function (A, i) {
		        if (A.AttachmentEnabled) {
		            var p = [];
		            if (i) {
		                p = this._getAttachmentsFromModel(i);
		            }
		            this.oCreateModel.setProperty("/attachments", p);
		            this.oCreateModel.setProperty("/isAttachmentUploadEnabled", p.length < x);
		            if (sap.ui.getCore().getLoadedLibraries()["sap.m"].controls.indexOf("sap.m.upload.UploadSet") !== -1) {
		                this._handleAttachmentsUploadSet(A);
		            } else {
		                this._handleAttachmentsUploadCollection(A);
		            }
		        } else {
		            this._doAttachmentCleanup();
		        }
		    },
		    _handleAttachmentsUploadSet: function (A) {
		        if (this.oUploadSet) {
		            this.oUploadSet.setMaxFileSize(this._getMaxFileSizeFromAbsenceTypeInMB(A));
		            this.oUploadSet.setFileTypes(this._getSupportedFileTypeFromAbsenceType(A));
		        } else {
		            this._oAttachmentsContainer.addItem(this._createNewUploadSetInstance(A));
		        }
		    },
		    _handleAttachmentsUploadCollection: function (A) {
		        if (this.oUploadCollection) {
		            if (this._isNewUploadCollectionInstanceNeeded(this.oUploadCollection, A)) {
		                if (this._informEnduserAboutLostAttachments()) {
		                    h.warning(this.getResourceBundle().getText("attachmentsLost"), {
		                        onClose: function () {
		                            this._doAttachmentCleanup();
		                            this._oAttachmentsContainer.addItem(this._createNewUploadCollectionInstance(A));
		                        }.bind(this)
		                    });
		                }
		            }
		        } else {
		            this._oAttachmentsContainer.addItem(this._createNewUploadCollectionInstance(A));
		        }
		    },
		    _createNewUploadSetInstance: function (A) {
		        var i = new sap.m.upload.UploadSet("AttachmentCollection", {
		            visible: true,
		            fileTypes: this._getSupportedFileTypeFromAbsenceType(A),
		            maxFileSize: this._getMaxFileSizeFromAbsenceTypeInMB(A),
		            instantUpload: false,
		            showIcons: true,
		            terminationEnabled: false,
		            uploadEnabled: {
		                formatter: f.isAttachmentUploadEnabled,
		                parts: [
		                    "create>/oLeaveStartDate",
		                    "AbsenceTypeCode",
		                    "create>/isAttachmentUploadEnabled"
		                ]
		            },
		            items: {
		                path: "create>/attachments",
		                templateShareable: false,
		                template: new sap.m.upload.UploadSetItem({
		                    enabledEdit: true,
		                    enabledRemove: true,
		                    fileName: "{create>FileName}",
		                    url: {
		                        parts: [
		                            "EmployeeID",
		                            "RequestID",
		                            "create>ArchivDocId",
		                            "create>FileName"
		                        ],
		                        formatter: f.formatAttachmentUrl
		                    },
		                    visibleEdit: false,
		                    visibleRemove: true,
		                    attributes: [
		                        new k({
		                            title: "{i18n>attachmentUploadOnTxt}",
		                            text: {
		                                parts: [
		                                    "create>CreaDate",
		                                    "create>CreaTime"
		                                ],
		                                formatter: f.formatAttachmentTimeStamp
		                            }
		                        }),
		                        new k({
		                            title: "{i18n>attachmentFileSizeTxt}",
		                            text: {
		                                path: "create>FileSize",
		                                formatter: f.formatFileSize
		                            }
		                        })
		                    ]
		                })
		            },
		            toolbar: new O("attachmentToolbar", {
		                design: sap.m.ToolbarDesign.Transparent,
		                content: [
		                    new T({
		                        text: "{create>/sAttachmentsTitle}",
		                        level: "H2"
		                    }),
		                    new j()
		                ]
		            }),
		            beforeItemAdded: this.onBeforeAttachmentItemAdded.bind(this),
		            afterItemAdded: this.onAfterAttachmentItemAdded.bind(this),
		            fileSizeExceeded: this.onFileSizeExceeded.bind(this),
		            fileTypeMismatch: this.onFileTypeMissmatch.bind(this),
		            beforeUploadStarts: this.onBeforeUploadStartsSet.bind(this)
		        });
		        i.addEventDelegate({
		            onAfterRendering: function (p) {
		                this._revalidateUploadButtonStatus();
		                this._revalidateSaveButtonStatus();
		            }.bind(this)
		        });
		        this.oUploadSet = i;
		        return i;
		    },
		    _getSupportedFileTypeFromAbsenceType: function (A) {
		        return A.AttachRestrictFileType ? A.AttachSupportFileType.toLowerCase().split(",") : [];
		    },
		    _getMaxFileSizeFromAbsenceTypeInMB: function (A) {
		        return A.AttachMaxSize / 1024;
		    },
		    _getFileTypeFromFileName: function (i) {
		        if (i.lastIndexOf(".") !== -1) {
		            return i.substring(i.lastIndexOf(".") + 1, i.length);
		        }
		        return undefined;
		    },
		    _createNewUploadCollectionInstance: function (A) {
		        var i = new U("AttachmentCollection", {
		            visible: true,
		            fileType: this._getSupportedFileTypeFromAbsenceType(A),
		            maximumFileSize: this._getMaxFileSizeFromAbsenceTypeInMB(A),
		            multiple: false,
		            sameFilenameAllowed: false,
		            showSeparators: sap.m.ListSeparators.All,
		            uploadEnabled: true,
		            instantUpload: false,
		            mode: sap.m.ListMode.None,
		            uploadButtonInvisible: {
		                formatter: f.isAttachmentUploadDisabled,
		                parts: [
		                    "create>/oLeaveStartDate",
		                    "AbsenceTypeCode",
		                    "create>/isAttachmentUploadEnabled"
		                ]
		            },
		            terminationEnabled: false,
		            items: {
		                path: "create>/attachments",
		                templateShareable: false,
		                template: new l({
		                    fileName: "{create>FileName}",
		                    url: {
		                        parts: [
		                            "EmployeeID",
		                            "RequestID",
		                            "create>ArchivDocId",
		                            "create>FileName"
		                        ],
		                        formatter: f.formatAttachmentUrl
		                    },
		                    visibleDelete: true,
		                    visibleEdit: false,
		                    attributes: [
		                        new k({
		                            title: "{i18n>attachmentUploadOnTxt}",
		                            text: {
		                                parts: [
		                                    "create>CreaDate",
		                                    "create>CreaTime"
		                                ],
		                                formatter: f.formatAttachmentTimeStamp
		                            }
		                        }),
		                        new k({
		                            title: "{i18n>attachmentFileSizeTxt}",
		                            text: {
		                                path: "create>FileSize",
		                                formatter: f.formatFileSize
		                            }
		                        })
		                    ]
		                })
		            },
		            infoToolbar: new O("attachmentToolbar", {
		                visible: "{= !( ${create>/uploadPercentage} === 0 || ${create>/uploadPercentage} >= 100 ) }",
		                design: sap.m.ToolbarDesign.Transparent,
		                content: [
		                    new L({ text: "{i18n>txtUploading}" }),
		                    new j(),
		                    new P({
		                        percentValue: "{create>/uploadPercentage}",
		                        showValue: false,
		                        state: "None"
		                    }).addStyleClass("sapUiSmallMarginBottom")
		                ]
		            }),
		            change: this.onAttachmentChange.bind(this),
		            fileSizeExceed: this.onFileSizeExceeded.bind(this),
		            typeMissmatch: this.onFileTypeMissmatch.bind(this),
		            beforeUploadStarts: this.onBeforeUploadStarts.bind(this)
		        });
		        i.addEventDelegate({
		            onAfterRendering: function () {
		                this._revalidateUploadButtonStatus();
		                this._revalidateSaveButtonStatus();
		            }.bind(this)
		        });
		        this.oUploadCollection = i;
		        return i;
		    },
		    _isNewUploadCollectionInstanceNeeded: function (i, A) {
		        var p = this._getSupportedFileTypeFromAbsenceType(A), G = this._getMaxFileSizeFromAbsenceTypeInMB(A);
		        return !(i && (i.getFileType()[0] !== p[0] || i.getMaximumFileSize() !== G));
		    },
		    _informEnduserAboutLostAttachments: function () {
		        var i = this.oUploadCollection.getItems(), p = [];
		        if (i && i.length > 0) {
		            p = i.filter(function (A) {
		                return A._status !== "display";
		            });
		            return p.length > 0;
		        }
		        return false;
		    },
		    _revalidateUploadButtonStatus: function () {
		        var i = [];
		        if (this.oCreateModel.getProperty("/sEditMode") !== "CREATE") {
		            i = this._getAttachmentsFromModel(this.getView().getBindingContext().getObject());
		        }
		        if (this.oUploadCollection) {
		            var p = this.oUploadCollection.getItems().filter(function (K) {
		                return !i.some(function (N) {
		                    return N.FileName === K.getProperty("fileName");
		                });
		            });
		            i = i.concat(p);
		        } else if (this.oUploadSet) {
		            var A = this.oUploadSet.getIncompleteItems(), G = this.oUploadSet.getItems().concat(A);
		            this.oCreateModel.setProperty("/sAttachmentsTitle", this.getResourceBundle().getText("attachmentToolbarTitle", [G.length]));
		            i = i.concat(A);
		        }
		        this.oCreateModel.setProperty("/isAttachmentUploadEnabled", i.length < x);
		    },
		    _handleApprovers: function (p, A) {
		        var G = "", K = [];
		        for (var i = 0; i < w; i++) {
		            G = p + "/ApproverLvl" + (i + 1);
		            if (i < A.length) {
		                K.push(A[i]);
		                this.oODataModel.setProperty(G + "/Name", A[i].Name);
		                this.oODataModel.setProperty(G + "/Pernr", A[i].Pernr);
		                this.oODataModel.setProperty(G + "/Seqnr", A[i].Seqnr);
		                this.oODataModel.setProperty(G + "/DefaultFlag", A[i].DefaultFlag);
		            } else if (this.oODataModel.getProperty(G)) {
		                this.oODataModel.setProperty(G, {
		                    Name: "",
		                    Pernr: "00000000",
		                    Seqnr: "000",
		                    DefaultFlag: false
		                });
		            }
		        }
		        ;
		        this.oCreateModel.setProperty("/iCurrentApproverLevel", A.length !== 0 ? A.length : 1);
		        this.oCreateModel.setProperty("/aProposedApprovers", K);
		    },
		    _getAdditionalFieldDefaultValue: function (A) {
		        var i = "";
		        switch (A.Type_Kind) {
		        case "T":
		            i = null;
		            break;
		        case "D":
		            i = null;
		            break;
		        case "C":
		            i = this._isFieldShownAsCheckbox(A) ? false : "";
		            break;
		        default:
		            i = "";
		        }
		        return i;
		    },
		    _fillAdditionalFieldTexts: function (A, p) {
		        A.forEach(function (G) {
		            var K, N;
		            N = this.oODataModel.getObject("/" + G);
		            if (N.HasF4 && N.F4EntityName && p.hasOwnProperty(N.Fieldname) && (p[N.Fieldname] || N.F4EntityName === "SearchOTCompensationTypeSet")) {
		                K = p[N.Fieldname];
		                var Q = {}, R = this.oODataModel.getMetaModel().getODataEntitySet(N.F4EntityName), V = this.oODataModel.getMetaModel().getODataEntityType(R.entityType).key.propertyRef, W = this.getModel("global").getProperty("/sCountryGrouping");
		                if (N.F4EntityName === "SearchWageTypeSet" && W || N.F4EntityName !== "SearchWageTypeSet") {
		                    V.forEach(function (i) {
		                        Q[i.name] = "";
		                        if (i.name === N.F4KeyProperty) {
		                            Q[i.name] = K;
		                        }
		                        if (i.name === "CountryGrouping" && W) {
		                            Q[i.name] = W;
		                        }
		                    }.bind(this));
		                    var X = this.oODataModel.createKey("/" + N.F4EntityName, Q), Y = this.oCreateModel.getProperty("/AdditionalFields");
		                    this.oODataModel.read(X, {
		                        success: function (Z) {
		                            var $ = false;
		                            $ = Y.some(function (_, i) {
		                                if (_.Fieldname === N.Fieldname) {
		                                    this.oCreateModel.setProperty("/AdditionalFields/" + i + "/descriptionText", Z[N.F4DescriptionProperty]);
		                                    _.descriptionText = Z[N.F4DescriptionProperty];
		                                    return true;
		                                }
		                                return false;
		                            }.bind(this));
		                            if ($) {
		                                this._updateChangeRelevantLocalModelProperty("AdditionalFields", Y);
		                            }
		                        }.bind(this),
		                        error: function (i) {
		                        }
		                    });
		                }
		            }
		        }.bind(this));
		    },
		    _getAdditionalFieldValues: function (A, V) {
		        var i = {};
		        A.forEach(function (p) {
		            var G, K;
		            K = this.oODataModel.getObject("/" + p);
		            if (V.hasOwnProperty(K.Fieldname)) {
		                if (K.Fieldname.startsWith("CUSTOMER")) {
		                    switch (K.Type_Kind) {
		                    case "D":
		                        var N = n.getDateInstance({
		                            pattern: "yyyyMMdd",
		                            UTC: true
		                        });
		                        G = N.parse(V[K.Fieldname]);
		                        break;
		                    case "C":
		                        G = V[K.Fieldname];
		                        if (this._isCustomerAdditionalFieldCheckbox(K)) {
		                            G = G === "X";
		                        }
		                        break;
		                    default:
		                        G = V[K.Fieldname];
		                    }
		                } else {
		                    G = V[K.Fieldname];
		                }
		            } else {
		                G = this._getAdditionalFieldDefaultValue(K);
		            }
		            i[K.Fieldname] = G;
		        }.bind(this));
		        return i;
		    },
		    _getCurrentAdditionalFieldValues: function () {
		        var i = {};
		        this.oCreateModel.getProperty("/AdditionalFields").forEach(function (p) {
		            i[p.Fieldname] = p.fieldValue;
		        });
		        return i;
		    },
		    _fillAdditionalFields: function (i, A, p) {
		        p.removeAllContent();
		        var G = this.getView().getBindingContext().getPath();
		        i.getProperty("/AdditionalFields").forEach(function (K, N) {
		            var Q = this._getAdditionalFieldFragmentName(K, G);
		            if (!this._oAdditionalFieldsControls[K.Fieldname]) {
		                if (Q) {
		                    this._oAdditionalFieldsControls[K.Fieldname] = sap.ui.xmlfragment(this.getView().createId(K.Fieldname), Q, this);
		                } else {
		                    this._addAdditionalFieldDecimal(this.getView(), p, i, N, this.onNumberChange, K, this._oAdditionalFieldsControls);
		                }
		            }
		            this._oAdditionalFieldsControls[K.Fieldname].forEach(function (R) {
		                R.setBindingContext(i.createBindingContext("/AdditionalFields/" + N), "create");
		                if (K.Required) {
		                    R.setFieldGroupIds("LeaveRequiredField");
		                }
		                this.getView().addDependent(R);
		                p.addContent(R);
		            }.bind(this));
		        }.bind(this));
		    },
		    _addAdditionalFieldDecimal: function (V, i, p, A, N, G, K) {
		        var Q = V.getId() + G.Fieldname + "addFieldInputDecimal";
		        var R = new L(Q + "Label", {
		            required: "{create>Required}",
		            text: "{create>FieldLabel}"
		        });
		        R.setBindingContext(p.createBindingContext("/AdditionalFields/" + A), "create");
		        V.addDependent(R);
		        i.addContent(R);
		        var W = new I(Q, {
		            type: "Text",
		            change: N,
		            textAlign: "Right",
		            editable: this.oCreateModel.getProperty("/sEditMode") !== "DELETE",
		            enabled: "{ parts: [{ path: 'create>Readonly' }, { path: 'create>/oLeaveStartDate' }, { path: 'AbsenceTypeCode' }], formatter: 'hcm.fab.myleaverequest.utils.formatters.isAdditionalFieldEnabled' }"
		        });
		        W.setBindingContext(p.createBindingContext("/AdditionalFields/" + A), "create");
		        W.bindValue({
		            path: "create>fieldValue",
		            type: new d({
		                parseAsString: true,
		                decimals: parseInt(G.Decimals, 10),
		                maxIntegerDigits: parseInt(G.Length, 10) - parseInt(G.Decimals, 10),
		                minFractionDigits: 0,
		                maxFractionDigits: parseInt(G.Decimals, 10)
		            }, {
		                precision: parseInt(G.Length, 10),
		                scale: parseInt(G.Decimals, 10)
		            })
		        });
		        V.addDependent(W);
		        i.addContent(W);
		        if (!K[G.Fieldname]) {
		            K[G.Fieldname] = [];
		            K[G.Fieldname].push(R);
		            K[G.Fieldname].push(W);
		        }
		    },
		    _copyDateFieldsIntoModel: function (i, p) {
		        i.setProperty(p + "/StartDate", q.convertToUTC(this.oCreateModel.getProperty("/oLeaveStartDate")));
		        i.setProperty(p + "/EndDate", u.dateToUTC(this.oCreateModel.getProperty("/oLeaveEndDate")));
		    },
		    _copyAdditionalFieldsIntoModel: function (A, i, p) {
		        A.forEach(function (G) {
		            var K = G.fieldValue, N = null;
		            switch (G.Type_Kind) {
		            case "C":
		                if (!this._bCheckboxFieldsAreBoolean && typeof K === "boolean" || this._isCustomerAdditionalFieldCheckbox(G)) {
		                    K = K ? "X" : "";
		                }
		                break;
		            case "N":
		                K = K + "";
		                break;
		            case "P":
		                if (typeof K === "string" && K === "") {
		                    K = null;
		                }
		                break;
		            case "D":
		                if (G.Fieldname.startsWith("CUSTOMER")) {
		                    N = n.getDateInstance({ pattern: "yyyyMMdd" });
		                    if (K) {
		                        K = N.format(K);
		                    }
		                }
		                break;
		            default:
		            }
		            i.setProperty(p + "/AdditionalFields/" + G.Fieldname, K);
		        }.bind(this));
		    },
		    _requiredAdditionalFieldsAreFilled: function () {
		        var i = true, p = false, R = this.getView().getControlsByFieldGroupId("LeaveRequiredField");
		        R.forEach(function (A) {
		            p = this._checkRequiredField(A);
		            if (!p) {
		                i = false;
		            }
		        }.bind(this));
		        return i;
		    },
		    _checkRequiredField: function (i) {
		        if (i.getRequired && i.getRequired() && i.getValue) {
		            var p = sap.ui.getCore().getMessageManager();
		            if (i.getValue()) {
		                var A = i.getId() + "-message", G = p.getMessageModel().getData().filter(function (R) {
		                        return R.type === sap.ui.core.MessageType.Error;
		                    }), K = G.filter(function (R) {
		                        return R.getId() === A;
		                    });
		                if (K.length > 0) {
		                    if (G.length === 1) {
		                        this.oCreateModel.setProperty("/saveButtonEnabled", true);
		                    }
		                    p.removeMessages(K[0]);
		                }
		                return true;
		            } else {
		                var N = this.getResourceBundle().getText("additionalFieldRequired", i.getParent().getLabel().getText()), Q = i.getBinding("value");
		                this.oCreateModel.setProperty("/saveButtonEnabled", false);
		                p.addMessages(new sap.ui.core.message.Message({
		                    id: i.getId() + "-message",
		                    message: N,
		                    type: sap.ui.core.MessageType.Error,
		                    target: (Q.getContext() ? Q.getContext().getPath() + "/" : "") + Q.getPath(),
		                    processor: Q.getModel()
		                }));
		                return false;
		            }
		        }
		        return true;
		    },
		    _checkFormFieldsForError: function () {
		        var i = [
		                "additionalFieldsSimpleForm",
		                "generalDataForm",
		                "leaveTypeSelectionForm"
		            ], p = [];
		        return i.some(function (A) {
		            p = this.byId(A).getContent();
		            if (p && p.length > 0) {
		                return p.some(function (G) {
		                    return G.getValueState && G.getValueState() === sap.ui.core.ValueState.Error;
		                });
		            }
		            return false;
		        }.bind(this));
		    },
		    _getAdditionalFieldMetaInfo: function (i) {
		        var p = this.oODataModel.getServiceMetadata().dataServices.schema[0].namespace, A = this.oODataModel.getMetaModel().getODataComplexType(p + ".AdditionalFields").property, G = A.filter(function (K) {
		                return K.name === i;
		            });
		        return G.length > 0 ? G[0] : {};
		    },
		    _getLeaveSpanDateFieldMetaInfo: function (i) {
		        var p = this.oODataModel.getMetaModel().getODataFunctionImport("CalculateLeaveSpan").parameter, A = p.filter(function (G) {
		                return G.name === i;
		            });
		        return A.length > 0 ? A[0] : {};
		    },
		    _quotaAvailabilityFIHasDateParams: function () {
		        var i = this.oODataModel.getMetaModel().getODataFunctionImport("CalculateQuotaAvailable").parameter;
		        return i.filter(function (p) {
		            return p.name === "StartDate";
		        }).length > 0;
		    },
		    _isAdditionalFieldBoolean: function (i) {
		        return this._getAdditionalFieldMetaInfo(i).type === "Edm.Boolean";
		    },
		    _isCustomerAdditionalFieldCheckbox: function (A) {
		        if (A.Fieldname.startsWith("CUSTOMER")) {
		            return parseInt(A.Length, 10) === 1;
		        }
		        return false;
		    },
		    _isFieldShownAsCheckbox: function (A) {
		        return this._isAdditionalFieldBoolean(A.Fieldname) || this._isCustomerAdditionalFieldCheckbox(A);
		    },
		    _checkForSearchApproverPropertyExistence: function () {
		        var i = this.oODataModel.getServiceMetadata().dataServices.schema[0].namespace, p = this.oODataModel.getMetaModel().getODataEntityType(i + ".SearchApprover");
		        if (p) {
		            return p.property.some(function (A) {
		                return A.name === "EmployeeID";
		            });
		        }
		        return false;
		    },
		    _getApproverSearchFilters: function () {
		        return this._bApproverOnBehalfPropertyExists ? [new F("EmployeeID", b.EQ, this.getModel("global").getProperty("/sEmployeeNumber"))] : [];
		    },
		    _getAdditionalFields: function (A) {
		        var i = {}, p = {};
		        return A.definition.map(function (G) {
		            p = this.oODataModel.getObject("/" + G);
		            p.fieldValue = A.values[p.Fieldname];
		            p.descriptionText = "";
		            if (p.HasF4 && !p.hasOwnProperty("F4KeyProperty")) {
		                i = z[p.Fieldname];
		                if (i) {
		                    p.F4KeyProperty = i.keyField;
		                    p.F4TitleProperty = i.titleField;
		                    p.F4DescriptionProperty = i.descriptionField;
		                    p.F4SearchFilter = i.searchFields;
		                }
		            }
		            return p;
		        }.bind(this));
		    },
		    _getInitialRadioGroupIndex: function (A, i, p) {
		        if (A.IsEndDateCalculated) {
		            return 0;
		        }
		        if (!f.isMoreThanOneDayAllowed(A.IsAllowedDurationMultipleDay) || f.isOneDayOrLessAllowed(A.IsAllowedDurationPartialDay, A.IsAllowedDurationSingleDay) && i && p && i.getTime() === p.getTime()) {
		            return 1;
		        }
		        return 0;
		    },
		    _updateLocalModel: function (A, i, p, G) {
		        var K = null, N = null;
		        if (p || this.oCreateModel.getProperty("/bUseDateDefaults")) {
		            K = p ? p : i.DefaultStartDate;
		        } else {
		            K = q.convertToUTC(this.oCreateModel.getProperty("/oLeaveStartDate"));
		        }
		        if (G || this.oCreateModel.getProperty("/bUseDateDefaults")) {
		            N = G ? G : i.DefaultEndDate;
		        } else {
		            N = u.dateToUTC(this.oCreateModel.getProperty("/oLeaveEndDate"));
		        }
		        this.setModelProperties(this.oCreateModel, {
		            "multiOrSingleDayRadioGroupIndex": this._getInitialRadioGroupIndex(i, K, N),
		            "isAttachmentMandatory": i.AttachmentMandatory,
		            "isEndDateCalculated": i.IsEndDateCalculated ? i.IsEndDateCalculated : false,
		            "isQuotaCalculated": i.IsQuotaUsed,
		            "BalanceAvailableQuantityText": this.getResourceBundle().getText("availabilityCalculation"),
		            "AllowedDurationMultipleDayInd": i.IsAllowedDurationMultipleDay,
		            "AllowedDurationPartialDayInd": i.IsAllowedDurationPartialDay,
		            "AllowedDurationSingleDayInd": i.IsAllowedDurationSingleDay,
		            "AdditionalFields": this._getAdditionalFields(A),
		            "IsMultiLevelApproval": i.IsMultiLevelApproval,
		            "iMaxApproverLevel": i.ApproverLevel,
		            "isApproverEditable": !i.IsApproverReadOnly,
		            "isApproverVisible": i.IsApproverVisible,
		            "isAddDeleteApproverAllowed": i.AddDelApprovers,
		            "isNoteVisible": i.IsNoteVisible,
		            "showTimePicker": i.IsRecordInClockTimesAllowed && i.IsAllowedDurationPartialDay,
		            "showInputHours": i.IsRecordInClockHoursAllowed && i.IsAllowedDurationPartialDay,
		            "AbsenceDescription": i.AbsenceDescription ? i.AbsenceDescription : null,
		            "AbsenceTypeName": i.AbsenceTypeName,
		            "oLeaveStartDate": q.convertToLocal(K),
		            "oLeaveEndDate": q.convertToLocal(N)
		        });
		        if (i.IsQuotaUsed) {
		            this._updateAvailableQuota(i);
		        }
		    },
		    _updateLeaveRequestWithModifiedAttachments: function (i, p) {
		        var A = i.getProperty(p);
		        var G = Array.apply(null, { length: x }).map(function (Q, R) {
		            return A["Attachment" + (R + 1)];
		        }).filter(function (Q) {
		            return Q && Q.FileName !== "";
		        });
		        var K = [], N = false;
		        if (this.oUploadCollection) {
		            K = this.oUploadCollection.getItems();
		        } else if (this.oUploadSet) {
		            K = this.oUploadSet.getItems();
		        }
		        G.forEach(function (Q, R) {
		            N = K.some(function (V) {
		                return V.getProperty("fileName") === Q.FileName;
		            });
		            if (!N) {
		                this.oODataModel.setProperty(p + "/Attachment" + (R + 1) + "/AttachmentStatus", "D");
		            }
		        }.bind(this));
		        if (this.oUploadSet) {
		            K = this.oUploadSet.getIncompleteItems();
		        }
		        K.forEach(function (Q, R) {
		            var V;
		            if (Q.getFileObject) {
		                V = Q.getFileObject();
		            } else {
		                V = this._oNewFileData[Q.getFileName()];
		            }
		            if (V) {
		                var W = p + "/Attachment" + (G.length + 1), X = Math.ceil(V.size / 1024);
		                this.oODataModel.setProperty(W + "/FileName", Q.getFileName());
		                this.oODataModel.setProperty(W + "/FileType", V.type);
		                this.oODataModel.setProperty(W + "/FileSize", X.toString());
		            }
		        }.bind(this));
		    },
		    _showSuccessStatusMessage: function (p) {
		        var i = this.getView().getBindingContext();
		        this.oCreateModel.setProperty("/busy", false);
		        this.getOwnerComponent().getEventBus().publish("hcm.fab.myleaverequest", "invalidateoverview", {
		            fnAfterNavigate: function () {
		                if (p.showSuccess) {
		                    setTimeout(function () {
		                        g.show(this.getResourceBundle().getText("createdSuccessfully"));
		                    }.bind(this), 400);
		                }
		            }.bind(this)
		        });
		        this.initLocalModel();
		        this.getView().setBindingContext(null);
		        this._doAttachmentCleanup();
		        if (p.aUploadedFiles.length > 0 && this.oODataModel.invalidateEntry) {
		            this.oODataModel.invalidateEntry(i);
		        }
		        if (this._sFromTarget) {
		            delete this._sFromTarget;
		            this.getRouter().getTargets().display("overview");
		        } else {
		            this.getRouter().navTo("overview", {}, true);
		        }
		        return Promise.resolve(p);
		    },
		    _doAttachmentCleanup: function () {
		        this._oAttachmentsContainer.destroyItems();
		        this.oUploadCollection = null;
		        this.oUploadSet = null;
		        this._oNewFileData = {};
		    },
		    _uploadAttachments: function (p) {
		        return new Promise(function (R, i) {
		            if (this.oUploadCollection) {
		                this._uploadAttachmentsUploadCollection(R, i, p);
		            } else if (this.oUploadSet) {
		                this._uploadAttachmentsUploadSet(R, i, p);
		            } else {
		                R(p);
		            }
		        }.bind(this));
		    },
		    _uploadAttachmentsUploadSet: function (R, i, p) {
		        var A = this.oUploadSet.getIncompleteItems(), G = null, K = 0, N = A.length;
		        if (A.length === 0) {
		            R(p);
		            return;
		        }
		        var Q = jQuery.extend({}, this.getView().getBindingContext().getObject());
		        if (p.requestID && p.requestID !== Q.RequestID) {
		            Q.RequestID = p.requestID;
		        }
		        var V = this._getAttachmentsUploadUrl(this.oODataModel.createKey("/LeaveRequestSet", Q));
		        this.oUploadSet.setUploadUrl(V);
		        A.forEach(function (X) {
		            X.setUrl(V);
		        });
		        var W = function (X) {
		            var Y = X.getParameter("item");
		            K++;
		            var Z = K / N * 100;
		            p.aUploadedFiles.push({ FileName: Y.getFileObject().name });
		            if (Z >= 100) {
		                this.oUploadSet.detachUploadCompleted(W);
		                R(p);
		            } else {
		                G = A.shift();
		                this.oUploadSet.uploadItem(G);
		            }
		        }.bind(this);
		        this.oUploadSet.attachUploadCompleted(W);
		        G = A.shift();
		        this.oUploadSet.uploadItem(G);
		    },
		    _uploadAttachmentsUploadCollection: function (R, i, p) {
		        var A = this.oUploadCollection.getItems(), G = 0, K = 0;
		        A.forEach(function (X) {
		            if (X._status !== "display") {
		                K++;
		            }
		        });
		        if (K === 0) {
		            R(p);
		            return;
		        }
		        var N = jQuery.extend({}, this.getView().getBindingContext().getObject());
		        if (p.requestID) {
		            N.RequestID = p.requestID;
		        }
		        var Q = this.oODataModel.createKey("/LeaveRequestSet", N), V = this._getAttachmentsUploadUrl(Q);
		        this._updateUploadUrlsUploadCollection(A, V);
		        this.oCreateModel.setProperty("/uploadPercentage", 5);
		        var W = function (X) {
		            X.getParameter("files").forEach(function (Y) {
		                if (parseInt(Y.status, 10) >= 400) {
		                    var Z = jQuery.parseXML(Y.responseRaw), $ = u.convertXML2JSON(Z.documentElement);
		                    h.warning(this.getResourceBundle().getText("txtUploadError", [Y.fileName]), {
		                        title: this.getResourceBundle().getText("txtUploadErrorTitle"),
		                        details: $.message,
		                        onClose: function () {
		                            p.showSuccess = false;
		                            R(p);
		                        }
		                    });
		                } else {
		                    G++;
		                    var _ = G / K * 100;
		                    this.oCreateModel.setProperty("/uploadPercentage", _);
		                    p.aUploadedFiles.push({ FileName: Y.fileName });
		                    if (_ >= 100) {
		                        R(p);
		                    }
		                }
		            }.bind(this));
		            this.oUploadCollection.detachUploadComplete(W);
		        }.bind(this);
		        this.oUploadCollection.attachUploadComplete(W, this);
		        this.oUploadCollection.upload();
		    },
		    _initOverlapCalendar: function () {
		        if (!this._oOverlapCalendar) {
		            this.oCreateModel.setProperty("/calendar/overlapNumber", 0);
		            this._oOverlapCalendar = new o({
		                id: "overlapTeamCalendar",
		                applicationId: "MYLEAVEREQUESTS",
		                instanceId: "OVERLAP",
		                assignmentId: "{global>/sEmployeeNumber}",
		                requesterId: "{global>/sEmployeeNumber}",
		                startDate: "{create>/oLeaveStartDate}",
		                leaveRequestMode: true,
		                leaveRequestSimulateRequest: true,
		                leaveRequestStartDate: {
		                    formatter: q.convertToUTC,
		                    parts: ["create>/oLeaveStartDate"]
		                },
		                leaveRequestEndDate: {
		                    formatter: q.convertToUTC,
		                    parts: ["create>/oLeaveEndDate"]
		                },
		                leaveRequestDescription: "{create>/calendarOverlapLeaveRequestText}",
		                showConcurrentEmploymentButton: false,
		                visible: "{create>/calendar/opened}",
		                dataChanged: function (i) {
		                    this.oCreateModel.setProperty("/calendar/overlapNumber", i.getParameter("employeeConflictList").length);
		                }.bind(this)
		            });
		            this.getView().addDependent(this._oOverlapCalendar);
		            if (this._oOverlapCalendar.getMetadata().hasProperty("dataChangedDate")) {
		                this._oOverlapCalendar.bindProperty("dataChangedDate", {
		                    path: "/lastLeaveRequestChangeDate",
		                    model: "global",
		                    mode: "OneWay"
		                });
		            }
		        }
		        this.oCreateModel.setProperty("/calendarOverlapLeaveRequestText", this.getResourceBundle().getText(this.oCreateModel.getProperty("/sEditMode") === "EDIT" ? "calendarOverlapLeaveRequestEditText" : "calendarOverlapLeaveRequestText"));
		    },
		    _showBusyDialog: function (i) {
		        var p = this.getModel("global").getProperty("/bShowBusyIndicatorForFunctionImports");
		        if (p) {
		            this.byId("busyDialog").open();
		            if (i) {
		                this._oControlToFocus = i;
		            }
		        }
		    },
		    _closeBusyDialog: function () {
		        var i = this.getModel("global").getProperty("/bShowBusyIndicatorForFunctionImports");
		        if (i) {
		            this.byId("busyDialog").close();
		            if (this._oControlToFocus) {
		                this._oControlToFocus.focus();
		                this._oControlToFocus = null;
		            }
		        }
		    },
		    _convertHoursMinutesFromDateToDecimal: function (i) {
		        var p = i;
		        if (!p) {
		            p = new Date(0, 0);
		        }
		        return parseFloat(p.getHours() + 1 / 60 * p.getMinutes(), 10);
		    },
		    _getDecimalHoursFromTimepicker: function () {
		        return this._convertHoursMinutesFromDateToDecimal(this.byId("traditionalHoursPicker").getDateValue());
		    },
		    _getDecimalHoursFromInputControl: function () {
		        var i = this.byId("hoursValue");
		        return f.convertInputHoursStringToFloat(i.getValue());
		    }
	});
});