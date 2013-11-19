"use strict";

window.MyApp = {};

$(function () {
    FastClick.attach(document.body);

    var devices = DevExpress.devices;
    var defaultLayout = "slideout";
    if (devices.current().platform === "desktop") {
        defaultLayout = "desktop";
    }
    MyApp.app = new DevExpress.framework.html.HtmlApplication({
        namespace: MyApp,
        
        defaultLayout: defaultLayout,
        navigation: [
          {
            title: "Home",
            action: "#home",
            icon: "home"
          },
          {
            title: "About",
            action: "#about",
            icon: "info"
          }
        ]
    });
    MyApp.app.router.register(":view", {view: "home"});
    MyApp.app.navigate();   
});