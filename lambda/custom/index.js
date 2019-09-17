const Alexa = require('ask-sdk-core');
const Jargon = require('@jargon/alexa-skill-sdk');
const { ri } = Jargon;
const utils = require('./utils');
const aplDocument = require('./resources/aplPostTweetIntent.json');

const supportsAPL = (handlerInput) => {
    const supportedInterfaces =
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface !== undefined;
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const tokens =
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
        const tokens =
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

        if (!supportsAPL(handlerInput)) {
            return handlerInput.jrb
                .speak(speechText)
                .withSimpleCard(ri('card.title'), ri('postTweet.card.content'))
                .getResponse();
        }

        const title = await handlerInput.jrm.render(ri('postTweet.header'));

        return handlerInput.jrb
            .speak(speechText)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: '[SkillProvidedToken]',
                document: aplDocument,
                datasources: {
                    bodyData: {
                        type: 'object',
                        objectId: 'bt1Sample',
                        backgroundImage: {
                            contentDescription: null,
                            smallSourceUrl: null,
                            largeSourceUrl: null,
                            sources: [
                                {
                                    url:
                                        'https://images.pond5.com/4k-particles-navy-blue-background-footage-086897506_prevstill.jpeg',
                                    size: 'small',
                                    widthPixels: 0,
                                    heightPixels: 0,
                                },
                                {
                                    url:
                                        'https://images.pond5.com/4k-particles-navy-blue-background-footage-086897506_prevstill.jpeg',
                                    size: 'large',
                                    widthPixels: 0,
                                    heightPixels: 0,
                                },
                            ],
                        },
                        title: title,
                        textContent: {
                            primaryText: {
                                type: 'PlainText',
                                text: text,
                            },
                        },
                        logoUrl:
                            'https://s3.amazonaws.com/CAPS-SSE/echo_developer/c475/28dd040e3f874be38a215da7c29eb6f4/APP_ICON?versionId=ceWsD687._cENr1SRKDXTn8MM3cWidOq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20190917T141524Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Credential=AKIAJFEYRBGIHK2BBYKA%2F20190917%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e2dd744ad7ed4d5930c7ae783796ae3b3e7b50c308204e8959e948f22a03aa73',
                    },
                },
            })
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
        const tokens =
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

const GetTimelineIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'GetTimelineIntent'
        );
    },
    async handle(handlerInput) {
        const tokens =
            handlerInput.requestEnvelope.context.System.user.accessToken;
        if (!tokens) {
            const speechText = ri('errors.noAuth');

            return handlerInput.jrb
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }

        const count =
            handlerInput.requestEnvelope.request.intent.slots.count.value;
        const speechText = await utils.getTimeline(
            tokens.split(','),
            handlerInput.jrm,
            count
        );

        return handlerInput.jrb
            .speak(speechText)
            .withSimpleCard(ri('card.title'), ri('getTimeline.card.content'))
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
        GetTimelineIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
