const Twitter = require('twitter');
const { ri } = require('@jargon/alexa-skill-sdk');
const regexCreator = require('emoji-regex');
const emojiRegex = regexCreator();
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

const login = (accessToken, accessTokenSecret) => {
    const client = new Twitter({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        access_token_key: accessToken,
        access_token_secret: accessTokenSecret,
    });

    return client;
};

const postTweet = async (text, [accessToken, accessTokenSecret]) => {
    const client = login(accessToken, accessTokenSecret);

    const params = {
        status: text,
    };
    return client
        .post('statuses/update', params)
        .then(() => {
            return ri('postTweet.success');
        })
        .catch(() => {
            ri('postTweet.error');
        });
};

const getTrends = async ([accessToken, accessTokenSecret]) => {
    const client = login(accessToken, accessTokenSecret);

    const params = {
        id: 1,
    };
    return client
        .get('trends/place', params)
        .then((results) => {
            const { trends } = results[0];
            const trendsList = trends
                .slice(0, 5)
                .map((trend) => {
                    return trend.name;
                })
                .join(', ');

            return ri('getTrends.success', { trendsList: trendsList });
        })
        .catch(() => {
            ri('getTrends.error');
        });
};

const getTimeline = async ([accessToken, accessTokenSecret], jrm, count) => {
    const client = login(accessToken, accessTokenSecret);

    const params = {
        count: count < 1 ? 1 : count,
        exclude_replies: true,
    };
    return client
        .get('statuses/home_timeline', params)
        .then(async (results) => {
            const tweetList = results.map((tweet) => {
                const newText = tweet.text
                    .replace(
                        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
                        ''
                    )
                    .replace(emojiRegex, '');

                return ri('getTimeline.tweet', {
                    text: newText,
                    user: tweet.user.name,
                });
            });

            const tweetString = await jrm.renderBatch(tweetList);

            return ri('getTimeline.success', {
                count: count,
                tweetList: tweetString.join(' <break strength=\'medium\'/> '),
            });
        })
        .catch(() => {
            return ri('getTimeline.error');
        });
};

module.exports = {
    postTweet,
    getTrends,
    getTimeline,
};
