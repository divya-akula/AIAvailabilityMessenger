// Import required packages
import * as restify from "restify";

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
  TurnContext,
  MemoryStorage,
  Entity,
  TeamsSSOTokenExchangeMiddleware,
  // ConversationState,
  // UserState
} from "botbuilder";

// This bot's main dialog.
import { TeamsBot } from "./teamsBot";
import config from "./config";
import { Application, ConversationHistory, DefaultPromptManager, DefaultTurnState, OpenAIModerator,AzureOpenAIPlannerOptions, AzureOpenAIPlanner, AI, DefaultConversationState, DefaultTempState, DefaultUserState } from '@microsoft/teams-ai';
import path from "path";
import { AzureOpenAIClient, AzureOpenAIClientOptions } from "@microsoft/teams-ai/lib/OpenAIClients";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
// import {  SendMessageToUserWhenAvailableAsyncs } from "./src/service";
import { TeamsBotSsoPrompt, TeamsBotSsoPromptSettings } from "@microsoft/teamsfx";
import { MainDialog } from "./src/Dialogs/AuthDialog";
import authConfig from "./src/authconfig";
import { GraphService } from "./src/Graph/helper";
import { SendMessageToUserWhenAvailableAsync } from "./src/service";
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: config.botId,
  MicrosoftAppPassword: config.botPassword,
  MicrosoftAppType: "MultiTenant",
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  credentialsFactory
);

const adapter = new   CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context: TurnContext, error: Error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );
  

  // Send a message to the user
  await context.sendActivity(`The bot encountered unhandled error:\n ${error.message}`);
  await context.sendActivity("To continue to run this bot, please fix the bot source code.");
};
interface ConversationState extends DefaultConversationState {
  available: boolean;
  message: string;
  userid:string;
  messagesent:boolean;
  users: UserData[];
}
type UserState = DefaultUserState;

interface TempState extends DefaultTempState {
    users: UserData[];
}
type ApplicationTurnState = DefaultTurnState<ConversationState,UserState>;

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the bot that will handle incoming messages.

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3979, () => {
  console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await app.run(context);
  });
});
const TeamsBotSsoPromptId = "TEAMS_BOT_SSO_PROMPT";
const settings: TeamsBotSsoPromptSettings = {
  scopes: ["Presence.Read", "Presence.Read.All", "Presence.ReadWrite", "User.Read", "User.Read.All", "User.ReadBasic.All", "User.ReadWrite.All", "User.ReadWrite","Directory.Read.All","Directory.ReadWrite.All"],
  timeout: 900000,
  endOnInvalidMessage: true,
};
// Define storage and application
const storage = new MemoryStorage();
// const convoState = new ConversationState(storage);
// const userState = new UserState(storage);
const dialog = new TeamsBotSsoPrompt(
  authConfig,
  "https://login.microsoftonline.com",
  TeamsBotSsoPromptId,
  settings
);
const bot = new TeamsBot();

const options:AzureOpenAIClientOptions={"endpoint":config.openAPIEndPoint,apiKey:config.openAIKey};
const client = new OpenAIClient(config.openAPIEndPoint, new AzureKeyCredential(config.openAIKey),);
const tokenExchangeMiddleware = new TeamsSSOTokenExchangeMiddleware(storage,"MyFirstAppAuth");
adapter.use(tokenExchangeMiddleware);
const deploymentId = "MyGPT3";
let messages=[
  {
    "role": "system",
    "content": "You are an AI assistant that helps people find other people and their availability"
  },
  {
    "role": "user",
    "content": "Can you check if the user is online?`"
  },
  {
    "role": "user",
    "content": "Help me find the user <username>"
  },
  {
    "role": "assistant",
    "content": "Call the action {{getUsers}} and send a list of users available "
  },
  {
    "role": "user",
    "content": "Let user select a datacard"
  },
];
const prompt=["You are an AI assistant that helps people find other people availability",
"Accept is an username or email to invoke {{GetUsers}}",
"Call the action {{GetUsers}} and send a list of users available ",

];
const result =  client.getCompletions(deploymentId, prompt, {
  frequencyPenalty:0.0,
  temperature: 0.9
}).catch((err)=>{console.warn(err);});

interface UserData {
  message:string;
  username: string; // <- populated by GPT
  email: string; // <- populated by GPT
  userId: string; // <- populated by GPT
  status: string; // <- populated by GPT
}
const planner = new AzureOpenAIPlanner({
  apiKey: config.openAIKey,
  defaultModel: 'MyGPT3',
  logRequests: true,
  endpoint:config.openAPIEndPoint,
});


const promptManager =  new DefaultPromptManager<ApplicationTurnState>(path.join(__dirname, './prompts' ));

const app = new Application<ApplicationTurnState>({
  storage,
  ai: {
      planner,
      promptManager,
      prompt: 'chat',
      history: {
          assistantHistoryType: 'text'
      },
     
  }
});
app.ai.action(AI.FlaggedInputActionName, async (context, state, data) => {
  await context.sendActivity(`I'm sorry your message was flagged: ${JSON.stringify(data)}`);
  return false;
});
// app.ai.action('login', async (context, state, userData: UserData) => {
//   let User= getUsers(state, userData.username);
//  //  await context.sendActivity(responses.itemFound(data.list, data.item));
//  await context.sendActivity(`Found User `+(await User).userId);
//    return true;
//  });
app.ai.action('GetUsers', async (context, state, userData: UserData) => {

 let User= getUsers(state, userData.username);
//  await context.sendActivity(responses.itemFound(data.list, data.item));
await context.sendActivity(`Found User `+(await User).userId);
  return true;
});

app.ai.action('sendMessage', async (context, state, userData: UserData,message:string) => {
  let User= SendMessageToUserWhenAvailable(state, userData.username,userData.message);
 //  await context.sendActivity(responses.itemFound(data.list, data.item));
 await context.sendActivity(`Found User `+(await User).userId);
   return true;
 });

app.ai.action(AI.FlaggedOutputActionName, async (context, state, data) => {
  await context.sendActivity(`I'm not allowed to talk about such things.`);
  return false;
});

app.message('/history', async (context, state) => {
  const history = ConversationHistory.toString(state, 2000, '\n\n');
  await context.sendActivity(history);
  });

  async function getUsers(state: ApplicationTurnState, user: string): Promise<UserData> {
    let userEmail:any;
  // let usrs= await getUsersFromAPI(user).then((res)=>{userEmail=res});
  const conversation = state.conversation.value;
  
  return {username:userEmail["displayName"],email:userEmail["mail"],userId:userEmail["id"],status:"unknown","message":""};
}

async function SendMessageToUserWhenAvailable(state: ApplicationTurnState, user: string,message:string): Promise<UserData> {
  let userEmail:any;
let usrs= await SendMessageToUserWhenAvailableAsync(user,message).then((res)=>{userEmail=res});
const conversation = state.conversation.value;

return {username:user,email:"",userId:"",status:"unknown","message":""};
}
/**
 * @param state
 * @param listName
 */
function ensureListExists(state: ApplicationTurnState, listName: string): void {
  const conversation = state.conversation.value;
  if (typeof conversation.users != 'object') {
      conversation.users = [];
      // conversation.userid = [];
  }

}
  // if (!Object.prototype.hasOwnProperty.call(conversation.lists, listName)) {
