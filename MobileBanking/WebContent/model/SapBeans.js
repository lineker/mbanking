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

		}
		
		
}