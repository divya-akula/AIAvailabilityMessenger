// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Client } from "@microsoft/microsoft-graph-client";

import 'isomorphic-fetch';
import settings, { AppSettings } from "./appsettings";
import { initializeBetaGraphForAppOnlyAuth, initializeGraphForAppOnlyAuth } from "./newauth";
import {} from "@microsoft/microsoft-graph-types-beta"
import { initializeBetaGraphForDelegatedOnlyAuth, initializeGraphForDelegatedOnlyAuth } from "./DelegatedAppAuth";
import * as graphHelper from './Graph/helper'

export async function getUsersFromAPI(userId:string): Promise<any> {

  let users: any=null;

// initializeGraph(settings,false);
let _gclient=initializeGraphForAppOnlyAuth(settings);
console.warn(userId);
let usr= await _gclient.
// api('/users/') //added for testing
api('/users/'+userId+'@trycatchexp.onmicrosoft.com')
// .header('ConsistencyLevel','eventual') //required if search works
// .search('displayname:Priyan') // This doesnt seem to work
.get();

 
 
    return usr;
  }
  export async function getUsersFromMe(): Promise<any> {

    let users: any=null;
  
  let _gclient=initializeBetaGraphForDelegatedOnlyAuth(settings);
  let usr= await _gclient.
  // api('/users/') //added for testing
  api('/me')
  // .header('ConsistencyLevel','eventual') //required if search works
  // .search('displayname:Priyan') // This doesnt seem to work
  .get();
  
   
   
      return usr;
    }
  function initializeGraph(settings: AppSettings,beta:boolean) {
    initializeGraphForAppOnlyAuth(settings);
  }
  
  export async function SendMessageToUserWhenAvailableAsync(userId:string,message:string): Promise<any> {
let theuser=await getUsersFromAPI(userId);
let me=await  getUsersFromAPI("dinudivya");
    // initializeGraph(settings);
    let _gclient=initializeBetaGraphForAppOnlyAuth(settings);
    const intervalId = setInterval(async () => {
      const configOptions={
        "version":"beta"
      }
      const presence = await _gclient.api('/users/'+theuser["id"]+'/presence').get((res,err)=>{
        console.warn(res);
        console.warn(err);
      });
      if (presence.availability === "Available") {
        console.log("User is online");
        const chat = {chatType: 'oneOnOne',members: [{'@odata.type':'#microsoft.graph.aadUserConversationMember',roles: ['owner'],'user@odata.bind':'https://graph.microsoft.com/v1.0/users(\''+me["id"]+'\')'},
        {'@odata.type':'#microsoft.graph.aadUserConversationMember',roles: ['owner'],'user@odata.bind':'https://graph.microsoft.com/v1.0/users(\''+theuser["id"]+'\')'}]};

    await _gclient.api('/chats')
	        .post(chat);
        clearInterval(intervalId);
      } else {
        console.log("User is offline");
      }
    }, 5000);
  }