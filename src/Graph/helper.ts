import { AppCredential, OnBehalfOfUserCredential, createMicrosoftGraphClient, createMicrosoftGraphClientWithCredential } from "@microsoft/teamsfx";
import { Client } from "@microsoft/microsoft-graph-client";

export class GraphService {
    private graphClient: Client;
    private _token: string;


    constructor(token: string) {
        if (!token || !token.trim()) {
            throw new Error('SimpleGraphClient: Invalid token received.');
        }

        this._token = token;
        this.graphClient = Client.init({
            authProvider: (done) => {
                done(null, this._token); // First parameter takes an error if you can't get an access token.
            }
        });
    }
    async getUsersFromAPI(userId:string): Promise<any> {

        let users: any=null;
      
      // initializeGraph(settings,false);
      console.warn(userId);
      let usr= await this.graphClient.
      // api('/users/') //added for testing
      api('/users/'+userId+'@trycatchexp.onmicrosoft.com')
      // .header('ConsistencyLevel','eventual') //required if search works
      // .search('displayname:Priyan') // This doesnt seem to work
      .get();
      
       
       
          return usr;
        }
      async getUsersFromMe(): Promise<any> {
      
          let users: any=null;
        
        // let _gclient=initializeGraphForDelegatedOnlyAuth(settings);
        let usr= await this.graphClient.
        // api('/users/') //added for testing
        api('/me')
        // .header('ConsistencyLevel','eventual') //required if search works
        // .search('displayname:Priyan') // This doesnt seem to work
        .get();
        
         
         
            return usr;
          }
        }