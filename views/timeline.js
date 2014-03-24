"use strict";

Cortex.timeline = function () {
    var twister = Cortex.createTwisterRPC();
    var cursor = null;    // user : postRange

    var initializeCursor = function () {
        var deferred = $.Deferred();
        twister.getLastHave(Cortex.config.user)
            .done(function (data) {
                cursor = {};
                for (var user in data.result) {
                    var range = { max_id: data.result[user], since_id: null };
                    cursor[user] = range;
                }
                deferred.resolve();
            })
            .fail(function () {
                console.debug("Error initializing cursor");
                deferred.reject();
            });
        return deferred.promise();
    }

    var loadMoreMessages = function (count) {
        var deferred = $.Deferred();
        var requestRanges = getMoreMessagesRequestRanges();
        twister.getPosts(count, requestRanges)
            .done(function (data) {
                updateCursor(data.result);
                deferred.resolve(createTimelineItems(data.result));
            })
            .fail(function () {
                console.debug("loadMoreMessages - error.");
                deferred.reject();
            });
        return deferred.promise();
    }

    var getMoreMessagesRequestRanges = function () {
        var requestRanges = [];
        for (var user in cursor) {
            var range = { username: user, since_id: -1 };

            if (cursor[user].since_id !== null) {
                range.max_id = cursor[user].since_id - 1;
                if (range.max_id < -1)
                    range.max_id = -1;
            } else {
                // Debug.Assert(cursor[user].max_id.HasValue);
                range.max_id = cursor[user].max_id;
            }

            requestRanges.push(range);
        }
        return requestRanges;
    }

    var createTimelineItems = function (posts) {
        var formatPostDate = function(time) {
            var date = new Date(0);
            date.setUTCSeconds(time);
            return Globalize.format(date, "dd.MM.yy HH:mm");
        }

        var createHyperlinks = function(text) {
            text = text.replace(
                /((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g,
                '<a target="_blank" href="$1">$1</a>'
            );
            return text;
        }

        var result = [];
        for (var i = 0; i < posts.length; i++) {
            var isRT = containsRetwist(posts[i]);
            var displayData = isRT ? posts[i].userpost.rt : posts[i].userpost;

            var itemModel = {
                post: posts[i],
                isRT: isRT,
                rtBy: isRT ? posts[i].userpost.n : null,
                date: formatPostDate(displayData.time),
                user: displayData.n,
                message: createHyperlinks(displayData.msg),
                k: displayData.k
            };

            result.push(itemModel);
        }
        return result;
    }

    var updateCursor = function (posts) {
        for (var i = 0; i < posts.length; i++) {
            var userpost = posts[i].userpost;

            if (userpost.n in cursor) {
                cursor[userpost.n].max_id = Math.max(cursor[userpost.n].max_id, userpost.k);

                if (cursor[userpost.n].since_id !== null) {
                    cursor[userpost.n].since_id = Math.min(cursor[userpost.n].since_id, userpost.k);
                } else {
                    cursor[userpost.n].since_id = userpost.k;
                }
            } else {
                cursor[userpost.n] = { max_id: userpost.k, since_id: userpost.k };
            }
        }
    }

    var createListSource = function() {
        var timelineListSource = new DevExpress.data.DataSource({
            load: function (loadOptions) {
                if (!loadOptions.refresh)
                    return loadMoreMessages(loadOptions.take);

                var deferred = $.Deferred();
                var handleError = function () {
                    alert("Error loading messages");
                    deferred.reject();
                };

                initializeCursor()
                    .done(function () {
                        loadMoreMessages(loadOptions.take)
                            .done(function (result) { deferred.resolve(result); })
                            .fail(handleError);
                    })
                    .fail(handleError);

                return deferred.promise();
            }
        });
        return timelineListSource;
    }

    var containsRetwist = function (post) {
        return post.userpost.rt !== undefined;
    }

    var replyPost = function (e) {
        Cortex.app.navigate({
            view: "post",
            replyTo: {
                user: e.model.user,
                k: e.model.k
            }
        });
    }

    var retwistPost = function(post) {
        var displayError = function (jqXHR, textStatus, errorThrown) {
            // TODO: more details on failure
            alert("Retwist failed");
        }

        var rt = {};
        if (containsRetwist(post)) {
            rt.sig_userpost = post.userpost.sig_rt;
            rt.userpost = post.userpost.rt;
        } else {
            rt.sig_userpost = post.sig_userpost;
            rt.userpost = post.userpost;
        }

        twister.getLastHave(Cortex.config.user)
            .done(function (data) {
                var k = data.result[Cortex.config.user] + 1;
                twister.newRTMsg(Cortex.config.user, k, rt)
                    .fail(displayError);
            })
            .fail(displayError);
    }

    var createRTActionSheet = function () {
        var items = [{
            text: "Retwist",
            clickAction: function () { retwistPost(targetPost); }
        }];
        var visible = ko.observable(false);
        var targetPost = null;

        var show = function (e) {
            targetPost = e.model.post;
            visible(true);
        }

        return {
            items: items,
            visible: visible,
            show: show
        };
    };

    var scrollToTheTop = function () {
        $("#timeline").dxList("instance").scrollTo(0);
    }

    return {
        listSource: ko.observable(createListSource()),
        rtActionSheet: createRTActionSheet(),
        replyPost: replyPost,
        scrollToTheTop: scrollToTheTop
    };
};
