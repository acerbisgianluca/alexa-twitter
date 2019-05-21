const Alexa = require('ask-sdk-core');
const Jargon = require('@jargon/alexa-skill-sdk');
const { ri } = Jargon;
const utils = require('./utils');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        let tokens =
            handlerInput.requestEnvelope.context.System.user.accessToken;
        if (!tokens) {
            const speechText = ri('errors.noAuth');

            return handlerInput.jrb
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }

        const speechText = ri('welcome.success');

        return handlerInput.jrb
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(ri('card.title'), ri('welcome.card.content'))
            .getResponse();
    },
};

const PostTweetIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'PostTweetIntent'
        );
    },
    async handle(handlerInput) {
        let tokens =
            handlerInput.requestEnvelope.context.System.user.accessToken;
        if (!tokens) {
            const speechText = ri('errors.noAuth');

            return handlerInput.jrb
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }

        const text =
            handlerInput.requestEnvelope.request.intent.slots.text.value;

        const speechText = await utils.postTweet(text, tokens.split(','));

        return handlerInput.jrb
            .speak(speechText)
            .withSimpleCard(ri('card.title'), ri('postTweet.card.content'))
            .getResponse();
    },
};

const GetTrendsIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'GetTrendsIntent'
        );
    },
    async handle(handlerInput) {
        let tokens =
            handlerInput.requestEnvelope.context.System.user.accessToken;
        if (!tokens) {
            const speechText = ri('errors.noAuth');

            return handlerInput.jrb
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }

        const speechText = await utils.getTrends(tokens.split(','));

        return handlerInput.jrb
            .speak(speechText)
            .withSimpleCard(ri('card.title'), ri('getTrends.card.content'))
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'AMAZON.HelpIntent'
        );
    },
    handle(handlerInput) {
        const speechText = ri('help.message');

        return handlerInput.jrb
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(ri('card.title'), ri('help.card.content'))
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name ===
                'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name ===
                    'AMAZON.StopIntent')
        );
    },
    handle(handlerInput) {
        const speechText = ri('stop.message');

        return handlerInput.jrb
            .speak(speechText)
            .withSimpleCard(ri('card.title'), ri('stop.card.content'))
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
        );
    },
    handle(handlerInput) {
        return handlerInput.jrb.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        const speechText = ri('errors.miscellaneous');

        return handlerInput.jrb
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const skillBuilder = new Jargon.JargonSkillBuilder().installOnto(
    Alexa.SkillBuilders.custom()
);

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        PostTweetIntentHandler,
        GetTrendsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
