"use strict";

Cortex.post = function (params) {
    var MAXIMUM_MESSAGE_LENGTH = 140;
    var twister = Cortex.createTwisterRPC();

    var message = ko.observable("");
    var postingMessage = ko.observable(false);
    var symbolsLeft = ko.computed(function () {
        return MAXIMUM_MESSAGE_LENGTH - message().length;
    });
    var postMessageDisabled = ko.computed(function () {
        if (postingMessage())
            return true;
        return symbolsLeft() >= MAXIMUM_MESSAGE_LENGTH || symbolsLeft() < 0;
    });
    var replyTo = params.replyTo;

    var postMessage = function () {
        var getLastHaveCompleted = function (data) {
            var k = data.result[Cortex.config.user] + 1;
            twister.newPostMsg(Cortex.config.user, k, message(), replyTo)
                .done(newPostMsgCompleted)
                .fail(errorSendingMessage);
        };
        var newPostMsgCompleted = function () {
            message("");
            replyTo = undefined;
            postingMessage(false);
            Cortex.app.back();
        };
        var errorSendingMessage = function (jqXHR, textStatus, errorThrown) {
            var errorMessage = "Error sending message.";
            if (jqXHR.responseJSON !== undefined)
                errorMessage += " " + jqXHR.responseJSON.error.message;
            alert(errorMessage);
            postingMessage(false);
        };

        postingMessage(true);
        twister.getLastHave(Cortex.config.user)
            .done(getLastHaveCompleted)
            .fail(errorSendingMessage);
    }

    if (replyTo !== undefined) {
        message("@" + params.replyTo.user + " ");
    }

    return {
        message: message,
        symbolsLeft: symbolsLeft,
        postMessageDisabled: postMessageDisabled,
        postMessage: postMessage
    };
};
