/*
 * Copyright SAP Mobile Services (c) 2012
 * All Rights Reserved
 */

//var servicesUrl = 'http://sitm.accessmoneymanager.com/mbanking/services/';
//var branchLocatorUrl = 'http://sitm.accessmoneymanager.com/wap/mb/ns/BranchLocator.jsp';
var servicesUrl = 'http://208.74.49.253/mbanking/services/';
var branchLocatorUrl = 'http://208.74.49.253/wap/mb/ns/BranchLocator.jsp';
//var servicesUrl = 'http://127.0.0.1:9081/mbanking/services/';
//var servicesUrl = 'http://gpsiphonedev.sybasedemo.com/mbanking/services/';
//var branchLocatorUrl = 'http://127.0.0.1:9081/wap/mb/grafx/BranchLocator.jsp';
//var branchLocatorUrl = 'http://gpsiphonedev.sybasedemo.com/wap/grafx/BranchLocator.jsp';
var exitAMHeader = "Exit accessMOBILE?";
var exitAMMessage = "You are about to exit accessMOBILE. Do you wish to continue?";
var commercialCardURL = "http://www.citizensbank.com/pdf/accessmobile/CommCard_Commentary/commcardmobilectz.pdf";
var commercialCardEmailURL = "mailto:commlcard@rbscitizens.com";
var exitAMEmailMessage = "You are about to exit accessMOBILE. Would you like to email commlcard@rbscitizens.com?";
var fxURL = "http://www.citizensbank.com/pdf/accessmobile/FX_Commentary/INTL-I147ctz.pdf";
var fxPhone = "tel:+18007334360";
var exitFXPhoneMessage = "You are about to exit accessMOBILE. Do you wish to call 1-800-733-4360?";
var exitContactUsPhoneMessage = "You are about to exit accessMOBILE. Do you wish to call 1-877-550-5933?";
var exitContactUsEmailMessage = "You are about to exit accessMOBILE. Would you like to email clientservices@rbscitizens.com?";
var exitContactUsIntlPhoneMessage = "You are about to exit accessMOBILE. Do you wish to call +001 401-464-3086?";
var exitBranchPhoneMessage = "You are about to exit accessMOBILE. Do you wish to call @?";

var SoapHeader = '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns1="http://services.mbanking.sybase.com/schema" ' + 'xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n ' + '<soapenv:Header/>\n<soapenv:Body>\n';
var SoapFooter = '</soapenv:Body></soapenv:Envelope>';
var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var debug = false;
var currentSession = new MBUserSession();
var currentLocation = '';
var wireValidChars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()_+-=|;:'<>,./?\\ ";
var amountValidChars = "0123456789.";
var zipValidChars = "0123456789";


var timerInterval = 1000; //milliseconds
var lastInactiveTime = 0;
var inactivityLimit = 20; //minutes
var intervalID = null;
var forcedLogout = false;
var phoneGapContainer = false;

var frontImage = null;
var backImage = null;

var disableDetails = false;

function showPleaseWait() {
	$.blockUI({
		message : null
	});
	$.mobile.loading('show', {
		theme : "b",
		text : "Please wait...",
		textVisible : true
	});
}

function hidePleaseWait() {
	$.unblockUI();
	$.mobile.loading('hide');
}

function getDateFromYYYYMMDD(date) {
	var dateFormatted = date.substring(4, 6) + '/' + date.substring(6, 8) + "/" + date.substring(0, 4);
	return dateFormatted;
}

/*function convertAxisDate(axisDate) {
	//sample 1355259540000:America-New_York
	var millisec = axisDate.substring(0, axisDate.indexOf(':'));
	var date = new Date(Number(millisec));
	return date;
}*/

function convertAxisDate(axisDate) {
	var epoch = parseInt(axisDate, 10);
	if(epoch < 10000000000)
		epoch *= 1000;
	var date = new Date();
	date.setTime(epoch);
	return date;
}

function getAxisDate(date) {
	var tz = jstz.determine();
	return date.getTime() + ':' + tz.name();
}

function formatSnapShotDate(snapshotdate) {
	var dateFormatted = snapshotdate.substring(4, 6) + '/' + snapshotdate.substring(6, 8) + "/" + snapshotdate.substring(0, 4);
	var time = snapshotdate.substring(8, 10) + ":" + snapshotdate.substring(10, 12) + " ET";
	return dateFormatted + " " + time;
}

function escapeHTML(escapeHTML) {
    return escapeHTML.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function log(logMessage) {
	if(debug === true) {
		if((window['console'] !== undefined)) {
			console.log(logMessage);
		}
	}
}

function unformatAmount(amount, cur) {
	var amt = '', d = '0', c = '00';
	if (amount === undefined || amount === '')
		return '';
	//    if (cur == 'CAD' || cur == 'USD' || cur == null || cur == '') {
	var i = amount.indexOf('.');
	if (i != -1) {
		c = (amount + '00').substr(i + 1, 2);
		d = amount.substring(0, i);
	} else {
		d = amount;
	}
	for ( i = d.length - 3; i > 0; i -= 3)
		d = d.substring(0, i) + ',' + d.substring(i);
	amt = d + '.' + c;
	//    }
	return amt;
}

function formatAmount(amount, cur) {
	var amt = unformatAmount(amount, cur);
	if (amt === '')
		return 'Not Available';
	if (cur === 'CAD')
		return '$' + amt + ' CAD';
	else if (cur === 'AUD')
		return '$' + amt + ' AUD';
	else if (cur === 'EUR')
		return '$' + amt + ' EUR';
	else
		return '$' + amt;
}

function capitalize (text) {
	//if(text === null || text === undefined)
	//	return text;
	//return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	return text;
}

/*
 * Branch Locator class
 */
function MBBranchLocator() {

}

MBBranchLocator.findBranchesByZip = function () {

};

MBBranchLocator.findBranchesByLocation = function () {

};

/*
 * Connector base class
 */

function MBConnector() {

}

MBConnector.sendSOAPMessage = function(endpoint, action, soapmessage, successcallback, errorcallback) {
	lastInactiveTime = 0;
    showPleaseWait();
    log(soapmessage);
    $.ajax({
        type : "POST",
        url : servicesUrl + endpoint,
        data : soapmessage,
        dataType : "xml",
        timeout: 90000,
        processData : false,
        beforeSend : function(xhr) {
            xhr.setRequestHeader('SOAPAction', action);
            xhr.setRequestHeader('Content-Type', 'text/xml');
            xhr.setRequestHeader('Accepts-Encoding', 'gzip');
        },
        success : successcallback,
        error : errorcallback
    });
};

/*
 * SecurityConnector base class
 */

function MBSecurityConnector() {

}

MBSecurityConnector.sendGetMultifactorSecurityInfoRequest = function (user) {
	var soap = SoapHeader + '<ns1:getMultifactorSecurityInfo>\n' + user.getXML() + '</ns1:getMultifactorSecurityInfo>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("SecurityService", "getMultifactorSecurityInfo", soap, processGetMultifactorSecurityInfoResponse, processHandleError);
};

MBSecurityConnector.answerMultifactorSecurityInfo = function (user) {
	var soap = SoapHeader + '<ns1:getMultifactorSecurityInfo>\n' + user.getXML() + '</ns1:getMultifactorSecurityInfo>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("SecurityService", "getMultifactorSecurityInfo", soap, processAnswerMultifactorSecurityInfoResponse, processHandleError);
};

MBSecurityConnector.sendAuthenticateUserRequest = function (user) {
	var soap = SoapHeader + '<ns1:authenticateUser>\n' + user.getXML() + '</ns1:authenticateUser>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("SecurityService", "authenticateUser", soap, processAuthenticateUserResponse, processHandleError);
};

MBSecurityConnector.sendLogoutRequest = function (user) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>20</ns1:numResults><ns1:extraMap size="0" /></ns1:criteria>';
	var soap = SoapHeader + '<logout>\n' + body + '</logout>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("SecurityService", "logout", soap, processLogoutResponse, processLogoutError);
	currentSession.clearUserSession();
};

/*
 * AccountConnector base class
 */

function MBAccountConnector() {

}

MBAccountConnector.sendGetAccountsRequest = function (user) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>20</ns1:numResults><ns1:extraMap size="0" /></ns1:criteria>';
	var soap = SoapHeader + '<getAccounts>\n' + body + '</getAccounts>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getAccounts", soap, processGetAccountsResponse, processHandleError);
};

MBAccountConnector.sendGetAccountSnapshotRequest = function (user, account) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += account.getXML();
	body += '</ns1:criteria>';
	var soap = SoapHeader + '<getAccountSnapshot>\n' + body + '</getAccountSnapshot>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getAccountSnapshot", soap, processGetAccountSnapshotResponse, processHandleError);
};

MBAccountConnector.sendGetPendingApprovalsRequest = function (user) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '</ns1:criteria>';
	var soap = SoapHeader + '<getPendingApprovals>\n' + body + '</getPendingApprovals>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getPendingApprovals", soap, processGetPendingApprovalsResponse, processHandleError);
};

MBAccountConnector.sendGetPendingWiresRequest = function (user) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '</ns1:criteria>';
	var soap = SoapHeader + '<getPendingWires>\n' + body + '</getPendingWires>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getPendingWires", soap, processGetPendingWiresResponse, processHandleError);
};

MBAccountConnector.sendGetAlertsRequest = function (user) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '<ns1:message><ns1:type>alert</ns1:type>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '</ns1:message></ns1:criteria>';
	var soap = SoapHeader + '<getUnreadMessages>\n' + body + '</getUnreadMessages>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getUnreadMessages", soap, processGetAlertsResponse, processHandleError);
};

MBAccountConnector.sendGetMessagesRequest = function (user) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '<ns1:message><ns1:type>message</ns1:type>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '</ns1:message></ns1:criteria>';
	var soap = SoapHeader + '<getUnreadMessages>\n' + body + '</getUnreadMessages>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getUnreadMessages", soap, processGetMessagesResponse, processHandleError);
};

MBAccountConnector.sendGetTransactionsRequest = function (user, account) {
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '<ns1:transaction><ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += account.getXML();
	body += '</ns1:transaction>';
	body += '</ns1:criteria>';
	var soap = SoapHeader + '<getTransactions>\n' + body + '</getTransactions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("AccountService", "getTransactions", soap, processGetTransactionsResponse, processHandleError);
};

MBAccountConnector.sendGetSelectedTransactionsRequest = function (availableDate, user, account) {
	var index = availableDate.indexOf('-');
	var dateStr = availableDate.substring(0, index);
	var date = new Date();
	date.setFullYear(dateStr.substring(0, 4));
	date.setMonth(dateStr.substring(4, 6) - 1);
	date.setDate(dateStr.substring(6, 8));
	var trans = new MBTransaction();
	trans.transDateAsCal = getAxisDate(date);
	trans.extra = new MBExtraMap();
	trans.extra.extra['dataClass'] = availableDate.substring(index + 1, availableDate.length);
	trans.account = account;
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += trans.getXML();
	body += '</ns1:criteria>';
	var soap = SoapHeader + '<getTransactions>\n' + body + '</getTransactions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("AccountService", "getTransactions", soap, processGetSelectedTransactionsResponse, processHandleError);
};

MBAccountConnector.sendLoadMoreTransactionsRequest = function (availableDate, user, account) {
	var index = availableDate.indexOf('-');
	var dateStr = availableDate.substring(0, index);
	var date = new Date();
	date.setFullYear(dateStr.substring(0, 4));
	date.setMonth(dateStr.substring(4, 6) - 1);
	date.setDate(dateStr.substring(6, 8));
	var trans = new MBTransaction();
	trans.transDateAsCal = getAxisDate(date);
	trans.extra = new MBExtraMap();
	trans.extra.extra['nextTXNS'] =  "True";
	trans.extra.extra['dataClass'] = availableDate.substring(index + 1, availableDate.length);
	trans.account = account;
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>10</ns1:numResults>';
	body += '<ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += trans.getXML();
	body += '</ns1:criteria>';
	var soap = SoapHeader + '<getTransactions>\n' + body + '</getTransactions>\n' + SoapFooter;
	trans.extra.extra['nextTXNS'] =  null;
	MBConnector.sendSOAPMessage("AccountService", "getTransactions", soap, processLoadMoreTransactionsResponse, processHandleError);
};

MBAccountConnector.sendMarkMessageReadRequest = function (user, message, isAlert) {
	var body = user.getXML() + '<ns1:messageId>' + message.messageId + '</ns1:messageId>';
	var soap = SoapHeader + '<markMessageRead>\n' + body + '</markMessageRead>\n' + SoapFooter;
	if(isAlert === true)
		MBConnector.sendSOAPMessage("CorpAccountService", "markMessageRead", soap, processMarkAlertReadResponse, processHandleError);
	else
		MBConnector.sendSOAPMessage("CorpAccountService", "markMessageRead", soap, processMarkMessageReadResponse, processHandleError);
};

MBAccountConnector.sendDeleteMessageRequest = function (user, message, isAlert) {
	var body = user.getXML() + '<ns1:messageId>' + message.messageId + '</ns1:messageId>';
	var soap = SoapHeader + '<deleteMessage>\n' + body + '</deleteMessage>\n' + SoapFooter;
	if(isAlert === true)
		MBConnector.sendSOAPMessage("CorpAccountService", "deleteMessage", soap, processDeleteAlertResponse, processHandleError);
	else
		MBConnector.sendSOAPMessage("CorpAccountService", "deleteMessage", soap, processDeleteMessageResponse, processHandleError);
};

MBAccountConnector.sendMessageRequest = function (user, message) {
	var body = user.getXML() + message.getXML();
	var soap = SoapHeader + '<sendMessage>\n' + body + '</sendMessage>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "sendMessage", soap, processSendMessageResponse, processHandleError);
};

MBAccountConnector.sendReplyRequest = function (user, message) {
	var body = user.getXML() + message.getXML();
	var soap = SoapHeader + '<sendMessage>\n' + body + '</sendMessage>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "sendMessage", soap, processSendReplyResponse, processHandleError);
};

MBAccountConnector.sendSubmitApprovalDecisionsRequest = function (user, pendingApprovals) {
	var body = user.getXML();
	body += '<ns1:decisions><ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '<ns1:approvalDecisions>';
	for(var i=0; i<pendingApprovals.length; i++) {
		body += pendingApprovals[i].getDecisionXML();
	}
	body += '</ns1:approvalDecisions></ns1:decisions>';
	var soap = SoapHeader + '<submitApprovalDecisions>\n' + body + '</submitApprovalDecisions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "submitApprovalDecision", soap, processSubmitApprovalDecisionsResponse, processHandleError);
};

MBAccountConnector.sendGenerateMobileTokenForWiresRequest = function (user) {
	var decisions = '<ns1:decisions><ns1:password></ns1:password><ns1:token>GENERATE_MOBILE_TOKEN</ns1:token><ns1:extraMap ns1:size="0"></ns1:extraMap></ns1:decisions>';
	var body = user.getXML() + decisions;
	var soap = SoapHeader + '<submitWireDecisions>\n' + body + '</submitWireDecisions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "submitWireDecisions", soap, processGenerateMobileTokenForWiresResponse, processHandleError);
};

MBAccountConnector.sendAuthorizeWireDecisionRequest = function (password, token, user) {
	var decisions = '<ns1:decisions><ns1:password>' + password + '</ns1:password><ns1:token>' + token + '</ns1:token><ns1:extraMap ns1:size="0"></ns1:extraMap></ns1:decisions>';
	var body = user.getXML() + decisions;
	var soap = SoapHeader + '<submitWireDecisions>\n' + body + '</submitWireDecisions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "submitWireDecisions", soap, processAuthorizeWireDecisionResponse, processHandleError);
};

MBAccountConnector.sendSubmitWireDecisionRequest = function (user, pendingWires) {
	var body = user.getXML();
	body += '<ns1:decisions><ns1:extraMap ns1:size="0"></ns1:extraMap>';
	body += '<ns1:wireDecisions>';
	for(var i=0; i<pendingWires.length; i++) {
		body += pendingWires[i].getWireDecisionXML();
	}
	body += '</ns1:wireDecisions></ns1:decisions>';
	var soap = SoapHeader + '<submitWireDecisions>\n' + body + '</submitWireDecisions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "submitWireDecisions", soap, processSubmitWireDecisionResponse, processHandleError);
};

MBAccountConnector.sendGetLockedUsersRequest = function (user) {
	var body = user.getXML();
	var soap = SoapHeader + '<getLockedUsers>\n' + body + '</getLockedUsers>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getLockedUsers", soap, processGetLockedUsersResponse, processHandleError);
};

MBAccountConnector.sendUserUnlockRequest = function (user, userId) {
	var body = user.getXML();
	body += '<ns1:users><ns1:lockedUsers><ns1:lockedUser><ns1:userName>' + userId + '</ns1:userName></ns1:lockedUser></ns1:lockedUsers></ns1:users>';
	var soap = SoapHeader + '<unlockUsers>\n' + body + '</unlockUsers>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "unlockUsers", soap, processUnlockUserResponse, processHandleError);
};

MBAccountConnector.sendGetPendingDepositDataRequest = function (user, userId) {
	var body = user.getXML();
	body += '<ns1:extraMap ns1:size="0"/>';
	var soap = SoapHeader + '<getPendingDepositData>\n' + body + '</getPendingDepositData>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getPendingDepositData", soap, processGetPendingDepositDataResponse, processHandleError);
};

MBAccountConnector.sendGetRemoteDepositHistoryRequest = function (user, userId, ezdaccounts) {
	var body = user.getXML();
	var rdmuser =  $.base64.encode(userId);//$.base64.encode("sybasetesting");
	var accounts = '';
	for(var i=0; i<ezdaccounts.length; i++) {
		accounts += ezdaccounts[i].ownerCode;
		if(i < (ezdaccounts.length -1)) {
			accounts += ',';
		}
	}

	body += '<ns1:userAccount><ns1:userName>' + rdmuser + '</ns1:userName><ns1:extraMap ns1:size="1"><ns1:entry ns1:key="accounts" xsi:type="xsd:string">' +  accounts  + '</ns1:entry></ns1:extraMap></ns1:userAccount>';
	var soap = SoapHeader + '<getRemoteDepositHistory>\n' + body + '</getRemoteDepositHistory>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getRemoteDepositHistory", soap, processGetRemoteDepositHistoryResponse, processHandleError);
};

MBAccountConnector.sendGetRemoteDepositHistoryImagesRequest = function (user, deposit, userId) {
	var body = user.getXML();
	var rdmUser = $.base64.encode(userId);
	deposit.extra.extra['username'] = rdmUser;
	var extra = deposit.extra.getXML();
	body += '<ns1:historyDetails><ns1:irn>' + deposit.irn + '</ns1:irn><ns1:h_irn>' + deposit.h_irn + '</ns1:h_irn>' + extra + '</ns1:historyDetails>';
	var soap = SoapHeader + '<getRemoteDepositHistoryImages>\n' + body + '</getRemoteDepositHistoryImages>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getRemoteDepositHistoryImages", soap, processGetRemoteDepositHistoryImagesResponse, processHandleError);
};

MBAccountConnector.sendGetWireTemplatesRequest = function (user) {
	var body = user.getXML();
	body += '<ns1:criteria><ns1:extraMap ns1:size="0"/></ns1:criteria>';
	var soap = SoapHeader + '<getWireTemplates>\n' + body + '</getWireTemplates>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getWireTemplates", soap, processGetWireTemplatesResponse, processHandleError);
};

MBAccountConnector.sendLoadWireTemplateRequest = function (user, wireTemplate) {
	var body = user.getXML();
	body += '<ns1:criteria><ns1:numResults>10</ns1:numResults><ns1:extraMap ns1:size="0"/>' + wireTemplate.getXML() +  '</ns1:criteria>';
	var soap = SoapHeader + '<loadWireTemplate>\n' + body + '</loadWireTemplate>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "loadWireTemplate", soap, processLoadWireTemplateResponse, processHandleError);
};

MBAccountConnector.sendVerifyWireTransferRequest = function (user, wireTemplate) {
	var body = user.getXML() + wireTemplate.getWireXML();
	var soap = SoapHeader + '<verifyWireTransfer>\n' + body + '</verifyWireTransfer>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "verifyWireTransfer", soap, processVerifyWireTransferResponse, processHandleError);
};

MBAccountConnector.sendCreateWireTransferRequest = function (user, wireTemplate) {
	var body = user.getXML() + wireTemplate.getWireXML();
	var soap = SoapHeader + '<createWireTransfer>\n' + body + '</createWireTransfer>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "createWireTransfer", soap, processCreateWireTransferResponse, processHandleError);
};

MBAccountConnector.sendGetPositivePaySuspectsRequest = function (user) {
	var body = user.getXML();
	var soap = SoapHeader + '<getPositivePaySuspects>\n' + body + '</getPositivePaySuspects>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getPositivePaySuspects", soap, processGetPositivePaySuspectsResponse, processHandleError);
};

MBAccountConnector.sendSubmitPositivePayDecisionsRequest = function(user, ppaySuspects) {
	var body = user.getXML();
	body += '<ns1:decisions><ns1:extraMap ns1:size="0"/><ns1:positivePayDecisions>';
	for(var i=0; i<ppaySuspects.length; i++) {
		body += ppaySuspects[i].getDecisionXML();
	}
	body += '</ns1:positivePayDecisions></ns1:decisions>';
	var soap = SoapHeader + '<submitPPayDecisions>\n' + body + '</submitPPayDecisions>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "submitPPayDecisions", soap, processSubmitPositivePayDecisionsResponse, processHandleError);
};

MBAccountConnector.sendGetCheckImageRequest = function(user, ppaySuspect) {
	var body = user.getXML();
	body += '<ns1:id>' + ppaySuspect.id + '</ns1:id>';
	body += '<ns1:imageSide>both</ns1:imageSide>';
	var soap = SoapHeader + '<getCheckImage>\n' + body + '</getCheckImage>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getCheckImage", soap, processGetCheckImageResponse, processHandleError);
};

MBAccountConnector.sendGetRDCLocationsRequest = function (user) {
	var extra = '<ns1:extraMap size="1"><ns1:entry ns1:key="type" xsi:type="xsd:string">EZD</ns1:entry></ns1:extraMap>';
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>20</ns1:numResults>' + extra + '</ns1:criteria>';
	var soap = SoapHeader + '<getRDCLocations>\n' + body + '</getRDCLocations>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getRDCLocations", soap, processGetRDCLocationsResponse, processHandleError);
};

MBAccountConnector.sendGetRDCPendingDepositsRequest = function (user) {
	var extra = '<ns1:extraMap size="1"><ns1:entry ns1:key="type" xsi:type="xsd:string">EZD</ns1:entry></ns1:extraMap>';
	var body = user.getXML() + '<ns1:criteria><ns1:numResults>20</ns1:numResults>' + extra + '</ns1:criteria>';
	var soap = SoapHeader + '<getPendingDepositData>\n' + body + '</getPendingDepositData>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getPendingDepositData", soap, processGetRDCPendingDepositsResponse, processHandleError);
};

MBAccountConnector.sendGetRDCAccountsRequest = function (user, userId) {
	var body = user.getXML();
	var rdmuser =  $.base64.encode(userId);
	var rdmuseraccount = $.base64.encode("RDM_LoginOwner");
	body += '<ns1:userAccount><ns1:userName>' + rdmuser + '</ns1:userName><ns1:extraMap ns1:size="0"/></ns1:userAccount>';
	var soap = SoapHeader + '<getViewableAccounts>\n' + body + '</getViewableAccounts>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "getViewableAccounts", soap, processGetRDCAccountsResponse, processHandleError);
};

MBAccountConnector.sendRDCSubmitDepositRequest = function(user, ezdAccountowner, ezdAccountNumber, username, amount, frontImage, backImage) {
	var body = user.getXML();
	var rdmuser =  $.base64.encode(username);
	body += '<ns1:details><ns1:accountNumber>' + ezdAccountNumber + '</ns1:accountNumber><ns1:amount>$' + amount + '</ns1:amount><ns1:ownerCode>' + ezdAccountowner + '</ns1:ownerCode>';
	body += '<ns1:frontImage>' + frontImage + '</ns1:frontImage>';
	body += '<ns1:backImage>' + backImage + '</ns1:backImage>';
	body += '<ns1:deposit_ID>(null)</ns1:deposit_ID><ns1:submissionQuestion>(null)</ns1:submissionQuestion><ns1:userName>' + rdmuser + '</ns1:userName>';
	body += '<ns1:extraMap ns1:size="1">';
	body += '<ns1:entry ns1:key="browserapp" xsi:type="xsd:string">true</ns1:entry>';
	body += '</ns1:extraMap>';
	body += '</ns1:details>';
	var soap = SoapHeader + '<submitDeposit>\n' + body + '</submitDeposit>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "submitDeposit", soap, processRDCSubmitDepositResponse, processHandleRDCSubmitError);
};

MBAccountConnector.sendRDCReSubmitDepositRequest = function(user, pendingDeposit) {
	var body = user.getXML();
	body += '<ns1:deposit><ns1:depositId>' + pendingDeposit.deposit_ID + '</ns1:depositId>';
	body += '<ns1:extraMap ns1:size="1">';
	body += '<ns1:entry ns1:key="browserapp" xsi:type="xsd:string">true</ns1:entry>';
	body += '</ns1:extraMap>';
	body += '</ns1:deposit>';
	var soap = SoapHeader + '<resubmitDeposit>\n' + body + '</resubmitDeposit>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("CorpAccountService", "resubmitDeposit", soap, processRDCReSubmitDepositResponse, processHandleRDCError);
};
/*
 * Transfer Connector class
 */

function MBTransferConnector () {

}

MBTransferConnector.sendTransferVerificationRequest = function (user, transfer) {
	var extraMap = new MBExtraMap();
	extraMap.extra['validateDate'] = 'true';
	transfer.extra = extraMap;

	var body = user.getXML() + transfer.getXML();
	var soap = SoapHeader + '<transferFunds>\n' + body + '</transferFunds>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("TransferService", "transferFunds", soap, processTransferVerificationResponse, processHandleError);
};

MBTransferConnector.sendTransferRequest = function (user, transfer) {
	currentSession.transfer.status = null;
	currentSession.transfer.extra = new MBExtraMap();

	var body = user.getXML() + transfer.getXML();
	var soap = SoapHeader + '<transferFunds>\n' + body + '</transferFunds>\n' + SoapFooter;
	MBConnector.sendSOAPMessage("TransferService", "transferFunds", soap, processTransferResponse, processHandleError);
};

