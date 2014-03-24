"use strict";

Cortex.createTwisterRPC = function () {
    var createCommand = function (methodName, parameters) {
        var command = new Object();
        command.jsonrpc = "2.0";
        command.method = methodName;
        command.params = parameters;
        return command;
    }

    var sendCommand = function (command) {
        return $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: "/",
            cache: false,
            async: true,
            data: JSON.stringify(command),
            //crossDomain: true,
            //beforeSend: function (xhr) {
            //    xhr.withCredentials = true;
            //    xhr.setRequestHeader('Authorization', TwisterClient.CreateBasicAuthHeader(TwisterClient.RpcUser, TwisterClient.RpcPassword));
            //}
        });
    }

    var getLastHave = function (user) {
        var command = createCommand("getlasthave", [user]);
        return sendCommand(command);
    }

    var newPostMsg = function (user, k, message, replyTo) {
        var parameters = [user, k, message];

        if (replyTo !== undefined) {
            parameters.push(replyTo.user);
            parameters.push(replyTo.k);
        }

        var command = createCommand("newpostmsg", parameters);
        return sendCommand(command);
    }

    var newRTMsg = function (user, k, rt) {
        var command = createCommand("newrtmsg", [user, k, rt]);
        return sendCommand(command);
    }

    var getPosts = function (count, ranges) {
        var command = createCommand("getposts", [count, ranges]);
        return sendCommand(command);
    }

    return {
        getLastHave: getLastHave,
        newPostMsg: newPostMsg,
        newRTMsg: newRTMsg,
        getPosts: getPosts
    };
};
