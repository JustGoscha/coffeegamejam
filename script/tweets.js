/*globals _:false, $:false, coffeeMachine: false, startDrawCycle: false, gamestate: false */
var tweets = [],
    mixedtweets,
    tweettemplate = _.template("<div class='tweet'><div class='userpicture'><img src='<%= user.profile_image_url %>' alt='' /></div><div class='text'><h2><%= user.name %></h2><%= text %></div></div>"),
    tweetfilteredtemplate = _.template("<div class='tweet'><div class='userpicture'><img src='<%= user.profile_image_url %>' alt='' /></div><div class='text'><h2><%= user.name %></h2><%= filteredText %></div></div>"),
    index = -1,
    tag1 = "toomuchcoffee",
    tag2 = "ineedcoffee",
    successCount = 0;

var showNewtweet = function() {
    "use strict";
    index++;

    var tweet = mixedtweets[index];

    if(tweet.retweeted_status){
        showNewtweet();
        return;
    }

    if(tweet.text.toLowerCase().indexOf(tag1) != -1){
        tweet.tag = "#" + tag1;
    } else {
        tweet.tag = "#" + tag2;
    }

    tweet.filteredText = tweet.text.toLowerCase().split(tweet.tag)[0] + "#?????????";
    if(tweet.text.toLowerCase().split(tweet.tag).length > 1){
        tweet.filteredText += tweet.text.toLowerCase().split(tweet.tag)[1];
    }

    $("#tweets").html(tweetfilteredtemplate(tweet));
    // todo: get more tweets here
    if (index > tweets.length-1) {
        index = 0;
    }
};

var initializeTweets = function() {
    "use strict";
    $(".tag1").data("tag", "#" + tag1).text("#" + tag1);
    $(".tag2").data("tag", "#" + tag2).text("#" + tag2);
    if(tweets.length > 100) {
        /* game starts here... */
        mixedtweets = _.shuffle(tweets);
        showNewtweet();
        init();
    }
};
var getHashtagTweets = function (tagname, callback) {
    "use strict";
    $.ajax({
        "type": "GET",
        "dataType": "JSON",
        "url": "http://www.bringliste.de/coffeegamejam/tweettest.php?hashtag=" + tagname,
        "success": callback
    });
};
var over = false;
var gameOver = function () {
    "use strict";
    if(over){
        return;
    }
    over = true;
    $("body").append("<div id='overlay'><div class='gocontainer'><h2>Game Over</h2></div></div>");
    setTimeout(function(){
        $("#overlay").addClass("show");
    }, 0);
};

$(function(){
    "use strict";

    $("#start").on("click", function() {
        tag1 = $("#tag1").val();
        tag2 = $("#tag2").val();
        $("#formoverlay").remove();
        setTimeout(function(){
            getHashtagTweets(tag1, function(reply){
                tweets = tweets.concat(reply.statuses);
                initializeTweets();
            });
            getHashtagTweets(tag2, function(reply){
                tweets = tweets.concat(reply.statuses);
                initializeTweets();
            });
        }, 0);
    });

    $(".tag").on("click", function(){
        var $this = $(this);
        var tweet = mixedtweets[index];
        if(tweet.clicked){
            return;
        } else {
            mixedtweets[index].clicked = true;
            $("#tweets").html(tweettemplate(tweet));
            gamestate.started = true;
            if(tweet.tag == $this.data("tag")){
                var up = 100;
                if(successCount > 3){
                    up += 100;
                }
                coffeeMachine.increaseLevel(up);
                successCount++;
            } else {
                coffeeMachine.decreaseLevel(50);
                successCount = 0;
            }
            setTimeout(function(){
                if(tweet.tag == $this.data("tag")){
                    $("#tweets .tweet").addClass("success");
                } else {
                    $("#tweets .tweet").addClass("fail");
                }
            }, 0);
            setTimeout(function(){
                showNewtweet();
            }, 800);
        }
    });

});