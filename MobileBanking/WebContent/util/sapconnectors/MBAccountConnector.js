jQuery.sap.require("util.sapconnectors.MBConnector");
jQuery.sap.require("util.Constants");

util.sapconnectors.MBAccountConnector = {
		
        sendGetAccountsRequest : function (user, successcallback, errorcallback) {
        		var body = user.getXML() + '<ns1:criteria><ns1:numResults>20</ns1:numResults><ns1:extraMap size="0" /></ns1:criteria>';
        		var soap = util.Constants.SoapHeader + '<getAccounts>\n' + body + '</getAccounts>\n' + util.Constants.SoapFooter;
        		util.sapconnectors.MBConnector.sendSOAPMessage("CorpAccountService", "getAccounts", soap, successcallback, errorcallback);
        	}
};
        