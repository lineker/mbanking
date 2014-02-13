
function displayPopupAlert(title, message, pageTo) {
	$('<div>').simpledialog2({
				themeHeader : "f",
				mode : 'button',
				headerText : title,
				headerClose : false,
				buttonPrompt : message,
				buttons : {
					'OK' : {
						click : function() {
							if(pageTo !== null && pageTo !== undefined && pageTo !== '') {
								$.mobile.changePage(pageTo);
							}
						},
						icon : false,
						theme : "c"
					}
				}
			});			
}

function displayPopupAlert2(title, message, message2, pageTo, showmessage2) {
	$('<div>').simpledialog2({
				themeHeader : "f",
				mode : 'button',
				headerText : title,
				headerClose : false,
				buttonPrompt : message,
				buttons : {
					'OK' : {
						click : function() {
							if(showmessage2) {
								displayPopupAlert(title, message2, pageTo);
							}
						},
						icon : false,
						theme : "c"
					}
				}
			});			
}

function processGetMultifactorSecurityInfoResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $challenge = $xml.find("ns0\\:challenge, challenge");
	currentSession.question = $challenge.text();
	var mbUser = new MBUser($(xmlDoc));
	currentSession.mbUser = mbUser;
	localStorage.setItem('pmdata', currentSession.mbUser.extra.extra['enc_pmdata']);
	hidePleaseWait();

	if (currentSession.question) {
		$.mobile.changePage("#loginmfa");
	} else if (mbUser.extra.extra['tokensBypassed'] === 'true') {
		//show error
		errormessage = "Your credentials cannot be verified at this time. Please log into Money Manager GPS or contact Client Services for further instructions.";
		$.mobile.changePage("#messagedialog", {
			role : "dialog",
			reverse : false
		});

	} else {
		currentSession.imageUrl = mbUser.extra.extra['passmarkImgSrc'];
		currentSession.passphrase = mbUser.extra.extra['secretPhrase'];
		$.mobile.changePage("#loginpwd");
	}
}

function processAnswerMultifactorSecurityInfoResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $returnXml = $xml.find("ns1\\:return,return");
	var $extraMap = $xml.find("ns1\\:extraMap,extraMap");
	var $entries = $extraMap.find("ns1\\:entry,entry");
	$entries.each(function() {
		var value = $(this).text();
		var mapKey = '';
		$.each(this.attributes, function() {
			if ($(this).val() != "xsd:string") {
				mapKey = $(this).val();
				if (mapKey === 'secretPhrase') {
					currentSession.passphrase = value;
				} else if (mapKey === 'passmarkImgSrc') {
					currentSession.imageUrl = value;
				}
			}
		});
	});
	var $challenge = $xml.find("ns0\\:challenge,challenge");
	var question2 = $challenge.text();
	var mbUser = new MBUser($(xmlDoc));
	currentSession.mbUser = mbUser;
	localStorage.setItem('pmdata', currentSession.mbUser.extra.extra['enc_pmdata']);
	hidePleaseWait();
	if (question2) {
		currentSession.question = question2;
		$.mobile.changePage("#loginmfa");
	} else {
		$.mobile.changePage("#loginpwd");
	}

}

function processAuthenticateUserResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $returnXml = $xml.find("ns1\\:return,return");
	var $extraMap = $xml.find("ns1\\:extraMap,extraMap");
	var $entries = $extraMap.find("ns1\\:entry,entry");
	var extra = new MBExtraMap($entries);
	currentSession.mbUser.extra = extra;
	channelSessionId = $returnXml.find("ns1\\:channelSessionId,channelSessionId").text();
	currentSession.mbUser.channelSessionId = channelSessionId;

	var $moremenulist = $("#moremenulist li");

	currentSession.appGeoLegURL = extra.extra.AppGeoLegURL;
	currentSession.authenticated = $returnXml.find("ns1\\:authenticated,authenticated").text();
	currentSession.mbUser.authenticated = currentSession.authenticated;
	if (extra.extra['unread_messages_count'] !== '' && extra.extra['unread_messages_count'] !== undefined && extra.extra['unread_messages_count'] !== null) {
		currentSession.unread_messages_count = Number(extra.extra['unread_messages_count']);
		delete extra.extra['unread_messages_count'];
		currentSession.isEntToMessages = true;
	} else {
		currentSession.isEntToMessages = false;
	}
	if (extra.extra['unread_alerts_count'] !== '' && extra.extra['unread_alerts_count'] !== undefined && extra.extra['unread_alerts_count'] !== null) {
		currentSession.unread_alerts_count = Number(extra.extra['unread_alerts_count']);
		delete extra.extra['unread_alerts_count'];
		currentSession.isEntToAlerts = true;
	} else {
		currentSession.isEntToAlerts = false;
	}

	var $wiresmenu = $moremenulist.find("a:contains('WIRE RELEASE')");
	if (extra.extra['wires_release_count'] !== '' && extra.extra['wires_release_count'] !== undefined && extra.extra['wires_release_count'] !== null) {
		currentSession.wires_release_count = Number(extra.extra['wires_release_count']);
		delete extra.extra['wires_release_count'];
		currentSession.hasWires = true;
	} else {
		currentSession.hasWires = false;
	}
	if (extra.extra['pending_approvals_count'] !== '' && extra.extra['pending_approvals_count'] !== undefined && extra.extra['pending_approvals_count'] !== null) {
		currentSession.pending_approvals_count = Number(extra.extra['pending_approvals_count']);
		delete extra.extra['pending_approvals_count'];
		currentSession.hasApprovals = true;
	} else {
		currentSession.hasApprovals = false;
	}

	if (extra.extra['user_lock_count'] !== '' && extra.extra['user_lock_count'] !== undefined && extra.extra['user_lock_count'] !== null) {
		currentSession.user_lock_count = Number(extra.extra['user_lock_count']);
		currentSession.hasAdminUnlock = true;
		delete extra.extra['user_lock_count'];
	} else {
		currentSession.hasAdminUnlock = false;
	}

	if (extra.extra['can_create_wires'] !== '' && extra.extra['can_create_wires'] !== undefined && extra.extra['can_create_wires'] !== null) {
		currentSession.can_create_wires = Boolean(extra.extra['can_create_wires']);
		delete extra.extra['can_create_wires'];
	}

	if (extra.extra['hasEZDeposit'] !== '' && extra.extra['hasEZDeposit'] !== undefined && extra.extra['hasEZDeposit'] !== null) {
		currentSession.hasEZDeposit = Boolean(extra.extra['hasEZDeposit']);
		delete extra.extra['hasEZDeposit'];
	}

	if (extra.extra['ppayCount'] !== '' && extra.extra['ppayCount'] !== undefined && extra.extra['ppayCount'] !== null) {
		currentSession.ppayCount = Number(extra.extra['ppayCount']);
		currentSession.hasPPayDecision = true;
		delete extra.extra['ppayCount'];
	} else {
		hasPPayDecision = false;
	}

	localStorage.setItem('pmdata', currentSession.mbUser.extra.extra['enc_pmdata']);
	//save user id
	if (currentSession.saveUserId === true) {
		localStorage.setItem('companyid', currentSession.mbUser.extra.extra['enc_companyid']);
		localStorage.setItem('userid', currentSession.mbUser.extra.extra['enc_userid']);
	} else {
		localStorage.removeItem('companyid');
		localStorage.removeItem('userid');
	}
	currentSession.mbUser.password = null;
	delete currentSession.mbUser.extra.extra['token'];
	delete currentSession.mbUser.extra.extra['globalMsg'];
	delete currentSession.mbUser.extra.extra['lastLoginDate'];
	delete currentSession.mbUser.extra.extra['secretPhrase'];
	delete currentSession.mbUser.extra.extra['passmarkImgSrc'];

	//MBAccountConnector.sendGetAccountsRequest(currentSession.mbUser);
	$.mobile.changePage("#dashboard");
}

function processGetAccountsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $accounts = $xml.find("ns1\\:return,return");
	currentSession.accounts.splice(0, currentSession.accounts.length);
	$accounts.each(function() {
		currentSession.accounts.push(new MBAccount($(this)));
	});

	//$.mobile.changePage("#dashboard");
	
	/*currentSession.accounts.sort(function(account1, account2) {
		var fav = account1.extra.extra['favorite'];
		var num1 = 1;
		var num2 = 1;
		if(fav === 'y') {
			num1 = 0;
		}
		
		fav = account2.extra.extra['favorite'];
		if(fav === 'y') {
			num2 = 0;
		}
		
		return num2 - num1;
	});*/

	
	showDashboard();

	hidePleaseWait();
}

function processGetAccountSnapshotResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $snapshot = $xml.find("ns1\\:return,return");
	currentSession.mbSnapshot = new MBAccountSnapshot($snapshot);
	$.mobile.changePage("#currentdaydetails");
	$xml = "";
	hidePleaseWait();
}

function processGetPendingApprovalsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $approvals = $xml.find("ns1\\:return,return");
	currentSession.pendingApprovals.splice(0, currentSession.pendingApprovals.length);
	$approvals.each(function() {
		currentSession.pendingApprovals.push(new MBPendingApproval($(this)));
	});
	$xml = null;
	$approvals = null;
	hidePleaseWait();
	$.mobile.changePage("#pendingapprovals");
}

function processGetPendingWiresResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $wires = $xml.find("ns1\\:return,return");
	currentSession.pendingWires.splice(0, currentSession.pendingWires.length);
	$wires.each(function() {
		currentSession.pendingWires.push(new MBPendingWire($(this)));
	});
	hidePleaseWait();
	$xml = null;
	$wires = null;
	hidePleaseWait();
	$.mobile.changePage("#pendingwires");
}

function processGetAlertsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $alerts = $xml.find("ns1\\:return,return");
	currentSession.alerts.splice(0, currentSession.alerts.length);
	$alerts.each(function() {
		currentSession.alerts.push(new MBMessage($(this)));
	});

	currentSession.alerts.sort(function(alert1, alert2) {
		var dt1 = alert1.date.getTime();
		var dt2 = alert2.date.getTime();
		return dt2 - dt1;
	});

	hidePleaseWait();
	$.mobile.changePage("#alerts");
}

function processGetMessagesResponse(response, textStatus, jqXHR) {

	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $messages = $xml.find("ns1\\:return,return");
	currentSession.messages.splice(0, currentSession.messages.length);
	$messages.each(function() {
		currentSession.messages.push(new MBMessage($(this)));
	});

	currentSession.messages.sort(function(msg1, msg2) {
		var dt1 = msg1.date.getTime();
		var dt2 = msg2.date.getTime();
		return dt2 - dt1;
	});

	hidePleaseWait();
	$xml = "";
	$.mobile.changePage("#messages");
}

function processGetTransactionsResponse(response, textStatus, jqXHR) {

	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $transactions = $xml.find("ns1\\:return,return");

	if (currentSession.transactions.length > 0) {
		currentSession.transactions.splice(0, currentSession.transactions.length);
	}
	$transactions.each(function() {
		currentSession.transactions.push(new MBTransaction($(this)));
	});

	hidePleaseWait();
	$xml = "";
	currentSession.selectedHistoryDay = 0;
	$.mobile.changePage("#accounthistory");
}

function processGetSelectedTransactionsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $transactions = $xml.find("ns1\\:return,return");

	currentSession.transactions.splice(0, currentSession.transactions.length);

	$transactions.each(function() {
		currentSession.transactions.push(new MBTransaction($(this)));
	});

	if ($.mobile.activePage.is("#accounthistory")) {
		showTransactions();
	} else {
		$.mobile.changePage("#accounthistory");
	}
	hidePleaseWait();
}

function processLoadMoreTransactionsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $transactions = $xml.find("ns1\\:return,return");

	var moreTransactions = [];
	$transactions.each(function() {
		moreTransactions.push(new MBTransaction($(this)));
	});

	if (moreTransactions.length > 0) {
		var firstTransaction = moreTransactions[0];
		var hasMore = firstTransaction.extra.extra['hasMore'];
		currentSession.transactions[0].extra.extra['hasMore'] = hasMore;
		currentSession.transactions.push.apply(currentSession.transactions, moreTransactions);
	}

	showTransactions();
	hidePleaseWait();
}

function processSubmitApprovalDecisionsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $return = $xml.find("ns1\\:return,return");
	var $decisions = $return.find("ns1\\:approvalDecisions,approvalDecisions");
	var $decision = $decisions.find("ns0\\:approvalDecision,approvalDecision");

	$decision.each(function() {
		var id = $(this).find("ns0\\:id,id").text();
		var status = $(this).find("ns0\\:decision,decision").text();
		var $error = $(this).find("ns0\\:error,error");
		var error = null;
		if ($error !== undefined && $error !== null) {
			error = $error.text();
		}
		for (var i = 0; currentSession.pendingApprovals; i++) {
			if (id === currentSession.pendingApprovals[i].approvalId) {
				currentSession.pendingApprovals[i].status = status;
				if (error !== '' && error !== undefined && error !== null) {
					currentSession.pendingApprovals[i].error = error;
				}
				break;
			}
		}
	});

	$.mobile.changePage("#approvalsconfirm");

	hidePleaseWait();
}

function processTransferVerificationResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var status = $xml.find("ns1\\:status,status").text();
	var dueDateAsCal = $xml.find("ns1\\:dueDateAsCal,dueDateAsCal").text();
	currentSession.transfer.dueDateAsCal = dueDateAsCal;
	var date = convertAxisDate(currentSession.transfer.dueDateAsCal);
	hidePleaseWait();

	if (status === 'DATE TO FAR') {
		errormessage = "Transfer Date must be less than 90 days in the future";
		$.mobile.changePage("#messagedialog", {
			role : "dialog",
			reverse : false
		});

	} else {
		if (status === 'DATE CHANGED') {
			var extraMap = new MBExtraMap($xml.find("ns1\\:entry, entry"));
			var willprocessOn = extraMap.extra['willProcessOn'];
			if (willprocessOn !== undefined || willprocessOn !== null) {
				date = new Date(willprocessOn.substring(0, 4), willprocessOn.substring(4, 6) - 1, willprocessOn.substring(6, 8));
			}
			$('#transferverify-date').hide();
			$('#transferverify-datechanged').empty();
			$('#transferverify-datechanged').show();
			$('#transferverify-datechangedmsg').show();
			var dt = '<span style="color:red">' + date.toDateString() + '<sup>*</sup></span>';
			$('#transferverify-datechanged').append(dt);
			currentSession.transfer.dueDateAsCal = getAxisDate(date);
		} else {
			$('#transferverify-date').text(date.toDateString());
			$('#transferverify-datechanged').empty();
			$('#transferverify-datechanged').hide();
			$('#transferverify-datechangedmsg').hide();
			$('#transferverify-date').show();
		}

		$('#transferverify-from').text(currentSession.transfer.fromAccount.getAccountNameAndNumber());
		$('#transferverify-to').text(currentSession.transfer.toAccount.getAccountNameAndNumber());
		$('#transferverify-amount').text(formatAmount(currentSession.transfer.amount));

		$.mobile.changePage("#transferverify");

	}
}

function processTransferResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var status = $xml.find("ns1\\:status,status").text();
	var dueDateAsCal = $xml.find("ns1\\:dueDateAsCal,dueDateAsCal").text();
	var date = convertAxisDate(dueDateAsCal);
	currentSession.transfer.status = status;
	currentSession.transfer.referenceId = $xml.find("ns1\\:referenceId,referenceId").text();
	$('#transferconfirm-date').text(date.toDateString());
	$('#transferconfirm-from').text(currentSession.transfer.fromAccount.getAccountNameAndNumber());
	$('#transferconfirm-to').text(currentSession.transfer.toAccount.getAccountNameAndNumber());
	$('#transferconfirm-amount').text(formatAmount(currentSession.transfer.amount));
	$('#transferconfirm-ref').text(currentSession.transfer.referenceId);
	$('#transferconfirm-status').text(currentSession.transfer.status);

	currentSession.transfer = new MBTransfer();
	$("#transfer-fromaccount").val('');
	$("#transfer-fromaccount option:selected").remove();
	$("#transfer-fromaccount").empty();
	$("#transfer-toaccount").val('');
	$("#transfer-toaccount option:selected").remove();
	$("#transfer-toaccount").empty();
	$("#transfer-amount").val('');
	$("#transfer-date").val('');

	$.mobile.changePage("#transferconfirm");

	hidePleaseWait();
}

function processGenerateMobileTokenForWiresResponse(response, textStatus, jqXHR) {
	hidePleaseWait();
}

function processAuthorizeWireDecisionResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	currentSession.wireAuthenticated = true;

	$.mobile.changePage("#wiresverify");
	hidePleaseWait();
}

function processSubmitWireDecisionResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $return = $xml.find("ns1\\:return,return");
	var $wireDecisions = $return.find("ns1\\:wireDecisions,wireDecisions");
	var $wireDecision = $xml.find("ns0\\:wireDecision,wireDecision");

	var held = 0;
	var released = 0;
	var rejected = 0;

	$wireDecision.each(function() {
		var decision = $(this).find("ns0\\:decision,decision").text();
		if (decision === 'Hold')
			held = held + 1;
		else if (decision === 'Reject')
			rejected = rejected + 1;
		else if (decision === 'Release')
			released = released + 1;
	});

	currentSession.wires_release_count = held;
	$("#wiresreleasedate").text('Your wire decisions were submitted at ' + dateFormat(new Date(), "h:MM TT") + ' ET');
	$("#wiresreleasecount").text(released);
	$("#wiresholdcount").text(held);
	$("#wiresrejectcount").text(rejected);

	$.mobile.changePage("#wiresconfirm");

	hidePleaseWait();
}

function processGetLockedUsersResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);

	var $lockedUsers = $xml.find("ns1\\:return,return");
	currentSession.lockedUsers.splice(0, currentSession.lockedUsers.length);

	$lockedUsers.each(function() {
		var user = new MBUser();
		user.userId = $(this).find("ns1\\:username,username").text();
		user.firstName = $(this).find("ns1\\:firstname,firstname").text();
		user.lastName = $(this).find("ns1\\:lastname,lastname").text();
		currentSession.lockedUsers.push(user);
	});

	$.mobile.changePage("#lockedusersview");

	hidePleaseWait();
}

function processUnlockUserResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $unlockedUsers = $xml.find("ns1\\:return,return");
	$unlockedUsers.each(function() {
		var userId = $(this).find("ns1\\:username,username").text();
		var lockedUsers = currentSession.lockedUsers;
		for (var i = 0; i < lockedUsers.length; i++) {
			if (lockedUsers[i].userId === userId) {
				currentSession.lockedUsers.splice(i, 1);
				currentSession.user_lock_count = currentSession.user_lock_count - 1;
				break;
			}
		}
	});

	var $lockedusersviewlist = $("#lockedusersviewlist");
	$lockedusersviewlist.remove("li");
	if (currentSession.lockedUsers.length > 0) {
		$("#lockeduserstext").hide();
		$("#lockeduserstable").show();

		var summary = '<li data-theme="b" data-role="list-divider"><strong>Unlock Users</strong></li>';

		for (var i = 0; i < currentSession.lockedUsers.length; i++) {
			summary += '<li><a href="#"><h4>' + currentSession.lockedUsers[i].userId + '</h4>';
			var fullname = '';
			if (currentSession.lockedUsers[i].firstName !== null && currentSession.lockedUsers[i].firstName !== undefined)
				fullname += currentSession.lockedUsers[i].firstName;
			if (currentSession.lockedUsers[i].lastName !== null && currentSession.lockedUsers[i].lastName !== undefined)
				fullname += ' ' + currentSession.lockedUsers[i].lastName;
			summary += '<p>' + fullname + '</p></a>';
			summary += '<a href="#" id="' + currentSession.lockedUsers[i].userId + '">Unlock</a>';
			summary += '</li>';
		}

		$lockedusersviewlist.html(summary);
		$lockedusersviewlist.listview('refresh');
	} else {
		$("#lockeduserstext").show();
		$("#lockeduserstext").text('No users to unlock');
		$("#lockeduserstable").hide();
	}

	hidePleaseWait();
}

function processGetPendingDepositDataResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);

	hidePleaseWait();
}

function processGetRemoteDepositHistoryResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $remoteDeposits = $xml.find("ns1\\:return,return");
	currentSession.remoteDeposits.splice(0, currentSession.remoteDeposits.length);
	$remoteDeposits.each(function() {
		currentSession.remoteDeposits.push(new MBRemoteDeposit($(this)));
	});

	//$.mobile.changePage("#remotedeposithistory");
	showRemoteDepositHistory();

	hidePleaseWait();
}

function processGetRemoteDepositHistoryImagesResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $images = $xml.find("ns1\\:return,return");
	frontImage = undefined;
	backImage = undefined;
	$images.each(function() {
		if (frontImage === undefined || frontImage === null || frontImage === '')
			frontImage = $(this).find("ns1\\:frontImageEncoded,frontImageEncoded").text();
		if (backImage === undefined || backImage === null || backImage === '')
			backImage = $(this).find("ns1\\:backImageEncoded,backImageEncoded").text();
	});

	$("#rdmcheckfront").children().remove();
	$("#rdmcheckback").children().remove();
	var imgF = '<img src="data:image/jpeg;base64,' + frontImage + '" style="width: 100%"/>';
	$("#rdmcheckfront").append(imgF);
	var imgB = '<img src="data:image/jpeg;base64,' + backImage + '"  style="width: 100%"/>';
	$("#rdmcheckback").append(imgB);

	$.mobile.changePage("#depositcheckimage");

	hidePleaseWait();
}

function processMarkMessageReadResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $response = $xml.find("ns1\\:return,return").text();
	hidePleaseWait();
	if ($response === 'success') {
		var messages = currentSession.messages;
		for (var i = 0; i < messages.length; i++) {
			if (currentSession.selectedmessage.messageId === messages[i].messageId) {
				//currentSession.messages.splice(i, 1);
				currentSession.unread_messages_count = currentSession.unread_messages_count - 1;
				currentSession.selectedmessage.status = 'read';
				break;
			}
		}
	}
}

function processMarkAlertReadResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $response = $xml.find("ns1\\:return,return").text();
	hidePleaseWait();
	if ($response === 'success') {
		var alerts = currentSession.alerts;
		for (var i = 0; i < alerts.length; i++) {
			if (currentSession.selectedalert.messageId === alerts[i].messageId) {
				//currentSession.messages.splice(i, 1);
				currentSession.unread_alerts_count = currentSession.unread_alerts_count - 1;
				currentSession.selectedalert.status = 'read';
				break;
			}
		}
	}
}

function processDeleteMessageResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $response = $xml.find("ns1\\:return,return").text();

	if ($response === 'success') {
		var messages = currentSession.messages;
		for (var i = 0; i < messages.length; i++) {
			if (currentSession.selectedmessage.messageId === messages[i].messageId) {
				if (currentSession.selectedmessage.status !== 'read') {
					currentSession.unread_messages_count = currentSession.unread_messages_count - 1;
				}
				messages.splice(i, 1);
				break;
			}
		}
		/*$.mobile.changePage("#messages", {
		 transition : "slide",
		 reverse: true,
		 changeHash: false
		 });*/
		var currPage = $.mobile.activePage.attr('id');
		if (currPage !== 'messages') {
			$.mobile.back();
		}
	}

	hidePleaseWait();
}

function processDeleteAlertResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $response = $xml.find("ns1\\:return,return").text();
	if ($response === 'success') {

		var alerts = currentSession.alerts;
		for (var i = 0; i < alerts.length; i++) {
			if (currentSession.selectedalert.messageId === alerts[i].messageId) {
				if (currentSession.selectedalert.status !== 'read') {
					currentSession.unread_alerts_count = currentSession.unread_alerts_count - 1;
				}
				alerts.splice(i, 1);
				break;
			}
		}
		/*$.mobile.changePage("#alerts", {
		 transition : "slide",
		 reverse: true,
		 changeHash: false
		 });*/
		var currPage = $.mobile.activePage.attr('id');
		if (currPage !== 'alerts') {
			$.mobile.back();
		}
	}

	hidePleaseWait();
}

function processGetWireTemplatesResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $templates = $xml.find("ns1\\:return,return");
	currentSession.wireTemplates.splice(0, currentSession.wireTemplates.length);
	$templates.each(function() {
		currentSession.wireTemplates.push(new MBWireTemplate($(this)));
	});
	$.mobile.changePage("#wiretemplates");
	hidePleaseWait();
}

function processLoadWireTemplateResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $template = $xml.find("ns1\\:return, return");
	var wireTemplate = new MBWireTemplate($template);
	if (wireTemplate !== null) {
		currentSession.selectedWireTemplate.debitAcctNum = wireTemplate.debitAcctNum;
		currentSession.selectedWireTemplate.creditAcctNum = wireTemplate.creditAcctNum;
		//currentSession.selectedWireTemplate.wireDateAsCal = getAxisDate(new Date());
		var extra = currentSession.selectedWireTemplate.extra.extra;
		for (var key in wireTemplate.extra.extra) {
			if (wireTemplate.extra.extra.hasOwnProperty(key)) {
				extra[key] = wireTemplate.extra.extra[key];
			}
		}
		currentSession.selectedWireTemplate.extra.extra = extra;
	}

	$.mobile.changePage("#loadwiretemplate");
	hidePleaseWait();
}

function processVerifyWireTransferResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var extra = new MBExtraMap($xml.find("ns1\\:entry,entry"));
	if (extra.extra["message"] !== undefined && extra.extra["message"] !== null && extra.extra["message"] !== '') {
		$("#datechangetext").text(extra.extra["message"]);
		$("#datechangetext").show();
		var date = new Date(getDateFromYYYYMMDD(extra.extra["newDate"]));
		currentSession.selectedWireTemplate.wireDateAsCal = getAxisDate(date);
		$("#wiretemplateverifyvaluedate").addClass('red-text');
	} else {
		$("#datechangetext").text("");
		$("#datechangetext").hide();
		$("#wiretemplateverifyvaluedate").removeClass('red-text');
	}

	$.mobile.changePage("#verifywiretransfer");
	hidePleaseWait();
}

function processCreateWireTransferResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);

	var $wire = $xml.find("ns1\\:return, return");
	var status = $wire.find("ns1\\:status, status").text();
	$("#wiretemplateconfirm").text(status);
	currentSession.selectedWireTemplate = null;
	$('#wire-date').data('datebox').theDate = new Date();

	var dateStr = dateFormat(new Date(), 'mmmm dd, yyyy');
	$('#wire-date').val(dateStr);
	$('#wire-date').trigger('calbox', {
		'method' : 'set',
		'value' : dateStr
	});

	$.mobile.changePage("#confirmwiretransfer");
	hidePleaseWait();
}

function processSendMessageResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	$("#securemailbody").val("");
	$.mobile.back();
	hidePleaseWait();
}

function processSendReplyResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	$("#securereplybody").val("");
	$.mobile.back();
	hidePleaseWait();
}

function processGetPositivePaySuspectsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $suspects = $xml.find("ns1\\:return, return");

	currentSession.ppaySuspects.splice(0, currentSession.ppaySuspects.length);
	$suspects.each(function() {
		currentSession.ppaySuspects.push(new MBPositivePaySuspect($(this)));
	});

	$.mobile.changePage("#positivepaysuspects");
	hidePleaseWait();
}

function processSubmitPositivePayDecisionsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $return = $xml.find("ns1\\:return, return");
	var $decisions = $xml.find("ns1\\:positivePayDecisions, positivePayDecisions");
	var $decisionItems = $xml.find("ns0\\:positivePayDecision, positivePayDecision");

	$decisionItems.each(function() {
		var id = $(this).find("ns0\\:id,id").text();
		var decision = $(this).find("ns0\\:decision,decision").text();
		var status = $(this).find("ns0\\:status,status").text();
		for (var i = 0; i < currentSession.ppaySuspects.length; i++) {
			if (id === currentSession.ppaySuspects[i].id) {
				currentSession.ppaySuspects[i].code = decision;
				currentSession.ppaySuspects[i].status = status;
				break;
			}
		}
	});

	$.mobile.changePage("#positivepayconfirm");

	hidePleaseWait();
}

function processGetCheckImageResponse(response, textStatus, jqXHR) {
	$("#ppaycheckfront").empty();
	$("#ppaycheckback").empty();
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $return = $xml.find("ns1\\:return,return");
	frontImage = $return.find("ns1\\:frontImage,frontImage").text();
	backImage = $return.find("ns1\\:backImage,backImage").text();

	var imgF = '<img src="data:image/jpeg;base64,' + frontImage + '" />';
	$("#ppaycheckfront").append(imgF);
	var imgB = '<img src="data:image/jpeg;base64,' + backImage + '" />';
	$("#ppaycheckback").append(imgB);
	
	$("#ppaycheckfront").die().live("click", function() {
		var img = '<img src="data:image/jpeg;base64,' + frontImage + '" />';
		$("#ppaycheckdetail").append(imgF);
		$.mobile.changePage("#ppaycheckimagedetail");
	});

	$("#ppaycheckback").die().live("click", function() {
		var img = '<img src="data:image/jpeg;base64,' + backImage + '" />';
		$("#ppaycheckdetail").append(img);
		$.mobile.changePage("#ppaycheckimagedetail");
	});

	$.mobile.changePage("#ppaycheckimage");

	hidePleaseWait();
}

/*function processGetRDCAccountsResponse(response, textStatus, jqXHR) {
 var xml = jqXHR.responseText;
 log(xml);
 var xmlDoc = $.parseXML(xml);
 var $xml = $(xmlDoc);
 var $ezdaccounts = $xml.find("ns1\\:return,return");
 currentSession.ezdaccounts.splice(0, currentSession.ezdaccounts.length);
 $ezdaccounts.each(function() {
 var ezdAccount = MBEZDAccount.fromXML($(this));
 if (ezdAccount !== null) {
 currentSession.ezdaccounts.push(ezdAccount);
 }
 });

 //$.mobile.changePage("#remotedepositloc");

 hidePleaseWait();
 }*/

function processGetRDCLocationsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $ezdlocations = $xml.find("ns1\\:return,return");
	currentSession.ezdlocations.splice(0, currentSession.ezdlocations.length);
	$ezdlocations.each(function() {
		var ezdlocation = MBEZDLocation.fromXML($(this));
		if (ezdlocation !== null) {
			currentSession.ezdlocations.push(ezdlocation);
		}
	});
	
	hidePleaseWait();
	if(currentSession.ezdlocations.length > 0) {
		$.mobile.changePage("#remotedepositoptions");
		//MBAccountConnector.sendGetRDCPendingDepositsRequest(currentSession.mbUser);
	} else {
		//displayPopupAlert("Information", "Location(s) not configured. Please contact your administrator.", "#dashboard");
		$.mobile.changePage("#ezdnolocations");
	}
}

function processGetRDCPendingDepositsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $pendingdeposits = $xml.find("ns1\\:return,return");
	currentSession.ezdPendingDeposits.splice(0, currentSession.ezdPendingDeposits.length);
	$pendingdeposits.each(function() {
		var ezdDeposit = MBEZDPendingDeposit.fromXML($(this));
		if (ezdDeposit !== null) {
			currentSession.ezdPendingDeposits.push(ezdDeposit);
		}
	});

	//$.mobile.changePage("#remotedepositoptions");
	showRemoteDepositOptions();

	hidePleaseWait();
}

function processGetRDCAccountsResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $ezdaccounts = $xml.find("ns1\\:return,return");
	currentSession.ezdaccounts.splice(0, currentSession.ezdaccounts.length);
	$ezdaccounts.each(function() {
		var ezdAccount = MBEZDAccount.fromXML($(this));
		if (ezdAccount !== null) {
			currentSession.ezdaccounts.push(ezdAccount);
		}
	});

	showEZDAccounts();
	hidePleaseWait();
}

function processRDCSubmitDepositResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $return = $xml.find("ns1\\:return,return");
	hidePleaseWait();
	if($return) {
		var $processingStatus = $return.find("ns1\\:processingStatus,processingStatus");
		var code = new Number($processingStatus.find("ns1\\:code,code").text());
		var description = $processingStatus.find("ns1\\:description,description").text();
		var txt = null;
		var title = null;
		if(code >= 0) {
			var isComplete = $return.find("ns1\\:isComplete,isComplete").text();
			var ppExpExists = $return.find("ns1\\:postProcessorException_exceptionExists,postProcessorException_exceptionExists").text();
			if(isComplete === "true" && ppExpExists === "false") {
				title = "Deposit Successful.";
				txt = "Please check the deposit history to view your deposited checks.";
				//displayPopupAlert("Information", "Deposit was successful. Please check the deposit history to view your deposited checks", "#remotedepositoptions");
			} else if (isComplete === "false") {
				title = "Deposit Successful.";
				txt = "Transaction in process.  Please review Deposit History.";
				//displayPopupAlert("Information", "Transaction in process.  Please review Deposit History", "#remotedepositoptions");
			} else if(isComplete === "true" && ppExpExists === "true") {
				var expDesc = $return.find("ns1\\:postProcessorException_exceptionDescription,postProcessorException_exceptionDescription").text();
				var processor = $return.find("ns1\\:postProcessorException_postProcessor,postProcessorException_postProcessor").text();
				title = "Deposit not successful.";
				txt = "Deposit failed for the following reason: " + expDesc + " PostProcessor: " + processor + ".";
				//displayPopupAlert("Error", "Deposit failed for the following reason: " + expDesc + " PostProcessor: " + processor, "#remotedepositoptions");
			}
		} else {
			title = "Deposit not successful.";
			txt = "Deposit failed for the following reason: " + description + " Error Code: " + code + ".";
			//displayPopupAlert("Error", "Deposit failed for the following reason: " + description + " Error Code: " + code, "#remotedepositoptions");
		}
		if(phoneGapContainer) {
			$("#pgdepositchecktitle").text(title);
			$("#pgdepositcheckmessage").text(txt);
			$("#pgdepositchecktoacct").text($("#pgezdaccounts option:selected").text());
			$("#pgdepositcheckamt").text(accounting.formatMoney($("#pgezdamount").val()));
			$.mobile.changePage("#pgdepositcheckconfirmation");
		} else {
			$("#depositchecktitle").text(title);
			$("#depositcheckmessage").text(txt);
			$("#depositchecktoacct").text($("#ezdaccounts option:selected").text());
			$("#depositcheckamt").text(accounting.formatMoney($("#ezdamount").val()));
			$.mobile.changePage("#depositcheckconfirmation");
		}
		
	}
}

function processRDCReSubmitDepositResponse(response, textStatus, jqXHR) {
	var xml = jqXHR.responseText;
	log(xml);
	var xmlDoc = $.parseXML(xml);
	var $xml = $(xmlDoc);
	var $return = $xml.find("ns1\\:return,return");
	hidePleaseWait();
	if($return) {
		var $processingStatus = $return.find("ns1\\:processingStatus,processingStatus");
		var code = new Number($processingStatus.find("ns1\\:code,code").text());
		var description = $processingStatus.find("ns1\\:description,description").text();
		currentSession.ezdPendingDeposits.splice(currentSession.selectedPendingDeposit, 1);
		var showMessage2 = false;
		if(currentSession.ezdPendingDeposits.length === 0) {
			showMessage2 = true;
		}
		if(code >= 0) {
			var isComplete = $return.find("ns1\\:isComplete,isComplete").text();
			var ppExpExists = $return.find("ns1\\:postProcessorException_exceptionExists,postProcessorException_exceptionExists").text();
			if(isComplete === "true" && ppExpExists === "false") {
				displayPopupAlert2("Information", "Deposit was successful. Please check the deposit history to view your deposited checks", 
					"No more Pending Deposits", "#remotedepositoptions", showMessage2);
			} else if (isComplete === "false") {
				displayPopupAlert2("Information", "Transaction in process.  Please review Deposit History", 
				    "No more Pending Deposits", "#remotedepositoptions", showMessage2);
			} else if(isComplete === "true" && ppExpExists === "true") {
				var expDesc = $return.find("ns1\\:postProcessorException_exceptionDescription,postProcessorException_exceptionDescription").text();
				var processor = $return.find("ns1\\:postProcessorException_postProcessor,postProcessorException_postProcessor").text();
				displayPopupAlert2("Error", "Deposit failed for the following reason: " + expDesc + " PostProcessor: " + processor, 
				     "No more Pending Deposits", "#remotedepositoptions", showMessage2);
			}
		} else {
			displayPopupAlert2("Error", "Deposit failed for the following reason: " + description + " Error Code: " + code, 
			         "No more Pending Deposits", "#remotedepositoptions", showMessage2);
		}
		showPendingDeposits();
	}
}

function processLogoutResponse(response, textStatus, jqXHR) {
	clearInterval(intervalID);
	hidePleaseWait();
	$('body').removeClass('ui-loading');
	log(jqXHR.responseText);

	$.mobile.changePage("#start");
}

function processHandleError(response) {
	hidePleaseWait();
	log(response.responseText);
	xmlDoc = $.parseXML(response.responseText);
	$xml = $(xmlDoc);
	errormessage = "";
	errormessage = $xml.find("ns0\\:message,message").text();
	var errorCode = $xml.find("ns0\\:errorCode,errorCode").text();
	if (errormessage === "" || errormessage === undefined || errormessage === null) {
		errormessage = "Unable to process your request at this time. Please try again later.";
	}
	if (errorCode === '991005'){
		$.mobile.changePage("#lockoutdialog", {
			role : "dialog",
			reverse : false
		});
	} else if (errorCode === '9276679') {
		 $('<div>').simpledialog2({
						themeHeader : "f",
						mode : 'button',
						headerText : "Error",
						headerClose : false,
						buttonPrompt : errormessage,
						buttons : {
							'OK' : {
								click : function() {
									MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
								},
								icon : false,
								theme : "c"
							}
						}
			});	
	} else {
		if (errormessage !== "" && errormessage !== undefined && errormessage !== null)
			/*$.mobile.changePage("#messagedialog", {
				role : "popup",
				reverse : false
			});*/
			$('<div>').simpledialog2({
						themeHeader : "f",
						mode : 'button',
						headerText : "Error",
						headerClose : false,
						buttonPrompt : errormessage,
						buttons : {
							'OK' : {
								click : function() {
								},
								icon : false,
								theme : "c"
							}
						}
					});			
	}
}

function processLogoutError(response) {
	clearInterval(intervalID);
	hidePleaseWait();
	log(response.responseText);
	$.mobile.changePage("#start");
}

function processHandleRDCError(response) {
	hidePleaseWait();
	log(response.responseText);
	xmlDoc = $.parseXML(response.responseText);
	$xml = $(xmlDoc);
	errormessage = "";
	errormessage = $xml.find("ns0\\:message,message").text();
	var errorCode = $xml.find("ns0\\:errorCode,errorCode").text();
	if (errormessage === "" || errormessage === undefined || errormessage === null) {
		errormessage = "Unable to process your request at this time. Please try again later.";
	}
	$('<div>').simpledialog2({
		themeHeader : "f",
		mode : 'button',
		headerText : "Error",
		headerClose : false,
		buttonPrompt : errormessage,
		buttons : {
			'OK' : {
				click : function() {
					$.mobile.changePage("#remotedepositoptions");
				},
				icon : false,
				theme : "c"
			}
		}
	});			
}

function processHandleRDCSubmitError(response) {
	hidePleaseWait();
	log(response.responseText);
	xmlDoc = $.parseXML(response.responseText);
	$xml = $(xmlDoc);
	errormessage = "";
	errormessage = $xml.find("ns0\\:message,message").text();
	var errorCode = $xml.find("ns0\\:errorCode,errorCode").text();
	if (errormessage === "" || errormessage === undefined || errormessage === null) {
		errormessage = "Unable to process your request at this time. Please try again later.";
	}
	
	if(phoneGapContainer) {
		$("#pgdepositchecktitle").text("Deposit not successful.");
		$("#pgdepositcheckmessage").text(errormessage);
		$("#pgdepositchecktoacct").text($("#pgezdaccounts option:selected").text());
		$("#pgdepositcheckamt").text(accounting.formatMoney($("#pgezdamount").val()));

		$.mobile.changePage("#pgdepositcheckconfirmation");
	} else {
		$("#depositchecktitle").text("Deposit not successful.");
		$("#depositcheckmessage").text(errormessage);
		$("#depositchecktoacct").text($("#ezdaccounts option:selected").text());
		$("#depositcheckamt").text(accounting.formatMoney($("#ezdamount").val()));
		
		$.mobile.changePage("#depositcheckconfirmation");
	}
	
		
}

/*----------------------------------------------------------------------------------------------------------------------*/

function showTransactions() {
	if (currentSession.transactions.length > 0) {
		currentSession.transaction = currentSession.transactions[0];
		//get the first transaction
		var dates = currentSession.transaction.extra.extra["availDates"];
		if (dates !== undefined || dates !== '') {
			currentSession.availableDates = dates.split(",");
		}
		if (currentSession.transaction.transDateAsCal === undefined || currentSession.transaction.transDateAsCal === "" || currentSession.transaction.transDateAsCal.substring(0, 2) === "0:") {
			currentSession.transactions.splice(0, 1);
		}
	}

	if (currentSession.transactions.length > 0) {
		$('#histMessageText').hide();
		$('#transactionList').show();
		$('#lvtransactions li').die();
		$('#lvtransactions li').remove();
		var data = '';
		if (currentSession.transactions.length > 0) {
			var date = currentSession.availableDates[currentSession.selectedHistoryDay].substring(0, 8);
			var headerDate = dateFormat(new Date(getDateFromYYYYMMDD(date)), "mmmm d, yyyy");
			data += '<li data-role="list-divider">' + headerDate + '</li>';
		}

		for (var i = 0; i < currentSession.transactions.length; i++) {
			var trans = currentSession.transactions[i];
			data += '<li data-icon="carrot"><a href="#transactiondetail">';
			data += '<span>' + trans.description + '</span>';
			if (trans.amount.indexOf("-") !== -1) {
				data += '<span class="ui-li-aside" style="color:red">' + accounting.formatMoney(trans.amount) + '</span>';
			} else {
				data += '<span class="ui-li-aside">' + accounting.formatMoney(trans.amount) + '</span>';
			}
			data += '</a></li>';
		}

		var firstTrans = currentSession.transactions[0];
		if (firstTrans.extra.extra["hasMore"] === "true") {
			data += '<li data-icon="false"><a href="#"><span>Load More...</span></a></li>';
		}

		$("#lvtransactions").html(data);
		$("#lvtransactions").listview('refresh');
		$('#lvtransactions li').die().live("click", function() {
			var selected_index = $(this).index() - 1;
			if (selected_index === currentSession.transactions.length) {
				MBAccountConnector.sendLoadMoreTransactionsRequest(currentSession.availableDates[currentSession.selectedHistoryDay], currentSession.mbUser, currentSession.account);
			} else {
				currentSession.selectedtransaction = currentSession.transactions[selected_index];
				currentSession.selectedtransactionIndex = selected_index;
			}
		});

	} else {
		$('#transactionList').hide();
		$('#histMessageText').show();
		if (currentSession.transaction !== undefined) {
			var message = currentSession.transaction.extra.extra["desc"];
			if (message === undefined) {
				$('#histMessageText').text("No Data Available");
			} else {
				$('#histMessageText').text(message);
			}
		}
	}
}

function formatMessageDate(msgDate) {
	var now = new Date();
	now.setHours(0);
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);
	var itemDate = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate(), 0, 0, 0, 0);

	//var diffSeconds = (now.getTime()-msgDate.getTime())/1000;
	var diffSeconds = (now.getTime() - itemDate.getTime()) / 1000;
	var diffDays = Math.floor(diffSeconds / 86400);
	var timeOfDay = dateFormat(msgDate, "h:MM TT");

	if (diffDays === 0)
		return "Today " + timeOfDay;
	if (diffDays === 1)
		return "Yesterday " + timeOfDay;

	if (diffDays <= 5) {
		return dateFormat(msgDate, "dddd h:MM TT");
	}

	return dateFormat(msgDate, "mm/dd/yy h:MM TT");
}

function showAlerts() {

	var $alertlist = $("#alertlist");
	$('#alertlist li').die();
	$alertlist.children().remove();

	var data = '';

	if(currentSession.alerts.length > 0) {
		$("#noalertsmsg").hide();
	} else {
		$("#noalertsmsg").show();
	}
	
	for (var i = 0; i < currentSession.alerts.length; i++) {
		var alert = currentSession.alerts[i];
		var id = "alrt-" + i;
		data += '<li><a href="#" id="' + id + '">';
		var opacity = '';
		if (alert.status === 'read') {
			opacity = 'imgOpacity';
		}
		data += '<img src="images/icon-alert.png" class="ui-li-icon ' + opacity + '" alt=""/>';
		data += '<h4>' + alert.from + '</h4>';
		//data += '<p><div class="ui-li-aside grid-label">' + dateFormat(alert.date, "mm/dd/yy h:MM TT") + '</div></p>';
		data += '<p><div class="ui-li-aside grid-label">' + formatMessageDate(alert.date) + '</div></p>';
		data += '<p>' + alert.subject + '</p>';
		data += '<p>' + alert.body + '</p>';
		data += '</a>';
		id = 'alrtdel-' + i;
		data += '<a href="#" id="' + id + '">Delete</a>';
		data += '</li>';
	}

	$alertlist.html(data);
	$alertlist.listview('refresh');

	$('#alertlist li .ui-li-link-alt').die().live('click', function() {
		var index = $(this).attr("id");
		var hyphenIndex = index.indexOf("-") + 1;
		index = index.substring(hyphenIndex);
		if (currentSession.alerts.length > 0) {
			currentSession.selectedalertIndex = new Number(index);
			currentSession.selectedalert = currentSession.alerts[currentSession.selectedalertIndex];
			MBAccountConnector.sendDeleteMessageRequest(currentSession.mbUser, currentSession.selectedalert, true);
			$(this).parent("li").remove();
		}
	});

	$('#alertlist li a.ui-link-inherit').die().live('click', function() {
		var index = $(this).attr("id");
		var hyphenIndex = index.indexOf("-") + 1;
		index = index.substring(hyphenIndex);
		if (currentSession.alerts.length > 0) {
			currentSession.selectedalertIndex = new Number(index);
			currentSession.selectedalert = currentSession.alerts[currentSession.selectedalertIndex];
			$.mobile.changePage("#alertdetail");
		}
	});
}

function showAlertDetail() {
	var header = 'Alert ' + (currentSession.selectedalertIndex + 1) + ' of ' + currentSession.alerts.length;
	$("#alertdetailheader").text(header);
	$("#alertsubject").text(currentSession.selectedalert.subject);
	//$("#alertdate").text(dateFormat(currentSession.selectedalert.date, "mm/dd/yy h:MM TT"));
	$("#alertdate").text(formatMessageDate(currentSession.selectedalert.date));
	$("#alertinfobody").text(currentSession.selectedalert.body);
	if (currentSession.selectedalert.status !== "read") {
		MBAccountConnector.sendMarkMessageReadRequest(currentSession.mbUser, currentSession.selectedalert, true);
	}
	$("#nextalertbutton").unbind().bind('click', function() {
		if (currentSession.selectedalertIndex < currentSession.alerts.length - 1) {
			currentSession.selectedalertIndex += 1;
			currentSession.selectedalert = currentSession.alerts[currentSession.selectedalertIndex];
			showAlertDetail();
		}
	});

	$("#prevalertbutton").unbind().bind('click', function() {
		if (currentSession.selectedalertIndex > 0) {
			currentSession.selectedalertIndex -= 1;
			currentSession.selectedalert = currentSession.alerts[currentSession.selectedalertIndex];
			showAlertDetail();
		}
	});
}

function showMessages() {
	$("#allmessages").children().remove();
	$('#messagelist li').die();
	
	if(currentSession.messages.length > 0) {
		$("#nomessagesmsg").hide();	
	} else {
		$("#nomessagesmsg").show();
	}
	
	
	var data = '<ul data-role="listview" data-inset="false" data-split-theme="d" data-split-icon="delete" id="messagelist">';
	for (var i = 0; i < currentSession.messages.length; i++) {
		var message = currentSession.messages[i];
		var id = 'msg-' + i;
		data += '<li><a href="#" id="' + id + '">';
		var opacity = '';
		if (message.status === 'read') {
			opacity = 'imgOpacity';
		}
		data += '<img src="images/icon-msg.png" class="ui-li-icon ' + opacity + '" alt=""/>';
		data += '<h4>' + message.from + '</h4>';
		//data += '<p><div class="ui-li-aside grid-label">' + dateFormat(message.date, "mm/dd/yy h:MM TT") + '</div></p>';
		data += '<p><div class="ui-li-aside grid-label">' + formatMessageDate(message.date) + '</div></p>';
		data += '<p>' + message.subject + '</p>';
		data += '<p>' + message.body + '</p>';
		data += '</a>';
		id = 'msgdel-' + i;
		data += '<a href="#" id="' + id + '">Delete</a>';
		data += '</li>';
	}
	data += '</ul>';

	$("#allmessages").append(data);
	$("#messagelist").listview();

	$('#messagelist li .ui-li-link-alt').die().live('click', function() {
		var index = $(this).attr("id");
		var hyphenIndex = index.indexOf("-") + 1;
		index = index.substring(hyphenIndex);
		if (currentSession.messages.length > 0) {
			currentSession.selectedmessageIndex = new Number(index);
			currentSession.selectedmessage = currentSession.messages[currentSession.selectedmessageIndex];
			MBAccountConnector.sendDeleteMessageRequest(currentSession.mbUser, currentSession.selectedmessage, false);
			$(this).parent("li").remove();
		}
	});

	$('#messagelist li a.ui-link-inherit').die().live('click', function() {
		var index = $(this).attr("id");
		var hyphenIndex = index.indexOf("-") + 1;
		index = index.substring(hyphenIndex);
		if (currentSession.messages.length > 0) {
			currentSession.selectedmessageIndex = new Number(index);
			currentSession.selectedmessage = currentSession.messages[currentSession.selectedmessageIndex];
			$.mobile.changePage("#messagedetail");
		}
	});

	/*$('#messagelist li').live('click', function() {
	 var index = $(this).index();
	 if (currentSession.messages.length > 0) {
	 currentSession.selectedmessage = currentSession.messages[index];
	 currentSession.selectedmessageIndex = index;
	 $.mobile.changePage("#messagedetail", {
	 transition : "slide"
	 });
	 }
	 });*/
}

function showMessageDetail() {

	var header = 'Message ' + (currentSession.selectedmessageIndex + 1) + ' of ' + currentSession.messages.length;
	$("#messagedetailheader").text(header);
	$("#messagesubject").text(currentSession.selectedmessage.subject);
	//$("#messagedate").text(dateFormat(currentSession.selectedmessage.date, "mm/dd/yy h:MM TT"));
	$("#messagedate").text(formatMessageDate(currentSession.selectedmessage.date));
	$("#messageinfobody").text(currentSession.selectedmessage.body);
	if (currentSession.selectedmessage.status !== "read") {
		MBAccountConnector.sendMarkMessageReadRequest(currentSession.mbUser, currentSession.selectedmessage, false);
	}

	$("#nextmsgbutton").unbind().bind('click', function() {
		if (currentSession.selectedmessageIndex < currentSession.messages.length - 1) {
			currentSession.selectedmessageIndex += 1;
			currentSession.selectedmessage = currentSession.messages[currentSession.selectedmessageIndex];
			showMessageDetail();
		}
	});

	$("#prevmsgbutton").unbind().bind('click', function() {
		if (currentSession.selectedmessageIndex > 0) {
			currentSession.selectedmessageIndex -= 1;
			currentSession.selectedmessage = currentSession.messages[currentSession.selectedmessageIndex];
			showMessageDetail();
		}
	});

}

function showCurrentDayDetails() {
	//currentSession.account
	$("#currentdaydetailheading").text(currentSession.account.getAccountNameAndNumber() + ' (' + currentSession.account.extra.extra['currency'] + ')');

	$("#lvcurrdaywires").children().remove('li');
	$("#lvcurrdaydis").children().remove('li');
	$("#lvcurrdayach").children().remove('li');
	$("#lvcurrdaywiresdate").text("");
	$("#lvcurrdaydisdate").text("");
	$("#lvcurrdayachdate").text("");

	var data = '';
	var temp = '';

	if (currentSession.mbSnapshot.wireTotals['totalCredits'] !== undefined && currentSession.mbSnapshot.wireTotals['totalCredits'] !== null) {
		data = '<li data-role="list-divider">Wire Transactions</li>';
		temp = currentSession.mbSnapshot.wireTotals['totalCredits'];

		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		data += '<li><span class="small-text">Number of Incoming Wires:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.wireTotals['totalCreditAmt'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">Total Credits:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.wireTotals['totalDebits'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		data += '<li><span class="small-text">Number of Outgoing Wires:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.wireTotals['totalDebitAmt'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">Total Debits:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		$("#lvcurrdaywires").html(data);
		$("#lvcurrdaywires").listview('refresh');

		if (currentSession.mbSnapshot.lastUpdate_Wires !== undefined && currentSession.mbSnapshot.lastUpdate_Wires !== "") {
			$("#lvcurrdaywiresdate").text("Last Update: " + formatSnapShotDate(currentSession.mbSnapshot.lastUpdate_Wires));
		} else {
			$("#lvcurrdaywiresdate").text("Last Update: No Data available");
		}

	}

	if (currentSession.mbSnapshot.cdTotals['firstDis'] !== undefined && currentSession.mbSnapshot.cdTotals['firstDis'] !== null) {
		data = '<li data-role="list-divider">Control Disbursement Totals</li>';
		temp = currentSession.mbSnapshot.cdTotals['firstDis'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">1<sup>st</sup> Presentment:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.cdTotals['secondDis'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">2<sup>nd</sup> Presentment:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.cdTotals['totalDis'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">Total Disbursements:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		$("#lvcurrdaydis").html(data);
		$("#lvcurrdaydis").listview('refresh');

		if (currentSession.mbSnapshot.lastUpdate_CD !== undefined && currentSession.mbSnapshot.lastUpdate_CD !== "") {
			$("#lvcurrdaydisdate").text("Last Update: " + formatSnapShotDate(currentSession.mbSnapshot.lastUpdate_CD));
		} else {
			$("#lvcurrdaydisdate").text("Last Update: No Data available");
		}
	}

	if (currentSession.mbSnapshot.achTotals['totalCredits'] !== undefined && currentSession.mbSnapshot.achTotals['totalCredits'] !== null) {
		data = '<li data-role="list-divider">ACH Transactions</li>';
		temp = currentSession.mbSnapshot.achTotals['totalCredits'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		data += '<li><span class="small-text">Number of Total Credits:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.achTotals['totalCreditAmt'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">Total Credits:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.achTotals['totalDebits'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		data += '<li><span class="small-text">Number of Total Debits:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		temp = currentSession.mbSnapshot.achTotals['totalDebitAmt'];
		if (temp === "" || temp === undefined)
			temp = 'N&#47;A';
		else
			temp = accounting.formatMoney(temp);
		data += '<li><span class="small-text">Total Debits:</span><p class=\"ui-li-aside\">' + temp + '</p></li>';
		$("#lvcurrdayach").html(data);
		$("#lvcurrdayach").listview('refresh');

		if (currentSession.mbSnapshot.lastUpdate_ACH !== undefined && currentSession.mbSnapshot.lastUpdate_ACH !== "") {
			$("#lvcurrdayachdate").text("Last Update: " + formatSnapShotDate(currentSession.mbSnapshot.lastUpdate_ACH));
		} else {
			$("#lvcurrdayachdate").text("Last Update: No Data available");
		}
	}

	$('body').removeClass('ui-loading');

	$('#lvcurrdaywires li').die().live('click', function() {
		MBAccountConnector.sendGetTransactionsRequest(currentSession.mbUser, currentSession.account);
	});

	$('#lvcurrdaydis li').die().live('click', function() {
		MBAccountConnector.sendGetTransactionsRequest(currentSession.mbUser, currentSession.account);
	});

	$('#lvcurrdayach li').die().live('click', function() {
		MBAccountConnector.sendGetTransactionsRequest(currentSession.mbUser, currentSession.account);
	});

}

function showPendingApprovals() {
	$('#pendingapprovalslist *').die('click');
	$("#pendingapprovalslist").children().remove();

	for (var i = 0; i < currentSession.pendingApprovals.length; i++) {
		var pendingApproval = currentSession.pendingApprovals[i];
		var data = '<ul data-role="listview" data-inset="true" id="' + pendingApproval.approvalId + '">';
		var hrefStart = ' ';
		var hRefEnd = ' ';
		if (pendingApproval.type !== 'Positive Pay Decision' && pendingApproval.type !== 'Positive Pay Issue' && pendingApproval.type !== 'Account Transfer') {
			hrefStart = '<a href="#approvaldetail">';
			hRefEnd = '</a>';
		}

		data += '<li data-icon="carrot">' + hrefStart + '<div class="ui-grid-a">';
		var dateLabel = null;
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision')
			dateLabel = 'Submit Date';
		else if (pendingApproval.type === 'Domestic Wire' || pendingApproval.type === 'Book Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type === 'Account Transfer')
			dateLabel = 'Effective Date';
		else if (pendingApproval.type === 'International Wire')
			dateLabel = 'Processing Date';
		else if (pendingApproval.type === 'Drawdown Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type.indexOf('Template') !== -1)
			dateLabel = 'Create Date';

		data += '<div class="ui-block-a"><span class="grid-label">' + dateLabel + ':</span></div>';
		var date = pendingApproval.extra.extra['dateDue'];
		if (date !== undefined)
			date = getDateFromYYYYMMDD(date);
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision' || pendingApproval.type === 'International Wire') {
			date = dateFormat(convertAxisDate(pendingApproval.date), "mm/dd/yyyy");
		}

		data += '<div class="ui-block-b"><span class="grid-label-normal">' + date + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Trans Type:</span></div>';

		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.type + '</span></div>';
		data += '</div>';

		if (pendingApproval.type !== "Positive Pay Issue" && pendingApproval.type !== "Positive Pay Decision" && pendingApproval.type !== "Account Transfer" && pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			if (pendingApproval.extra.extra['beneficiary'] === undefined)
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.beneficiary + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['beneficiary'] + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
			if (pendingApproval.fromAccount !== undefined && pendingApproval.fromAccount !== null && pendingApproval.fromAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.fromAccount.substr(pendingApproval.fromAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === "Drawdown Template" || pendingApproval.type === "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['debitAcctName'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
			var acctNum = pendingApproval.extra.extra['debitAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
			acctNum = pendingApproval.extra.extra['creditAcctNum'];
			if(acctNum !== null && acctNum !== undefined) 
				acctNum = 'x' + acctNum.substr(acctNum.length - 4);
			else
				acctNum = '';
				
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + acctNum + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Account Transfer') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">To Account:</span></div>';
			if (pendingApproval.toAccount !== undefined && pendingApproval.toAccount !== null && pendingApproval.toAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.toAccount.substr(pendingApproval.toAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Positive Pay Issue') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue/Void:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['voidCheck'] !== undefined) {
				data += pendingApproval.extra.extra['voidCheck'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}

		if (pendingApproval.type === 'Positive Pay Decision') {

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['suspectReason'] !== undefined) {
				data += pendingApproval.extra.extra['suspectReason'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['decisionType'] !== undefined) {
				data += pendingApproval.extra.extra['decisionType'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Submitted By:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.submittedBy + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		if (pendingApproval.type === 'International Wire' || pendingApproval.type === 'Intl Template') {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['usdAmount'] + '</span></div>';
		} else {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingApproval.amount) + '</span></div>';
		}
		data += '</div>';

		data += hRefEnd + '</li>';

		data += '<li><div data-role="fieldcontain">';
		var radioid = "pendingapproval-" + pendingApproval.approvalId;
		var radioname = "pendingapproval-" + pendingApproval.approvalId;
		data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
		var checked = '';
		if (pendingApproval.status === 'Approve')
			checked = 'checked';
		data += '<div class="ui-block-a">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '" value="Approve" ' + checked + '/>';
		data += '<label for="' + radioid + '">Approve</label>';
		data += '</div>';
		checked = '';
		if (pendingApproval.status === 'Hold')
			checked = 'checked';
		data += '<div class="ui-block-b">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '" value="Hold" ' + checked + '/>';
		data += '<label for="' + radioid + '">Hold</label>';
		data += '</div>';
		checked = '';
		if (pendingApproval.status === 'Reject')
			checked = 'checked';
		data += '<div class="ui-block-c">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '" value="Reject" ' + checked + '/>';
		data += '<label for="' + radioid + '">Reject</label>';
		data += '</div>';
		data += '</fieldset>';
		data += '</div></li>';

		data += '</ul>';
		$("#pendingapprovalslist").append(data);
		$("#" + pendingApproval.approvalId).listview();
		$("#" + pendingApproval.approvalId).die('click');
		$("#" + pendingApproval.approvalId).live('click', function() {
			currentSession.approvalId = jQuery(this).attr("id");
		});

	}
	$('body').removeClass('ui-loading');
}

function updatePendingApprovalStatus(id, status) {
	var pendingApprovals = currentSession.pendingApprovals;
	for (var i = 0; i < pendingApprovals.length; i++) {
		if (pendingApprovals[i].approvalId === id) {
			pendingApprovals[i].status = status;
			break;
		}
	}

}

function updateWireReleaseStatus(id, status) {
	var pendingWires = currentSession.pendingWires;
	for (var i = 0; i < pendingWires.length; i++) {
		if (pendingWires[i].wireId === id) {
			pendingWires[i].status = status;
			break;
		}
	}

}

function showApprovalsVerify() {
	
	$("#approvalsverifylist").children().remove();
	var transfers = 0;
	var transfersAmt = 0.00;
	var posPay = 0;
	var posPayAmt = 0.00;
	var wireDebits = 0;
	var wireDebitsAmt = 0.00;
	var wireCredits = 0;
	var wireCreditsAmt = 0.00;

	for (var i = 0; i < currentSession.pendingApprovals.length; i++) {
		var pendingApproval = currentSession.pendingApprovals[i];

		if (pendingApproval.status === 'Approve' && pendingApproval.type === "Positive Pay Decision") {
			posPay += 1;
			posPayAmt += Number(pendingApproval.amount);
		}

		if (pendingApproval.status === 'Approve' && pendingApproval.type === "Drawdown Wire") {
			wireCredits += 1;
			wireCreditsAmt += Number(pendingApproval.amount);
		}

		if (pendingApproval.status === 'Approve' && (pendingApproval.type === "Domestic Wire" || pendingApproval.type === "International Wire" || pendingApproval.type === "Book Wire")) {
			wireDebits += 1;
			if (pendingApproval.type === "International Wire") {
				wireDebitsAmt += Number(accounting.unformat(pendingApproval.extra.extra['usdAmount']));
			} else {
				wireDebitsAmt += Number(pendingApproval.amount);
			}
		}

		if (pendingApproval.status === 'Approve' && pendingApproval.type === 'Account Transfer') {
			transfers += 1;
			transfersAmt += Number(pendingApproval.amount);
		}

		var data = '<ul data-role="listview" data-inset="true" id="verify-' + pendingApproval.approvalId + '">';

		var hrefStart = ' ';
		var hRefEnd = ' ';
		if(pendingApproval.type !== 'Positive Pay Decision'
		 && pendingApproval.type !== 'Positive Pay Issue' && pendingApproval.type !== 'Account Transfer') {
		 	hrefStart = '<a href="#approvaldetail">';
		 	hRefEnd = '</a>';
		 }

		data += '<li data-icon="carrot">' + hrefStart + '<div class="ui-grid-a">';
		var dateLabel = null;
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision')
			dateLabel = 'Submit Date';
		else if (pendingApproval.type === 'Domestic Wire' || pendingApproval.type === 'Book Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type === 'Account Transfer')
			dateLabel = 'Effective Date';
		else if (pendingApproval.type === 'International Wire')
			dateLabel = 'Processing Date';
		else if (pendingApproval.type === 'Drawdown Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type.indexOf('Template') !== -1)
			dateLabel = 'Create Date';

		data += '<div class="ui-block-a"><span class="grid-label">' + dateLabel + ':</span></div>';
		var date = pendingApproval.extra.extra['dateDue'];
		if (date !== undefined)
			date = getDateFromYYYYMMDD(date);
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision' || pendingApproval.type == 'International Wire') {
			date = dateFormat(convertAxisDate(pendingApproval.date), "mm/dd/yyyy");
		}

		data += '<div class="ui-block-b"><span class="grid-label-normal">' + date + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Trans Type:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.type + '</span></div>';
		data += '</div>';

		if (pendingApproval.type !== "Positive Pay Issue" && pendingApproval.type !== "Positive Pay Decision" && pendingApproval.type !== "Account Transfer" && pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			if (pendingApproval.extra.extra['beneficiary'] === undefined)
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.beneficiary + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['beneficiary'] + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
			if (pendingApproval.fromAccount !== undefined && pendingApproval.fromAccount !== null && pendingApproval.fromAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.fromAccount.substr(pendingApproval.fromAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === "Drawdown Template" || pendingApproval.type === "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['debitAcctName'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
			var acctNum = pendingApproval.extra.extra['debitAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
			acctNum = pendingApproval.extra.extra['creditAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Account Transfer') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">To Account:</span></div>';
			if (pendingApproval.toAccount !== undefined && pendingApproval.toAccount !== null && pendingApproval.toAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.toAccount.substr(pendingApproval.toAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Positive Pay Issue') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue/Void:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['voidCheck'] !== undefined) {
				data += pendingApproval.extra.extra['voidCheck'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}

		if (pendingApproval.type === 'Positive Pay Decision') {

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['suspectReason'] !== undefined) {
				data += pendingApproval.extra.extra['suspectReason'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['decisionType'] !== undefined) {
				data += pendingApproval.extra.extra['decisionType'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Submitted By:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.submittedBy + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		if (pendingApproval.type === 'International Wire' || pendingApproval.type === 'Intl Template') {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['usdAmount'] + '</span></div>';
		} else {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingApproval.amount) + '</span></div>';
		}
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.status + '</span></div>';
		data += '</div>';

		data += hRefEnd + '</li>';

		data += '<li><div data-role="fieldcontain">';
		var radioid = "pendingapprovalverify-" + pendingApproval.approvalId;
		var radioname = "pendingapprovalpendingapprovalverify-" + pendingApproval.approvalId;
		data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
		var checked = '';
		if (pendingApproval.status === 'Approve')
			checked = 'checked';
		data += '<div class="ui-block-a">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '" value="Approve" ' + checked + ' disabled/>';
		data += '<label for="' + radioid + '">Approve</label>';
		data += '</div>';
		checked = '';
		if (pendingApproval.status === 'Hold')
			checked = 'checked';
		data += '<div class="ui-block-b">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '" value="Hold" ' + checked + ' disabled/>';
		data += '<label for="' + radioid + '">Hold</label>';
		data += '</div>';
		checked = '';
		if (pendingApproval.status === 'Reject')
			checked = 'checked';
		data += '<div class="ui-block-c">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '" value="Reject" ' + checked + ' disabled/>';
		data += '<label for="' + radioid + '">Reject</label>';
		data += '</div>';
		data += '</fieldset>';
		data += '</div></li>';

		data += '</ul>';
		$("#approvalsverifylist").append(data);
		$("#verify-" + pendingApproval.approvalId).listview();
		
		if(pendingApproval.type !== 'Positive Pay Decision'
		 && pendingApproval.type !== 'Positive Pay Issue' && pendingApproval.type !== 'Account Transfer') {
			$("#verify-" + pendingApproval.approvalId).die().live('click', function() {
				disableDetails = true;
				currentSession.approvalId = jQuery(this).attr("id").substring(7);
			});
		 }

	}
	$("#approvalsverifytransfers").text(transfers);
	var amount = transfersAmt;
	if (amount !== null && amount !== undefined && amount > 0) {
		amount = accounting.formatMoney(amount);
	} else {
		amount = '$0.00';
	}
	$("#approvalsverifytransfersamt").text(amount);
	$("#approvalsverifywiredebits").text(wireDebits);
	amount = wireDebitsAmt;
	if (amount !== null && amount !== undefined && amount > 0) {
		amount = accounting.formatMoney(amount);
	} else {
		amount = '$0.00';
	}
	$("#approvalsverifydebitsamt").text(amount);
	$("#approvalsverifydrawdowncredits").text(wireCredits);
	amount = wireCreditsAmt;
	if (amount !== null && amount !== undefined && amount > 0) {
		amount = accounting.formatMoney(amount);
	} else {
		amount = '$0.00';
	}
	$("#approvalsverifycreditsamt").text(amount);
	$("#approvalsverifypospay").text(posPay);
	amount = posPayAmt;
	if (amount !== null && amount !== undefined && amount > 0) {
		amount = accounting.formatMoney(amount);
	} else {
		amount = '$0.00';
	}
	$("#approvalsverifypospayamt").text(amount);

}

function showApprovalsConfirm() {
	$("#approvalsconfirmlist").children().remove();
	var hasErrors = false;
	var approvalCount = 0;

	for (var i = 0; i < currentSession.pendingApprovals.length; i++) {
		var pendingApproval = currentSession.pendingApprovals[i];
		var data = '<ul data-role="listview" data-inset="true" id="confirm-' + pendingApproval.approvalId + '">';
		var hrefStart = ' ';
		var hRefEnd = ' ';
		/*if(pendingApproval.type !== 'Positive Pay Decision'
		 && pendingApproval.type !== 'Positive Pay Issue' && pendingApproval.type !== 'Account Transfer') {
		 hrefStart = '<a href="#approvaldetail">';
		 hRefEnd = '</a>';
		 }*/

		data += '<li data-icon="carrot">' + hrefStart + '<div class="ui-grid-a">';
		var dateLabel = null;
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision')
			dateLabel = 'Submit Date';
		else if (pendingApproval.type === 'Domestic Wire' || pendingApproval.type === 'Book Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type === 'Account Transfer')
			dateLabel = 'Effective Date';
		else if (pendingApproval.type === 'International Wire')
			dateLabel = 'Processing Date';
		else if (pendingApproval.type === 'Drawdown Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type.indexOf('Template') !== -1)
			dateLabel = 'Create Date';

		data += '<div class="ui-block-a"><span class="grid-label">' + dateLabel + ':</span></div>';
		var date = pendingApproval.extra.extra['dateDue'];
		if (date !== undefined)
			date = getDateFromYYYYMMDD(date);
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision' || pendingApproval.type === 'International Wire') {
			date = dateFormat(convertAxisDate(pendingApproval.date), "mm/dd/yyyy");
		}

		data += '<div class="ui-block-b"><span class="grid-label-normal">' + date + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Trans Type:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.type + '</span></div>';
		data += '</div>';

		if (pendingApproval.type !== "Positive Pay Issue" && pendingApproval.type !== "Positive Pay Decision" && pendingApproval.type !== "Account Transfer" && pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			if (pendingApproval.extra.extra['beneficiary'] === undefined)
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.beneficiary + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['beneficiary'] + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
			if (pendingApproval.fromAccount !== undefined && pendingApproval.fromAccount !== null && pendingApproval.fromAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.fromAccount.substr(pendingApproval.fromAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === "Drawdown Template" || pendingApproval.type === "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['debitAcctName'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
			var acctNum = pendingApproval.extra.extra['debitAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
			acctNum = pendingApproval.extra.extra['creditAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Account Transfer') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">To Account:</span></div>';
			if (pendingApproval.toAccount !== undefined && pendingApproval.toAccount !== null && pendingApproval.toAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.toAccount.substr(pendingApproval.toAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Positive Pay Issue') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue/Void:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['voidCheck'] !== undefined) {
				data += pendingApproval.extra.extra['voidCheck'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}

		if (pendingApproval.type === 'Positive Pay Decision') {

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['suspectReason'] !== undefined) {
				data += pendingApproval.extra.extra['suspectReason'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['decisionType'] !== undefined) {
				data += pendingApproval.extra.extra['decisionType'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Submitted By:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.submittedBy + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		if (pendingApproval.type === 'International Wire' || pendingApproval.type === 'Intl Template') {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['usdAmount'] + '</span></div>';
		} else {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingApproval.amount) + '</span></div>';
		}
		data += '</div>';
		data += '</li>';

		if (pendingApproval.error !== '' && pendingApproval.error !== null && pendingApproval.error !== undefined) {
			hasErrors = true;
			approvalCount = approvalCount + 1;
			data += '<li><img src="images/confirmError@2x.png" class="ui-li-icon"/><span class="grid-label">' + pendingApproval.error + '</span></li>';
		} else {
			if (pendingApproval.status === 'Approved')
				data += '<li><img src="images/confirmAccepted@2x.png" class="ui-li-icon"/><span class="grid-label">Item Approved</span></li>';
			else if (pendingApproval.status === 'Hold') {
				approvalCount = approvalCount + 1;
				data += '<li><img src="images/confirmHold@2x.png" class="ui-li-icon"/><span class="grid-label">Item Held</span></li>';
			} else if (pendingApproval.status === 'Rejected')
				data += '<li><img src="images/confirmAccepted@2x.png" class="ui-li-icon"/><span class="grid-label">Item Rejected</span></li>';
		}
		data += '</ul>';
		$("#approvalsconfirmlist").append(data);
		$("#confirm-" + pendingApproval.approvalId).listview();
	}

	currentSession.pending_approvals_count = approvalCount;

	if (hasErrors === true) {
		$("#approvalerrors").show();
		$("#approvalsuccess").hide();
	} else {
		$("#approvalerrors").hide();
		$("#approvalsuccess").show();
	}
}

function getAccountTransferDetails(pendingApproval) {
	var data = '<li><div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Effective Date:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + getDateFromYYYYMMDD(pendingApproval.extra.extra['dateDue']) + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Trans Type:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.type + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.fromAccount + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">To Account:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.toAccount + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Submitted By:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.submittedBy + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingApproval.amount) + '</span></div>';
	data += '</div>';

	data += '</div></li>';

	data += '<li><div data-role="fieldcontain">';
	var radioid = "approvaldetail-" + pendingApproval.approvalId;
	var radioname = "approvaldetail-" + pendingApproval.approvalId;
	data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
	var checked = '';
	var disabled = '';
	if(disableDetails === true)
		disabled = 'disabled';
	if (pendingApproval.status === 'Approve')
		checked = 'checked';
	data += '<div class="ui-block-a">';
	data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-21" value="Approve" ' + checked + ' ' + disabled + '/>';
	data += '<label for="' + radioid + '-21">Approve</label>';
	data += '</div>';
	checked = '';
	if (pendingApproval.status === 'Hold')
		checked = 'checked';
	data += '<div class="ui-block-b">';
	data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-22" value="Hold" ' + checked + ' ' + disabled + '/>';
	data += '<label for="' + radioid + '-22">Hold</label>';
	data += '</div>';
	checked = '';
	if (pendingApproval.status === 'Reject')
		checked = 'checked';
	data += '<div class="ui-block-c">';
	data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-23" value="Reject" ' + checked + ' ' + disabled + '/>';
	data += '<label for="' + radioid + '-23">Reject</label>';
	data += '</div>';
	data += '</fieldset>';
	data += '</div></li>';

	return data;
}

function getWireApprovalDetails(pendingApproval) {
	var data = '<li><div class="ui-grid-a">';

	data += '<div class="ui-block-a"><span class="grid-label">Submitted By:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.submittedBy + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Trans Type:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.type + '</span></div>';
	data += '</div>';

	if (pendingApproval.type === 'Dom Template' || pendingApproval.type === 'Intl Template' || pendingApproval.type === 'Book Template' || pendingApproval.type === 'Drawdown Template') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Name:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['name'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Category:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['category'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type === "Drawdown Template" || pendingApproval.type === "Drawdown Wire") {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['debitAcctName'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
		var acctNum = pendingApproval.extra.extra['debitAcctNum'];
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + acctNum + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Bank:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['debitBank'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type.indexOf('Drawdown') === -1) {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
		if (pendingApproval.extra.extra['beneficiary'] === undefined)
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.beneficiary + '</span></div>';
		else
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['beneficiary'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type === 'Drawdown Template' || pendingApproval.type === 'Drawdown Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">ABA/SWIFT:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['abaOrSwift'] + '</span></div>';
		data += '</div>';
	}

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
	var acct = pendingApproval.extra.extra['creditAcctNum'];
	if (pendingApproval.type !== 'Book Template' && pendingApproval.type !== 'Book Wire' && pendingApproval.type !== 'Dom Template' && pendingApproval.type !== 'Intl Template') {
		if(acct !== null && acct !== undefined) 
			acct = 'x' + acct.substr(acct.length - 4);
		else
			acct = '';
	}
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
	data += '</div>';

	if (pendingApproval.type.indexOf('Drawdown') === -1) {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Bene Bank:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['beneficiaryBank'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type !== 'Drawdown Wire' && pendingApproval.type !== 'Drawdown Template') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">ABA/SWIFT:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['abaOrSwift'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type.indexOf('Drawdown') === -1) {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
		acct = pendingApproval.extra.extra['debitAcctNum'];
		if(acct !== undefined && acct !== null)
			acct = 'x' + acct.substr(acct.length - 4);
		else
			acct = '';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type === 'Domestic Wire' || pendingApproval.type === 'Book Wire' || pendingApproval.type === 'Dom Template' || pendingApproval.type === 'Book Template' || pendingApproval.type === 'Drawdown Template' || pendingApproval.type === 'Drawdown Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingApproval.amount) + '</span></div>';
		data += '</div>';
	} else {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Original Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['originalAmt'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type === 'International Wire' || pendingApproval.type === 'Intl Template') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Currency:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.currency + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Exchange Rate:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['exchangeRate'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">USD Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['usdAmount'] + '</span></div>';
		data += '</div>';
	}

	if (pendingApproval.type.indexOf('Template') === -1) {
		data += '<div class="ui-grid-a">';
		if (pendingApproval.type === 'Domestic Wire' || pendingApproval.type === 'Book Wire' || pendingApproval.type === 'Drawdown Wire') {
			data += '<div class="ui-block-a"><span class="grid-label">Value Date:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + getDateFromYYYYMMDD(pendingApproval.extra.extra['dateDue']) + '</span></div>';
		} else {
			data += '<div class="ui-block-a"><span class="grid-label">Processing Date:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + dateFormat(convertAxisDate(pendingApproval.date), "mm/dd/yyyy") + '</span></div>';
		}
		data += '</div>';
	}

	data += '<div class="ui-grid-a">';
	if (pendingApproval.type === 'Book Wire' || pendingApproval.type === 'Domestic Wire' || pendingApproval.type.indexOf('Drawdown') != -1
	      || pendingApproval.type === 'Dom Template' || pendingApproval.type === 'Book Template') {
		data += '<div class="ui-block-a"><span class="grid-label">Reference For Beneficiary:</span></div>';
	} else {
		data += '<div class="ui-block-a"><span class="grid-label">Sender\'s Reference:</span></div>';
	}

	data += '<div class="ui-block-b"><span class="grid-label-normal">';
	if (pendingApproval.extra.extra['refForBene'] !== undefined) {
		data += pendingApproval.extra.extra['refForBene'];
	}
	data += '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Originator to Beneficiary:</span></div>';
	var obi = pendingApproval.extra.extra['origToBeneInfo1'];
	if (obi === undefined || obi === null) {
		obi = '&nbsp;';
	}
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	obi = pendingApproval.extra.extra['origToBeneInfo2'];
	if (obi !== undefined && obi !== null) {
		data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	}
	obi = pendingApproval.extra.extra['origToBeneInfo3'];
	if (obi !== undefined && obi !== null) {
		data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	}
	obi = pendingApproval.extra.extra['origToBeneInfo4'];
	if (obi !== undefined && obi !== null) {
		data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	}
	data += '</div>';

	if (pendingApproval.type !== 'Book Wire' && pendingApproval.type !== 'Book Template') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Bank to Bank Information:</span></div>';
		obi = pendingApproval.extra.extra['bankToBankInfo1'];
		if (obi === undefined || obi === null) {
			obi = '&nbsp;';
		}
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		obi = pendingApproval.extra.extra['bankToBankInfo2'];
		if (obi !== undefined && obi !== null) {
			data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		}
		obi = pendingApproval.extra.extra['bankToBankInfo3'];
		if (obi !== undefined && obi !== null) {
			data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		}
		obi = pendingApproval.extra.extra['bankToBankInfo4'];
		if (obi !== undefined && obi !== null) {
			data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		}
		data += '</div>';
	}

	data += '</div></li>';

	data += '<li><div data-role="fieldcontain">';
	var radioid = "approvaldetail-" + pendingApproval.approvalId;
	var radioname = "approvaldetail-" + pendingApproval.approvalId;
	data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
	var checked = '';
	var disabled = '';
	if(disableDetails === true)
		disabled = 'disabled';
	if (pendingApproval.status === 'Approve')
		checked = 'checked';
	data += '<div class="ui-block-a">';
	data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-21" value="Approve" ' + checked + ' ' + disabled  + '/>';
	data += '<label for="' + radioid + '-21">Approve</label>';
	data += '</div>';
	checked = '';
	if (pendingApproval.status === 'Hold')
		checked = 'checked';
	data += '<div class="ui-block-b">';
	data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-22" value="Hold" ' + checked + ' ' + disabled  + '/>';
	data += '<label for="' + radioid + '-22">Hold</label>';
	data += '</div>';
	checked = '';
	if (pendingApproval.status === 'Reject')
		checked = 'checked';
	data += '<div class="ui-block-c">';
	data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-23" value="Reject" ' + checked + ' ' + disabled  + '/>';
	data += '<label for="' + radioid + '-23">Reject</label>';
	data += '</div>';
	data += '</fieldset>';
	data += '</div></li>';

	return data;
}

function showApprovalDetail(approvalId, prevPage) {
	
    if (prevPage.indexOf("pendingapprovals") !== -1) {
        $("#approvaldetailbackbtn").text("Approvals");
    } else if (prevPage.indexOf("approvalsverify") !== -1) {
        $("#approvaldetailbackbtn").text("Verify");
    }
	
	var pendingApproval = '';
	var index = -1;
	for (var i = 0; i < currentSession.pendingApprovals.length; i++) {
		pendingApproval = currentSession.pendingApprovals[i];
		if (pendingApproval.approvalId === approvalId) {
			index = i;
			currentSession.selectedApprovalIndex = index;
			break;
		}
	}

	var header = (index + 1) + ' of ' + currentSession.pendingApprovals.length;
	$("#approvaldetailheading").text(header);

	$("#approvalinfo").children().remove();
	var id = "approvaldetail-" + approvalId;
	var data = '<ul data-role="listview" data-inset="true" id="' + id + '">';

	if (pendingApproval.type === "Account Transfer") {
		data += getAccountTransferDetails(pendingApproval);
	} else if (pendingApproval.type !== "Positive Pay Decision" && pendingApproval.type !== "Positive Pay Issue" && pendingApproval.type !== "Account Transfer") {
		data += getWireApprovalDetails(pendingApproval);
	} else {
		var hrefStart = ' ';
		var hRefEnd = ' ';

		data += '<li data-icon="carrot">' + hrefStart + '<div class="ui-grid-a">';
		var dateLabel = null;
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision')
			dateLabel = 'Submit Date';
		else if (pendingApproval.type === 'Domestic Wire' || pendingApproval.type === 'Book Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type === 'Account Transfer')
			dateLabel = 'Effective Date';
		else if (pendingApproval.type === 'International Wire')
			dateLabel = 'Processing Date';
		else if (pendingApproval.type === 'Drawdown Wire')
			dateLabel = 'Value Date';
		else if (pendingApproval.type.indexOf('Template') !== -1)
			dateLabel = 'Create Date';

		data += '<div class="ui-block-a"><span class="grid-label">' + dateLabel + ':</span></div>';
		var date = pendingApproval.extra.extra['dateDue'];
		if (date !== undefined)
			date = getDateFromYYYYMMDD(date);
		if (pendingApproval.type === 'Positive Pay Issue' || pendingApproval.type == 'Positive Pay Decision' || pendingApproval.type === 'International Wire') {
			date = dateFormat(convertAxisDate(pendingApproval.date), "mm/dd/yyyy");
		}

		data += '<div class="ui-block-b"><span class="grid-label-normal">' + date + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Trans Type:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.type + '</span></div>';
		data += '</div>';

		if (pendingApproval.type !== "Positive Pay Issue" && pendingApproval.type !== "Positive Pay Decision" && pendingApproval.type !== "Account Transfer" && pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			if (pendingApproval.extra.extra['beneficiary'] === undefined)
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.beneficiary + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['beneficiary'] + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type !== "Drawdown Template" && pendingApproval.type !== "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
			if (pendingApproval.fromAccount !== undefined && pendingApproval.fromAccount !== null && pendingApproval.fromAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.fromAccount.substr(pendingApproval.fromAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === "Drawdown Template" || pendingApproval.type === "Drawdown Wire") {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['debitAcctName'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
			var acctNum = pendingApproval.extra.extra['debitAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
			acctNum = pendingApproval.extra.extra['creditAcctNum'];
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + acctNum.substr(acctNum.length - 4) + '</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Account Transfer') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">To Account:</span></div>';
			if (pendingApproval.toAccount !== undefined && pendingApproval.toAccount !== null && pendingApproval.toAccount !== '')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + 'x' + pendingApproval.toAccount.substr(pendingApproval.toAccount.length - 4) + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">&nbsp;</span></div>';
			data += '</div>';
		}

		if (pendingApproval.type === 'Positive Pay Issue') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue/Void:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['voidCheck'] !== undefined) {
				data += pendingApproval.extra.extra['voidCheck'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}

		if (pendingApproval.type === 'Positive Pay Decision') {

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['suspectReason'] !== undefined) {
				data += pendingApproval.extra.extra['suspectReason'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Number:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['checkNumber'] !== undefined) {
				data += pendingApproval.extra.extra['checkNumber'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['decisionType'] !== undefined) {
				data += pendingApproval.extra.extra['decisionType'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Add. Data:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.extra.extra['additionalData'] !== undefined) {
				data += pendingApproval.extra.extra['additionalData'];
			}
			data += '</span></div></div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">';
			if (pendingApproval.beneficiary !== undefined || pendingApproval.beneficiary !== null) {
				data += pendingApproval.beneficiary;
			}
			data += '</span></div></div>';
		}
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Submitted By:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.submittedBy + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		if (pendingApproval.type === 'International Wire' || pendingApproval.type === 'Intl Template') {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingApproval.extra.extra['usdAmount'] + '</span></div>';
		} else {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingApproval.amount) + '</span></div>';
		}
		data += '</div>';

		data += hRefEnd + '</li>';

		data += '<li><div data-role="fieldcontain">';
		var radioid = "approvaldetail-" + pendingApproval.approvalId;
		var radioname = "approvaldetail-" + pendingApproval.approvalId;
		data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
		var checked = '';
		var disabled = '';
		if (pendingApproval.status === 'Approve')
			checked = 'checked';
		if(disableDetails === true)
			disabled = 'disabled';	
			
		data += '<div class="ui-block-a">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-21" value="Approve" ' + checked + ' ' + disabled  + '/>';
		data += '<label for="' + radioid + '-21">Approve</label>';
		data += '</div>';
		checked = '';
		if (pendingApproval.status === 'Hold')
			checked = 'checked';
		data += '<div class="ui-block-b">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-22" value="Hold" ' + checked + ' ' + disabled  + '/>';
		data += '<label for="' + radioid + '-22">Hold</label>';
		data += '</div>';
		checked = '';
		if (pendingApproval.status === 'Reject')
			checked = 'checked';
		data += '<div class="ui-block-c">';
		data += '<input type="radio" name="' + radioname + '" id="' + radioid + '-23" value="Reject" ' + checked + ' ' + disabled  + '/>';
		data += '<label for="' + radioid + '-23">Reject</label>';
		data += '</div>';
		data += '</fieldset>';
		data += '</div></li>';
	}

	data += '</ul>';
	$("#approvalinfo").append(data);
	$("#" + id).listview();

	//prev next approval
	$("#nextapprbutton").unbind().bind('click', function() {
		if (currentSession.selectedApprovalIndex < currentSession.pendingApprovals.length - 1) {
			currentSession.selectedApprovalIndex += 1;
			var currPage = $.mobile.activePage.attr('id');
			showApprovalDetail(currentSession.pendingApprovals[currentSession.selectedApprovalIndex].approvalId, currPage);
		}
	});

	$("#prevapprbutton").unbind().bind('click', function() {
		if (currentSession.selectedApprovalIndex > 0) {
			currentSession.selectedApprovalIndex -= 1;
			var currPage = $.mobile.activePage.attr('id');
			showApprovalDetail(currentSession.pendingApprovals[currentSession.selectedApprovalIndex].approvalId, currPage);
		}
	});

}

function showPendingWires() {
	var $pendingwireslist = $("#pendingwireslist");
	$pendingwireslist.children().remove();

	for (var i = 0; i < currentSession.pendingWires.length; i++) {
		var pendingWire = currentSession.pendingWires[i];
		var data = '<ul data-role="listview" data-inset="true" id="' + pendingWire.wireId + '">';
		data += '<li data-icon="carrot"><a href="#wiredetail"><div class="ui-grid-a">';
		var dateLabel = null;
		var dateStr = '';

		if (pendingWire.type === 'Domestic Wire' || pendingWire.type === 'Book Wire' || pendingWire.type === 'Drawdown Wire') {
			dateLabel = 'Value Date';
			dateStr = getDateFromYYYYMMDD(pendingWire.extra.extra['dateDue']);
		} else if (pendingWire.type === 'International Wire') {
			dateLabel = 'Processing Date';
			dateStr = dateFormat(convertAxisDate(pendingWire.dateToPost), "mm/dd/yyyy");
		}

		data += '<div class="ui-block-a"><span class="grid-label">' + dateLabel + '</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + dateStr + '</span></div>';
		data += '</div>';

		if (pendingWire.type !== 'Drawdown Wire') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			if (pendingWire.extra.extra['beneficiary'] === undefined)
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.beneficiary + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['beneficiary'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
			var acct = pendingWire.extra.extra['debitAcctNum'];
			acct = 'x' + acct.substr(acct.length - 4);
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
			data += '</div>';
		} else if (pendingWire.type === 'Drawdown Wire') {
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['debitAcctName'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
			acct = pendingWire.extra.extra['debitAcctNum'];
			acct = 'x' + acct.substr(acct.length - 4);
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
			acct = pendingWire.extra.extra['creditAcctNum'];
			acct = 'x' + acct.substr(acct.length - 4);
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
			data += '</div>';

		}

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Wire Type:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.type + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		if (pendingWire.type === 'International Wire') {
			if (pendingWire.currency === 'USD') {
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingWire.extra.extra['originalAmt']) + '</span></div>';
			} else {
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['originalAmt'] + ' ' + pendingWire.currency + '</span></div>';
			}
		} else {
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingWire.amount) + '</span></div>';
		}
		data += '</div>';

		data += '</a></li>';

		data += '<li><div data-role="fieldcontain">';
		var radioid = "pendingwire-" + pendingWire.wireId;
		var radioname = "pendingwire-" + pendingWire.wireId;
		data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
		var checked = '';
		if (pendingWire.status === 'Release')
			checked = 'checked';
		data += '<div class="ui-block-a">';
		data += '<input type="radio" name="' + radioname + '" id="21' + radioid + '" value="Release" ' + checked + '/>';
		data += '<label for="21' + radioid + '">Release</label>';
		data += '</div>';
		checked = '';
		if (pendingWire.status === 'Hold')
			checked = 'checked';
		data += '<div class="ui-block-b">';
		data += '<input type="radio" name="' + radioname + '" id="22' + radioid + '" value="Hold" ' + checked + '/>';
		data += '<label for="22' + radioid + '">Hold</label>';
		data += '</div>';
		checked = '';
		if (pendingWire.status === 'Reject')
			checked = 'checked';
		data += '<div class="ui-block-c">';
		data += '<input type="radio" name="' + radioname + '" id="23' + radioid + '" value="Reject" ' + checked + '/>';
		data += '<label for="23' + radioid + '">Reject</label>';
		data += '</div>';
		data += '</fieldset>';
		data += '</div></li>';

		data += '</ul>';
		$pendingwireslist.append(data);
		$("#" + pendingWire.wireId).listview();
		//$("#" + pendingWire.wireId).die('click');
		$("#" + pendingWire.wireId).die().live('click', function() {
			currentSession.wireId = jQuery(this).attr("id");
			currentSession.selectedWireIndex = $(this).index();
		});
	}
}

function showWireDetail(wireId, prevPage) {
	var pendingWire = '';

	for (var i = 0; i < currentSession.pendingWires.length; i++) {
		pendingWire = currentSession.pendingWires[i];
		if (pendingWire.wireId === wireId) {
			currentSession.selectedWireIndex = i;
			break;
		}
	}
	
    if (prevPage.indexOf("pendingwires") !== -1) {
        $("#wiredetailbackbtn").text("Wire Release");
    } else if (prevPage.indexOf("wiresverify") !== -1) {
        $("#wiredetailbackbtn").text("Verify");
    }

	var header = (currentSession.selectedWireIndex + 1) + ' of ' + currentSession.pendingWires.length;
	$("#wiredetailheading").text(header);

	$("#wireinfo").children().remove();
	var data = '<ul data-role="listview" data-inset="true" id="wire">';
	data += '<li><div class="ui-grid-a">';

	data += '<div class="ui-block-a"><span class="grid-label">Created By:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['submittedBy'] + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Wire Type:</span></div>';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.type + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Template Name:</span></div>';
	var name = '';
	if (pendingWire.name !== undefined && pendingWire.name !== null && pendingWire.name !== '') {
		name = pendingWire.name;
	}
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + name + '</span></div>';
	data += '</div>';

	if (pendingWire.type === 'Drawdown Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Acct Name:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['debitAcctName'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['debitAcctNum'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Bank:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['debitBank'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">ABA/SWIFT:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['abaOrSwift'] + '</span></div>';
		data += '</div>';

	}

	if (pendingWire.type !== 'Drawdown Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
		if (pendingWire.extra.extra['beneficiary'] === undefined)
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.beneficiary + '</span></div>';
		else
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['beneficiary'] + '</span></div>';
		data += '</div>';
	}

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
	var acct = pendingWire.extra.extra['creditAcctNum'];
	if (pendingWire.type === 'Drawdown Wire') {
		acct = 'x' + acct.substr(acct.length - 4);
	}

	data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
	data += '</div>';

	if (pendingWire.type !== 'Drawdown Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Bene Bank:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['beneficiaryBank'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">ABA/SWIFT:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['abaOrSwift'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
		acct = pendingWire.extra.extra['debitAcctNum'];
		//if (pendingWire.type !== 'International Wire')
		acct = 'x' + acct.substr(acct.length - 4);
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
		data += '</div>';
	}

	if (pendingWire.type === 'Domestic Wire' || pendingWire.type === 'Drawdown Wire' || pendingWire.type === 'Book Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingWire.amount) + '</span></div>';
		data += '</div>';
	} else {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Original Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['originalAmt'] + '</span></div>';
		data += '</div>';
	}

	if (pendingWire.type === 'International Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Currency:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.currency + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Exchange Rate:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['exchangeRate'] + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">USD Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['usdAmount'] + '</span></div>';
		data += '</div>';
	}

	data += '<div class="ui-grid-a">';
	var dateStr = '';
	if (pendingWire.type === 'Domestic Wire' || pendingWire.type === 'Book Wire' || pendingWire.type === 'Drawdown Wire') {
		data += '<div class="ui-block-a"><span class="grid-label">Value Date:</span></div>';
		dateStr = getDateFromYYYYMMDD(pendingWire.extra.extra['dateDue']);
	} else {
		data += '<div class="ui-block-a"><span class="grid-label">Processing Date:</span></div>';
		dateStr = dateFormat(convertAxisDate(pendingWire.dateToPost), "mm/dd/yyyy");
	}
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + dateStr + '</span></div>';
	data += '</div>';

	data += '<div class="ui-grid-a">';
	if (pendingWire.type === 'Domestic Wire' || pendingWire.type === 'Drawdown Wire' || pendingWire.type === 'International Wire' || pendingWire.type === 'Book Wire') {
		data += '<div class="ui-block-a"><span class="grid-label">Reference For Beneficiary:</span></div>';
	} else {
		data += '<div class="ui-block-a"><span class="grid-label">Sender\'s Reference:</span></div>';
	}
	var refNum = pendingWire.extra.extra['refForBene'];
	if (refNum === undefined)
		refNum = '';
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + refNum + '</span></div>';
	data += '</div>';

	/*data += '<div class="ui-grid-a">';
	 data += '<div class="ui-block-a"><span class="grid-label">Bank to Bank Information:</span></div>';
	 data += '<div class="ui-block-b">' + '&nbsp;' + '</div>';
	 data += '</div>';*/

	data += '<div class="ui-grid-a">';
	data += '<div class="ui-block-a"><span class="grid-label">Originator to Beneficiary:</span></div>';
	var obi = pendingWire.extra.extra['origToBeneInfo1'];
	if (obi === undefined || obi === null) {
		obi = '&nbsp;';
	}
	data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	obi = pendingWire.extra.extra['origToBeneInfo2'];
	if (obi !== undefined && obi !== null) {
		data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	}
	obi = pendingWire.extra.extra['origToBeneInfo3'];
	if (obi !== undefined && obi !== null) {
		data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	}
	obi = pendingWire.extra.extra['origToBeneInfo4'];
	if (obi !== undefined && obi !== null) {
		data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
	}
	data += '</div>';

	if (pendingWire.type !== 'Book Wire') {
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Bank to Bank Information:</span></div>';
		obi = pendingWire.extra.extra['bankToBankInfo1'];
		if (obi === undefined || obi === null) {
			obi = '&nbsp;';
		}
		data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		obi = pendingWire.extra.extra['bankToBankInfo2'];
		if (obi !== undefined && obi !== null) {
			data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		}
		obi = pendingWire.extra.extra['bankToBankInfo3'];
		if (obi !== undefined && obi !== null) {
			data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		}
		obi = pendingWire.extra.extra['bankToBankInfo4'];
		if (obi !== undefined && obi !== null) {
			data += '<div class="ui-block-a"><span class="grid-label">&nbsp;</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + obi + '</span></div>';
		}
		data += '</div>';
	}

	data += '</div></li>';

	data += '<li><div data-role="fieldcontain">';
	var radioid = "wiredetail-" + pendingWire.wireId;
	var radioname = "wiredetail" + pendingWire.wireId;
	data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
	var checked = '';
	var disabled = '';
	if (pendingWire.status === 'Release')
		checked = 'checked';
	if(disableDetails === true)
		disabled = 'disabled';	
	data += '<div class="ui-block-a">';
	data += '<input type="radio" name="' + radioname + '" id="21' + radioid + '" value="Release" ' + checked + ' ' + disabled + '/>';
	data += '<label for="21' + radioid + '">Release</label>';
	data += '</div>';
	checked = '';
	if (pendingWire.status === 'Hold')
		checked = 'checked';
	data += '<div class="ui-block-b">';
	data += '<input type="radio" name="' + radioname + '" id="22' + radioid + '" value="Hold" ' + checked + ' ' + disabled + '/>';
	data += '<label for="22' + radioid + '">Hold</label>';
	data += '</div>';
	checked = '';
	if (pendingWire.status === 'Reject')
		checked = 'checked';
	data += '<div class="ui-block-c">';
	data += '<input type="radio" name="' + radioname + '" id="23' + radioid + '" value="Reject" ' + checked + ' ' + disabled + '/>';
	data += '<label for="23' + radioid + '">Reject</label>';
	data += '</div>';
	data += '</fieldset>';
	data += '</div></li>';

	data += '</ul>';
	$("#wireinfo").append(data);
	$("#wire").listview();

	$("#nextwirebutton").die().live('click', function() {
		if (currentSession.selectedWireIndex < currentSession.pendingWires.length - 1) {
			currentSession.selectedWireIndex += 1;
			var currPage = $.mobile.activePage.attr('id');
			showWireDetail(currentSession.pendingWires[currentSession.selectedWireIndex].wireId, currPage);
		}
	});

	$("#prevwirebutton").die().live('click', function() {
		if (currentSession.selectedWireIndex > 0) {
			currentSession.selectedWireIndex -= 1;
			var currPage = $.mobile.activePage.attr('id');
			showWireDetail(currentSession.pendingWires[currentSession.selectedWireIndex].wireId, currPage);
		}
	});

}

function showPendingWiresVerify() {
	var $wiresverifysummary = $("#wiresverifysummary");
	$wiresverifysummary.remove('li');

	var $wiresverifylist = $("#wiresverifylist");
	$wiresverifylist.children().remove();

	if (currentSession.wireAuthenticated === true) {
		var summary = '<li data-role="list-divider"><strong>Wire Release Summary</strong></li>';
		//get summary
		var summaries = {};
		var counts = {};
		var rejected = 0;
		var held = 0;
		for (var i = 0; i < currentSession.pendingWires.length; i++) {
			var pendingWire = currentSession.pendingWires[i];
			if (pendingWire.status === 'Release') {
				var total = summaries[pendingWire.currency];
				if (total === null || total === undefined) {
					total = new Number(0.00);
				}
				var amt = null;

				if (pendingWire.extra.extra['originalAmt'] !== null && pendingWire.extra.extra['originalAmt'] !== undefined && pendingWire.extra.extra['originalAmt'] !== '') {
					amt = new Number(pendingWire.extra.extra['originalAmt']);
				} else if (pendingWire.amount !== undefined && pendingWire.amount !== null && pendingWire.amount !== '') {
					amt = new Number(pendingWire.amount);
				} else {
					amt = new Number(0.00);
				}

				total = total + amt;
				summaries[pendingWire.currency] = total;
				var count = counts[pendingWire.currency];
				if (count === undefined || count === null) {
					count = new Number(0);
				}
				count = count + 1;
				counts[pendingWire.currency] = count;
			} else if (pendingWire.status === 'Hold') {
				held += 1;
			} else if (pendingWire.status === 'Reject') {
				rejected += 1;
			}
		}

		summary += '<li>';
		summary += '<div class="ui-grid-a">';
		summary += '<div class="ui-block-a"><span class="grid-label">Items Held:</span></div>';
		summary += '<div class="ui-block-b"><span class="grid-label-normal">' + held + '</span></div>';
		summary += '<div class="ui-block-a"><span class="grid-label">Items Rejected:</span></div>';
		summary += '<div class="ui-block-b"><span class="grid-label-normal">' + rejected + '</span></div>';
		summary += '</div>';
		for (var key in summaries) {
			if (summaries.hasOwnProperty(key)) {
				summary += '<div class="ui-grid-a">';
				summary += '<div class="ui-block-a"><span class="grid-label">Items Released (' + key + '):</span></div>';
				summary += '<div class="ui-block-b"><span class="grid-label-normal">' + counts[key] + '</span></div>';
				summary += '<div class="ui-block-a"><span class="grid-label">Amount Released:</span></div>';
				summary += '<div class="ui-block-b"><span class="grid-label-normal">' + accounting.formatMoney(summaries[key]) + ' (' + key + ')</span></div>';
				summary += '</div>';
			}
		}
		summary += '</li>';

		$wiresverifysummary.html(summary);
		$wiresverifysummary.listview('refresh');

		//var $wiresverifylist = $("#wiresverifylist");
		//$wiresverifylist.children().remove();

		for (i = 0; i < currentSession.pendingWires.length; i++) {
			pendingWire = currentSession.pendingWires[i];
			var id = "wireverify" + pendingWire.wireId;
			var data = '<ul data-role="listview" data-inset="true" id="' + id + '">';
			data += '<li data-icon="carrot"><a href="#wiredetail"><div class="ui-grid-a">';
			var dateLabel = null;
			var dateStr = '';

			if (pendingWire.type === 'Domestic Wire' || pendingWire.type === 'Book Wire' || pendingWire.type === 'Drawdown Wire') {
				dateLabel = 'Value Date';
				dateStr = getDateFromYYYYMMDD(pendingWire.extra.extra['dateDue']);
			} else if (pendingWire.type === 'International Wire') {
				dateLabel = 'Processing Date';
				dateStr = dateFormat(convertAxisDate(pendingWire.dateToPost), "mm/dd/yyyy");
			}

			data += '<div class="ui-block-a"><span class="grid-label">' + dateLabel + '</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + dateStr + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			if (pendingWire.extra.extra['beneficiary'] === undefined)
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.beneficiary + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['beneficiary'] + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">From Account:</span></div>';
			var acct = pendingWire.extra.extra['debitAcctNum'];
			acct = 'x' + acct.substr(acct.length - 4);

			data += '<div class="ui-block-b"><span class="grid-label-normal">' + acct + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Wire Type:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.type + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
			if (pendingWire.type === 'International Wire') {
				if (pendingWire.currency === 'USD') {
					data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingWire.extra.extra['originalAmt']) + '</span></div>';
				} else {
					data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.extra.extra['originalAmt'] + ' ' + pendingWire.currency + '</span></div>';
				}
			} else {
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + formatAmount(pendingWire.amount) + '</span></div>';
			}
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + pendingWire.status + '</span></div>';
			data += '</div>';

			data += '</a></li>';
			data += '</ul>';

			$wiresverifylist.append(data);
			$("#" + id).listview();
			$("#" + id).die().live('click', function() {
				currentSession.wireId = jQuery(this).attr("id").substring(10);
				currentSession.selectedWireIndex = $(this).index();
			});
			//$(id).die('click');
			//$(id).live('click', function() {
			//	currentSession.wireId = jQuery(this).attr("id");
			//});
		}
	}
}

function showBranchDetails() {

	$('#branchlinks li').remove();

	var title = $(currentSession.branch).find('title').text();
	var address = $(currentSession.branch).find('address').text();
	var city = $(currentSession.branch).find('city').text();
	var state = $(currentSession.branch).find('state').text();
	var zip = $(currentSession.branch).find('zip').text();
	var hours = $(currentSession.branch).find('hours').text();
	var hours2 = $(currentSession.branch).find('hours2').text();
	var lat = $(currentSession.branch).find('lat').text();
	var lon = $(currentSession.branch).find('lon').text();
	var phone = $(currentSession.branch).find('phone').text();

	var html = '<li style="white-space:normal">';
	html += '<h4><span style="white-space:normal">' + title + '</span></h4>';
	html += '<br>';
	html += '<p><span style="white-space:normal">' + address + '</span></p>';
	html += '<p><span style="white-space:normal">' + city + ', ' + state + ' ' + zip + '</span></p>';
	if (phone !== undefined && phone !== null && phone !== 'NA') {
		html += '<h4><span style="white-space:normal">' + phone + '</span></h4>';
	}
	html += '<br>';
	html += '<p><span style="white-space:normal">' + hours + '</span></p>';
	if(hours2 !== '' && hours2 !== undefined && hours2 !== null)
		html += '<p><span style="white-space:normal">' + hours2 + '</span></p>';
	html += '</li>';
	$('#branchdetail').children().remove('li');
	$('#branchdetail').html(html).listview('refresh');

	var url = 'http://maps.google.com/maps?q=CitizensBank@' + lat + ',' + lon;
	var data = '<li data-icon="carrot">';
	data += '<a target="_blank" href="' + url + '"' + ' rel="external">Map Location</a>';
	data += '</li>';

	data += '<li data-icon="carrot">';
	url = "http://maps.google.com/maps?" + "saddr=" + currentLocation.coords.latitude + "," + currentLocation.coords.longitude + "&daddr=" + encodeURIComponent(address + "," + city + "," + state + "," + zip);
	data += '<a target="_blank" href="' + url + '">Driving Directions</a>';

	data += '</li>';

	if (phone !== undefined && phone !== null && phone !== 'NA') {
		data += '<li data-icon="carrot" id="branchphone"><a href="#">Call This Branch</a></li>';
	}

	$('#branchlinks').html(data).listview('refresh');
	$("#branchdetails").page();

	$("#branchphone").die().live("click", function() {
		var phone = $(currentSession.branch).find('phone').text();
		var message = exitBranchPhoneMessage.replace(/@/g, phone);
		phone = phone.replace(/-/g, '');
		$("#branchphoneform").attr("action", "tel:+1" + phone);
		$('<div>').simpledialog2({
			mode : 'button',
			headerText : exitAMHeader,
			headerClose : true,
			buttonPrompt : message,
			themeHeader : "f",
			buttons : {
				'OK' : {
					click : function() {
						var user = currentSession.mbUser;
						if (user !== undefined && user !== null) {
							if (user.authenticated === 'true') {
								MBSecurityConnector.sendLogoutRequest(user);
								$("#branchphoneform").submit();
							}
						} else {
							$("#branchphoneform").submit();
						}
					}
				},
				'Cancel' : {
					click : function() {
						//do nothing
					},
					icon : "delete",
					theme : "c"
				}
			}
		});

		//$("form#branchphoneform").submit();
	});
}

function showBranchList() {
	$('#listbyzip').children().remove('li');
	var liArray = [];
	$(currentSession.branches).each(function() {
		var title = $(this).find('title').text();
		var address = $(this).find('address').text();
		var city = $(this).find('city').text();
		var state = $(this).find('state').text();
		var distance = $(this).find('dist').text();
		var line2 = address + ", " + city + ", " + state;
		liArray.push('<li data-icon="carrot" style="white-space:normal"><a href="#branchdetails" ><h4><span style="white-space:normal">' + title + '</span></h4><p><span style="white-space:normal">' + line2 + '</span></p><p class="ui-li-aside">' + distance + '</p></a></li>');
	});

	var listItems = liArray.join("");
	$('#listbyzip').append(listItems);
	$('#listbyzip').listview('refresh');
	$("#branchesbyziplist").page();

	$('#listbyzip li').live('click', function() {
		var selected_index = $(this).index();
		currentSession.branch = currentSession.branches[selected_index];
	});
}

function showLocationOnMap() {
	var lat = $(currentSession.branch).find('lat').text();
	var lon = $(currentSession.branch).find('lon').text();
	var title = $(currentSession.branch).find('title').text();
	var myLatlng = new google.maps.LatLng(lat, lon);
	var myOptions = {
		zoom : 15,
		center : myLatlng,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	var marker = new google.maps.Marker({
		position : myLatlng,
		map : map,
		title : title
	});
}

function getCurrentLocation() {
	navigator.geolocation.getCurrentPosition(locationFound);
}

function locationFound(position) {
	var brand = 'Citizens';
	currentLocation = position;
	var url = branchLocatorUrl + '?brand=' + brand + '&q1=-670922684&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude;
	showPleaseWait();
	$.get(url, function(data) {
		hidePleaseWait();
		log(data);
		var xml = $.parseXML(data);
		currentSession.branches = $(xml).find('branch');
		var count = $(currentSession.branches).length;
		if (count > 0) {
			$.mobile.changePage("#branchesbyziplist");
		} else {
			displayPopupAlert('', 'No branches found. Please enter an alternate zip code.', null);
		}
	});
}

function branchByZipcode(position) {
	currentLocation = position;
	var zipcode = $("#zipcode").val();
	var brand = 'Citizens';
	var q1 = '-12981032894';
	var url = branchLocatorUrl + '?brand=' + brand + '&q1=' + q1 + '&zip=' + zipcode;
	showPleaseWait();
	$.get(url, function(data) {
		var xml = data;
		log(xml);
		hidePleaseWait();
		currentSession.branches = $(xml).find('branch');
		var count = $(currentSession.branches).length;
		if (count > 0) {
			$.mobile.changePage("#branchesbyziplist");
		} else {
			displayPopupAlert('Information', 'No branches found.\r\nPlease enter an alternate zip code.', null);
		}
	});
}

function showDirections() {
	navigator.geolocation.getCurrentPosition(displayDirections);
}

function displayDirections(position) {
	var lat = $(currentSession.branch).find('lat').text();
	var lon = $(currentSession.branch).find('lon').text();
	var address = $(this).find('address').text();
	var city = $(this).find('city').text();
	var state = $(this).find('state').text();
	var zip = $(currentSession.branch).find('zip').text();

	var url = "http://maps.google.com/maps?" + "saddr=" + position.coords.latitude + "," + position.coords.longitude + "&daddr=" + encodeURIComponent(address + "," + city + "," + state + "," + zip);
	window.open(url);
	//$('#map_canvas2').gmap({ 'center': new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 'callback': function() {
	/*$('#map_directions').gmap('displayDirections', {
	 'origin' : new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
	 'destination' : new google.maps.LatLng(lat, lon),
	 'travelMode' : google.maps.DirectionsTravelMode.DRIVING
	 }, {
	 'panel' : document.getElementById('directions')
	 }, function(response, status) {
	 ( status === 'OK' ) ? $('#results').show() : $('#results').hide();
	 });
	 //}});*/
}

function showWireTemplates() {
	$("#wire-amount").val('');
	$("#wire-date").val('');
	$("#wiretemplateemaildata").val('');
	$("#wiretemplatedetailrefforbenedata").val('');
	$("#wiretemplatedetailobi1data").val('');
	$("#wiretemplatedetailobi2data").val('');
	$("#wiretemplatedetailobi3data").val('');
	$("#wiretemplatedetailobi4data").val('');
	$("#wiretemplatedetailbbi1data").val('');
	$("#wiretemplatedetailbbi2data").val('');
	$("#wiretemplatedetailbbi3data").val('');
	$("#wiretemplatedetailbbi4data").val('');
	$("#wiretemplatedetailname").text('');
	$("#wiretemplatedetailnickname").text('');

	var $wiretemplatelist = $("#wiretemplatelist");
	$wiretemplatelist.empty();

	if (currentSession.wireTemplates.length === 0) {
		$("#wiretemplatelistheading").hide();
		$wiretemplatelist.text("No templates assigned or created.");
	} else {
		$("#wiretemplatelistheading").show();
		for (var i = 0; i < currentSession.wireTemplates.length; i++) {
			var template = currentSession.wireTemplates[i];
			var id = 'wiretemp' + template.id;
			var data = '<ul data-role="listview" data-divider-theme="f" data-inset="true" id="' + id + '" >';
			data += '<li>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Template Name:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + template.name + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Nickname:</span></div>';
			if (template.nickName !== 'null')
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + template.nickName + '</span></div>';
			else
				data += '<div class="ui-block-b"><span class="grid-label">&nbsp;</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Wire Type:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + capitalize(template.extra.extra["dispType"]) + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Scope:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + capitalize(template.scope) + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Category:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + capitalize(template.category) + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Debit Account:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + template.debitAcctNum + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Beneficiary:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + template.beneficiary + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Credit Account:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label-normal">' + template.creditAcctNum + '</span></div>';
			data += '</div>';
			if (template.type === 'INTERNATIONAL') {
				data += '<div class="ui-grid-a">';
				data += '<div class="ui-block-a"><span class="grid-label">Original Limit:</span></div>';
				var amt = template.originalAmt;
				if (amt === '' || amt === undefined || amt === null)
					amt = 'No Limit';
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + amt + ' (' + template.currency + ')</span></div>';
				data += '</div>';
				data += '<div class="ui-grid-a">';
				data += '<div class="ui-block-a"><span class="grid-label">USD Limit:</span></div>';
			} else {
				data += '<div class="ui-grid-a">';
				data += '<div class="ui-block-a"><span class="grid-label">Limit:</span></div>';
			}
			if (template.usdAmount === '0' || template.usdAmount === '0.00') {
				data += '<div class="ui-block-b"><span class="grid-label-normal">No Limit</span></div>';
			} else {
				data += '<div class="ui-block-b"><span class="grid-label-normal">' + accounting.formatMoney(template.usdAmount) + '</span></div>';
			}
			data += '</div>';
			data += '</li>';
			var btnId = "loadwiretemp" + template.id;
			data += '<li data-icon="carrot"><a href="#" data-role="button" data-theme="g" id="' + btnId + '">Load Template</a></li>';
			data += '</ul>';
			$wiretemplatelist.append(data);
			$("#" + id).listview();

			$("#" + btnId).die().live("click", function() {
				var id = jQuery(this).attr("id");
				id = id.substring(12, id.length);
				currentSession.selectedWireTemplate = null;
				//load the template here
				for (var i = 0; i < currentSession.wireTemplates.length; i++) {
					if (id === currentSession.wireTemplates[i].id) {
						currentSession.selectedWireTemplate = clone(currentSession.wireTemplates[i]);
						//currentSession.selectedWireTemplate = $.extend(true, currentSession.selectedWireTemplate, currentSession.wireTemplates[i]);
						break;
					}
				}
				if (currentSession.selectedWireTemplate !== null) {
					MBAccountConnector.sendLoadWireTemplateRequest(currentSession.mbUser, currentSession.selectedWireTemplate);
				}
			});

		}
	}

}

function clone(src) {
	function mixin(dest, source, copyFunc) {
		var name, s, i, empty = {};
		for (name in source) {
			// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
			// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
			// don't overwrite it with the toString() method that source inherited from Object.prototype
			s = source[name];
			if (!( name in dest) || (dest[name] !== s && (!( name in empty) || empty[name] !== s))) {
				dest[name] = copyFunc ? copyFunc(s) : s;
			}
		}
		return dest;
	}

	if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
		// null, undefined, any non-object, or function
		return src;
		// anything
	}
	if (src.nodeType && "cloneNode" in src) {
		// DOM Node
		return src.cloneNode(true);
		// Node
	}
	if ( src instanceof Date) {
		// Date
		return new Date(src.getTime());
		// Date
	}
	if ( src instanceof RegExp) {
		// RegExp
		return new RegExp(src);
		// RegExp
	}
	var r, i, l;
	if ( src instanceof Array) {
		// array
		r = [];
		for ( i = 0, l = src.length; i < l; ++i) {
			if ( i in src) {
				r.push(clone(src[i]));
			}
		}
		// we don't clone functions for performance reasons
		//		}else if(d.isFunction(src)){
		//			// function
		//			r = function(){ return src.apply(this, arguments); };
	} else {
		// generic objects
		r = src.constructor ? new src.constructor() : {};
	}
	return mixin(r, src, clone);

}

/*----------------------------------------------------------------------------------------------------------------------*/

$("#branches").live("pagebeforeshow", function(event, data) {
    var prevPage = data.prevPage.attr('id');
    if (prevPage.indexOf("start") !== -1) {
        $("#branchesbackbutton").text("Main Menu");
    } else if (prevPage.indexOf("moremenu") !== -1) {
        $("#branchesbackbutton").text("More");
    }

	$("#brancheslogoutbutton").hide();
	$("#brancheslogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#brancheslogoutbutton").show();
			$("#brancheslogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
});



$("#branchesbyzip").live("pagebeforeshow", function(event, data) {

	$("#branchbyziplogoutbutton").hide();
	$("#branchbyziplogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#branchbyziplogoutbutton").show();
			$("#branchbyziplogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
});

$("#branchesbyziplist").live("pagebeforeshow", function(event, data) {
	$("#branchziplistlogoutbutton").hide();
	$("#branchziplistlogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#branchziplistlogoutbutton").show();
			$("#branchziplistlogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
	showBranchList();
});

$("#branchdetails").live("pagebeforeshow", function(event, data) {
	$("#branchdetaillogoutbutton").hide();
	$("#branchdetaillogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#branchdetaillogoutbutton").show();
			$("#branchdetaillogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
	showBranchDetails();
});

$('#branchesbylocitem').live('click', 'li', function() {
	getCurrentLocation();
});

function displayCommCardConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitAMMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                            window.open(commercialCardURL, "_blank");
                        }
                    } else {
                        window.open(commercialCardURL, "_blank");
                    }
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

function displayCommCardContactConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitAMEmailMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                        }
                    } 
                    if(phoneGapContainer)
                    	navigator.app.loadUrl("mailto:commlcard@rbscitizens.com?subject=Commercial%20Card%20inquiry%20from%20accessMOBILE", {openExternal:true});
                    else
                    	window.location.href = "mailto:commlcard@rbscitizens.com?subject=Commercial%20Card%20inquiry%20from%20accessMOBILE";	
                    
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

function displayFXUpdateConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitAMMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                            window.open(fxURL, "_blank");
                        }
                    } else {
                        window.open(fxURL, "_blank");
                    }
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

function displayFXContactConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitFXPhoneMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                            //$("#fxContactPhone").click();
                            $("#fxcontactphoneform").submit();
                        }
                    } else {
                        //$("#fxContactPhone").click();
                        $("#fxcontactphoneform").submit();
                    }
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

function displayContactUsPhoneConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitContactUsPhoneMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                            $("#contactusphoneform").submit();
                        }
                    } else {
                        $("#contactusphoneform").submit();
                    }
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

function contactUsIntlPhoneConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitContactUsIntlPhoneMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                            $("#contactusintphoneform").submit();
                        }
                    } else {
                        $("#contactusintphoneform").submit();
                    }
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

function contactUsEmailConfirmation() {
    $('<div>').simpledialog2({
        mode: 'button',
        headerText: exitAMHeader,
        headerClose: true,
        buttonPrompt: exitContactUsEmailMessage,
        themeHeader: "f",
        buttons: {
            'OK': {
                click: function () {
                    var user = currentSession.mbUser;
                    if (user !== undefined && user !== null) {
                        if (user.authenticated === 'true') {
                            MBSecurityConnector.sendLogoutRequest(user);
                        }
                    } 
                    if(phoneGapContainer)
                    	navigator.app.loadUrl("mailto:clientservices@rbscitizens.com?subject=Question%20on%20accessMOBILE", {openExternal:true});
                    else
                    	window.location.href = "mailto:clientservices@rbscitizens.com?subject=Question%20on%20accessMOBILE";	
                    
                },
                theme: "g"
            },
            'Cancel': {
                click: function () {
                    //do nothing
                },
                icon: "delete",
                theme: "c"
            }
        }
    });
}

$(document).keypress(function(e) {
	if (e.which === 13) {
		//alert("enter pressed");
		log('enter pressed');
	}
});

function onDeviceReady() {

	jQuery.extend(jQuery.mobile.datebox.prototype.options, {
		'overrideDateFormat' : '%B %d, %Y'
	});

	accounting.settings.currency.format = {
		pos : "%s%v",
		neg : "(%s%v)",
		zero : "Not Available"
	};
	
	if(phoneGapContainer) {
		$(".footertext2").hide();
		$("#aboutfooter").hide();
	}

	$("#searchbyzipbutton").die().live("click", function() {
		var zipcode = $("#zipcode").val();
		if(zipcode.length < 5 || zipcode.length > 5) {
			displayPopupAlert("", "Invalid Zip Code. Please enter a valid zip code.", null);
			return;
		}
		
		if(validateZipCodeChars(zipcode) === false) {
			displayPopupAlert("", "Invalid Zip Code. Please enter a valid zip code.", null);
			return;
		}
		navigator.geolocation.getCurrentPosition(branchByZipcode);
	});

	$("#logoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#helplogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#currdaydetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#pendingapprlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#apprdetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#apprverifylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#apprconfirmlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#pendingwirelogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wiredetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wireauthlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wiresverifylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wiresconfirmlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#alertslogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#messageslogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#msgdetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#alertdetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#accthistorylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#transdetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#morelogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#xferslogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#xferverifylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#xferconfirmlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#lockeduserslogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ezdlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ezdhistlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ezdcheckimagelogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ezdcheckdepositlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wiretemplateslogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#loadwiretemplogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wiretempverifylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#wiretempconfirmlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ppaylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#pwilogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ppayverifylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ppayconfirmlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ppaycheckimagelogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#ppaycheckdetaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});


	$("#ppaynonelogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#securemaillogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#securereplylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

    $("#commmorelogoutbutton").die().live("click", function() {
        MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
    });

    $("#fxmorelogoutbutton").die().live("click", function() {
        MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
    });

    $("#ezdpendinglogoutbutton").die().live("click", function() {
        MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
    });
    
    $("#ezdlogoutbutton").die().live("click", function() {
        MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
    });
    
    $("#ezdnoloclogoutbutton").die().live("click", function() {
        MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
    });
    

	$("#submitwiretransferbtn").die().live("click", function() {
		MBAccountConnector.sendCreateWireTransferRequest(currentSession.mbUser, currentSession.selectedWireTemplate);
	});

	$("#deletealert").die().live("click", function() {
		MBAccountConnector.sendDeleteMessageRequest(currentSession.mbUser, currentSession.selectedalert, true);
	});

	$("#deletemessage").die().live("click", function() {
		MBAccountConnector.sendDeleteMessageRequest(currentSession.mbUser, currentSession.selectedmessage, false);
	});

	$("#wiresverifysubmit").die().live("click", function() {
		if (currentSession.wireAuthenticated === true) {
			MBAccountConnector.sendSubmitWireDecisionRequest(currentSession.mbUser, currentSession.pendingWires);
			currentSession.wireAuthenticated = false;
		}
	});

	$("#wireverifysubmitbtn").die().live("click", function() {
		if (currentSession.wireAuthenticated === true) {
			MBAccountConnector.sendSubmitWireDecisionRequest(currentSession.mbUser, currentSession.pendingWires);
			currentSession.wireAuthenticated = false;
		}
	});

	$("#pendingppayrow").die().live("click", function() {
		MBAccountConnector.sendGetPositivePaySuspectsRequest(currentSession.mbUser);
	});

	$("#positivepaymenu").die().live("click", function() {
		if (currentSession.ppayCount > 0) {
			MBAccountConnector.sendGetPositivePaySuspectsRequest(currentSession.mbUser);
		} else {
			$.mobile.changePage("#ppaynoitems");
		}
	});

	$("#positivepaysaveissue").die().live("click", function() {
		//$("#ppay-issuedate").val();
		if ($('#ppay-issuedate').val() !== null && $('#ppay-issuedate').val() !== undefined && $('#ppay-issuedate').val() !== '') {
			var date = $('#ppay-issuedate').data('datebox').theDate;
			if (date !== null || date !== undefined) {
				currentSession.selectedPPaySuspect.payWithIssueDate = date;
			}
		}
		if ($("#ppay-payeename").val() !== null || $("#ppay-payeename").val() !== undefined) {
			currentSession.selectedPPaySuspect.payWithIssuePayee = $("#ppay-payeename").val();
		}
		if ($("#ppay-additionaldata").val() !== null || $("#ppay-additionaldata").val() !== undefined) {
			currentSession.selectedPPaySuspect.additionalData = $("#ppay-additionaldata").val();
		}
		currentSession.selectedPPaySuspect.decision = 'PWI';
		$('#ppay-issuedate').val('');
		$("#ppay-payeename").val('');
		$("#ppay-additionaldata").val('');
		$.mobile.back();
	});

	$("#positivepaycontinue").die().live("click", function() {
		$.mobile.changePage("#positivepayverify");
	});

	$("#positivepaysubmit").die().live("click", function() {
		MBAccountConnector.sendSubmitPositivePayDecisionsRequest(currentSession.mbUser, currentSession.ppaySuspects);
	});

	$("#ppayverifysubmit").die().live("click", function() {
		MBAccountConnector.sendSubmitPositivePayDecisionsRequest(currentSession.mbUser, currentSession.ppaySuspects);
	});

	$("#approveallbutton").die().live("click", function() {
		for (var i = 0; i < currentSession.pendingApprovals.length; i++) {
			currentSession.pendingApprovals[i].status = 'Approve';
		}
		showPendingApprovals();
	});

	$("#wirereleaseallbutton").die().live("click", function() {
		for (var i = 0; i < currentSession.pendingWires.length; i++) {
			currentSession.pendingWires[i].status = 'Release';
		}
		showPendingWires();
	});

	$('#wiretemplatedetailrefforbenedata').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});

	$('#wiretemplatedetailobi1data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailobi2data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailobi3data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailobi4data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailbbi1data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailbbi2data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailbbi3data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});
	$('#wiretemplatedetailbbi4data').die().live("keypress", function(event) {
		validateWireSpecialChars(event);
	});

	//$("#transfer-amount").maskMoney({thousands:'', decimal:'.'});
	$("#transfer-amount").autoNumeric('init', {
		aSep : ''
	});
	//$("#wire-amount").maskMoney({thousands:'', decimal:'.'});
	$("#wire-amount").autoNumeric('init', {
		aSep : ''
	});

	$('#commcardfacts').die().live('click', function() {
        displayCommCardConfirmation();
    });

    $('#commcardfactsmore').die().live('click', function() {
        displayCommCardConfirmation();
    });

	$('#commcardcontact').die().live('click', function() {
         displayCommCardContactConfirmation();
    });

    $('#commcardcontactmore').die().live('click', function() {
        displayCommCardContactConfirmation();
    });

	$('#fxupdate').die().live('click', function() {
        displayFXUpdateConfirmation();
    });

    $('#fxupdatemore').die().live('click', function() {
        displayFXUpdateConfirmation();
    });


	$('#fxcontact').die().live('click', function() {
        displayFXContactConfirmation();
    });

	$('#fxcontactmore').die().live('click', function() {
        displayFXContactConfirmation();
    });

	$('#contactUsPhone').die().live('click', function() {
        displayContactUsPhoneConfirmation();
    });

    $('#contactUsMorePhone').die().live('click', function() {
        displayContactUsPhoneConfirmation();
    });

	$('#contactUsIntlPhone').die().live('click', function() {
        contactUsIntlPhoneConfirmation();
    });

    $('#contactUsMoreIntlPhone').die().live('click', function() {
        contactUsIntlPhoneConfirmation();
    });

	$('#contactUsEmail').die().live('click', function() {
        contactUsEmailConfirmation();
    });

    $('#contactUsMoreEmail').die().live('click', function() {
        contactUsEmailConfirmation();
    });

	$('#zipcode').die().live("keypress", function(event) {
		validateZipCodeChars(event);
	});

	$("#remotedepositmenu").die().live("click", function() {
		MBAccountConnector.sendGetRDCLocationsRequest(currentSession.mbUser);
	});

	$(this).mousemove(function(e) {
		timerFired();
		lastInactiveTime = 0;
	});

	$(this).keypress(function(e) {
		timerFired();
		lastInactiveTime = 0;
	});


	
}

$(document).ready(function() {
	onDeviceReady();
});


function timerFired() {
	var timeNow = new Date().getTime();
	if (lastInactiveTime === 0) {
		lastInactiveTime = timeNow;
	} else if (lastInactiveTime > 0) {
		var idlePeriod = (timeNow - lastInactiveTime) / 1000;
		var allowdInactivityLimit = inactivityLimit * 60;
		if (idlePeriod > (inactivityLimit * 60)) {
			clearInterval(intervalID);
			lastInactiveTime = -1;
			forcedLogout = true;
			if(currentSession.mbUser !== null)
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
		}
	}
}

function validateEmailAddress(emailAddress) {
	var status = true;
	var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
	if (emailAddress.search(emailRegEx) == -1) {
		status = false;
		displayPopupAlert("Error", "Please enter a valid email address.", null);
	}
	return status;
}

function validateZipCodeChars(zipcode) {
	var status = true;
	var zipRegEx = /^\d{5}/;
	if (zipcode.search(zipRegEx) == -1) {
		status = false;
	}
	return status;
}

function validateWireSpecialChars(event) {

	var key = [event.charCode || event.keyCode || event.which];

	if ((key === null) || (key === 0) || (key === 8) || (key === 9) || (key === 13) || (key === 27) || (key === 16))
		return true;

	var charEntered = String.fromCharCode(key).toLowerCase();

	if (wireValidChars.indexOf(charEntered) > -1)
		return true;

	return event.preventDefault();
}

function entitledForTransfers() {

	var fromAccounts = 0;
	var toAccounts = 0;

	var accounts = currentSession.accounts;

	for ( i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		var ops = account.supportedOps.ops;
		for ( j = 0; j < ops.length; j++) {
			if (ops[j] === 'TRANSFER_FROM') {
				fromAccounts += 1;
			} else if (ops[j] === 'TRANSFER_TO') {
				toAccounts += 1;
			}
		}
	}

	if (fromAccounts === 0 || toAccounts === 0) {
		return false;
	}

	return true;

}

function showTransfersPage() {
	$('#transfer-fromaccount option:selected').remove();
	$('#transfer-toaccount option:selected').remove();
	var fromSelect = $("#transfer-fromaccount");
	fromSelect.empty();
	var accounts = currentSession.accounts;
	fromSelect.append('<option value=""></option>');
	for ( i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		var ops = account.supportedOps.ops;
		for ( j = 0; j < ops.length; j++) {
			if (ops[j] === 'TRANSFER_FROM') {
				fromSelect.append('<option value="' + accounts[i].accountId + '">' + accounts[i].getAccountNameAndNumber() + '</option>');
				break;
			}
		}
	}

	var toSelect = $("#transfer-toaccount");
	toSelect.empty();
	toSelect.append('<option value=""></option>');
	for ( i = 0; i < accounts.length; i++) {
		account = accounts[i];
		ops = account.supportedOps.ops;
		for ( j = 0; j < ops.length; j++) {
			if (ops[j] === 'TRANSFER_TO') {
				toSelect.append('<option value="' + accounts[i].accountId + '">' + accounts[i].getAccountNameAndNumber() + '</option>');
				break;
			}
		}
	}
	currentSession.transfer = new MBTransfer();
	currentSession.transfer.dueDateAsCal = getAxisDate(new Date());
	currentSession.transfer.postDateAsCal = getAxisDate(new Date());
	var dateStr = dateFormat(new Date(), 'mmmm dd, yyyy');
	$('#transfer-date').val(dateStr);
	$('#transfer-date').trigger('calbox', {
		'method' : 'set',
		'value' : dateStr
	});
	$('#transfer-date').trigger('datebox', {
		'method' : 'set',
		'value' : dateStr
	});
	$('#transfer-amount').val('');
	$.mobile.changePage("#transfers");
}

function showTransferEntitlementError() {
	errormessage = "Your account setup is not entitled for Internal Transfers. Please speak to your System Administrator for additional information.";

	/*if (errormessage !== "" || errormessage !== undefined)
		$.mobile.changePage("#messagedialog", {
			role : "dialog",
			reverse : false
		});*/
	displayPopupAlert("", errormessage, null);
}

function getPageTitle(destPage) {
	
	if(destPage.indexOf("loginmfa") !== -1) {
		return "MULTIFACTOR-VIEW";
	} else if(destPage.indexOf("loginpwd") !== -1){
		return "PASSWORD-VIEW";
	} else if(destPage.indexOf("login") !== -1){
		return "LOGIN-VIEW";
	} else if(destPage.indexOf("dashboard") !== -1){
		return "DASHBOARD-VIEW";
	} else if(destPage.indexOf("transfers") !== -1){
		return "TRANSFER-VIEW";
	} else if(destPage.indexOf("transferverify") !== -1){
		return "VERIFYTRANSFER-VIEW";
	} else if(destPage.indexOf("transferconfirm") !== -1){
		return "CONFIRMTRANSFER-VIEW";
	} else if(destPage.indexOf("pendingapprovals") !== -1){
		return "APPROVALS-VIEW";
	} else if(destPage.indexOf("approvaldetail") !== -1){
		return "APPROVALSDETAILS-VIEW";
	} else if(destPage.indexOf("approvalsverify") !== -1){
		return "APPROVALSVERIFY-VIEW";
	} else if(destPage.indexOf("approvalsconfirm") !== -1){
		return "APPROVALSCONFIRM-VIEW";
	} else if(destPage.indexOf("positivepaysuspects") !== -1){
		return "POSITIVEPAY-VIEW";
	} else if(destPage.indexOf("positivepayverify") !== -1){
		return "POSITIVEPAYVERIFY-VIEW";
	} else if(destPage.indexOf("positivepayconfirm") !== -1){
		return "POSITIVEPAYCONFIRM-VIEW";
	} else if(destPage.indexOf("paywithissue") !== -1){
		return "POSITIVEPAYPWI-VIEW";
	} else if(destPage.indexOf("ppaynoitems") !== -1){
		return "POSITIVEPAY-VIEW";
	} else if(destPage.indexOf("ppaycheckimage") !== -1){
		return "POSITIVEPAYCHECK-VIEW";
	} else if(destPage.indexOf("pendingwires") !== -1){
		return "WIRERELEASE-VIEW";
	} else if(destPage.indexOf("wiredetail") !== -1){
		return "WIREDETAILS-VIEW";
	} else if(destPage.indexOf("wiresverify") !== -1){
		return "WIRERELEASEVERIFY-VIEW";
	} else if(destPage.indexOf("wiresconfirm") !== -1){
		return "WIRERELEASECONFIRM-VIEW";
	} else if(destPage.indexOf("wireauthenticate") !== -1){
		return "WIRERELEASEAUTH-VIEW";
	} else if(destPage.indexOf("wiretemplates") !== -1){
		return "WIRETEMPLATES-VIEW";
	} else if(destPage.indexOf("loadwiretemplate") !== -1){
		return "WIRECREATE-VIEW";
	} else if(destPage.indexOf("verifywiretransfer") !== -1){
		return "WIRECREATEVERIFY-VIEW";
	} else if(destPage.indexOf("confirmwiretransfer") !== -1){
		return "WIRECREATECONFIRM-VIEW";
	} else if(destPage.indexOf("messages") !== -1){
		return "MESSAGESLIST-VIEW";
	} else if(destPage.indexOf("messagedetail") !== -1){
		return "MESSAGEREAD-VIEW";
	} else if(destPage.indexOf("securemail") !== -1){
		return "MESSAGESEND-VIEW";
	} else if(destPage.indexOf("securereply") !== -1){
		return "MESSAGEREPLY-VIEW";
	} else if(destPage.indexOf("alerts") !== -1){
		return "ALERTSLIST-VIEW";
	} else if(destPage.indexOf("alertdetail") !== -1){
		return "ALERTREAD-VIEW";
	} else if(destPage.indexOf("accounthistory") !== -1){
		return "ACCOUNTHISTORY-VIEW";
	} else if(destPage.indexOf("transactiondetail") !== -1){
		return "TRANSACTIONDETAIL-VIEW";
	} else if(destPage.indexOf("currentdaydetails") !== -1){
		return "SNAPSHOTREPORT-VIEW";
	} else if(destPage.indexOf("currentday") !== -1){
		return "SELECTSNAPSHOT-VIEW";
	} else if(destPage.indexOf("contactus") !== -1){
		return "CONTACTUS-VIEW";
	} else if(destPage.indexOf("commercial") !== -1){
		return "COMMERCIALCARD-VIEW";
	} else if(destPage.indexOf("foreignExchange") !== -1){
		return "FOREIGNEXCHANGE-VIEW";
	} else if(destPage.indexOf("lockedusersview") !== -1){
		return "ADMIN-VIEW";
	} else if(destPage.indexOf("moremenu") !== -1){
		return "MORE-VIEW";
	} else if(destPage.indexOf("help") !== -1){
		return "FAQ-VIEW";
	} else if(destPage.indexOf("branchesbyzip") !== -1){
		return "SEARCHBYZIP-VIEW";
	} else if(destPage.indexOf("branches") !== -1){
		return "BRANCHLOCATORTYPE-VIEW";
	} else if(destPage.indexOf("about") !== -1){
		return "ABOUT-VIEW";
	} else if(destPage.indexOf("remotedepositoptions") !== -1){
		return "EZD-VIEW";
	} else if(destPage.indexOf("ezdnolocations") !== -1){
		return "EZD-VIEW";
	} else if(destPage.indexOf("remotedeposithistory") !== -1){
		return "EZDHISTORY-VIEW";
	} else if(destPage.indexOf("depositcheckimage") !== -1){
		return "EZDCHECKIMAGE-VIEW";
	} else if(destPage.indexOf("depositchecknosupport") !== -1){
		return "EZDUNSUPPORTED-VIEW";
	} else if(destPage.indexOf("depositcheck") !== -1){
		return "EZDDEPOSIT-VIEW";
	} else if(destPage.indexOf("pgdepositcheck") !== -1){
		return "EZDDEPOSIT-VIEW";
	} else if(destPage.indexOf("ezdpendingdeposits") !== -1){
		return "EZDPENDING-VIEW";
	}  
	
	return "accessMOBILE";
}

function getContentGroup(destPage) {
	
	if(destPage.indexOf("loginmfa") !== -1) {
		return "login";
	} else if(destPage.indexOf("loginpwd") !== -1){
		return "login";
	} else if(destPage.indexOf("login") !== -1) {
		return "login";
	} else if(destPage.indexOf("dashboard") !== -1){
		return "dashboard";
	} else if(destPage.indexOf("transfers") !== -1){
		return "fundsTransfer";
	} else if(destPage.indexOf("transferverify") !== -1){
		return "fundsTransfer";
	} else if(destPage.indexOf("transferconfirm") !== -1){
		return "fundsTransfer";
	} else if(destPage.indexOf("approvaldetail") !== -1){
		return "approval";
	} else if(destPage.indexOf("approvalsverify") !== -1){
		return "approval";
	} else if(destPage.indexOf("approvalsconfirm") !== -1){
		return "approval";
	} else if(destPage.indexOf("positivepaysuspects") !== -1){
		return "positivePay";
	} else if(destPage.indexOf("positivepayverify") !== -1){
		return "positivePay";
	} else if(destPage.indexOf("positivepayconfirm") !== -1){
		return "positivePay";
	} else if(destPage.indexOf("paywithissue") !== -1){
		return "positivePay";
	} else if(destPage.indexOf("ppaynoitems") !== -1){
		return "positivePay";
	} else if(destPage.indexOf("ppaycheckimage") !== -1){
		return "positivePay";
	} else if(destPage.indexOf("pendingwires") !== -1){
		return "wireRelease";
	} else if(destPage.indexOf("wiredetail") !== -1){
		return "wireRelease";
	} else if(destPage.indexOf("wiresverify") !== -1){
		return "wireRelease";
	} else if(destPage.indexOf("wiresconfirm") !== -1){
		return "wireRelease";
	} else if(destPage.indexOf("wireauthenticate") !== -1){
		return "wireRelease";
	} else if(destPage.indexOf("wiretemplates") !== -1){
		return "wireCreate";
	} else if(destPage.indexOf("loadwiretemplate") !== -1){
		return "wireCreate";
	} else if(destPage.indexOf("verifywiretransfer") !== -1){
		return "wireCreate";
	} else if(destPage.indexOf("confirmwiretransfer") !== -1){
		return "wireCreate";
	} else if(destPage.indexOf("messages") !== -1){
		return "messages";
	} else if(destPage.indexOf("messagedetail") !== -1){
		return "messages";
	} else if(destPage.indexOf("securemail") !== -1){
		return "messages";
	} else if(destPage.indexOf("securereply") !== -1){
		return "messages";
	} else if(destPage.indexOf("alerts") !== -1){
		return "alerts";
	} else if(destPage.indexOf("alertdetail") !== -1){
		return "alerts";
	} else if(destPage.indexOf("accounthistory") !== -1){
		return "accountHistory";
	} else if(destPage.indexOf("transactiondetail") !== -1){
		return "accountHistory";
	} else if(destPage.indexOf("currentdaydetails") !== -1){
		return "currDaySnapshot";
	} else if(destPage.indexOf("currentday") !== -1){
		return "currDaySnapshot";
	} else if(destPage.indexOf("contactus") !== -1){
		return "contactUs";
	} else if(destPage.indexOf("commercial") !== -1){
		return "commercialCard";
	} else if(destPage.indexOf("foreignExchange") !== -1){
		return "foreignExchange";
	} else if(destPage.indexOf("lockedusersview") !== -1){
		return "admin";
	} else if(destPage.indexOf("moremenu") !== -1){
		return "more";
	} else if(destPage.indexOf("help") !== -1){
		return "help";
	} else if(destPage.indexOf("branches") !== -1){
		return "branchesATM";
	} else if(destPage.indexOf("about") !== -1){
		return "about";
	} else if(destPage.indexOf("remotedepositoptions") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("ezdnolocations") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("remotedeposithistory") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("depositcheckimage") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("depositchecknosupport") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("depositcheck") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("pgdepositcheck") !== -1){
		return "ezDeposit";
	} else if(destPage.indexOf("ezdpendingdeposits") !== -1){
		return "ezDeposit";
	}  
	
	return "";
}

$(document).live("pagechange", function(e, data) {
	
	//if ( typeof data.toPage === "string") {
	var currUrl = $.mobile.activePage.data('url');
	//console.log("toPage: " + data.toPage);

	var destPage = "/" + currUrl;
	if (window.location.protocol === "file:") {
		destPage = window.location.href;
	}
	/*if (data.toPage.indexOf("#") !== -1) {
	 destPage += data.toPage.substring(data.toPage.indexOf("#") + 1);
	 }*/
	
	var title = getPageTitle(destPage);
	var group = getContentGroup(destPage);

	if (window.Webtrends) {
		Webtrends.multiTrack({
			args : {
				"DCS.dcsuri" : destPage,
				"WT.dl"      : "0",
				"WT.ti"      : title,
				"WT.cg_n"    : group
			}
		});
	}
	//}
});

$(document).live("pagebeforechange", function(e, data) {
	if ( typeof data.toPage === "string") {

		/*var destPage = "/";
		 if (data.toPage.indexOf("#") !== -1) {
		 destPage += data.toPage.substring(data.toPage.indexOf("#") + 1);
		 }

		 if(window.Webtrends) {
		 Webtrends.multiTrack({
		 args : {
		 "DCS.dcsuri" : destPage,
		 "WT.dl" : "0"
		 }
		 });
		 }*/
		
		var index = data.toPage.indexOf("#navbar-");
		if (index !== -1) {
			var pageName = data.toPage.substring(index + 8);
			if (pageName === "pendingapprovals") {
				if(currentSession.hasApprovals === true && currentSession.pending_approvals_count > 0) {
					MBAccountConnector.sendGetPendingApprovalsRequest(currentSession.mbUser);
				} 
				e.preventDefault();
			} else if (pageName === "transfers") {
				if (entitledForTransfers() === true) {
					showTransfersPage();
				} else {
					showTransferEntitlementError();
				}
				e.preventDefault();
			}
		} else if (data.toPage.indexOf("#ppaycheckimagereq") !== -1) {
			MBAccountConnector.sendGetCheckImageRequest(currentSession.mbUser, currentSession.selectedPPaySuspect);
			e.preventDefault();
		}
	}
});

$('#branchmap').live("pageshow", function() {
	showLocationOnMap();
});

$('#branchdirectionsurl').die().live("click", function() {
	showDirections();
});

$('#login').live("pagebeforeshow", function(event, data) {
	currentSession.savedCompanyId = localStorage.getItem('companyid');
	currentSession.savedUserId = localStorage.getItem('userid');
	if (currentSession.savedCompanyId !== undefined && currentSession.savedCompanyId !== null && currentSession.savedUserId !== undefined && currentSession.savedUserId !== null) {
		$('#userid').val(currentSession.savedUserId);
		$('#companyid').val(currentSession.savedCompanyId);
		$('#saveuserid').val('on').slider('refresh');
	} else {
		$('#saveuserid').val('off').slider('refresh');
	}

	//TODO: LOGIN 1
	$("#signonbutton").die().live("click", function() {

		if ($('#companyid').val() === '' || $('#companyid').val() === undefined) {
			displayPopupAlert("Error", "Company ID is required", null);
			return;
		}
		if ($('#userid').val() === '' || $('#userid').val() === undefined) {
			displayPopupAlert("Error", "User ID is required", null);
			return;
		}
		var user = new MBUser();
		user.type = 'consumer';
		user.locale = 'en_US';
		user.userId = $('#userid').val().toLowerCase();
		user.backendUserId = $('#userid').val().toLowerCase();
		user.groupId = $('#companyid').val().toLowerCase();
		user.type = "business";
		if ($('#saveuserid').val() === 'on') {
			currentSession.saveUserId = true;
		} else {
			currentSession.saveUserId = false;
		}
		var extraMap = new MBExtraMap();
		if (currentSession.savedCompanyId !== undefined && currentSession.savedUserId !== undefined) {
			if (user.userId === currentSession.savedUserId)
				extraMap.extra['enc_userid'] = currentSession.savedUserId;
			if (user.groupId === currentSession.savedCompanyId)
				extraMap.extra['enc_companyid'] = currentSession.savedCompanyId;
		}
		var pmdata = localStorage.getItem('pmdata');
		if (pmdata !== null && pmdata !== undefined)
			extraMap.extra['enc_pmdata'] = pmdata;
		var udid = localStorage.getItem('clientid');
		if(udid === null || udid === undefined) {
			udid = uuid.v4();
			localStorage.setItem('clientid', udid);
		}
		extraMap.extra['uuid'] = udid;
		user.extra = extraMap;
		MBSecurityConnector.sendGetMultifactorSecurityInfoRequest(user); //see processGetMultifactorSecurityInfoResponse
	});

});

//TODO: LOGIN 2
$('#loginmfa').live("pagebeforeshow", function(event, data) {
	$('#userid').val('');
	$('#companyid').val('');
	$('#answer').val('');
	$("#question").empty();
	var label = '<label>' + currentSession.question + '</label>';
	$("#question").append(currentSession.question);

	$("#mfabutton").die().live("click", function() {
		currentSession.mbUser.multifactorInfo[0].response = $('#answer').val();
		currentSession.mbUser.multifactorInfo[0].enumClass = 'ChallengeQuestion';
		if ($('#rememberdevice').val() === 'on') {
			currentSession.mbUser.multifactorInfo[0].extra.extra['regDevice'] = 'true';
		} else {
			currentSession.mbUser.multifactorInfo[0].extra.extra['regDevice'] = 'false';
		}
		MBSecurityConnector.answerMultifactorSecurityInfo(currentSession.mbUser); //see processAnswerMultifactorSecurityInfoResponse
	});

});

//TODO: LOGIN 3
$('#loginpwd').live("pagebeforeshow", function(event, data) {
	$('#password').val('');
	$('#token').val('');
	$("#passmarkimage").empty();
	$("#passmarkimage").append('<img src="' + currentSession.imageUrl + '"/>');
	$("#passmarkphrase").empty();
	$("#passmarkphrase").append('<label>' + currentSession.passphrase + '</label>');

	$("#passwordbutton").die().live("click", function() {
		currentSession.mbUser.password = $.base64.encode($('#password').val());
		var extra = currentSession.mbUser.extra;
		extra.extra["token"] = $('#token').val();
		currentSession.mbUser.extra = extra;

		MBSecurityConnector.sendAuthenticateUserRequest(currentSession.mbUser); //see processAuthenticateUserResponse
	});
});

function verifyEntitlements() {

	if (currentSession.hasApprovals === true) {
		if (currentSession.pending_approvals_count > 0) {
			$("#navbar-pendingapprovals").removeClass('ui-disabled');
		} else {
			$("#navbar-pendingapprovals").addClass('ui-disabled');
		}
	} else {
		$("#navbar-pendingapprovals").addClass('ui-disabled');
	}

}

function showDashboard() {
	var $alertsmessages = $("#alertsmessages");
	$alertsmessages.remove('li');
	var data = '';
	if (currentSession.isEntToMessages === false && currentSession.isEntToAlerts === false) {
		$alertsmessages.hide();
	} else {
		var title = null;
		if (currentSession.isEntToMessages === true && currentSession.isEntToAlerts === true) {
			title = 'Alerts and Bank Mail';
		} else if (currentSession.isEntToMessages === true) {
			title = 'Bank Mail';
		} else if (currentSession.isEntToAlerts === true) {
			title = 'Alerts';
		}
		if (currentSession.isEntToMessages === true || currentSession.isEntToAlerts === true) {
			data = '<li data-role="list-divider"><strong>' + title + '</strong></li>';
		}
		if (currentSession.isEntToAlerts === true) {
			if (currentSession.unread_alerts_count === 0) {
				data += '<li><span class="account-label">You have ' + currentSession.unread_alerts_count + ' new Alert(s)</span></li>';
			} else {
				data += '<li data-icon="carrot" id="alertsrow"><a href="#"><span class="account-label">You have ' + currentSession.unread_alerts_count + ' new Alert(s)</span></a></li>';
			}
		}

		if (currentSession.isEntToMessages === true) {
			data += '<li data-icon="carrot" id="messagesrow"><a href="#"><span class="account-label">You have ' + currentSession.unread_messages_count + ' new Bank Message(s)</span></a></li>';
		}
	}
	$alertsmessages.html(data);
	$alertsmessages.listview('refresh');

	var $pendingapprovals = $("#pendingapprovalsdashboard");
	$pendingapprovals.remove('li');
	data = '';
	
	if(currentSession.hasApprovals === true || currentSession.hasWires === true || currentSession.hasPPayDecision === true) {
		data = '<li data-role="list-divider"><strong>Pending Approvals</strong></li>';
	}
	
	if (currentSession.hasApprovals === true) {
		if (currentSession.pending_approvals_count > 0) {
			data += '<li data-icon="carrot" id="pendingapprovalsrow"><a href="#"><span class="account-label">Please approve ' + currentSession.pending_approvals_count + ' new item(s) </span></a></li>';
		} else {
			data += '<li><span class="account-label">No new items to approve</span></li>';
		}
	}

	if (currentSession.hasWires === true) {
		if (currentSession.wires_release_count > 0)
			data += '<li data-icon="carrot" id="pendingwiresrow"><a href="#"><span class="account-label">Please release ' + currentSession.wires_release_count + ' new wire(s) </span></a></li>';
		else
			data += '<li><span class="account-label">No new wires to release</span></li>';

	}

	if (currentSession.hasPPayDecision === true) {
		if (currentSession.ppayCount > 0)
			data += '<li data-icon="carrot" id="pendingppayrow"><a href="#"><span class="account-label" style="white-space:normal">Please decision ' + currentSession.ppayCount + ' positive pay suspects</span></a></li>';
		else
			data += '<li><span class="account-label">No new positive pay items.</span></li>';
	}

	$pendingapprovals.html(data);
	$pendingapprovals.listview('refresh');

	var $lockedusers = $('#lockedusers');
	$lockedusers.remove('li');
	data = '';
	if (currentSession.hasAdminUnlock === true) {
		$('#lockedusersdiv').show();
		data = '<li data-role="list-divider"><strong>Admin</strong></li>';
		if (currentSession.user_lock_count === 0) {
			data += '<li><span class="account-label">You have ' + currentSession.user_lock_count + ' locked user(s)</span></li>';
		} else {
			data += '<li data-icon="carrot" id="lockedusersrow"><a href="#"><span class="account-label">You have ' + currentSession.user_lock_count + ' locked user(s)</span></a></li>';
		}
		$lockedusers.html(data);
		$lockedusers.listview('refresh');

		$("#lockedusersrow").die().live("click", function() {
			MBAccountConnector.sendGetLockedUsersRequest(currentSession.mbUser);
		});
	} else {
		$('#lockedusersdiv').hide();
	}

	data = '<li data-role="list-divider"><strong>Account Summary</strong></li>';
	var $accountsummary = $("#accountsummary");
	$accountsummary.remove('li');
	
	var fav = null;
	var extacct = null;
	var acctErr = null;
	var amount = null;
	var balLabel = null;
	var posted = null; 	
	var balLabel2 = null;
	
	for (var i = 0; i < currentSession.accounts.length; i++) {
		var account = currentSession.accounts[i];
		data += '<li data-icon="carrot"><a href="#">';
		data += '<h6><span class="account-label">' + account.getAccountNameAndNumber() + '</span></h6>';
		
		acctErr = account.extra.extra['acctErr'];
		posted = account.extra.extra['postDate'];
		amount = account.balance;
		extacct = account.extra.extra['extacct'];
		fav = account.extra.extra['favorite'];
		
		if(posted === null || posted === undefined || posted === 'null') {
			posted = "Not Available";
		} 
		
		if(acctErr !== null && acctErr !== undefined && acctErr !== "") {
			amount = acctErr;
			posted = "Not Available";
		}
		else if (amount === null || amount === undefined || amount === "(null)") {
			amount = "Not Available";
			posted = "Not Available ";
		} else {
			amount = accounting.formatMoney(amount); 
		}
		
		balLabel = "Opening Available: ";
		
		if((fav === null || fav === 'n') || (extacct !== null && extacct !== undefined && extacct === 'y')) {
			balLabel = "Opening Available: ";
		}	 
		balLabel2 = "Last Posted: ";
		
		if((fav === null || fav === undefined || fav === 'n') || (extacct !== null && extacct !== undefined && extacct === 'y')) {
			balLabel2 = "Last Posted: ";
		} 
		
		
		data += '<p>' + balLabel +  amount + '</p>';

		data += '<p>' + balLabel2 + posted + '</p>';

		data += '</a></li>';
	}
	$accountsummary.html(data);
	$accountsummary.listview('refresh');

	intervalID = setInterval(timerFired, timerInterval);
	lastInactiveTime = 0;
}

$('#dashboard').live("pagebeforeshow", function(event, data) {

	$("#dashlogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});
	
	MBAccountConnector.sendGetAccountsRequest(currentSession.mbUser);

});

$('#accountsummary li').live('click', function() {
	var index = $(this).index();
	if (currentSession.accounts.length > 0) {
		currentSession.account = currentSession.accounts[index - 1];
		MBAccountConnector.sendGetTransactionsRequest(currentSession.mbUser, currentSession.account);
	}
});

$('#currentday').live("pagebeforeshow", function(event, data) {

	$("#currdaylogoutbutton").die().live("click", function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#lvaccounts").remove('li');
	var hasCurrentDay = false;
	var data = '<li data-role="list-divider"><strong>Accounts</strong></li>';
	for (var i = 0; i < currentSession.accounts.length; i++) {
		var account = currentSession.accounts[i];
		var supportedOps = account.supportedOps.ops;
		for (var j = 0; j < supportedOps.length; j++) {
			if (supportedOps[j] === 'CURDAY_SNAPSHOT') {
				var id = "currentday-" + account.accountId;
				data += '<li data-icon="carrot" id="' + id + '"><a href="#">';
				data += '<h1><span class="grid-label">' + account.getAccountNameAndNumber() + '</span></h1>';
				data += '</a></li>';
				hasCurrentDay = true;
			}
		}
	}

	if (hasCurrentDay === true) {
		$("#currentdaytext").show();
		$("#currentdayerror").hide();
		$("#lvaccounts").html(data);
		$("#lvaccounts").listview('refresh');
	} else {
		$("#currentdaytext").hide();
		$("#currentdayerror").show();
	}

});

$('#lvaccounts li').die().live('click', function() {
	var selected_index = jQuery(this).attr("id");
	//$(this).index();
	var accountId = selected_index.substring(11, selected_index.length);
	for (var i = 0; i < currentSession.accounts.length; i++) {
		if (accountId === currentSession.accounts[i].accountId) {
			currentSession.account = currentSession.accounts[i];
			MBAccountConnector.sendGetAccountSnapshotRequest(currentSession.mbUser, currentSession.account);
			break;
		}
	}
});

$('#currentdaydetails').live("pagebeforeshow", function(event, data) {
	showCurrentDayDetails();
});

$('#pendingapprovalsrow').live('click', function() {
	MBAccountConnector.sendGetPendingApprovalsRequest(currentSession.mbUser);
});

$('#pendingapprovals').live("pagebeforeshow", function(event, data) {
	//$('body').addClass('ui-loading');
	disableDetails = false;
	showPendingApprovals();
});

$('#pendingwiresrow').live("click", function() {
	MBAccountConnector.sendGetPendingWiresRequest(currentSession.mbUser);
});

$('#pendingwiresmenu').live("click", function() {
	MBAccountConnector.sendGetPendingWiresRequest(currentSession.mbUser);
});

$('#pendingwires').live("pagebeforeshow", function(event, data) {
	disableDetails = false;
	showPendingWires();
});

$('#pendingwires').live("pagehide", function(event, data) {
	var $pendingwireslist = $("#pendingwireslist");
	$pendingwireslist.empty();
});

$('#approvaldetail').live("pagebeforeshow", function(event, data) {
	var prevPage = data.prevPage.attr('id');
	showApprovalDetail(currentSession.approvalId, prevPage);
});

$('#wiredetail').live("pagebeforeshow", function(event, data) {
	var prevPage = data.prevPage.attr('id');
    showWireDetail(currentSession.wireId, prevPage);
});

$('#alertsrow').live("click", function() {
	MBAccountConnector.sendGetAlertsRequest(currentSession.mbUser);
});

$('#alertsmenu').live("click", function() {
	MBAccountConnector.sendGetAlertsRequest(currentSession.mbUser);
});

$('#alerts').live("pagebeforeshow", function(event, data) {
	//sendGetAlertsRequest(mbUser);
	var prevPage = data.prevPage.attr('id');

	if (prevPage.indexOf("dashboard") !== -1) {
		$("#alertsbackbtn").text("Home");
	} else if (prevPage.indexOf("moremenu") !== -1) {
		$("#alertsbackbtn").text("More");
	}

	showAlerts();
});

$('#messagesrow').live("click", function() {
	MBAccountConnector.sendGetMessagesRequest(currentSession.mbUser);
});

$('#messagesmenu').live("click", function() {
	MBAccountConnector.sendGetMessagesRequest(currentSession.mbUser);
});

$('#messages').live("pagebeforeshow", function(event, data) {

	var prevPage = data.prevPage.attr('id');

	if (prevPage.indexOf("dashboard") !== -1) {
		$("#msgsbackbtn").text("Home");
	} else if (prevPage.indexOf("moremenu") !== -1) {
		$("#msgsbackbtn").text("More");
	}

	showMessages();
});

$('#messagedetail').live("pagebeforeshow", function(event, data) {
	showMessageDetail();
});

$('#alertdetail').live("pagebeforeshow", function(event, data) {
	showAlertDetail();
});

function updatePPaySuspectStatus(id, status) {
	for (var i = 0; i < currentSession.ppaySuspects.length; i++) {
		if (id === currentSession.ppaySuspects[i].id) {
			currentSession.ppaySuspects[i].decision = status;
			break;
		}
	}
}


$("input[type='radio']").live("change", function(event, ui) {
	var status = $(this).val();
	var selectedId = $(this).attr("id");
	var id = null;
	if (selectedId.indexOf("pendingapproval") !== -1) {
		id = selectedId.substring(16, selectedId.length);
		updatePendingApprovalStatus(id, status);
	} else if (selectedId.indexOf("wiredetail") !== -1) {
		id = selectedId.substring(13, selectedId.length);
		updateWireReleaseStatus(id, status);
	} else if (selectedId.indexOf("pendingwire") !== -1) {
		id = selectedId.substring(14, selectedId.length);
		updateWireReleaseStatus(id, status);
	} else if (selectedId.indexOf("approvaldetail") !== -1) {
		id = selectedId.substring(15, selectedId.length - 3);
		updatePendingApprovalStatus(id, status);
	} else {
		id = selectedId.substring(14, selectedId.length);
		updatePPaySuspectStatus(id, status);
	}

});

$('#messagedialog').live("pagebeforeshow", function(event, data) {
	$("#message").children().empty();
	var label = '<label>' + errormessage + '</label>';
	$("#message").append(label);
});

$('#lockoutdialog').live("pagebeforeshow", function(event, data) {
	$("#lockoutmessage").children().empty();
	var label = '<label>' + errormessage + '</label>';
	$("#lockoutmessage").append(label);
});

$('#navbar-histday1').die().live("click", function() {
	if (currentSession.selectedHistoryDay !== 0) {
		currentSession.selectedHistoryDay = 0;
		MBAccountConnector.sendGetSelectedTransactionsRequest(currentSession.availableDates[0], currentSession.mbUser, currentSession.account);
	}
});

$('#navbar-histday2').die().live("click", function() {
	if (currentSession.selectedHistoryDay !== 1) {
		currentSession.selectedHistoryDay = 1;
		MBAccountConnector.sendGetSelectedTransactionsRequest(currentSession.availableDates[1], currentSession.mbUser, currentSession.account);
	}
});

$('#navbar-histday3').die().live("click", function() {
	if (currentSession.selectedHistoryDay !== 2) {
		currentSession.selectedHistoryDay = 2;
		MBAccountConnector.sendGetSelectedTransactionsRequest(currentSession.availableDates[2], currentSession.mbUser, currentSession.account);
	}
});

$('#navbar-histday4').die().live("click", function() {
	if (currentSession.selectedHistoryDay !== 3) {
		currentSession.selectedHistoryDay = 3;
		MBAccountConnector.sendGetSelectedTransactionsRequest(currentSession.availableDates[3], currentSession.mbUser, currentSession.account);
	}
});

$('#navbar-histday5').die().live("click", function() {
	if (currentSession.selectedHistoryDay !== 4) {
		currentSession.selectedHistoryDay = 4;
		MBAccountConnector.sendGetSelectedTransactionsRequest(currentSession.availableDates[4], currentSession.mbUser, currentSession.account);
	}
});

function showTransactionTabBar(footerid) {
	$('#' + footerid).children().remove();
	if (currentSession.availableDates.length > 0) {
		var data = '<div data-role="navbar" class="ui-navbar-custom"  id="' + footerid + '"><ul>';
		var dateStr = currentSession.availableDates[0];
		//yyyymmdd
		dateStr = dateStr.substring(0, dateStr.indexOf('-'));
		var date = new Date();
		date.setFullYear(dateStr.substring(0, 4));
		date.setMonth(dateStr.substring(4, 6) - 1);
		date.setDate(dateStr.substring(6, 8));
		var activebtn = '';
		if (currentSession.selectedHistoryDay === 0)
			activebtn = 'class="ui-btn-active"';

		data += '<li><a href="#" id="navbar-histday1" ' + activebtn + ' data-icon="cal' + date.getDate() + '"><span id="navbar-day1-text">' + weekdays[date.getDay()] + '</span></a></li>';
		dateStr = currentSession.availableDates[1];
		dateStr = dateStr.substring(0, dateStr.indexOf('-'));
		date.setFullYear(dateStr.substring(0, 4));
		date.setMonth(dateStr.substring(4, 6) - 1);
		date.setDate(dateStr.substring(6, 8));

		activebtn = '';
		if (currentSession.selectedHistoryDay == 1)
			activebtn = 'class="ui-btn-active"';
		data += '<li><a href="#" id="navbar-histday2" ' + activebtn + '  data-icon="cal' + date.getDate() + '"><span id="navbar-day2-text">' + weekdays[date.getDay()] + '</span></a></li>';
		dateStr = currentSession.availableDates[2];
		dateStr = dateStr.substring(0, dateStr.indexOf('-'));
		date.setFullYear(dateStr.substring(0, 4));
		date.setMonth(dateStr.substring(4, 6) - 1);
		date.setDate(dateStr.substring(6, 8));

		activebtn = '';
		if (currentSession.selectedHistoryDay == 2)
			activebtn = 'class="ui-btn-active"';
		data += '<li><a href="#" id="navbar-histday3" ' + activebtn + '  data-icon="cal' + date.getDate() + '"><span id="navbar-day3-text">' + weekdays[date.getDay()] + '</span></a></li>';
		dateStr = currentSession.availableDates[3];
		dateStr = dateStr.substring(0, dateStr.indexOf('-'));
		date.setFullYear(dateStr.substring(0, 4));
		date.setMonth(dateStr.substring(4, 6) - 1);
		date.setDate(dateStr.substring(6, 8));

		activebtn = '';
		if (currentSession.selectedHistoryDay == 3)
			activebtn = 'class="ui-btn-active"';
		data += '<li><a href="#" id="navbar-histday4" ' + activebtn + '  data-icon="cal' + date.getDate() + '"><span id="navbar-day4-text">' + weekdays[date.getDay()] + '</span></a></li>';
		dateStr = currentSession.availableDates[4];
		dateStr = dateStr.substring(0, dateStr.indexOf('-'));
		date.setFullYear(dateStr.substring(0, 4));
		date.setMonth(dateStr.substring(4, 6) - 1);
		date.setDate(dateStr.substring(6, 8));

		activebtn = '';
		if (currentSession.selectedHistoryDay == 4)
			activebtn = 'class="ui-btn-active"';
		data += '<li><a href="#" id="navbar-histday5" ' + activebtn + '  data-icon="cal' + date.getDate() + '"><span id="navbar-day5-text">' + weekdays[date.getDay()] + '</span></a></li>';
		data += '</ul></div>';
		$('#' + footerid).append(data).trigger("create");
	} else {
		$('#' + footerid).hide();
	}
}


$('#accounthistory').live("pagebeforeshow", function(event, data) {
	$('#histAccountName').children().remove();
	var acctName = '<h1><span class="account-label">' + currentSession.account.getAccountNameNumberAndCurrency() + '</span></h1>';
	$('#histAccountName').append(acctName);
	showTransactions();
	showTransactionTabBar("histFooter");
});

function showTransactionDetail() {
	var heading = 'Detail ' + (currentSession.selectedtransactionIndex + 1) + ' of ' + currentSession.transactions.length;
	$("#transationdetailheading").text(heading);
	$('#histdetailAccountName').text(currentSession.account.getAccountNameNumberAndCurrency());
	$('#histProcessedOn').text(currentSession.selectedtransaction.extra.extra["procDate"]);
	$('#histTransType').text(currentSession.selectedtransaction.description);
	$('#histBAICode').text(currentSession.selectedtransaction.extra.extra["baiCode"]);
	data = currentSession.selectedtransaction.referenceId;
	if (data !== undefined && data !== null && data !== '') {
		$('#histBankRefNum').text(data);
	}

	data = currentSession.selectedtransaction.extra.extra["custrefnum"];
	if (data !== undefined && data !== null && data !== '') {
		$('#histCustomerRefNum').text(data);
	}

	data = currentSession.selectedtransaction.transDateAsCal;
	if (data !== undefined && data !== null && data !== '') {
		data = dateFormat(convertAxisDate(data), "mm/dd/yyyy");
		$('#histDate').text(data);
	}

	data = currentSession.selectedtransaction.extra.extra["amt_raw"];
	if (data === undefined || data === null || data === '')
		data = currentSession.selectedtransaction.amount;
	if (data !== undefined && data !== null && data !== '') {
		if (data.indexOf("-") !== -1) {
			$('#histAmountLabel').text("Amount Debited:");
			data = data.substring(1, data.length);
		} else {
			$('#histAmountLabel').text("Amount Credited:");
		}
		$('#histAmount').text(data);
	}

	$('#histDescription').children().remove();
	data = currentSession.selectedtransaction.extra.extra["desc"];
	if (data !== undefined && data !== null && data !== '') {
		data = data.replace(/\+/g, ' ');
		//data = '<span class="grid-label">' + data + '</span>';
		$('#histDescription').text(unescape(data));
	}

	showTransactionTabBar("histFooter2");

	$("#nexttranbutton").die().live('click', function() {
		if (currentSession.selectedtransactionIndex < currentSession.transactions.length - 1) {
			currentSession.selectedtransactionIndex += 1;
			currentSession.selectedtransaction = currentSession.transactions[currentSession.selectedtransactionIndex];
			showTransactionDetail();
		}
	});

	$("#prevtranbutton").die().live('click', function() {
		if (currentSession.selectedtransactionIndex > 0) {
			currentSession.selectedtransactionIndex -= 1;
			currentSession.selectedtransaction = currentSession.transactions[currentSession.selectedtransactionIndex];
			showTransactionDetail();
		}
	});

}


$('#transactiondetail').live("pagebeforeshow", function(event, data) {
	showTransactionDetail();
});

$("#approvalsverify").live("pagebeforeshow", function(event, data) {
	disableDetails = true;
	showApprovalsVerify();

	$("#approvalsverifysubmit").die().live("click", function() {
		MBAccountConnector.sendSubmitApprovalDecisionsRequest(currentSession.mbUser, currentSession.pendingApprovals);
	});

	$("#approvalsverifysubmit2").die().live("click", function() {
		MBAccountConnector.sendSubmitApprovalDecisionsRequest(currentSession.mbUser, currentSession.pendingApprovals);
	});

});

$("#approvalsconfirm").live("pagebeforeshow", function(event, data) {
	showApprovalsConfirm();
});

$("#transfers").live("pagebeforeshow", function(event, data) {

	if ($('#transfer-date').val() === undefined || $('#transfer-date').val() === null || $('#transfer-date').val() === '') {
		var dateStr = dateFormat(new Date(), 'mmmm dd, yyyy');
		$('#transfer-date').val(dateStr);
		$('#transfer-date').trigger('calbox', {
			'method' : 'set',
			'value' : dateStr
		});
	}

	$("select#transfer-fromaccount").selectmenu('refresh');
	$("select#transfer-toaccount").selectmenu('refresh');

	$("#verifytransferbtn").die().live("click", function() {
		currentSession.transfer.currencyCode = "USD";
		currentSession.transfer.amount = $('#transfer-amount').autoNumeric('get');
		var date = $('#transfer-date').data('datebox').theDate;
		var dateNow = new Date();
		date.setHours(dateNow.getHours());
		date.setMinutes(dateNow.getMinutes());
		date.setSeconds(dateNow.getSeconds());
		date.setMilliseconds(dateNow.getMilliseconds());

		currentSession.transfer.dueDateAsCal = getAxisDate(date);
		
		if($("#transfer-fromaccount option:selected").val() === '') {
			displayPopupAlert("Error", "Please select a source account", null);
			return;
		}
		if($("#transfer-toaccount option:selected").val() === '') {
			displayPopupAlert("Error", "Please select a destination account", null);
			return;
		}
		if(currentSession.transfer.amount === '') {
			displayPopupAlert("Error", "Please enter a valid amount", null);
			return;
		}
		MBTransferConnector.sendTransferVerificationRequest(currentSession.mbUser, currentSession.transfer);
	});

	$("#transfer-fromaccount").live("change", function() {
		var selectedFromId = $("#transfer-fromaccount option:selected").val();
		$("#transfer-toaccount option").each(function() {
			$(this).prop('disabled', false);
		});
		$("#transfer-toaccount option[value='" + selectedFromId + "']").prop('disabled', true);
	});

	$("#transfer-toaccount").live("change", function() {
		var selectedToId = $("#transfer-toaccount option:selected").val();
		$("#transfer-fromaccount option").each(function() {
			$(this).prop('disabled', false);
		});
		$("#transfer-fromaccount option[value='" + selectedToId + "']").prop('disabled', true);
	});

});

$("#transfer-fromaccount").die().live("change", function() {
	var accounts = currentSession.accounts;
	for ( i = 0; i < accounts.length; i++) {
		if (accounts[i].accountId === $(this).val()) {
			currentSession.transfer.fromAccount = accounts[i];
			break;
		}
	}
});

$("#transfer-toaccount").die().live("change", function() {
	var accounts = currentSession.accounts;
	for ( i = 0; i < accounts.length; i++) {
		if (accounts[i].accountId === $(this).val()) {
			currentSession.transfer.toAccount = accounts[i];
			break;
		}
	}
});

$("#transferverify").live("pagebeforeshow", function(event, data) {
	$("#submittransferbtn").die().live("click", function() {
		MBTransferConnector.sendTransferRequest(currentSession.mbUser, currentSession.transfer);
	});
});

$("#wireauthenticate").live("pagebeforeshow", function(event, data) {
	$('#wirepassword').val('');
	$('#wiretoken').val('');
	var pendingWires = currentSession.pendingWires;
	var wireAuthType = null;
	for ( i = 0; i < pendingWires.length; i++) {
		var wire = pendingWires[i];
		var extra = wire.extra.extra;
		if (extra.hasOwnProperty("wireAuthType")) {
			wireAuthType = extra["wireAuthType"];
			break;
		}
	}
	if (wireAuthType !== "RSA") {
		MBAccountConnector.sendGenerateMobileTokenForWiresRequest(currentSession.mbUser);
	}

	$("#wireauthenticatebtn").die().live("click", function() {
		MBAccountConnector.sendAuthorizeWireDecisionRequest($.base64.encode($('#wirepassword').val()), $('#wiretoken').val(), currentSession.mbUser);
	});
	
	$("#cancelwireauthentication").die().live("click", function() {
		var pendingWires = currentSession.pendingWires;
		for ( i = 0; i < pendingWires.length; i++) {
			pendingWires[i].status = 'Hold';
		}
		$.mobile.changePage("#pendingwires");
	});
	
});

$("#wiresverify").live("pagebeforeshow", function(event, data) {
	disableDetails = true;
	showPendingWiresVerify();
});

$("#lockedusersview").live("pagebeforeshow", function(event, data) {

	var prevPage = data.prevPage.attr('id');

	if (prevPage.indexOf("dashboard") !== -1) {
		$("#adminbackbtn").text("Home");
	} else {
		$("#adminbackbtn").text("More");
	}

	if (currentSession.lockedUsers.length > 0) {
		$("#lockeduserstext").hide();
		$("#lockeduserstable").show();
		var $lockedusersviewlist = $("#lockedusersviewlist");
		$lockedusersviewlist.remove("li");
		var summary = '<li data-theme="b" data-role="list-divider"><strong>Unlock Users</strong></li>';

		for (var i = 0; i < currentSession.lockedUsers.length; i++) {
			summary += '<li><a href="#"><h4>' + currentSession.lockedUsers[i].userId + '</h4>';
			var fullname = '';
			if (currentSession.lockedUsers[i].firstName !== null && currentSession.lockedUsers[i].firstName !== undefined)
				fullname += currentSession.lockedUsers[i].firstName;
			if (currentSession.lockedUsers[i].lastName !== null && currentSession.lockedUsers[i].lastName !== undefined)
				fullname += ' ' + currentSession.lockedUsers[i].lastName;
			summary += '<p>' + fullname + '</p></a>';
			summary += '<a href="#" id="' + currentSession.lockedUsers[i].userId + '">Unlock</a>';
			summary += '</li>';
		}

		$lockedusersviewlist.html(summary);
		$lockedusersviewlist.listview('refresh');

		$("#lockedusersviewlist li .ui-li-link-alt").die().live("click", function() {
			var userId = $(this).attr("id");
			MBAccountConnector.sendUserUnlockRequest(currentSession.mbUser, userId);
		});
		
	} else {
		$("#lockeduserstext").show();
		$("#lockeduserstext").text('No users to unlock');
		$("#lockeduserstable").hide();
	}

});

$("#remotedeposithistory").live("pagehide", function(event, data) {
	//$("#remotedeposithistorylist").empty();
});

function showRemoteDepositHistory() {
	var $remotedeposithistorylist = $("#remotedeposithistorylist");
	$remotedeposithistorylist.empty();
	if (currentSession.remoteDeposits.length === 0) {
		$("#remotedeposithistorylist").text("No history found.");
	} else {
		var name = null;
		for (var i = 0; i < currentSession.remoteDeposits.length; i++) {
			var deposit = currentSession.remoteDeposits[i];
			var id = 'rdmdeposit-' + i;
			var data = '<ul data-role="listview" data-divider-theme="f" data-inset="true" id="' + id + '" >';
			data += '<li data-role="list-divider">Deposit ' + deposit.itemStatus + '</li>';
			if (deposit.itemStatus === 'Approved')
				data += '<li data-icon="carrot"><a href="#">';
			else
				data += '<li>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Check Amount:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + accounting.formatMoney(deposit.amount) + '</span></div>';
			data += '</div>';
			
			/*if(deposit.individualName !== null && deposit.individualName !== undefined) {
				data += '<div class="ui-grid-a">';
				data += '<div class="ui-block-a"><span class="grid-label">Name:</span></div>';
				name = deposit.individualName;
				data += '<div class="ui-block-b"><span class="grid-label">' + name + '</span></div>';
				data += '</div>';
			}*/
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Deposit Created on:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + dateFormat(deposit.date, "mm/dd/yy") + ' at ' + dateFormat(deposit.date, "h:MM:ss TT") + '</span></div>';
			data += '</div>';
			if (deposit.itemStatus === 'Approved')
				data += '</a></li></ul>';
			else
				data += '</li></ul>';
			$remotedeposithistorylist.append(data);
			$("#" + id).listview();
			if (deposit.itemStatus === 'Approved') {
				$("#" + id).die().live("click", function() {
					var index = $(this).attr("id").substring(11);
					var rdmdeposit = currentSession.remoteDeposits[index];
					var ezdUser = $("#ezdlocations option:selected").val();
					MBAccountConnector.sendGetRemoteDepositHistoryImagesRequest(currentSession.mbUser, rdmdeposit, ezdUser);
				});
			}
		}
	}
}


$("#remotedeposithistory").live("pagehide", function(event, data) {
	/*$('#ezdlocations option:selected').remove();
	$("#ezdlocations").empty();
	$("#remotedeposithistorylist").empty();*/
});

$("#remotedeposithistory").live("pagebeforeshow", function(event, data) {
	$('#ezdlocations').selectmenu('refresh');

});

$("#wiretemplates").live("pagebeforeshow", function(event, data) {
	showWireTemplates();
});

$("#wiretemplates").live("pagehide", function() {
	var $wiretemplatelist = $("#wiretemplatelist");
	$wiretemplatelist.empty();
});

function showWireTemplateDetail() {

	var extra = currentSession.selectedWireTemplate.extra.extra;
	$("#wiretemplatedetailname").text(capitalize(currentSession.selectedWireTemplate.name));
	if (currentSession.selectedWireTemplate.nickName !== 'null')
		$("#wiretemplatedetailnickname").text(capitalize(currentSession.selectedWireTemplate.nickName));
	$("#wiretemplatedetailtype").text(capitalize(currentSession.selectedWireTemplate.extra.extra['dispType']));
	$("#wiretemplatedetailcategory").text(capitalize(currentSession.selectedWireTemplate.category));
	$("#wiretemplatedetailscope").text(currentSession.selectedWireTemplate.scope);
	var limit = currentSession.selectedWireTemplate.usdAmount;
	if (limit === '0') {
		limit = 'No Limit';
	} else {
		limit = accounting.formatMoney(limit);
	}
	$("#wiretemplatedetaillimit").text(limit);
	$("#wiretemplatedetailbene").text(capitalize(currentSession.selectedWireTemplate.beneficiary));
	$("#wiretemplatedetailcreditacct").text(currentSession.selectedWireTemplate.creditAcctNum);
	var beneBank = extra['beneficiaryBank'];
	if (beneBank !== null || beneBank !== undefined)
		beneBank = capitalize(beneBank);
	$("#wiretemplatedetailbenebank").text(beneBank);
	$("#wiretemplatedetailabaswift").text(extra['abaOrSwift']);
	$("#wiretemplatedetaildebitacct").text(currentSession.selectedWireTemplate.debitAcctNum);

	if (currentSession.selectedWireTemplate.wireDateAsCal === null || currentSession.selectedWireTemplate.wireDateAsCal === undefined) {
		currentSession.selectedWireTemplate.wireDateAsCal = getAxisDate(new Date());
		//$("#wire-date").val(dateFormat(new Date(), "mmmm dd, yyyy"));
		$('#wire-date').data('datebox').theDate = new Date();
		var dateStr = dateFormat(new Date(), 'mmmm dd, yyyy');
		$('#wire-date').val(dateStr);
		$('#wire-date').trigger('calbox', {
			'method' : 'set',
			'value' : dateStr
		});
	}

	if (currentSession.selectedWireTemplate.type === 'INTERNATIONAL') {
		$("#wiretemplatedetailreflabelrep").text("Sender's Reference:");
		$("#wiretemplatedetailreflabelsemirep").text("Sender's Reference:");
		$("#wiretemplatedetailobi4data").hide();
	} else {
		$("#wiretemplatedetailreflabelrep").text("Reference for Beneficiary:");
		$("#wiretemplatedetailreflabelsemirep").text("Reference for Beneficiary:");
		$("#wiretemplatedetailobi4data").show();
	}

	$("#wiretemplatedetailrefforbenedata").val('');
	$("#wiretemplatedetailobi1data").val('');
	$("#wiretemplatedetailobi2data").val('');
	$("#wiretemplatedetailobi3data").val('');
	$("#wiretemplatedetailobi4data").val('');
	$("#wiretemplatedetailbbi1data").val('');
	$("#wiretemplatedetailbbi2data").val('');
	$("#wiretemplatedetailbbi3data").val('');
	$("#wiretemplatedetailbbi4data").val('');

	if (currentSession.selectedWireTemplate.category === 'SEMI-REPETITIVE') {
		$("#wiretemplateverifyrepetitive").hide();
		$("#wiretemplatedetailbbirep").hide();
		$("#wiretemplateverifysemirepetitive").show();
		$("#wiretemplatedetailrefforbenedata").val(extra['refForBene']);
		if (extra['origToBeneInfo1'] !== undefined) {
			$("#wiretemplatedetailobi1data").val(extra['origToBeneInfo1']);
		}
		if (extra['origToBeneInfo2'] !== undefined) {
			$("#wiretemplatedetailobi2data").val(extra['origToBeneInfo2']);
		}
		if (extra['origToBeneInfo3'] !== undefined) {
			$("#wiretemplatedetailobi3data").val(extra['origToBeneInfo3']);
		}
		if (extra['origToBeneInfo4'] !== undefined) {
			$("#wiretemplatedetailobi4data").val(extra['origToBeneInfo4']);
		}

		if (currentSession.selectedWireTemplate.type !== 'BOOKTRANSFER') {
			$("#wiretemplatedetailbbisemi").show();
			if (extra['bankToBankInfo1'] !== undefined) {
				$("#wiretemplatedetailbbi1data").val(extra['bankToBankInfo1']);
			}
			if (extra['bankToBankInfo2'] !== undefined) {
				$("#wiretemplatedetailbbi2data").val(extra['bankToBankInfo2']);
			}
			if (extra['bankToBankInfo3'] !== undefined) {
				$("#wiretemplatedetailbbi3data").val(extra['bankToBankInfo3']);
			}
			if (extra['bankToBankInfo4'] !== undefined) {
				$("#wiretemplatedetailbbi4data").val(extra['bankToBankInfo4']);
			}
		} else {
			$("#wiretemplatedetailbbisemi").hide();
		}

	} else if (currentSession.selectedWireTemplate.category === 'REPETITIVE') {
		$("#wiretemplateverifysemirepetitive").hide();
		$("#wiretemplatedetailbbisemi").hide();
		$("#wiretemplateverifyrepetitive").show();
		$("#wiretemplatedetailrefforbene").text(extra['refForBene']);

		if (currentSession.selectedWireTemplate.type !== 'BOOKTRANSFER' && currentSession.selectedWireTemplate.type !== 'DOMESTIC') {
			$("#wiretemplatedetailobirep").show();
			if (extra['origToBeneInfo1'] !== undefined) {
				$("#wiretemplatedetailobi1").text(extra['origToBeneInfo1']);
			}
			if (extra['origToBeneInfo2'] !== undefined) {
				$("#wiretemplatedetailobi2").text(extra['origToBeneInfo2']);
			}
			if (extra['origToBeneInfo3'] !== undefined) {
				$("#wiretemplatedetailobi3").text(extra['origToBeneInfo3']);
			}
			if (extra['origToBeneInfo4'] !== undefined) {
				$("#wiretemplatedetailobi4").text(extra['origToBeneInfo4']);
			}
		} else {
			$("#wiretemplatedetailobirep").hide();
		}

		if (currentSession.selectedWireTemplate.type !== 'BOOKTRANSFER' && currentSession.selectedWireTemplate.type !== 'DOMESTIC') {
			$("#wiretemplatedetailbbirep").show();
			if (extra['bankToBankInfo1'] !== undefined) {
				$("#wiretemplatedetailbbi1").text(extra['bankToBankInfo1']);
			}
			if (extra['bankToBankInfo2'] !== undefined) {
				$("#wiretemplatedetailbbi2").text(extra['bankToBankInfo2']);
			}
			if (extra['bankToBankInfo3'] !== undefined) {
				$("#wiretemplatedetailbbi3").text(extra['bankToBankInfo3']);
			}
			if (extra['bankToBankInfo4'] !== undefined) {
				$("#wiretemplatedetailbbi4").text(extra['bankToBankInfo4']);
			}
		} else {
			$("#wiretemplatedetailbbirep").hide();
		}
	}

	if (currentSession.selectedWireTemplate.type === 'INTERNATIONAL' && currentSession.selectedWireTemplate.currency !== 'USD') {
		$("#wire-date").datebox("option", {
			mode : "calbox",
			maxDays : 0
		});
	} else {
		$("#wire-date").datebox("option", {
			mode : "calbox",
			maxDays : 90
		});
	}
	$("#wire-date").datebox("refresh");
}

function showWireTemplateVerify() {

	$("#wiretemplateverifyname").text('');
	$("#wiretemplateverifynickname").text('');
	$("#wiretemplateverifyemail").text('');
	$("#wiretemplateverifyrefforbene").text('');
	$("#wiretemplateverifyobi1").text('');
	$("#wiretemplateverifyobi2").text('');
	$("#wiretemplateverifyobi3").text('');
	$("#wiretemplateverifyobi4").text('');
	$("#wiretemplateverifybbi1").text('');
	$("#wiretemplateverifybbi2").text('');
	$("#wiretemplateverifybbi3").text('');
	$("#wiretemplateverifybbi4").text('');
	$("#wiretemplateverifyorigamount").text('');
	

	var extra = currentSession.selectedWireTemplate.extra.extra;
	$("#wiretemplateverifyname").text(capitalize(currentSession.selectedWireTemplate.name));
	if (currentSession.selectedWireTemplate.nickName !== 'null')
		$("#wiretemplateverifynickname").text(capitalize(currentSession.selectedWireTemplate.nickName));
	$("#wiretemplateverifytype").text(capitalize(currentSession.selectedWireTemplate.extra.extra['dispType']));
	$("#wiretemplateverifycategory").text(capitalize(currentSession.selectedWireTemplate.category));
	var limit = currentSession.selectedWireTemplate.usdAmount;
	if (limit === '0') {
		limit = 'No Limit';
	} else {
		limit = accounting.formatMoney(limit);
	}
	$("#wiretemplateverifylimit").text(limit);
	$("#wiretemplateverifybene").text(capitalize(currentSession.selectedWireTemplate.beneficiary));
	$("#wiretemplateverifycreditacct").text(currentSession.selectedWireTemplate.creditAcctNum);
	var beneBank = extra['beneficiaryBank'];
	if (beneBank !== null || beneBank !== undefined)
		beneBank = capitalize(beneBank);
	$("#wiretemplateverifybenebankdiv").show();
	$("#wiretemplateverifybenebanklabel").text("Bene Bank:");
	$("#wiretemplateverifybenebank").text(beneBank);
	$("#wiretemplateverifyabaswift").text(extra['abaOrSwift']);
	$("#wiretemplateverifydebitacct").text(currentSession.selectedWireTemplate.debitAcctNum);

	$("#wiretemplateverifyamount").text(accounting.formatMoney($("#wire-amount").val()));
	$("#wiretemplateverifyvaluedate").text(dateFormat(convertAxisDate(currentSession.selectedWireTemplate.wireDateAsCal), "mmmm dd, yyyy"));
	$("#wiretemplateverifybenelabel").text("Beneficiary:");
	$("#wiretemplateverifycreditacctlabel").text("Credit Account:");
	$("#wiretemplateverifydebitacctlabel").text("Debit Account:");
	
	
	if (currentSession.selectedWireTemplate.type === 'DRAWDOWN') {
		$("#wiretemplateverifybenelabel").text("Debit Acct Name:");
		$("#wiretemplateverifycreditacctlabel").text("Debit Account:");
		$("#wiretemplateverifycreditacct").text(currentSession.selectedWireTemplate.debitAcctNum);
		$("#wiretemplateverifydebitacctlabel").text("Credit Account:");
		$("#wiretemplateverifydebitacct").text(currentSession.selectedWireTemplate.creditAcctNum);
		$("#wiretemplateverifybenebanklabel").text("Debit Bank:");
		$("#wiretemplateverifybenebank").text(currentSession.selectedWireTemplate.extra.extra['debitBank']);
	} 
	
		
	if (currentSession.selectedWireTemplate.type === 'INTERNATIONAL') {
		$("#wiretemplateverifyreflabel").text("Sender's Reference:");
		$("#wiretemplateverifyobi4").hide();
		$('#wiretemplateverifycurrencydiv').show();
		$('#wiretemplateverifycurrency').text(currentSession.selectedWireTemplate.currency);

		$('#wiretemplateverifyfxratediv').show();
		$('#wiretemplateverifyfxrate').text(currentSession.selectedWireTemplate.extra.extra['exchangeRate']);
		var fx = new Number(currentSession.selectedWireTemplate.extra.extra['exchangeRate']);
		var amt = new Number($("#wire-amount").val());
		$("#wiretemplateverifyamount").text(accounting.formatMoney(fx*amt));
		$('#wiretemplateverifyorigamtdiv').show();
		$("#wiretemplateverifyorigamount").text($("#wire-amount").val());
		$("#wiretemplateverifyvaluedatelabel").text("Processing Date:");
		$("#wiretemplateverifyamountlabel").text("USD Amount:");
		
	} else {
		$("#wiretemplateverifyreflabel").text("Reference for Beneficiary:");
		$("#wiretemplateverifyobi4").show();
		$('#wiretemplateverifycurrencydiv').hide();
		$('#wiretemplateverifyfxratediv').hide();
		$('#wiretemplateverifyorigamtdiv').hide();
		
		$("#wiretemplateverifyvaluedatelabel").text("Value Date:");
		$("#wiretemplateverifyamountlabel").text("Amount:");
	}

	if (currentSession.selectedWireTemplate.category === 'SEMI-REPETITIVE') {
		if (currentSession.selectedWireTemplate.type === 'BOOKTRANSFER') {
			$("#wiretemplateverifybbi").hide();
		} else {
			$("#wiretemplateverifybbi").show();
		}

		$("#wiretemplateverifyrefforbene").text($("#wiretemplatedetailrefforbenedata").val());

		$("#wiretemplateverifyobi1").text($("#wiretemplatedetailobi1data").val());
		$("#wiretemplateverifyobi2").text($("#wiretemplatedetailobi2data").val());
		$("#wiretemplateverifyobi3").text($("#wiretemplatedetailobi3data").val());
		$("#wiretemplateverifyobi4").text($("#wiretemplatedetailobi4data").val());

		$("#wiretemplateverifybbi1").text($("#wiretemplatedetailbbi1data").val());
		$("#wiretemplateverifybbi2").text($("#wiretemplatedetailbbi2data").val());
		$("#wiretemplateverifybbi3").text($("#wiretemplatedetailbbi3data").val());
		$("#wiretemplateverifybbi4").text($("#wiretemplatedetailbbi4data").val());

		$("#wiretemplateverifyemail").text($("#wiretemplateemaildata").val());

	} else if (currentSession.selectedWireTemplate.category === 'REPETITIVE') {

		if (currentSession.selectedWireTemplate.type === 'BOOKTRANSFER') {
			$("#wiretemplateverifybbi").hide();
		} else {
			$("#wiretemplateverifybbi").show();
		}

		$("#wiretemplateverifyrefforbene").text(extra['refForBene']);

		$("#wiretemplatedetailrefforbene").text(extra['refForBene']);
		if (extra['origToBeneInfo1'] !== undefined) {
			$("#wiretemplateverifyobi1").text(extra['origToBeneInfo1']);
		}
		if (extra['origToBeneInfo2'] !== undefined) {
			$("#wiretemplateverifyobi2").text(extra['origToBeneInfo2']);
		}
		if (extra['origToBeneInfo3'] !== undefined) {
			$("#wiretemplateverifyobi3").text(extra['origToBeneInfo3']);
		}
		if (extra['origToBeneInfo4'] !== undefined) {
			$("#wiretemplateverifyobi4").text(extra['origToBeneInfo4']);
		}

		if (extra['bankToBankInfo1'] !== undefined) {
			$("#wiretemplateverifybbi1").text(extra['bankToBankInfo1']);
		}
		if (extra['bankToBankInfo2'] !== undefined) {
			$("#wiretemplateverifybbi2").text(extra['bankToBankInfo2']);
		}
		if (extra['bankToBankInfo3'] !== undefined) {
			$("#wiretemplateverifybbi3").text(extra['bankToBankInfo3']);
		}
		if (extra['bankToBankInfo4'] !== undefined) {
			$("#wiretemplateverifybbi4").text(extra['bankToBankInfo4']);
		}
	}
}


$("#loadwiretemplate").live("pagebeforeshow", function() {
	showWireTemplateDetail();

	$("#verifywiretransferbtn").die().live("click", function() {
		if ($("#wire-amount").val() === undefined || $("#wire-amount").val() === null || $("#wire-amount").val() === '' || $("#wire-amount").val() === '0.00' || $("#wire-amount").val() === '0') {
			displayPopupAlert('Error', "Please enter a valid amount", null);
			return;
		}

		currentSession.selectedWireTemplate.wireAmount = $("#wire-amount").val();

		if ($("#wire-date").val() === undefined || $("#wire-date").val() === null || $("#wire-date").val() === '') {
			displayPopupAlert('Error', "Please select a date", null);
			return;
		}

		var date = $('#wire-date').data('datebox').theDate;
		currentSession.selectedWireTemplate.wireDateAsCal = getAxisDate(date);
		if (currentSession.selectedWireTemplate.category === 'SEMI-REPETITIVE') {

			if ($("#wiretemplatedetailrefforbenedata").val() !== undefined || $("#wiretemplatedetailrefforbenedata").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['refForBene'] = $("#wiretemplatedetailrefforbenedata").val();
			}

			if ($("#wiretemplatedetailobi1data").val() !== undefined || $("#wiretemplatedetailobi1data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['origToBeneInfo1'] = $("#wiretemplatedetailobi1data").val();
			}
			if ($("#wiretemplatedetailobi2data").val() !== undefined || $("#wiretemplatedetailobi2data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['origToBeneInfo2'] = $("#wiretemplatedetailobi2data").val();
			}
			if ($("#wiretemplatedetailobi3data").val() !== undefined || $("#wiretemplatedetailobi3data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['origToBeneInfo3'] = $("#wiretemplatedetailobi3data").val();
			}
			if ($("#wiretemplatedetailobi4data").val() !== undefined || $("#wiretemplatedetailobi4data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['origToBeneInfo4'] = $("#wiretemplatedetailobi4data").val();
			}

			if ($("#wiretemplatedetailbbi1data").val() !== undefined || $("#wiretemplatedetailbbi1data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['bankToBankInfo1'] = $("#wiretemplatedetailbbi1data").val();
			}
			if ($("#wiretemplatedetailbbi2data").val() !== undefined || $("#wiretemplatedetailbbi2data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['bankToBankInfo2'] = $("#wiretemplatedetailbbi2data").val();
			}
			if ($("#wiretemplatedetailbbi3data").val() !== undefined || $("#wiretemplatedetailbbi3data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['bankToBankInfo3'] = $("#wiretemplatedetailbbi3data").val();
			}
			if ($("#wiretemplatedetailbbi4data").val() !== undefined || $("#wiretemplatedetailbbi4data").val() !== null) {
				currentSession.selectedWireTemplate.extra.extra['bankToBankInfo4'] = $("#wiretemplatedetailbbi4data").val();
			}

			if ($("#wiretemplateemaildata").val() !== undefined && $("#wiretemplateemaildata").val() !== null && $("#wiretemplateemaildata").val() !== '') {
				var email = $("#wiretemplateemaildata").val();
				//email = email.replace(/^\s+|\s+$/g, "") ;
				//if(email !== '') {
				if (validateEmailAddress(email) === false)
					return;
				//}
				currentSession.selectedWireTemplate.extra.extra['emailConf'] = $("#wiretemplateemaildata").val();
			}

		}

		MBAccountConnector.sendVerifyWireTransferRequest(currentSession.mbUser, currentSession.selectedWireTemplate);
	});
});

$("#verifywiretransfer").live("pagebeforeshow", function() {
	showWireTemplateVerify();
});

function showPositivePaySuspects() {
	$('#positivepaysuspectitems *').die('click');
	var $positivepaysuspectitems = $("#positivepaysuspectitems");
	$positivepaysuspectitems.empty();

	for (var i = 0; i < currentSession.ppaySuspects.length; i++) {
		var ppaySuspect = currentSession.ppaySuspects[i];
		var id = "ppay" + ppaySuspect.id;
		var data = '<ul data-role="listview" data-inset="true" id="' + id + '">';
		data += '<li data-icon="carrot"><div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Date:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + dateFormat(ppaySuspect.date) + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Account:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.accountId + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Check #:</span></div>';
		if (ppaySuspect.echeck === 'false') {
			data += '<div class="ui-block-b"><span class="grid-label"><a href="#ppaycheckimagereq">' + ppaySuspect.checkNumber + '</a></span><a href="#ppaycheckimagereq"><img src="images/view_check@2x.png"/></a></div>';
		} else {
			data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.checkNumber + '</span></div>';
		}
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + accounting.formatMoney(ppaySuspect.amount) + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.reason + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Default:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.defaultDecision + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.payeeName + '</span></div>';
		data += '</div>';

		if (ppaySuspect.decision === 'PWI') {
			var temp = '';
			temp = ppaySuspect.payWithIssueDate;
			if (temp !== undefined && temp !== null) {
				temp = dateFormat(temp, "mm/dd/yyyy");
			} else {
				temp = '';
			}

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue Date:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			temp = ppaySuspect.payWithIssuePayee;
			if (temp === undefined || temp === null) {
				temp = '';
			}

			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Addtl Data:</span></div>';
			temp = ppaySuspect.additionalData;
			if (temp === undefined || temp === null) {
				temp = '';
			}
			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';
		}

		data += '</li>';

		data += '<li><div data-role="fieldcontain">';
		var radioid = "ppaysuspect-" + ppaySuspect.id;
		var radioname = radioid;
		data += '<fieldset data-role="controlgroup" data-type="horizontal" class="ui-grid-b" data-mini="true">';
		var checked = '';
		if (ppaySuspect.decision === 'PY' || ppaySuspect.decision === 'PWI')
			checked = 'checked';
		data += '<div class="ui-block-a">';
		data += '<input type="radio" name="' + radioname + '" id="21' + radioid + '" value="PY" ' + checked + '/>';
		data += '<label for="21' + radioid + '">Pay</label></div>';
		checked = '';
		if (ppaySuspect.decision === 'HLD')
			checked = 'checked';
		data += '<div class="ui-block-b"><input type="radio" name="' + radioname + '" id="22' + radioid + '" value="HLD" ' + checked + '/>';
		data += '<label for="22' + radioid + '">Hold</label></div>';
		checked = '';
		if (ppaySuspect.decision === 'RT')
			checked = 'checked';
		data += '<div class="ui-block-c">';
		data += '<input type="radio" name="' + radioname + '" id="23' + radioid + '" value="RT" ' + checked + '/>';
		data += '<label for="23' + radioid + '">Return</label></div>';
		data += '</fieldset>';
		data += '</div></li>';

		data += '<li data-icon="carrot"><a href="#paywithissue"><span class="grid-label">Pay With Issue</span></a></li>';

		data += '</ul>';

		$positivepaysuspectitems.append(data);
		$("#" + id).listview();
		$("#" + id).die('click');
		$("#" + id).live('click', function() {
			var id = jQuery(this).attr("id");
			id = id.substring(4, id.length);
			for (var i = 0; i < currentSession.ppaySuspects.length; i++) {
				if (id === currentSession.ppaySuspects[i].id) {
					currentSession.selectedPPaySuspect = currentSession.ppaySuspects[i];
					break;
				}
			}
		});
	}
}


$("#positivepaysuspects").live("pagebeforeshow", function() {
	showPositivePaySuspects();
});

$("#positivepaysuspects").live("pagehide", function() {
	$('#positivepaysuspectitems *').die('click');
	$("#positivepaysuspectitems").empty();
});

function showPayWithIssueData() {
	if (currentSession.selectedPPaySuspect.payWithIssuePayee !== null && currentSession.selectedPPaySuspect.payWithIssuePayee !== undefined)
		$("#ppay-payeename").val(currentSession.selectedPPaySuspect.payWithIssuePayee);
	if (currentSession.selectedPPaySuspect.additionalData !== null && currentSession.selectedPPaySuspect.additionalData !== undefined)
		$("#ppay-additionaldata").val(currentSession.selectedPPaySuspect.additionalData);
	if (currentSession.selectedPPaySuspect.payWithIssueDate !== null && currentSession.selectedPPaySuspect.payWithIssueDate !== undefined) {
		$('#ppay-issuedate').data('datebox').theDate = currentSession.selectedPPaySuspect.payWithIssueDate;
		$('#ppay-issuedate').val(dateFormat(currentSession.selectedPPaySuspect.payWithIssueDate, "mmmm dd, yyyy"));
	} else {
		$('#ppay-issuedate').data('datebox').theDate = new Date();
		var dateStr = dateFormat(new Date(), 'mmmm dd, yyyy');
		$('#ppay-issuedate').val(dateStr);
		$('#ppay-issuedate').trigger('calbox', {
			'method' : 'set',
			'value' : dateStr
		});
	}
}


$("#paywithissue").live("pagebeforeshow", function() {
	showPayWithIssueData();
});

$("#paywithissue").live("pagehide", function() {
	$("#ppay-payeename").val('');
	$("#ppay-additionaldata").val('');
	$("#ppay-issuedate").val('');
});

function showPositivePayVerify() {

	var $ppayverifysummary = $("#positivepayverifysummary");
	$ppayverifysummary.remove('li');
	var summary = '<li data-role="list-divider"><strong>Decision Summary</strong></li>';
	//get summary
	var summaries = {};
	var counts = {};
	var ppaySuspect = null;
	for (var i = 0; i < currentSession.ppaySuspects.length; i++) {
		ppaySuspect = currentSession.ppaySuspects[i];
		var total = summaries[ppaySuspect.decision];
		if (total === undefined || total === null)
			total = new Number(0.00);
		var amt = new Number(ppaySuspect.amount);
		if (amt === undefined || amt === null) {
			amt = new Number(0.00);
		}

		total = total + amt;
		summaries[ppaySuspect.decision] = total;
		var count = counts[ppaySuspect.decision];
		if (count === undefined || count === null) {
			count = new Number(0);
		}
		count = count + 1;
		counts[ppaySuspect.decision] = count;
	}

	summary += '<li><div class="ui-grid-a">';
	count = counts["PY"];
	if (count === undefined || count === null)
		count = '0';
	var amount = summaries["PY"];
	if (amount === undefined || amount === null)
		amount = '$0.00';
	else
		amount = accounting.formatMoney(amount);
	summary += '<div class="ui-block-a"><span class="grid-label">Items Paid:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + count + '</span></div>';
	summary += '<div class="ui-block-a"><span class="grid-label">Paid Amt:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + amount + '</span></div>';

	count = counts["PWI"];
	if (count === undefined || count === null)
		count = '0';
	amount = summaries["PWI"];
	if (amount === undefined || amount === null)
		amount = '$0.00';
	else
		amount = accounting.formatMoney(amount);
	summary += '<div class="ui-block-a"><span class="grid-label">Items Paid with Issue:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + count + '</span></div>';
	summary += '<div class="ui-block-a"><span class="grid-label">Paid with Issue Amt:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + amount + '</span></div>';

	count = counts["RT"];
	if (count === undefined || count === null)
		count = '0';
	amount = summaries["RT"];
	if (amount === undefined || amount === null)
		amount = '$0.00';
	else
		amount = accounting.formatMoney(amount);
	summary += '<div class="ui-block-a"><span class="grid-label">Items Returned:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + count + '</span></div>';
	summary += '<div class="ui-block-a"><span class="grid-label">Returned Amt:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + amount + '</span></div>';

	count = counts["HLD"];
	if (count === undefined || count === null)
		count = '0';
	amount = summaries["HLD"];
	if (amount === undefined || amount === null)
		amount = '$0.00';
	else
		amount = accounting.formatMoney(amount);
	summary += '<div class="ui-block-a"><span class="grid-label">Items Held:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + count + '</span></div>';
	summary += '<div class="ui-block-a"><span class="grid-label">Held Amt:</span></div>';
	summary += '<div class="ui-block-b"><span class="grid-label">' + amount + '</span></div>';

	summary += '</div></li>';

	$ppayverifysummary.html(summary);
	$ppayverifysummary.listview('refresh');

	var $positivepayverifyitems = $("#positivepayverifyitems");
	$positivepayverifyitems.empty();

	for (i = 0; i < currentSession.ppaySuspects.length; i++) {
		ppaySuspect = currentSession.ppaySuspects[i];
		var id = "ppayverify" + ppaySuspect.id;
		var data = '<ul data-role="listview" data-inset="true" id="' + id + '">';
		data += '<li data-icon="carrot"><div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Date:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + dateFormat(ppaySuspect.date) + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Account:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.accountId + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Check #:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.checkNumber + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + accounting.formatMoney(ppaySuspect.amount) + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.reason + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Default:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.defaultDecision + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.payeeName + '</span></div>';
		data += '</div>';

		if (ppaySuspect.decision === 'PWI') {
			var temp = '';
			temp = ppaySuspect.payWithIssueDate;
			if (temp !== undefined && temp !== null) {
				temp = dateFormat(temp, "mm/dd/yy");
			} else {
				temp = '';
			}

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue Date:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			temp = ppaySuspect.payWithIssuePayee;
			if (temp === undefined || temp === null) {
				temp = '';
			}

			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Addtl Data:</span></div>';
			temp = ppaySuspect.additionalData;
			if (temp === undefined || temp === null) {
				temp = '';
			}
			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';
		}

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Decision:</span></div>';
		var decision = null;
		if (ppaySuspect.decision === 'HLD')
			decision = 'Hold';
		else if (ppaySuspect.decision === 'PY')
			decision = 'Pay';
		else if (ppaySuspect.decision === 'PWI')
			decision = 'Pay With Issue';
		else if (ppaySuspect.decision === 'RT')
			decision = 'Return';
		data += '<div class="ui-block-b"><span class="grid-label">' + decision + '</span></div>';
		data += '</div>';

		data += '</li>';
		data += '</ul>';

		$positivepayverifyitems.append(data);
		$("#" + id).listview();
	}
}


$("#positivepayverify").live("pagebeforeshow", function() {
	showPositivePayVerify();
});

$("#positivepayverify").live("pagehide", function() {
	var $ppayverifysummary = $("#positivepayverifysummary");
	$ppayverifysummary.remove('li');
});

function showPositivePayConfirm() {
	var $positivepayconfirmitems = $("#positivepayconfirmitems");
	$positivepayconfirmitems.empty();
	var ppayCount = 0;
	var confirmed = 0;
	var error = 0;
	for (var i = 0; i < currentSession.ppaySuspects.length; i++) {
		var ppaySuspect = currentSession.ppaySuspects[i];
		var id = "ppayconfirm" + ppaySuspect.id;
		var data = '<ul data-role="listview" data-inset="true" id="' + id + '">';
		data += '<li data-icon="carrot"><div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Date:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + dateFormat(ppaySuspect.date) + '</span></div>';
		data += '</div>';
		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Account:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.accountId + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Check #:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.checkNumber + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Amount:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + accounting.formatMoney(ppaySuspect.amount) + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Suspect Reason:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.reason + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Default:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.defaultDecision + '</span></div>';
		data += '</div>';

		data += '<div class="ui-grid-a">';
		data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
		data += '<div class="ui-block-b"><span class="grid-label">' + ppaySuspect.payeeName + '</span></div>';
		data += '</div>';

		if (ppaySuspect.decision === 'PWI') {
			var temp = '';
			temp = ppaySuspect.payWithIssueDate;
			if (temp !== undefined && temp !== null) {
				temp = dateFormat(temp, "mm/dd/yy");
			} else {
				temp = '';
			}

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Issue Date:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Payee Name:</span></div>';
			temp = ppaySuspect.payWithIssuePayee;
			if (temp === undefined || temp === null) {
				temp = '';
			}

			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';

			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Addtl Data:</span></div>';
			temp = ppaySuspect.additionalData;
			if (temp === undefined || temp === null) {
				temp = '';
			}
			data += '<div class="ui-block-b"><span class="grid-label">' + temp + '</span></div>';
			data += '</div>';
		}

		data += '</li>';

		if (ppaySuspect.code === '0') {
			confirmed += 1;
			data += '<li><img src="images/confirmAccepted@2x.png" class="ui-li-icon"/><span class="grid-label">' + ppaySuspect.status + '</span></li>';
		} else if (ppaySuspect.code === '1') {
			ppayCount += 1;
			data += '<li><img src="images/confirmHold@2x.png" class="ui-li-icon"/><span class="grid-label">' + ppaySuspect.status + '</span></li>';
		} else if (ppaySuspect.code === '2') {
			error += 1;
			ppayCount += 1;
			data += '<li><img src="images/confirmError@2x.png" class="ui-li-icon"/><span class="grid-label">' + ppaySuspect.status + '</span></li>';
		}
		data += '</ul>';

		$positivepayconfirmitems.append(data);
		$("#" + id).listview();
		$("#ppayconfirmmsg").text('All items were held.');
		if (error > 0) {
			$("#ppayconfirmmsg").text('Some items were not processed. Please review each item below.');
		} else if (confirmed > 0) {
			$("#ppayconfirmmsg").text('All decisions were processed successfully.');
		}
	}
	currentSession.ppayCount = ppayCount;
}


$("#positivepayconfirm").live("pagebeforeshow", function() {
	showPositivePayConfirm();
});

$("#positivepayconfirm").live("pagehide", function() {
	var $positivepayconfirmitems = $("#positivepayconfirmitems");
	$positivepayconfirmitems.empty();
});

$("#moremenu").live("pagebeforeshow", function() {

	var $moremenuitems = $("#moremenuitems");
	var $moremenulist = $("#moremenulist");

	$("#moremenulist li").remove();
	var data = '';
	if (currentSession.isEntToAlerts === true) {
		data += '<li data-icon="carrot"><a href="#" id="alertsmenu"><img src="images/access_mobile_icon_ALERTS@2x.png" alt=""/><span class="mainmenu-label">ALERTS</span></a></li>';
	}
	if (currentSession.isEntToMessages === true) {
		data += '<li data-icon="carrot"><a href="#" id="messagesmenu"><img src="images/access_mobile_icon_MESSAGES@2x.png" alt=""/><span class="mainmenu-label">MESSAGES</span></a></li>';
	}
	
	/*if (currentSession.hasWires === true) {
		if(currentSession.wires_release_count > 0) {
			data += '<li data-icon="carrot"><a href="#" id="pendingwiresmenu"><img src="images/access_mobile_icon_WIRES@2x.png"/><span class="mainmenu-label">WIRE RELEASE</span></a></li>';
		} else {
			data += '<li data-icon="carrot" class="ui-disabled"><a href="#" id="pendingwiresmenu"><img src="images/access_mobile_icon_WIRES@2x.png"/><span class="mainmenu-label">WIRE RELEASE</span></a></li>';
		}
	}*/
	
	if (currentSession.hasWires === true && currentSession.wires_release_count > 0) {
		data += '<li data-icon="carrot"><a href="#" id="pendingwiresmenu"><img src="images/access_mobile_icon_WIRES@2x.png"/><span class="mainmenu-label">WIRE RELEASE</span></a></li>';
	}
		
	if (currentSession.can_create_wires === true) {
		data += '<li data-icon="carrot" ><a href="#" id="wireinitiatemenu"><img src="images/access_mobile_icon_WIRECREATE@2x.png"/><span class="mainmenu-label">WIRE INITIATE</span></a></li>';
	}
	if (currentSession.hasAdminUnlock === true) {
		data += '<li data-icon="carrot"><a href="#" id="useradminmenu"><img src="images/access_mobile_icon_ADMIN@2x.png"/><span class="mainmenu-label">ADMINISTRATION</span></a></li>';
	}
	if (currentSession.hasEZDeposit === true) {
		data += '<li data-icon="carrot"><a href="#" id="remotedepositmenu"><img src="images/access_mobile_icon_EZD@2x.png"/><span class="mainmenu-label">EZ DEPOSIT &#174;</span></a></li>';
	}
	if (currentSession.hasPPayDecision === true) {
		data += '<li data-icon="carrot"><a href="#" id="positivepaymenu"><img src="images/access_mobile_icon_PPAY@2x.png"/><span class="mainmenu-label">POSITIVE PAY</span></a></li>';
	}
	data += '<li data-icon="carrot"><a href="#commercialMore"><img src="images/access_mobile_icon_CARDS@2x.png" alt=""/><span class="mainmenu-label">COMMERCIAL CARDS</span></a></li>';
	data += '<li data-icon="carrot"><a href="#foreignExchangeMore"><img src="images/access_mobile_icon_FX@2x.png" alt="" /><span class="mainmenu-label">FOREIGN EXCHANGE</span></a></li>';
	data += '<li data-icon="carrot"><a href="#branches"><span class="mainmenu-label">BRANCHES <span class="changeFont">&amp;</span> ATMS</span><img src="images/access_mobile_icon_BRANCH@2x.png" title="Branches &amp; ATMS" alt=""/></a></li>';
	data += '<li data-icon="carrot"><a href="#help"><img src="images/access_mobile_icon_HELP@2x.png" alt="" /><span class="mainmenu-label">HELP</span></a></li>';
	data += '<li data-icon="carrot"><a href="#contactusMore"><span class="mainmenu-label">CONTACT US</span><img src="images/access_mobile_icon_CONTACT@2x.png" alt="" /></a></li>';
	data += '<li data-icon="carrot"><a href="#about"><span class="mainmenu-label">ABOUT</span><img src="images/access_mobile_icon_ABOUT@2x.png" alt="" /></a></li>';

	$moremenulist.html(data);
	$moremenulist.listview('refresh');

	$("#useradminmenu").die().live("click", function() {
		MBAccountConnector.sendGetLockedUsersRequest(currentSession.mbUser);
	});

	/*$("#pendingdepositmenu").die().live("click", function() {
		MBAccountConnector.sendGetPendingDepositDataRequest(currentSession.mbUser);
	});*/

	$("#wireinitiatemenu").die().live("click", function() {
		$("#wire-amount").val('');
		$("#wire-date").val('');
		MBAccountConnector.sendGetWireTemplatesRequest(currentSession.mbUser);
	});

});

$("#moremenu").live("pagehide", function() {
	$("#moremenulist li").remove();
});

$("#start").live("pagebeforeshow", function() {
	clearInterval(intervalID);
	if (currentSession !== undefined && currentSession !== null)
		currentSession.clearUserSession();
	forcedLogout = false;	
});

$("#start").live("pageshow", function() {
	if (forcedLogout) {
		forcedLogout = false;
		errormessage = "Due to inactivity, your session has expired. Please sign on again.";
		$.mobile.changePage("#messagedialog", {
			role : "dialog",
			reverse : false
		});
	}
});

$("#alerts").live("pagehide", function() {
	var $alertlist = $("#alertlist");
	$('#alertlist li').die();
	$alertlist.empty();
});

/*$("#contactus").live("pagebeforeshow", function() {

	$("#contactlogoutbutton").hide();
	$("#contactlogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#contactlogoutbutton").show();
			$("#contactlogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
});

$("#commercial").live("pagebeforeshow", function() {

	$("#commlogoutbutton").hide();
	$("#commlogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#commlogoutbutton").show();
			$("#commlogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
});

$("#foreignExchange").live("pagebeforeshow", function() {

	$("#fxlogoutbutton").hide();
	$("#fxlogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#fxlogoutbutton").show();
			$("#fxlogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
});*/

$("#about").live("pagebeforeshow", function(event, data) {

    var prevPage = data.prevPage.attr('id');
    if (prevPage.indexOf("moremenu") !== -1) {
        $("#aboutbackbutton").text("More");
    } else {
        $("#aboutbackbutton").text("Done");
    }

	$("#aboutlogoutbutton").hide();
	$("#aboutlogoutbutton").die();
	if (currentSession.mbUser !== undefined && currentSession.mbUser !== null) {
		if (currentSession.mbUser.authenticated !== undefined && currentSession.mbUser.authenticated !== null && currentSession.mbUser.authenticated === 'true') {
			$("#aboutlogoutbutton").show();
			$("#aboutlogoutbutton").die().live("click", function() {
				MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
			});
		}
	}
});

function captureFrontImage() {
	$("#frontImageCapture").click();
}

function captureBackImage() {
	$("#backImageCapture").click();
}

function setFrontImageURI(dataURI, width, height) {
	//frontImage = dataURI;
	frontImage = dataURI.substring(dataURI.indexOf(",") + 1);
}

function setBackImageURI(dataURI, width, height) {
	//backImage = dataURI;
	backImage = dataURI.substring(dataURI.indexOf(",") + 1);
}

/*function resizeImage(imgURI, setImageFn) {
	
	var img = new Image();
	
	img.onload = function() {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		
		
		var MAX_WIDTH = 1200;
		var MAX_HEIGHT = 1600;
		var width = img.width;
		var height = img.height;
		var ratio = 1;
		
		if(width > height) {
			MAX_HEIGHT = 1200;
			MAX_WIDTH = 1600
		}
		
		if(width > MAX_WIDTH) 
			ratio = MAX_WIDTH/width;
		else if (height > MAX_HEIGHT)
			ratio = MAX_HEIGHT/height;	 
		
		canvas.width = Math.round(width*ratio);
		canvas.height = Math.round(height*ratio);
	
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
		var dataUrl = canvas.toDataURL("image/jpeg", 0.3);
		dataUrl = dataUrl.substring(dataUrl.indexOf(",") + 1);
		log(dataUrl);
		setImageFn(dataUrl);
	}
	
	img.src = imgURI;
	
}*/

function resizeImage(imageURI, setImageFn) {
	$.canvasResize(imageURI, {
		width:1600,
		height: 0,
		crop: false,
		quality: 30,
		rotate:90,
		callback: setImageFn
	});
}

/*function showFrontImage(files) {
	var imageType = /image/;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.type.match(imageType)) {
			var newImg = document.createElement("img");
			newImg.classList.add("obj");
			newImg.file = file;
			newImg.style.maxHeight = "30px";
			newImg.style.maxWidth = "148px";
			var thumbnails = document.getElementById('ezdfrontimg');
			thumbnails.appendChild(newImg);

			var reader = new FileReader();
			reader.onload = (function(aImg) {
				return function(e) {
					aImg.src = e.target.result;
					frontImage = resizeImage(aImg);//e.target.result.substring(e.target.result.indexOf(",")+1);
				};
			})(newImg);
			reader.readAsDataURL(file);
		}
	}
}

function showBackImage(files) {
	var imageType = /image/;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.type.match(imageType)) {
			var newImg = document.createElement("img");
			newImg.classList.add("obj");
			newImg.file = file;
			newImg.style.maxHeight = "30px";
			newImg.style.maxWidth = "148px";
			var thumbnails = document.getElementById('ezdbackimg');
			thumbnails.appendChild(newImg);

			var reader = new FileReader();
			reader.onload = (function(aImg) {
				return function(e) {
					aImg.src = e.target.result;
					backImage = resizeImage(aImg);//e.target.result.substring(e.target.result.indexOf(",")+1);
				};
			})(newImg);
			reader.readAsDataURL(file);
		}
	}
}

*/

function showFrontImage(files) {
	var imageType = /image/;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.type.match(imageType)) {
			resizeImage(file, setFrontImageURI);
			var reader = new FileReader();
			reader.onload = function(e) {
					var smallImage = document.getElementById('ezdfrontimg');
					smallImage.style.display = 'block';
					smallImage.src = e.target.result;
					var origImage = document.createElement('img');
					origImage.src = e.target.result;
				};
			reader.readAsDataURL(file);
		}
	}
}

function showBackImage(files) {
	var imageType = /image/;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.type.match(imageType)) {
			resizeImage(file, setBackImageURI);
			var reader = new FileReader();
			reader.onload = function(e) {
					var smallImage = document.getElementById('ezdbackimg');
					smallImage.style.display = 'block';
					smallImage.src = e.target.result;
					var origImage = document.createElement('img');
					origImage.src = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	}
}

$("#securemail").live("pagebeforeshow", function() {
	$("#securemailbody").val("");

	$("#sendsecuremail").die().live("click", function() {
		var message = new MBMessage();
		message.subject = 'General Inquiry';
		message.body = $("textarea#securemailbody").val();
		if(/\S/.test(message.body)) {
			MBAccountConnector.sendMessageRequest(currentSession.mbUser, message);
		} else {
			displayPopupAlert("", "Please enter a valid message.", null);
		}
	});
});

$("#securereply").live("pagebeforeshow", function() {
	$("#securereplybody").val("");

	$("#sendsecurereply").die().live("click", function() {
		var message = new MBMessage();
		message.messageId = currentSession.selectedmessage.messageId;
		message.subject = currentSession.selectedmessage.subject;
		message.type = currentSession.selectedmessage.type;
		message.from = currentSession.selectedmessage.from;
		message.caseNum = currentSession.selectedmessage.caseNum;
		message.date = getAxisDate(new Date());
		message.body = $("textarea#securereplybody").val();
		if(/\S/.test(message.body)) {
			MBAccountConnector.sendReplyRequest(currentSession.mbUser, message);
		} else {
			displayPopupAlert("", "Please enter a valid message.", null);
		}
	});
});


function pgfrontImageSuccess(imageData) {
	var smallImage = document.getElementById('pgsmallfrontimage');
	frontImage = imageData;
	smallImage.style.display = 'block';
	smallImage.src = "data:image/jpeg;base64," + frontImage;
}

function pgfrontImageError(message) {
	displayPopupAlert('Information', message, null);
}

function pgbackImageSuccess(imageData) {
	backImage = imageData;
	var smallImage = document.getElementById('pgsmallbackimage');
	smallImage.style.display = 'block';
	smallImage.src = "data:image/jpeg;base64," + backImage;
}

function pgbackImageError(message) {
	displayPopupAlert('Information', message, null);
}

function onCameraCleanupSuccess() {

}

function onCameraCleanupFail(message) {

}

function showEZDAccounts() {
	var ezdaccountselect = null;
	if (phoneGapContainer === true) {
		$('#pgezdaccounts option:selected').remove();
		ezdaccountselect = $("#pgezdaccounts");
	} else {
		$('#ezdaccounts option:selected').remove();
		ezdaccountselect = $("#ezdaccounts");
	}

	ezdaccountselect.empty();
	var accounts = currentSession.ezdaccounts;
	ezdaccountselect.append('<option value=""></option>');
	for ( i = 0; i < accounts.length; i++) {
		ezdaccountselect.append('<option value="' + accounts[i].ownerCode + '">' + accounts[i].accNodeName + '</option>');
	}
	if(phoneGapContainer === true)
		$("select#pgezdaccounts").selectmenu('refresh');
	else 
		$("select#ezdaccounts").selectmenu('refresh');	
}

function togglePGDepositForm(toggle) {
	$("#pgezdamount").textinput(toggle);
	$("#pgezdaccounts").selectmenu(toggle);
	$("#pgcapturefrontimage").button(toggle);
	$("#pgcapturebackimage").button(toggle);
	$("#pgsubmitimagebutton").button(toggle);
}

function resetPGDepositForm() {
	frontImage = null;
	backImage = null;
	delete frontImage;
	delete backImage;
	
	var smallImage = $('#pgsmallfrontimage');
	smallImage.src = "";
	smallImage.hide();

	smallImage = $('#pgsmallbackimage');
	smallImage.src = "";
	smallImage.hide();

	$('#pgezdlocations option:selected').remove();
	var ezdlocationselect = $("#pgezdlocations");
	ezdlocationselect.empty();
	ezdlocationselect.selectmenu('refresh');

	$("#pgezdlocations").val('');
	$('#pgezdaccounts option:selected').remove();
	$("#pgezdaccounts").empty();
	$("#pgezdaccounts").val('');
	togglePGDepositForm('disable');

	var locations = currentSession.ezdlocations;
	ezdlocationselect.append('<option value=""></option>');
	for ( i = 0; i < locations.length; i++) {
		ezdlocationselect.append('<option value="' + locations[i].username + '">' + locations[i].location + '</option>');
	}
	
	$("#pgezdlocations option[value='']").attr('selected', 'selected');
	ezdlocationselect.selectmenu('refresh');
	
	showEZDAccounts();
	$("#pgezdamount").val('');
	togglePGDepositForm('disable');
}

$("#pgdepositcheck").live("pagebeforeshow", function() {

	currentSession.ezdaccounts.splice(0, currentSession.ezdaccounts.length);
	
	/*var ezdloc =$("select#pgezdlocations");
	ezdloc.selectedIndex = 0; 
	ezdloc.selectmenu('refresh');
	
	$("select#pgezdaccounts").selectmenu('refresh');*/
	
	$('#pgezdaccounts option:selected').remove();
	$("#pgezdaccounts").empty();
	
	$('#pgezdlocations option:selected').remove();
	var ezdlocationselect = $("#pgezdlocations");
	ezdlocationselect.empty();
	
	$("#pgezdlocations").val('');
	$("#pgezdaccounts").val('');
	
	$("#pgezdamount").autoNumeric('init', {
		aSep : ''
	});

	$("#pgezdamount").val('');

	var locations = currentSession.ezdlocations;
	ezdlocationselect.append('<option value=""></option>');
	for ( i = 0; i < locations.length; i++) {
		ezdlocationselect.append('<option value="' + locations[i].username + '">' + locations[i].location + '</option>');
	}
	
	$("#pgezdlocations option[value='']").attr('selected', 'selected');
	ezdlocationselect.selectmenu('refresh');
	
	showEZDAccounts();
	togglePGDepositForm('disable');
	
	ezdlocationselect.die().live("change", function() {
		var ezdUserName = $("#pgezdlocations option:selected").val();
		if(ezdUserName !== '') {
			togglePGDepositForm('enable');
			var index = $("#pgezdlocations option:selected").index();
			
			/*for(var i=0; i<currentSession.ezdlocations.length; i++) {
				if(currentSession.ezdlocations[i].username === ezdUserName) {
					currentSession.ezdaccounts = currentSession.ezdlocations[i].accounts;
					break;
				}	
			}*/
			currentSession.ezdaccounts = clone(currentSession.ezdlocations[index-1].accounts);
			if(currentSession.ezdaccounts !== null) {
				showEZDAccounts();
			}
		} else {
			togglePGDepositForm('disable');
		}
	});

	$("#pgcheckdepositlogoutbutton").die().live('click', function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});

	$("#pgcapturefrontimage").die().live('click', function() {
		navigator.camera.getPicture(pgfrontImageSuccess, pgfrontImageError, {
			quality : 30,
			destinationType : navigator.camera.DestinationType.DATA_URL,
			encodingType : navigator.camera.EncodingType.JPEG
		});
	});

	$("#pgcapturebackimage").die().live('click', function() {
		navigator.camera.getPicture(pgbackImageSuccess, pgbackImageError, {
			quality : 30,
			destinationType : navigator.camera.DestinationType.DATA_URL,
			encodingType : navigator.camera.EncodingType.JPEG
		});
	});
	
	$("#pgcancelmagebutton").die().live('click', function() {
		resetPGDepositForm();
	});

	$("#pgsubmitimagebutton").die().live('click', function() {
		var ezdUserName = $("#pgezdlocations option:selected").val();
		var ezdAcctOwner = $("#pgezdaccounts option:selected").val();
		var ezdAccountNumber = $("#pgezdaccounts option:selected").text();
		
		if(ezdAcctOwner === '' || ezdAcctOwner === null || ezdAcctOwner === undefined) {
			displayPopupAlert("Error", "Please select an account", null);
			return;
		}
		var amount = $("#pgezdamount").val();
		if(amount === '' || amount === null || amount === undefined || Number(amount) <= 0.00) {
			displayPopupAlert("Error", "Please enter a valid amount", null);
			return;
		}
		
		if(frontImage === '' || frontImage === null || frontImage === undefined) {
			displayPopupAlert("Error", "No front image found", null);
			return;
		}

		if(backImage === '' || backImage === null || backImage === undefined) {
			displayPopupAlert("Error", "No back image found", null);
			return;
		}
		
		MBAccountConnector.sendRDCSubmitDepositRequest(currentSession.mbUser, ezdAcctOwner, ezdAccountNumber, ezdUserName, amount, frontImage, backImage);
		//MBAccountConnector.sendRDCSubmitDepositRequest(currentSession.mbUser, ezdAcctOwner, ezdUserName, amount, frontImage, backImage);
	});

});


$("#pgdepositcheck").live("pagehide", function() {
	resetPGDepositForm();
});

function supports_canvas() {
  return !!document.createElement('canvas').getContext;
}

function supports_filereader() {
	if(window.File && window.FileReader && window.FileList)
		return true;
	return false;		
}

function supports_video() {
  return !!document.createElement('video').canPlayType;
}

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

function showPendingDeposits() {
	$('#ezdpendingdepositlist *').die('click');
	var $remotedeposithistorylist = $("#ezdpendingdepositlist");
	$remotedeposithistorylist.empty();
	if (currentSession.ezdPendingDeposits.length === 0) {
		$("#ezdpendingdepositlist").text("No records found.");
	} else {
		var amount = null;
		for (var i = 0; i < currentSession.ezdPendingDeposits.length; i++) {
			var deposit = currentSession.ezdPendingDeposits[i];
			var id = "ezdpending" + i;
			var data = '<ul data-role="listview" data-divider-theme="f" data-inset="true" id="' + id + '" >';
			data += '<li data-role="list-divider">Deposit Status Unknown</li>';
			data += '<li>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Deposit Account:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + deposit.accountNumber + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Deposit Amount:</span></div>';
			if(deposit.amount !== null && deposit.amount !== undefined && deposit.amount !== '')
				amount = accounting.formatMoney(deposit.amount);
			else
				amount = '';	
			data += '<div class="ui-block-b"><span class="grid-label">' + amount + '</span></div>';
			data += '</div>';
			data += '<div class="ui-grid-a">';
			data += '<div class="ui-block-a"><span class="grid-label">Submitted:</span></div>';
			data += '<div class="ui-block-b"><span class="grid-label">' + deposit.createdDate + '</span></div>';
			data += '</div>';
			data += '</li>';
			data += '<li data-icon="carrot"><a href="#"><span class="grid-label">Resubmit Deposit</span></a></li>';
			data += '</ul>';
			$remotedeposithistorylist.append(data);
			$("#" + id).listview();
			$("#" + id).die().live('click', function() {
				var index = Number(jQuery(this).attr("id").substring(10));
				currentSession.selectedPendingDeposit = index;
				MBAccountConnector.sendRDCReSubmitDepositRequest(currentSession.mbUser, currentSession.ezdPendingDeposits[index]);
			});
		}
	}
}

$("#ezdpendingdeposits").live("pagebeforeshow", function(event, data) {
	showPendingDeposits();
});

$("#ezdpendingdeposits").live("pagehide", function(event, data) {
	$('#ezdpendingdepositlist *').die('click');
	var $remotedeposithistorylist = $("#ezdpendingdepositlist");
	$remotedeposithistorylist.empty();
	//currentSession.ezdPendingDeposits.splice(0, currentSession.ezdPendingDeposits.length);
});

function showRemoteDepositOptions() {
	var data = '';
	$("#ezdmenulist li").remove();
	var $ezdmenulist = $("#ezdmenulist");
	if (currentSession.ezdPendingDeposits.length > 0) {
		data += '<li data-icon="carrot"><a href="#" id="pendingdepositmenu"><span class="mainmenu-label">Pending Deposits</span></a></li>';
		
		$("#pendingdepositmenu").die().live("click", function() {
			$.mobile.changePage("#ezdpendingdeposits");
		});

	}
	data += '<li data-icon="carrot"><a href="#" id="deposithistorymenu"><span class="mainmenu-label">View Deposit History</span></a></li>';
	data += '<li data-icon="carrot"><a href="#" id="depositcheckmenu"><span class="mainmenu-label">Deposit a Check</span></a></li>';

	$ezdmenulist.html(data);
	$ezdmenulist.listview('refresh');

	$("#deposithistorymenu").die().live("click", function() {
		$("#remotedeposithistorylist").empty();
		$('#ezdlocations option:selected').remove();
		var ezdlocationselect = $("#ezdlocations");
		ezdlocationselect.empty();
	
		var locations = currentSession.ezdlocations;
		ezdlocationselect.append('<option value=""></option>');
		for ( i = 0; i < locations.length; i++) {
			ezdlocationselect.append('<option value="' + locations[i].username + '">' + locations[i].location + '</option>');
		}
	
		$("#ezdlocations option[value='']").attr('selected', 'selected');
	
		$("#rdchistorybutton").die().live("click", function() {
			var ezdUser = $("#ezdlocations option:selected").val();
			var ezdLocationName = $("#ezdlocations option:selected").text();
			if (ezdUser === '') {
				displayPopupAlert('Error', 'Please select a location.', null);
			} else {
				//get all accounts for the history
				var locations = currentSession.ezdlocations;
				var ezdaccounts = null;
				 
				for(var i=0; i<locations.length; i++) {
					var ezdlocation = locations[i];
					if(ezdlocation.location === ezdLocationName && 
						ezdlocation.username === ezdUser ) {
						ezdaccounts = ezdlocation.accounts;
					} 					
				}
				MBAccountConnector.sendGetRemoteDepositHistoryRequest(currentSession.mbUser, ezdUser, ezdaccounts);
			}
		});
		
		$.mobile.changePage("#remotedeposithistory");
	});

	$("#depositcheckmenu").die().live('click', function() {
		if (phoneGapContainer === true) {
			$.mobile.changePage("#pgdepositcheck");
		} else {
			if(supports_canvas() && supports_filereader()) 
				$.mobile.changePage("#depositcheck");
			else
				$.mobile.changePage("#depositchecknosupport");
		}
	});
	
}

$("#remotedepositoptions").live("pagebeforeshow", function(event, data) {
	MBAccountConnector.sendGetRDCPendingDepositsRequest(currentSession.mbUser);
});

$("#depositchecknosupport").live("pagebeforeshow", function () {
	var $appstorelink = $("#appstorelink");
	$appstorelink.empty();
	var link = null;
	if(isMobile.Android()) {
		link = "<h4>Please download our native app to use this feature.</h4>";
		link += '<img alt="Android app on Google Play" src="images/googleplay.png" />';
		$appstorelink.append(link);
	} else if (isMobile.iOS()) {
		link = "<h4>Please download our native app to use this feature.</h4>";
		link += '<img alt="iOS app on iTunes" src="images/appstore.png" />';
		$appstorelink.append(link);
	}
	
	$("#ezdcheckdepositnoupportlogoutbutton").die().live("click", function () {
		MBSecurityConnector.sendLogoutRequest(currentSession.MBUser);
	});
});

function toggleDepositForm(toggle) {
	$("#ezdamount").textinput(toggle);
	$("#ezdaccounts").selectmenu(toggle);
	$("#capturefrontimagebutton").button(toggle);
	$("#capturebackimagebutton").button(toggle);
	$("#submitimagebutton").button(toggle);
}

function resetDepositForm() {
	frontImage = null;
	backImage = null;
	delete frontImage;
	delete backImage;
	
	var smallImage = $('#ezdfrontimg');
	smallImage.src = "";
	smallImage.hide();

	smallImage = $('#ezdbackimg');
	smallImage.src = "";
	smallImage.hide();

	$('#dcezdlocations option:selected').remove();
	var ezdlocationselect = $("#dcezdlocations");
	ezdlocationselect.empty();
	ezdlocationselect.selectmenu('refresh');

	$("#dcezdlocations").val('');
	$('#ezdaccounts option:selected').remove();
	$("#ezdaccounts").empty();
	$("#ezdaccounts").val('');

	var locations = currentSession.ezdlocations;
	ezdlocationselect.append('<option value=""></option>');
	for ( i = 0; i < locations.length; i++) {
		ezdlocationselect.append('<option value="' + locations[i].username + '">' + locations[i].location + '</option>');
	}
	
	$("#dcezdlocations option[value='']").attr('selected', 'selected');
	ezdlocationselect.selectmenu('refresh');
	
	showEZDAccounts();
	$("#ezdamount").val('');
	toggleDepositForm('disable');
}

$("#depositcheck").live("pagebeforeshow", function() {

	currentSession.ezdaccounts.splice(0, currentSession.ezdaccounts.length);
	
	$('#ezdaccounts option:selected').remove();
	$("#ezdaccounts").empty();
	
	$('#dcezdlocations option:selected').remove();
	var ezdlocationselect = $("#dcezdlocations");
	ezdlocationselect.empty();
	
	$("#dcezdlocations").val('');
	$("#ezdaccounts").val('');
	
	$("#ezdamount").autoNumeric('init', {
		aSep : ''
	});

	$("#ezdamount").val('');

	var locations = currentSession.ezdlocations;
	ezdlocationselect.append('<option value=""></option>');
	for ( i = 0; i < locations.length; i++) {
		ezdlocationselect.append('<option value="' + locations[i].username + '">' + locations[i].location + '</option>');
	}
	
	$("#dcezdlocations option[value='']").attr('selected', 'selected');
	ezdlocationselect.selectmenu('refresh');
	
	showEZDAccounts();
	toggleDepositForm('disable');
	
	ezdlocationselect.die().live("change", function() {
		var ezdUserName = $("#dcezdlocations option:selected").val();
		if(ezdUserName !== '') {
			toggleDepositForm('enable');
			var index = $("#dcezdlocations option:selected").index();
			
			/*for(var i=0; i<currentSession.ezdlocations.length; i++) {
				if(currentSession.ezdlocations[i].username === ezdUserName) {
					currentSession.ezdaccounts = currentSession.ezdlocations[i].accounts;
					break;
				}	
			}*/
			currentSession.ezdaccounts = clone(currentSession.ezdlocations[index-1].accounts);
			if(currentSession.ezdaccounts !== null) {
				showEZDAccounts();
			}
			 
		} else {
			toggleDepositForm('disable');
		}
	});

	$("#ezdcheckdepositlogoutbutton").die().live('click', function() {
		MBSecurityConnector.sendLogoutRequest(currentSession.mbUser);
	});
	
	$("#cancelmagebutton").die().live('click', function() {
		resetDepositForm();
	});
	

	$("#submitimagebutton").die().live('click', function() {
		var ezdUserName = $("#dcezdlocations option:selected").val();
		var ezdAcctOwner = $("#ezdaccounts option:selected").val();
		var ezdAccountNumber = $("#ezdaccounts option:selected").text();
		
		if(ezdAcctOwner === '' || ezdAcctOwner === null || ezdAcctOwner === undefined) {
			displayPopupAlert("Error", "Please select an account", null);
			return;
		}
		var amount = $("#ezdamount").val();
		if(amount === '' || amount === null || amount === undefined || Number(amount) <= 0.00) {
			displayPopupAlert("Error", "Please enter a valid amount", null);
			return;
		}
		
		if(frontImage === '' || frontImage === null || frontImage === undefined) {
			displayPopupAlert("Error", "No front image found", null);
			return;
		}

		if(backImage === '' || backImage === null || backImage === undefined) {
			displayPopupAlert("Error", "No back image found", null);
			return;
		}
		
		MBAccountConnector.sendRDCSubmitDepositRequest(currentSession.mbUser, ezdAcctOwner, ezdAccountNumber, ezdUserName, amount, frontImage, backImage);
	});

});

$("#depositcheck").live("pagehide", function() {
	resetDepositForm();
});


$("#depositcheckimage").live("pagehide", function(event, data) {
	$("#rdmcheckfront").children().remove();
	$("#rdmcheckback").children().remove();
	delete frontImage;
	delete backImage;
});

$("#ppaycheckimage").live("pagehide", function(event, data) {
	var nextPage = data.nextPage.attr('id');
	if(nextPage.indexOf("ppaycheckimagedetail") == -1) {
		$("#ppaycheckfront").empty();
		$("#ppaycheckback").empty();
		delete frontImage;
		delete backImage;
	}
});

$("#ppaycheckimagedetail").live("pagehide", function(event, data) {
	var nextPage = data.nextPage.attr('id');
	$("#ppaycheckdetail").empty();
	if(nextPage.indexOf("ppaycheckimage") == -1) {
		$("#ppaycheckfront").empty();
		$("#ppaycheckback").empty();
		delete frontImage;
		delete backImage;
	}
});

/*----------------------------------------------------------------------------------------------------------------------*/

// /PY, RT, PWI, HLD
