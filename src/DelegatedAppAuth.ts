import 'isomorphic-fetch';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from
  '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
  const msal = require('@azure/msal-node');


import { AppSettings } from './appsettings';

let _settings: AppSettings | undefined = undefined;
let _clientSecretCredential: ClientSecretCredential | undefined = undefined;
let _appClient: Client | undefined = undefined;
let _betaappClient: Client | undefined = undefined;

export function initializeGraphForDelegatedOnlyAuth(settings: AppSettings) {
  // Ensure settings isn't null
  if (!settings) {
    throw new Error('Settings cannot be undefined');
  }

  _settings = settings;

  if (!_clientSecretCredential) {
    _clientSecretCredential = new ClientSecretCredential(
      _settings.tenantId,
      _settings.clientId,
      _settings.clientSecret
    );
  }
  const config = {
    auth: {
        clientId: _settings.clientId,
        authority: 'https://login.microsoftonline.com/common/',
        clientSecret:  _settings.clientSecret,

    }
};
const cca = new msal.ConfidentialClientApplication(config);
  
  if (!_appClient) {
    const {
      DeviceCodeCredential
  } = require("@azure/identity");
    const credential = new DeviceCodeCredential(_settings.tenantId, _settings.clientId, _settings.clientSecret);    

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      // scopes: [ 'https://graph.microsoft.com/.default' ]
      scopes:  ["Presence.Read", "Presence.Read.All", "Presence.ReadWrite", "User.Read", "User.Read.All", "User.ReadBasic.All", "User.ReadWrite.All", "User.ReadWrite","Directory.Read.All","Directory.ReadWrite.All"]
    });
    let btoken=""; 
         
        
            //  btoken= authResult.accessToken;
          _appClient = Client.initWithMiddleware({
            // defaultVersion: 'beta',
            authProvider:authProvider
          });
        
    return _appClient;
  }
  return _appClient;
}
export function initializeBetaGraphForDelegatedOnlyAuth(settings: AppSettings) {
  // Ensure settings isn't null
  if (!settings) {
    throw new Error('Settings cannot be undefined');
  }

  _settings = settings;

  if (!_clientSecretCredential) {
    _clientSecretCredential = new ClientSecretCredential(
      _settings.tenantId,
      _settings.clientId,
      _settings.clientSecret
    );
  }
  
  const config = {
    auth: {
        clientId: _settings.clientId,
        authority: 'https://login.microsoftonline.com/common/',
        clientSecret:  _settings.clientSecret,

    }
};
  if (!_betaappClient) {
    const {
      DeviceCodeCredential
  } = require("@azure/identity");
    const credential = new DeviceCodeCredential(_settings.tenantId, _settings.clientId, _settings.clientSecret);    
    
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      // scopes: [ 'https://graph.microsoft.com/.default' ]
      scopes:  ["Presence.Read", "Presence.Read.All", "Presence.ReadWrite", "User.Read", "User.Read.All", "User.ReadBasic.All", "User.ReadWrite.All", "User.ReadWrite", "Presence.Read.All","Directory.Read.All","Directory.ReadWrite.All"]
    });
   
  
      //  btoken= authResult.accessToken;
    _betaappClient = Client.initWithMiddleware({
      defaultVersion: 'beta',
      authProvider:authProvider
    });
    return _betaappClient;
  }
  return _betaappClient;
}
export async function getAppOnlyTokenAsync(): Promise<string> {
    // Ensure credential isn't undefined
    if (!_clientSecretCredential) {
      throw new Error('Graph has not been initialized for app-only auth');
    }
  
    // Request token with given scopes
    const response = await _clientSecretCredential.getToken([
      'https://graph.microsoft.com/.default'
    ]);
    return response.token;
  }
