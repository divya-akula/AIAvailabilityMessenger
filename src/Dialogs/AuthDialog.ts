// with thanks to https://github.com/garrytrinder/msteams-bot-sso
import { Activity, Attachment, AttachmentLayoutTypes, BotState, CardFactory, HeroCard, InputHints, MessageFactory, StatePropertyAccessor, TurnContext, UserState } from 'botbuilder';

import {
    ComponentDialog,
    ConfirmPrompt,
    DateTimePrompt,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    OAuthPrompt,
    PromptOptions,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import fetch from 'node-fetch';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CONFIRM_PROMPT = 'ConfirmPrompt';
const MAIN_DIALOG = 'MainDialog';
const OAUTH_PROMPT = 'OAuthPrompt';
export class MainDialog extends ComponentDialog {
    _userState: BotState;
    constructor(userState: BotState) {
        super('MainDialog');
        console.log('Main Dialog constructor');
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this._userState = userState;

    this.addDialog(new OAuthPrompt(OAUTH_PROMPT, {
                connectionName: 'AIApp',
                text: 'Please Sign In',
                title: 'Sign In',
                timeout: 300000,
            }));

    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

    this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.promptStep.bind(this),
                this.loginStep.bind(this),
            ]));

    this.initialDialogId = MAIN_WATERFALL_DIALOG;

}

async promptStep(stepContext) {
    try {
        return await stepContext.beginDialog(OAUTH_PROMPT);
    } catch (err) {
        console.error(err);
    }
}

async loginStep(stepContext) {
    // Get the token from the previous step. Note that we could also have gotten the
    // token directly from the prompt itself. There is an example of this in the next method.
    const tokenResponse = stepContext.result;
    if (!tokenResponse || !tokenResponse.token) {
        await stepContext.context.sendActivity('Login was not successful please try again.');
    } else {
        const token = tokenResponse.token;
        // On successful login, the token contains sign in token.
    }
    return await stepContext.endDialog();
}
}