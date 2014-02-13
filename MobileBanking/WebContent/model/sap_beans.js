/*
 * Copyright SAP Mobile Services (c) 2012
 * All Rights Reserved
 */

function addTag(obj, tagName) {
	if (obj !== null) {
		var val = obj[tagName];
		if (val !== undefined && val !== null && val !== '') {
			if (tagName === 'amount')
				val = accounting.unformat(val);//unformatAmount(val, obj['currencyCode']);
			return '<ns1:' + tagName + '>' + val + '</ns1:' + tagName + '>';
		}
	}
	return '';
}

function addTags(obj, tagNames) {
	var xml = '';
	if (obj !== null) {
		for (var i = 0; i < tagNames.length; i++) {
			xml += addTag(obj, tagNames[i]);
		}
	}
	return xml;
}

function MBUserSession() {
	this.branches = '';
	this.branch = '';
	this.appGeoLegURL = '';
	this.question = '';
	this.saveUserId = null;
	this.savedCompanyId = null;
	this.savedUserId = null;
	this.mbUser = null;
	this.imageUrl = '';
	this.passphrase = '';
	this.channelSessionId = '';
	this.authenticated = 'false';
	this.unread_messages_count = Number('0');
	this.isEntToMessages = true;
	this.unread_alerts_count = Number('0');
	this.isEntToAlerts = true;
	this.wires_release_count = Number('-1');
	this.hasWires = true;
	this.pending_approvals_count = Number('-1');
	this.hasApprovals = true;
	this.hasPPay = true;
	this.ppayCount = Number("-1");
	this.accounts = [];
	this.account = '';
	this.errormessage = '';
	this.mbSnapshot = null;
	this.pendingApprovals = [];
	this.pendingWires = [];
	this.approvalId = null;
	this.wireId = null;
	this.alerts = [];
	this.selectedalert = null;
	this.messages = [];
	this.selectedmessage = null;
	this.transactions = [];
	this.transaction = null;
	this.availableDates = null;
	this.selectedHistoryDay = 0;
	this.selectedtransaction = null;
	this.transfer = new MBTransfer();
	this.hasEZDeposit = false;
	this.can_create_wires = false;
	this.hasPPayDecision = false;
	this.ppayCount = Number('0');
	this.user_lock_count = Number('0');
	this.hasAdminUnlock = false;
	this.lockedUsers = [];
	this.remoteDeposits = [];
	this.wireTemplates = [];
	this.selectedWireTemplate = null;
	this.ppaySuspects = [];
	this.selectedPPaySuspect = null;
	this.wireAuthenticated = false;
	this.selectedmessageIndex = -1;
	this.selectedalertIndex = -1;
	this.selectedApprovalIndex = -1;
	this.selectedWireIndex = -1;
	this.ezdaccounts = [];
	this.ezdlocations = [];
	this.ezdPendingDeposits = [];
	this.selectedPendingDeposit = -1;
	
	this.clearUserSession = function() {
		this.branches = '';
		this.branch = '';
		this.appGeoLegURL = '';
		this.question = '';
		this.mbUser = null;
		this.imageUrl = '';
		this.passphrase = '';
		this.channelSessionId = '';
		this.authenticated = '';
		this.unread_messages_count = Number('0');
		this.isEntToMessages = true;
		this.unread_alerts_count = Number('0');
		this.isEntToAlerts = true;
		this.wires_release_count = Number('-1');
		this.hasWires = true;
		this.pending_approvals_count = Number('-1');
		this.hasApprovals = true;
		this.accounts.splice(0, this.accounts.length);
		this.account = '';
		this.errormessage = '';
		this.mbSnapshot = null;
		this.pendingApprovals.splice(0, this.pendingApprovals.length);
		this.pendingWires.splice(0, this.pendingWires.length);
		this.approvalId = null;
		this.wireId = null;
		this.alerts.splice(0, this.alerts.length);
		this.selectedalert = null;
		this.messages.splice(0, this.messages.length);
		this.selectedmessage = null;
		this.transactions.splice(0, this.transactions.length);
		this.transaction = null;
		this.availableDates = null;
		this.selectedHistoryDay = 0;
		this.selectedtransaction = null;
		this.saveUserId = null;
		this.savedCompanyId = null;
		this.savedUserId = null;
		this.transfer = null;
		this.hasEZDeposit = false;
		this.can_create_wires = false;
		this.hasPPayDecision = false;
		this.ppayCount = Number('0');
		this.user_lock_count = Number('0');
		this.hasAdminUnlock = false;
		this.remoteDeposits.splice(0, this.remoteDeposits.length);
		this.wireTemplates.splice(0, this.wireTemplates.length);
		this.selectedWireTemplate = null;
		this.ppaySuspects.splice(0, this.ppaySuspects.length);
		this.selectedPPaySuspect = null;
		this.wireAuthenticated = false;
		this.selectedmessageIndex = -1;
		this.selectedalertIndex = -1;
		this.selectedApprovalIndex = -1;
		this.selectedWireIndex = -1;
		this.ezdaccounts.splice(0, this.ezdaccounts.length);
		this.ezdlocations.splice(0, this.ezdlocations.length);
		this.ezdPendingDeposits.splice(0, this.ezdPendingDeposits.length);
		this.selectedPendingDeposit = -1;
		
		frontImage = null;
		backImage = null;
		
		$('#userid').val('');
		$('#companyid').val('');
		$('#answer').val('');
		$('#password').val('');
		$('#token').val('');
	};
}

MBUserSession.getAttribute = function(name) {
};

MBUserSession.setAttribute = function(name, value) {
};

function MBExtraMap(root) {
	this.extra = {};
	var temp = {};
	if (root !== undefined) {
		root.each(function() {
			var value = $(this).text();
			var mapKey = '';
			$.each(this.attributes, function() {
				if ($(this).val() !== "xsd:string") {
					mapKey = $(this).val();
				}
			});
			temp[mapKey] = value;
		});
		this.extra = temp;
		temp = null;
	}

	this.getXML = function() {
		var count = 0;
		var xml = '';
		for (var key in this.extra) {
			if (this.extra.hasOwnProperty(key)) {
				xml += '<ns1:entry ns1:key="' + key + '">' + this.extra[key] + '</ns1:entry>';
				count++;
			}
		}
		var finalxml = '';
		if (count > 0) {
			finalxml += '<ns1:extraMap size="' + count + '">';
			finalxml += xml;
			finalxml += '</ns1:extraMap>';
		} else
			finalxml = '<ns1:extraMap size="0"></ns1:extraMap>';
		return finalxml;
	};

	this.getXMLEscaped = function() {
		var count = 0;
		var xml = '';
		for (var key in this.extra) {
			if (this.extra.hasOwnProperty(key)) {
				xml += '<ns1:entry ns1:key="' + key + '">' + escape(this.extra[key]) + '</ns1:entry>';
				count++;
			}
		}
		var finalxml = '';
		if (count > 0) {
			finalxml += '<ns1:extraMap size="' + count + '">';
			finalxml += xml;
			finalxml += '</ns1:extraMap>';
		} else
			finalxml = '<ns1:extraMap size="0"></ns1:extraMap>';
		return finalxml;
	};

}

function MBMultifactorInfo(root) {
	this.id = '';
	this.challenge = '';
	this.response = '';
	this.enumClass = '';
	this.enumValue = '';
	this.extra = new MBExtraMap();
	if (root !== undefined) {
		$challenge = $(root).find("ns0\\:challenge,challenge");
		this.challenge = $challenge.text();
	}

	/*for(var i = 0; i < root.childNodes.length; i++) {
	 var node = root.childNodes[i];
	 var name = node.localName;

	 if (name == 'id') this.id = nodeValue(node);
	 else if (name == 'challenge') this.challenge = nodeValue(node);
	 else if (name == 'response') this.response = nodeValue(node);
	 else if (name == 'multifactor-type') {
	 for(var j = 0; j < node.childNodes.length; j++) {
	 var name = node.childNodes[j].localName;
	 if (name == 'enum-class') this.enumClass = nodeValue(node.childNodes[j]);
	 else if (name == 'enum-value') this.enumValue = nodeValue(node.childNodes[j]);
	 }
	 }
	 }*/

	this.getXML = function() {
		var xml = '<ns1:multifactorInfo>';
		if (this.challenge !== '')
			xml += '<ns1:challenge>NA</ns1:challenge>';
		if (this.response !== '')
			xml += '<ns1:response>' + this.response + '</ns1:response>';
		if (this.id !== '')
			xml += '<ns1:id>' + this.id + '</ns1:id>';

		xml += this.extra.getXML();
		/*xml += '<ns1:multifactor-type>';
		 xml += '<ns1:enum-class>'+this.enumClass+'</ns1:enum-class>';
		 xml += '<ns1:enum-value>'+this.enumValue+'</ns1:enum-value>';
		 xml += '</ns1:multifactor-type>';*/
		xml += '</ns1:multifactorInfo>';
		return xml;
	};
}

function MBUser(root) {
	this.userId = '';
	this.backendUserId = '';
	this.custId = '';
	this.password = '';
	this.type = '';
	this.bankId = '';
	this.locale = '';
	this.groupId = '';
	this.sessionId = '';
	this.channelSessionId = '';
	this.authenticated = 'false';
	this.channelName = 'WAP';
	this.profileStatus = '';
	this.multifactorInfo = null;
	this.firstName = '';
	this.lastName = '';
	// array
	this.extra = null;
	this.profileStatus = 'Active';

	if (root !== undefined) {
		var user = this;
		var $entries = $(root).find("ns1\\:entry, entry");
		this.extra = new MBExtraMap($entries);
		var $multifactor = $(root).find("ns1\\:multifactorSecurityInfo,multifactorSecurityInfo");
		if ($multifactor !== null && $multifactor !== undefined) {
			var mfa = new MBMultifactorInfo($multifactor);
			user.multifactorInfo = [mfa];
		}

		$(root).find("ns1\\:return,return").children().each(function() {
			var tagName = $(this).get(0).tagName;
			var temp = $(this).text();
			if (tagName.indexOf('ns1:') >= 0) {
				tagName = tagName.substring(4);
			}
			if (tagName !== 'extraMap' || tagName !== 'multifactorSecurityInfo') {
				user[tagName] = temp;
			}
		});
	}

	this.getXML = function() {
		var xml = '<ns1:user>';

		xml += addTags(this, ['userId', 'backendUserId', 'custId', 'password', 'type', 'bankId', 'groupId', 'sessionId', 'locale', 'channelSessionId', 'authenticated', 'channelName']);

		if (this.extra !== null)
			xml += this.extra.getXML();
		xml += '<ns1:profile-status><ns1:enum-class>com.sybase.mbanking.profile.enums.ProfileStatus</ns1:enum-class><ns1:enum-value>' + this.profileStatus + '</ns1:enum-value></ns1:profile-status>';
		if (this.multifactorInfo !== null && this.multifactorInfo !== undefined && this.multifactorInfo.length > 0) {
			var mfi = this.multifactorInfo[0];
			if (mfi !== null && mfi !== undefined) {
				if (mfi.response !== null && mfi.response !== undefined) {
					xml += '<ns1:multifactorSecurityInfo>';
					xml += mfi.getXML();
					xml += '</ns1:multifactorSecurityInfo>';
				}
			}
			/*var found = false;
			 for(var i = 0; i < this.multifactorInfo.length; i++) {
			 var mfi = this.multifactorInfo[i];
			 if (mfi.enumValue !== 'ChallengeQuestion')
			 continue;
			 if (!found) {
			 xml += '<ns1:multifactorSecurityInfo>';
			 found = true;
			 }
			 xml += mfi.getXML();
			 }
			 if (found)
			 xml += '</ns1:multifactorSecurityInfo>';*/
		}
		xml += '</ns1:user>';

		return xml;
	};
}

function MBAccount(root) {
	this.accountId = '';
	this.fullAccountId = '';
	this.type = '';
	this.balance = '';
	this.currencyCode = '';
	this.status = '';
	this.nickName = '';
	this.supportedOps = null;
	// MBSupportedOps
	this.extra = null;

	this.transactions = null;
	this.moreTransactionsAvail = null;
	this.availableTransactionDates = null;
	this.transactionListGrouped = null;

	if (root !== undefined) {
		this.accountId = $(root).find("ns1\\:accountId,accountId").text();
		this.fullAccountId = $(root).find("ns1\\:fullAccountId,fullAccountId").text();
		this.balance = $(root).find("ns1\\:balance,balance").text();
		this.nickName = $(root).find("ns1\\:nickName,nickName").text();

		$entries = $(root).find("ns1\\:entry,entry");
		this.extra = new MBExtraMap($entries);

		$supOps = $(root).find("ns1\\:supportedOps,supportedOps");
		this.supportedOps = new MBSupportedOps($supOps);
	}

	this.getXML = function(renamedAs) {
		if (renamedAs === undefined)
			renamedAs = 'account';
		var xml = '<ns1:' + renamedAs + '>';
		xml += addTags(this, ['accountId', 'fullAccountId', 'type', 'balance', 'currencyCode', 'nickName']);
		if (this.extra !== null)
			xml += this.extra.getXML();
		if (this.supportedOps !== null)
			xml += this.supportedOps.getXML();
		xml += '</ns1:' + renamedAs + '>';
		return xml;
	};

	this.entitledTo = function(op) {
		if (this.supportedOps !== null) {
			for (var i = 0; i < this.supportedOps.length; i++) {
				if (this.supportedOps[i] === op)
					return true;
			}
		}
		return false;
	};

	this.getAccountNameAndNumber = function() {
		var number = this.accountId.substring(0, this.accountId.indexOf('-'));
		if (number.length > 4)
			return this.nickName + ' x' + number.substr(-4);
		else
			return this.nickName + ' x' + number;
	};

	this.getMaskedNumber = function() {
		var number = this.accountId.substring(0, this.accountId.indexOf('-'));
		if (number.length > 4)
			return 'x' + number.substr(-4);
		else
			return 'x' + number;
	};

	this.getAccountNameNumberAndCurrency = function() {
		var number = this.accountId.substring(0, this.accountId.indexOf('-'));
		if (number.length > 4)
			return this.nickName + ' x' + number.substr(-4) + ' (' + this.extra.extra['currency'] + ')';
		else
			return this.nickName + ' x' + number;
	};
}

function MBSupportedOps(root) {
	this.ops = new Array();
	if (root !== undefined) {
		var index = 0;
		var operations = new Array();
		$ops = $(root).find("ns1\\:op,op");
		$ops.each(function() {
			operations[index] = $(this).text();
			index++;
		});
		this.ops = operations;
	}

	this.getXML = function() {
		var xml = '<ns1:supportedOps>';
		for (var i = 0; i < this.ops.length; i++)
			xml += '<ns1:op>' + this.ops[i] + '</ns1:op>';
		xml += '</ns1:supportedOps>';
		return xml;
	};

}

function MBAccountSnapshot(root) {
	this.lastUpdate_ACH = '';
	this.lastUpdate_Wires = '';
	this.lastUpdate_CD = '';

	this.cdTotals = {};
	this.wireTotals = {};
	this.achTotals = {};

	console.log(root);
	if (root !== undefined) {
		var $entries = $(root).find("ns1\\:entry,entry");
		var dates = new MBExtraMap($entries);
		this.lastUpdate_ACH = dates.extra['lastUpdate_ACH'];
		this.lastUpdate_Wires = dates.extra['lastUpdate_Wires'];
		this.lastUpdate_CD = dates.extra['lastUpdate_CD'];

		var $CDTotals = $(root).find("ns1\\:cdtotals,cdtotals");
		console.log($CDTotals);
		var $snapshots = $CDTotals.find("ns0\\:snapshottotal,snapshottotal");
		var temp = {};
		$snapshots.each(function() {
			var type = $(this).find("type").text();
			var balance = $(this).find("balance").text();
			temp[type] = balance;
		});
		this.cdTotals = temp;

		temp = {};
		var $WireTotals = $(root).find("ns1\\:lockboxtotals,lockboxtotals");
		console.log($WireTotals);
		$snapshots = $WireTotals.find("ns0\\:snapshottotal,snapshottotal");
		$snapshots.each(function() {
			var type = $(this).find("type").text();
			var balance = $(this).find("balance").text();
			temp[type] = balance;
		});
		this.wireTotals = temp;

		temp = {};
		var $ACHTotals = $(root).find("ns1\\:achtotals,achtotals");
		console.log($ACHTotals);
		$snapshots = $ACHTotals.find("ns0\\:snapshottotal,snapshottotal");
		$snapshots.each(function() {
			var type = $(this).find("type").text();
			var balance = $(this).find("balance").text();
			temp[type] = balance;
		});
		this.achTotals = temp;
	}
}

function MBPendingApproval(root) {
	this.approvalId = '';
	this.type = '';
	this.date = '';
	this.beneficiary = '';
	this.fromAccount = null;
	this.toAccount = null;
	this.submittedBy = '';
	this.amount = '';
	this.status = 'Hold';
	this.currency = '';
	this.error = '';
	this.extra = null;

	if (root !== undefined) {
		this.approvalId = $(root).find("ns1\\:approvalId,approvalId").text();
		this.type = $(root).find("ns1\\:type,type").text();
		this.submittedBy = $(root).find("ns1\\:submittedBy,submittedBy").text();
		this.date = $(root).find("ns1\\:date,date").text();
		this.currency = $(root).find("ns1\\:currency,currency").text();
		this.amount = $(root).find("ns1\\:amount,amount").text();
		this.beneficiary = $(root).find("ns1\\:payeeName,payeeName").text();
		this.fromAccount = $(root).find("ns1\\:fromAccountId,fromAccountId").text();
		this.toAccount = $(root).find("ns1\\:toAccountId,toAccountId").text();
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
		if (this.beneficiary === undefined) {
			var bene = this.extra.extra['beneficiary'];
			this.beneficiary = bene;
		}
		if (this.fromAccount === undefined || this.fromAccount === '') {
			var acct = this.extra.extra['debitAcctNum'];
			this.fromAccount = acct;
		}
	}

	this.getDecisionXML = function() {
		var xml = '<ns1:approvalDecision>';
		xml += '<ns1:id>' + this.approvalId + '</ns1:id>';
		var status = null;
		if (this.status === 'Approve')
			status = 'Approved';
		else if (this.status === 'Reject')
			status = 'Rejected';
		else
			status = this.status;

		xml += '<ns1:decision>' + status + '</ns1:decision>';
		xml += '</ns1:approvalDecision>';
		return xml;
	};

}

function MBPendingWire(root) {
	this.wireId = '';
	this.type = '';
	this.name = '';
	this.dateToPost = '';
	this.currency = 'USD';
	this.extra = null;
	this.amount = '';
	this.status = 'Hold';

	if (root !== undefined) {
		this.wireId = $(root).find("ns1\\:wireId,wireId").text();
		this.type = $(root).find("ns1\\:type,type").text();
		this.name = $(root).find("ns1\\:name,name").text();
		this.dateToPost = $(root).find("ns1\\:dateToPost,dateToPost").text();
		var currency = $(root).find("ns1\\:currency,currency").text();
		if (currency !== '')
			this.currency = currency;

		this.amount = $(root).find("ns1\\:amount,amount").text();
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
	}

	this.getWireDecisionXML = function() {
		var xml = '<ns1:wireDecision>';
		xml += '<ns1:id>' + this.wireId + '</ns1:id>';
		xml += '<ns1:decision>' + this.status + '</ns1:decision>';
		xml += '</ns1:wireDecision>';
		return xml;
	};

}

function MBMessage(root) {
	this.messageId = '';
	this.type = '';
	this.subject = '';
	this.from = '';
	this.body = '';
	this.caseNum = '';
	this.date = null;
	this.status = null;
	this.extra = null;

	if (root !== undefined) {
		this.messageId = $(root).find("ns1\\:messageId,messageId").text();
		this.type = $(root).find("ns1\\:type,type").text();
		this.subject = $(root).find("ns1\\:subject,subject").text();
		this.from = $(root).find("ns1\\:from,from").text();
		this.body = $(root).find("ns1\\:body,body").text();
		this.caseNum = $(root).find("ns1\\:caseNum,caseNum").text();
		this.status = 'unread';
		this.date = convertAxisDate($(root).find("ns1\\:date,date").text());
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
	}

	this.getXML = function() {
		var xml = '<ns1:message>';
		xml += addTags(this, ['messageId', 'type', 'subject', 'from', 'body', 'caseNum', 'date']);
		if (this.extra !== null)
			xml += this.extra.getXML();
		xml += '</ns1:message>';
		return xml;
	};

}

function MBTransaction(root) {
	this.date = null;
	this.description = null;
	this.amount = null;
	this.extra = null;
	this.transDateAsCal = null;
	this.account = null;
	this.referenceId = null;

	if (root !== undefined) {
		this.description = $(root).find("ns1\\:description,description").text();
		this.amount = $(root).find("ns1\\:amount,amount").text();
		this.date = convertAxisDate($(root).find("ns1\\:transactionDateAsCal,transactionDateAsCal").text());
		this.transDateAsCal = $(root).find("ns1\\:transactionDateAsCal,transactionDateAsCal").text();
		this.referenceId = $(root).find("ns1\\:referenceId,referenceId").text();
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
	}

	this.getXML = function() {
		var xml = '<ns1:transaction>';
		xml += '<ns1:transactionDateAsCal>' + this.transDateAsCal + '</ns1:transactionDateAsCal>';
		xml += this.extra.getXML();
		xml += this.account.getXML();
		xml += '</ns1:transaction>';
		return xml;
	};

}

function MBTransfer(root) {
	this.amount = null;
	this.currencyCode = null;
	this.dueDateAsCal = null;
	this.postDateAsCal = null;
	this.status = null;
	this.referenceId = null;
	this.extra = null;
	this.fromAccount = null;
	this.toAccount = null;
	this.date = null;
	this.longDate = null;

	if (root !== undefined) {
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
		this.fromAccount = new MBAccount($(root).find("ns1\\:fromAccount,fromAccount"));
		this.toAccount = new MBAccount($(root).find("ns1\\:toAccount,toAccount"));
		this.amount = $(root).find("ns1\\:amount,amount");
		this.status = $(root).find("ns1\\:status,status");
		this.referenceId = $(root).find("ns1\\:referenceId,referenceId");

		this.dueDateAsCal = $(root).find("ns1\\:dueDateAsCal,dueDateAsCal");
		this.postDateAsCal = $(root).find("ns1\\:postDateAsCal,postDateAsCal");
		
		var dateTime = null;
		if (this.dueDateAsCal !== '') {
			dateTime = formatDateTime(this.dueDateAsCal);
			this.longDate = dateTime.date;
		}
		if (this.postDateAsCal !== '') {
			dateTime = formatDateTime(this.postDateAsCal);
			this.longDate = dateTime.date;
		}
	}

	this.getXML = function() {
		var xml = '<ns1:transfer>';
		xml += addTags(this, ['amount', 'currencyCode', 'dueDateAsCal', 'postDateAsCal', 'status', 'referenceId']);
		if (this.extra !== null)
			xml += this.extra.getXML();
		if (this.fromAccount !== null)
			xml += this.fromAccount.getXML('fromAccount');
		if (this.toAccount !== null)
			xml += this.toAccount.getXML('toAccount');
		xml += '</ns1:transfer>';
		return xml;
	};
}

function MBRemoteDeposit(root) {
	this.ammount = '';
	this.date = null;
	this.insertTime = '';
	this.itemStatus = '';
	this.ownerCode = '';
	this.irn = '';
	this.h_irn = '';
	this.individualName = '';

	this.extra = null;

	if (root !== undefined) {
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
		this.amount = $(root).find("ns1\\:amount,amount").text();
		this.itemStatus = $(root).find("ns1\\:itemStatus,itemStatus").text();
		this.ownerCode = $(root).find("ns1\\:ownerCode,ownerCode").text();
		this.irn = $(root).find("ns1\\:irn,irn").text();
		this.h_irn = $(root).find("ns1\\:h_irn,h_irn").text();
		this.individualName = $(root).find("ns1\\:individualName,individualName").text();

		this.insertTime = $(root).find("ns1\\:insertTime,insertTime").text();
		if (this.insertTime !== '') {
			var dateTime = convertAxisDate(this.insertTime);
			this.date = dateTime;
		}
	}
}

function MBWireTemplate(root) {
	this.id = '';
	this.name = '';
	this.nickName = '';
	this.type = '';
	this.scope = '';
	this.category = '';
	this.debitAcctNum = '';
	this.beneficiary = '';
	this.creditAcctNum = '';
	this.usdAmount = '';
	this.currency = '';
	this.originalAmt = '';
	this.wireDateAsCal = null;
	this.wireAmount = '';

	this.extra = null;

	if (root !== undefined) {
		this.id = $(root).find("ns1\\:id,id").text();
		this.name = $(root).find("ns1\\:name,name").text();
		this.nickName = $(root).find("ns1\\:nickName,nickName").text();
		this.type = $(root).find("ns1\\:type,type").text();
		this.scope = $(root).find("ns1\\:scope,scope").text();
		this.category = $(root).find("ns1\\:category,category").text();
		this.debitAcctNum = $(root).find("ns1\\:debitAcctNum,debitAcctNum").text();
		this.beneficiary = $(root).find("ns1\\:beneficiary,beneficiary").text();
		this.creditAcctNum = $(root).find("ns1\\:creditAcctNum,creditAcctNum").text();
		this.usdAmount = $(root).find("ns1\\:usdAmount,usdAmount").text();
		this.currency = $(root).find("ns1\\:currency,currency").text();
		this.originalAmt = $(root).find("ns1\\:originalAmt,originalAmt").text();
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
	}

	this.getXML = function() {
		var xml = '<ns1:wireTemplate>';
		xml += '<ns1:id>' + this.id + '</ns1:id>';
		xml += this.extra.getXML();
		xml += '</ns1:wireTemplate>';
		return xml;
	};

	this.getWireXML = function() {
		var xml = '<ns1:wire>';
		xml += '<ns1:dateToPost>' + this.wireDateAsCal + '</ns1:dateToPost>';
		xml += '<ns1:currency>' + this.currency + '</ns1:currency>';
		xml += '<ns1:amount>' + this.wireAmount + '</ns1:amount>';
		xml += '<ns1:wireId>' + this.id + '</ns1:wireId>';
		xml += this.extra.getXMLEscaped();
		xml += '</ns1:wire>';
		return xml;
	};

}

function MBPositivePaySuspect(root) {
	this.id = '';
	this.checkNumber = '';
	this.echeck = '';
	this.reason = '';
	this.defaultDecision = '';
	this.accountId = '';
	this.payeeName = '';
	this.issueDate = '';
	this.date = null;
	this.amount = '';
	this.extra = null;
	this.decision = '';
	this.additionalData = null;
	this.payWithIssueDate = null;
	this.payWithIssuePayee = null;
	this.code = '';
	this.error = '';

	if (root !== undefined) {
		this.id = $(root).find("ns1\\:id,id").text();
		this.checkNumber = $(root).find("ns1\\:checkNumber,checkNumber").text();
		this.echeck = $(root).find("ns1\\:ECheck,ECheck").text();
		this.reason = $(root).find("ns1\\:reason,reason").text();
		this.defaultDecision = $(root).find("ns1\\:defaultDecision,defaultDecision").text();
		this.decision = 'HLD';
		this.accountId = $(root).find("ns1\\:accountId,accountId").text();
		this.payeeName = $(root).find("ns1\\:payeeName,payeeName").text();
		this.amount = $(root).find("ns1\\:amount,amount").text();
		this.issueDate = $(root).find("ns1\\:date,date").text();

		if (this.issueDate !== '') {
			var dateTime = convertAxisDate(this.issueDate);
			this.date = dateTime;
		}

		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
	}

	this.getDecisionXML = function() {
		var xml = '<ns1:positivePayDecision>';
		xml += '<ns1:id>' + this.id + '</ns1:id>';
		xml += '<ns1:decision>' + this.decision + '</ns1:decision>';
		if (this.decision === 'PWI') {
			if (this.payWithIssue !== undefined || this.payWithIssue !== null)
				xml += '<ns1:date>' + getAxisDate(this.payWithIssueDate) + '</ns1:date>';
			if (this.payWithIssuePayee !== undefined || this.payWithIssuePayee !== null)
				xml += '<ns1:payeeName>' + this.payWithIssuePayee + '</ns1:payeeName>';
			if (this.additionalData !== undefined || this.additionalData !== null)
				xml += '<ns1:additionalData>' + this.additionalData + '</ns1:additionalData>';
		}
		xml += '</ns1:positivePayDecision>';
		return xml;
	};
}

/*function MBEZDAccount() {
	this.accountId = '';
	this.nickName = '';
	this.ezdlocations = undefined;
	this.locationOwnerCodes = undefined;
	this.acctOwnerCodes = undefined;
	this.locationLoginNames = undefined;
}

MBEZDAccount.fromXML = function(root) {
	var ezdaccount = null;
	if (root !== undefined) {
		ezdaccount = new MBEZDAccount();
		ezdaccount.accountId = $(root).find("ns1\\:accountId,accountId").text();
		ezdaccount.nickName = $(root).find("ns1\\:nickName,nickName").text();
		var extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
		ezdaccount.ezdlocations = extra.extra['ezdlocations'].split(",");
		ezdaccount.locationOwnerCodes = extra.extra['locationOwnerCodes'].split(",");
		ezdaccount.acctOwnerCodes = extra.extra['acctOwnerCodes'].split(",");
		ezdaccount.locationLoginNames = extra.extra['locationLoginNames'];
	}
	return ezdaccount;
};*/

function MBEZDLocation() {
	this.location = '';
	this.username = '';
	this.accounts = [];
	this.extra = null;
}

MBEZDLocation.fromXML = function(root) {
	var ezdlocation = null;
	if (root !== undefined) {
		ezdlocation = new MBEZDLocation();
		ezdlocation.location = $(root).find("ns1\\:location,location").text();
		ezdlocation.username = $(root).find("ns1\\:username,username").text();
		ezdlocation.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
		var $ezdAccounts = $(root).find("ns0\\:account,account");
		$ezdAccounts.each(function() {
			var ezdaccount = new MBEZDAccount();
			ezdaccount.accNodeName = $(this).find("ns0\\:accNodeName,accNodeName").text();
			ezdaccount.ownerCode = $(this).find("ns0\\:ownerCode,ownerCode").text();
			ezdaccount.extra = new MBExtraMap($(this).find("ns0\\:entry,entry"));
			ezdlocation.accounts.push(ezdaccount);
		});
	}
	return ezdlocation;
};

function MBEZDAccount() {
	this.accNodeName = '';
	this.ownerCode = '';
	this.extra = null;
}

MBEZDAccount.fromXML = function(root) {
	var ezdaccount = null;
	if (root !== undefined) {
		ezdaccount = new MBEZDAccount();
		ezdaccount.accNodeName = $(root).find("ns1\\:accNodeName,accNodeName").text();
		ezdaccount.ownerCode = $(root).find("ns1\\:ownerCode,ownerCode").text();
		ezdaccount.extra = new MBExtraMap($(root).find("ns1\\:entry,entry"));
	}
	return ezdaccount;
};

function MBEZDPendingDeposit() {
	this.deposit_ID = '';
	this.accountNumber = '';
	this.amount = undefined;
	this.channelName = undefined;
	this.frontImageName = undefined;
	this.backImageName = undefined;
	this.depositStatus = undefined;
	this.postproc_sessToken = undefined;
	this.proc_statusCode = undefined;
	this.procStatus_Desc = undefined;
	this.procExcep_Descr = undefined;
	this.postProc = undefined;
	this.createdDate = undefined;
	this.extra = undefined;
}

MBEZDPendingDeposit.fromXML = function(root) {
	var ezddeposit = null;
	if (root !== undefined) {
		ezddeposit = new MBEZDPendingDeposit();
		ezddeposit.deposit_ID = $(root).find("ns1\\:depositId,depositId").text();
		ezddeposit.accountNumber = $(root).find("ns1\\:accountNumber,accountNumber").text();
		ezddeposit.amount = $(root).find("ns1\\:amount,amount").text();
		ezddeposit.channelName = $(root).find("ns1\\:channelName,channelName").text();
		ezddeposit.frontImageName = $(root).find("ns1\\:frontImageName,frontImageName").text();
		ezddeposit.backImageName = $(root).find("ns1\\:backImageName,backImageName").text();
		ezddeposit.depositStatus = $(root).find("ns1\\:depositStatus,depositStatus").text();
		ezddeposit.postproc_sessToken = $(root).find("ns1\\:postproc_sessToken,postproc_sessToken").text();
		ezddeposit.proc_statusCode = $(root).find("ns1\\:proc_statusCode,proc_statusCode").text();
		ezddeposit.procStatus_Desc = $(root).find("ns1\\:procStatus_Desc,procStatus_Desc").text();
		ezddeposit.procExcep_Descr = $(root).find("ns1\\:procExcep_Descr,procExcep_Descr").text();
		ezddeposit.postProc = $(root).find("ns1\\:postProc,postProc").text();
		ezddeposit.createdDate = $(root).find("ns1\\:createdDate,createdDate").text();
		this.extra = new MBExtraMap($(root).find("ns1\\:entry,entry")); 
	}
	return ezddeposit;
};
