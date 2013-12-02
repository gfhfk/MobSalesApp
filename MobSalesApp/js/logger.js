MobileSales.logger = (function () {

    //toastr.options.timeOut = 2000; 
    var timeOut=2000; 
    //toastr.options.positionClass = 'toast-bottom-right';

    var logger = {
        error: error,
        info: info,
        success: success,
        warning: warning,
        log: log // straight to console; bypass toast
    };

    function error(message, title) {
        DevExpress.ui.notify(message, 'error', timeOut);
        //toastr.error(message, title);
        log("Error: " + message);
    };
    function info(message, title) {
        DevExpress.ui.notify(message, 'info', timeOut);
        //toastr.info(message, title);
        log("Info: " + message);
    };
    function success(message, title) {
       // DevExpress.ui.dialog.alert('Alert message', 'Alert title');
        DevExpress.ui.notify(message, 'success', timeOut);
        //toastr.success(message, title);
        log("Success: " + message);
    };
    function warning(message, title) {
        DevExpress.ui.notify(message, 'warning', timeOut);
        //toastr.warning(message, title);
        log("Warning: " + message);
    };

    // IE and google chrome workaround
    // http://code.google.com/p/chromium/issues/detail?id=48662
    function log() {
        var console = window.console;
        !!console && console.log && console.log.apply && console.log.apply(console, arguments);
    }

    return logger;
})();