jQuery.sap.declare("util.sapconnectors.MBSecurityConnector");
jQuery.sap.require("util.sapconnectors.MBConnector");
jQuery.sap.require("util.Constants");

util.sapconnectors.MBSecurityConnector = {
        sendGetMultifactorSecurityInfoRequest : function (user) {
            var soap = util.Constants.SoapHeader + '<ns1:getMultifactorSecurityInfo>\n' + user.getXML() + '</ns1:getMultifactorSecurityInfo>\n' + util.Constants.SoapFooter;
            util.sapconnectors.MBConnector.sendSOAPMessage("SecurityService", "getMultifactorSecurityInfo", soap, processGetMultifactorSecurityInfoResponse, processHandleError);
        },
        
        answerMultifactorSecurityInfo : function (user) {
            var soap = util.Constants.SoapHeader + '<ns1:getMultifactorSecurityInfo>\n' + user.getXML() + '</ns1:getMultifactorSecurityInfo>\n' + util.Constants.SoapFooter;
            util.sapconnectors.MBConnector.sendSOAPMessage("SecurityService", "getMultifactorSecurityInfo", soap, processAnswerMultifactorSecurityInfoResponse, processHandleError);
        },
        
        sendAuthenticateUserRequest : function (user) {
            var soap = util.Constants.SoapHeader + '<ns1:authenticateUser>\n' + user.getXML() + '</ns1:authenticateUser>\n' + util.Constants.SoapFooter;
            util.sapconnectors.MBConnector.sendSOAPMessage("SecurityService", "authenticateUser", soap, processAuthenticateUserResponse, processHandleError);
        },
        
        sendLogoutRequest : function (user) {
            var body = user.getXML() + '<ns1:criteria><ns1:numResults>20</ns1:numResults><ns1:extraMap size="0" /></ns1:criteria>';
            var soap = util.Constants.SoapHeader + '<logout>\n' + body + '</logout>\n' + util.Constants.SoapFooter;
            util.sapconnectors.MBConnector.sendSOAPMessage("SecurityService", "logout", soap, processLogoutResponse, processLogoutError);
            currentSession.clearUserSession();
        }
};
        