jQuery.sap.declare("util.sapconnectors.MBConnector");
jQuery.sap.require("util.Constants");


util.sapconnectors.MBConnector = {
        
    sendSOAPMessage : function(endpoint, action, soapmessage, successcallback, errorcallback) {
        //lastInactiveTime = 0;
        //showPleaseWait();
        //log(soapmessage);
        $.ajax({
            type : "POST",
            url : util.Constants.servicesUrl + endpoint,
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
    }
};