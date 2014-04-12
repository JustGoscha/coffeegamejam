/*globals _:false, $:false, coffeeMachine: false, startDrawCycle: false */
var tweets = [],
    mixedtweets,
    tweettemplate = _.template("<div class='tweet'><div class='userpicture'><img src='<%= user.profile_image_url %>' alt='' /></div><div class='text'><h2><%= user.name %></h2><%= text %></div></div>"),
    tweetfilteredtemplate = _.template("<div class='tweet'><div class='userpicture'><img src='<%= user.profile_image_url %>' alt='' /></div><div class='text'><h2><%= user.name %></h2><%= filteredText %></div></div>"),
    index = -1,
    tag1 = "toomuchcoffee",
    tag2 = "ineedcoffee";

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
        startDrawCycle();
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
$(function(){
    "use strict";

    getHashtagTweets(tag1, function(reply){
        tweets = tweets.concat(reply.statuses);
        initializeTweets();
    });
    getHashtagTweets(tag2, function(reply){
        tweets = tweets.concat(reply.statuses);
        initializeTweets();
    });

    $(".tag").on("click", function(){
        var $this = $(this);
        var tweet = mixedtweets[index];
        tweet.clicked = true;
        $("#tweets").html(tweettemplate(tweet));
        setTimeout(function(){
            if(tweet.tag == $this.data("tag")){
                $("#tweets .tweet").addClass("success");
                coffeeMachine.increaseLevel(50);
            } else {
                $("#tweets .tweet").addClass("fail");
                coffeeMachine.decreaseLevel(50);
            }
        }, 0);
        setTimeout(function(){
            showNewtweet();
        }, 1000);
    });
});