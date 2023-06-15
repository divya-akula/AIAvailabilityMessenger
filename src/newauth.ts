import 'isomorphic-fetch';
import { ClientSecretCredential } from '@azure/identity';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from
  '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

import { AppSettings } from './appsettings';

let _settings: AppSettings | undefined = undefined;
let _clientSecretCredential: ClientSecretCredential | undefined = undefined;
let _appClient: Client | undefined = undefined;
let _betaappClient: Client | undefined = undefined;

export function initializeGraphForAppOnlyAuth(settings: AppSettings) {
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
  
  if (!_appClient) {
    const authProvider = new TokenCredentialAuthenticationProvider(_clientSecretCredential, {
      scopes: [ 'https://graph.microsoft.com/.default' ]
    });
      
    _appClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
    return _appClient;
  }
  return _appClient;
}
export function initializeBetaGraphForAppOnlyAuth(settings: AppSettings) {
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
  
  if (!_betaappClient) {
    const authProvider = new TokenCredentialAuthenticationProvider(_clientSecretCredential, {
      scopes: [ 'https://graph.microsoft.com/.default' ]
    });
     
    _betaappClient = Client.initWithMiddleware({
      defaultVersion: 'beta',
      authProvider: authProvider
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
