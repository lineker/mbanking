jQuery.sap.declare("model.SapBeans");
jQuery.sap.require("util.Tags");
model.SapBeans = {
		
		MBUser : function(root) {
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
			this.extra = null; // array
			this.profileStatus = 'Active';
			
			if (root !== undefined) {
				var user = this;
				var $entries = $(root).find("ns1\\:entry, entry");
				this.extra = new model.SapBeans.MBExtraMap($entries);
				var $multifactor = $(root).find("ns1\\:multifactorSecurityInfo,multifactorSecurityInfo");
				if ($multifactor !== null && $multifactor !== undefined) {
					var mfa = new model.SapBeans.MBMultifactorInfo($multifactor);
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

				xml += util.Tags.addTags(this, ['userId', 'backendUserId', 'custId', 'password', 'type', 'bankId', 'groupId', 'sessionId', 'locale', 'channelSessionId', 'authenticated', 'channelName']);

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
				}
				xml += '</ns1:user>';

				return xml;
			};
		},
		
		MBExtraMap: function (root) {
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

		},
		
		MBMultifactorInfo : function(root) {
			this.id = '';
			this.challenge = '';
			this.response = '';
			this.enumClass = '';
			this.enumValue = '';
			this.extra = new model.SapBeans.MBExtraMap();
			if (root !== undefined) {
				$challenge = $(root).find("ns0\\:challenge,challenge");
				this.challenge = $challenge.text();
			}

			this.getXML = function() {
				var xml = '<ns1:multifactorInfo>';
				if (this.challenge !== '')
					xml += '<ns1:challenge>NA</ns1:challenge>';
				if (this.response !== '')
					xml += '<ns1:response>' + this.response + '</ns1:response>';
				if (this.id !== '')
					xml += '<ns1:id>' + this.id + '</ns1:id>';

				xml += this.extra.getXML();
				xml += '</ns1:multifactorInfo>';
				return xml;
			};
		},
		
		MBAccount : function MBAccount(root) {
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
				this.extra = new model.SapBeans.MBExtraMap($entries);

				$supOps = $(root).find("ns1\\:supportedOps,supportedOps");
				this.supportedOps = new model.SapBeans.MBSupportedOps($supOps);
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
		},
		
		 MBSupportedOps : function(root) {
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
		
		
}