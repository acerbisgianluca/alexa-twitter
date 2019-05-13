const express = require('express');
const session = require('express-session');
const twitterAPI = require('node-twitter-api');
const SESS_SECRET = process.env.SESS_SECRET;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

const app = express();
app.set('trust proxy', 1);
app.use(
    session({
        secret: SESS_SECRET,
        cookie: { maxAge: 2592000, secure: true },
        resave: false,
        saveUninitialized: true,
    })
);

const twitter = new twitterAPI({
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    callback: CALLBACK_URL,
});

app.get('/', (req, res) => {
    res.send('OAuth middleware is working!');
});

app.get('/oauth/request_token', (req, res) => {
    console.log(CONSUMER_KEY, CONSUMER_SECRET, CALLBACK_URL);
    const session = req.session;
    session.clientId = req.query.client_id;
    session.state = req.query.state;
    session.redirect_uri = req.query.redirect_uri;

    twitter.getRequestToken((error, oauthToken, oauthTokenSecret) => {
        if (error) {
            console.log('Error getting OAuth request token: ', error);
        } else {
            session.oauthTokenSecret = oauthTokenSecret;
            res.redirect(
                'https://twitter.com/oauth/authorize?oauth_token=' + oauthToken
            );
        }
    });
});

app.get('/oauth/callback', (req, res) => {
    const oauthToken = req.query.oauth_token;
    const oauthVerifier = req.query.oauth_verifier;
    const oauthTokenSecret = req.session.oauthTokenSecret;

    twitter.getAccessToken(
        oauthToken,
        oauthTokenSecret,
        oauthVerifier,
        (error, accessToken, accessTokenSecret) => {
            const session = req.session;
            if (error) {
                console.log(error);
            } else {
                const params = {};
                twitter.verifyCredentials(
                    accessToken,
                    accessTokenSecret,
                    params,
                    (error, data) => {
                        if (error) {
                            console.log('Error while verifying.');
                            res.send('Error while verifying.');
                        } else {
                            console.log('Success; name:' + data['screen_name']);

                            var redirect_alexa =
                                decodeURI(session.redirect_uri) +
                                '#access_token=' +
                                accessToken +
                                ',' +
                                accessTokenSecret +
                                '&state=' +
                                session.state +
                                '&client_id=' +
                                session.client_id +
                                '&response_type=Bearer';

                            res.redirect(redirect_alexa);
                        }
                    }
                );
            }
        }
    );
});

module.exports = app;
