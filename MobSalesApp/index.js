"use strict";

window.MobileSales = {};

$(function () {
    FastClick.attach(document.body);
    var ms = window.MobileSales,
    app,
    currentBackAction,
    device = DevExpress.devices.current(),
    APP_SETTINGS = {
        namespace: ms,
        defaultLayout: "slideout",
        navigation: [
            {
                "id": "Home",
                "title": "Home",
                "action": "#Home",
                "icon": "home"
            },
             {
                 "id": "Settings",
                 "title": "Settings",
                 "action": "#Settings",
                 "icon": "card"
             },
            {
                "id": "About",
                "title": "About",
                "action": "#about",
                "icon": "info"
            }
        ]
    };
    $.extend(ms, {
        hardwareBackButton: (device.phone && device.platform === "win8") || device.platform === "android" || device.platform === "tizen",
    });

    var subviewMap = {
        "Home": ["Orders/*", "CreateOrder/*"],
    };
    function testUri(patterns, uri) {
        var pattern = [],
            regexp;

        $.each(patterns, function () {
            pattern.push(this.replace("/", "\\/").replace("*", ".+"));
        });

        regexp = new RegExp("^(" + pattern.join("|") + ")$");
        return regexp.test(uri);
    }
    function startApp(needToSynchronize) {
        if (needToSynchronize)
            ms.app.navigate("Settings/1");
        else
            ms.app.navigate();
    }
    function onNavigate(args) {
        if (!args.currentUri)
            return;

        if (subviewMap[args.uri] && testUri(subviewMap[args.uri], args.currentUri) && args.options.location === "navigation") {
            args.cancel = true;
            return;
        }
         
    }
    function onViewShown(args) {
        var viewInfo = args.viewInfo;
        if (viewInfo.model.hideNavigationButton)
            viewInfo.renderResult.$markup.find(".nav-button-item").remove();

        currentBackAction = viewInfo.model.backButtonDown;
    }
    function onBackButton() {
        if (currentBackAction) {
            currentBackAction();
        } else {
            if (ms.app.canBack()) {
                ms.app.back();
            }
            else {
                if (confirm("Are you sure you want to exit?")) {
                    switch (device.platform) {
                        case "tizen":
                            tizen.application.getCurrentApplication().exit();
                            break;
                        case "android":
                            navigator.app.exitApp();
                            break;
                        case "win8":
                            window.external.Notify("DevExpress.ExitApp");
                            break;
                    }
                }
            }
        }
    }
    function onDeviceReady() {
        document.addEventListener("backbutton", onBackButton, false);
        document.addEventListener("pause", window.MobileSales.dataservice.saveDataLocally, false);
        navigator.splashscreen.hide();
    }

    $(function () {
        FastClick.attach(document.body);
        app = ms.app = new DevExpress.framework.html.HtmlApplication(APP_SETTINGS);
        app.router.register(":view/:item", { view: "Home", item: undefined });
        ms.app.viewShown.add(onViewShown);
        ms.app.navigationManager.navigating.add(onNavigate);

      
        startApp(!ms.dataservice.initUserData());

        setTimeout(function () {
            document.addEventListener("deviceready", onDeviceReady, false);
            //window.onunload = wo.saveCurrentWorkout;

            if (device.platform == "tizen") {
                document.addEventListener("tizenhwkey", function (e) {
                    if (e.keyName === "back")
                        onBackButton();
                });
            }
        }, 1000);
    });
   
});