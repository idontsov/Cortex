"use strict";

window.Cortex = window.Cortex || {};

$(function () {
    if ("currentDevice" in Cortex.config) {
        DevExpress.devices.current(Cortex.config.currentDevice);
    }

    Cortex.app = new DevExpress.framework.html.HtmlApplication({
        namespace: Cortex,
        navigationType: "slideout",
        navigation: [
            {
                title: "Timeline",
                action: "#timeline",
            },
            {
                title: "Network",
                action: "#network",
            }
        ],
        commandMapping: {
            "ios-header-toolbar": {
                commands: [
                    { id: "newPost", location: 'right', showText: false },
                    { id: "scrollToTheTop", location: 'left', showText: false },
                ]
            },
            "android-footer-toolbar": {
                commands: [
                    { id: "newPost", location: 'center', showText: false },
                    { id: "scrollToTheTop", location: 'left', showText: false },
                ]
            },
            "tizen-footer-toolbar": {
                commands: [
                      { id: "newPost", location: 'center', showText: false },
                      { id: "scrollToTheTop", location: 'left', showText: false },
                ]
            },
            "generic-header-toolbar": {
                commands: [
                    { id: "newPost", location: 'right', showText: false },
                    { id: "scrollToTheTop", location: 'left', showText: false },
                ]
            },
            "win8-phone-appbar": {
                commands: [
                    { id: "newPost", location: 'center', showText: true },
                    { id: "scrollToTheTop", location: 'left', showText: true },
                ]
            },
        }
    });

    Cortex.app.router.register(":view/", { view: "timeline" });
    Cortex.app.router.register("post/:replyTo", { view: "post", replyTo: undefined });
});
