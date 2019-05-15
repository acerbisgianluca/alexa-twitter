const Twitter = require('twitter');
const { ri } = require('@jargon/alexa-skill-sdk');
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

module.exports = {
    postTweet,
    getTrends,
};
