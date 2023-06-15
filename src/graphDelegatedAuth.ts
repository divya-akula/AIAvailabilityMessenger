import { ClientSecretCredential } from "@azure/identity";
import { AuthenticationContext } from "adal-node";
import { Client } from "@microsoft/microsoft-graph-client";

const clientId = "YOUR_APP_ID";
const secret = "YOUR_APP_SECRET";
const tenantId = "YOUR_TENANT_ID";

const authContext = new AuthenticationContext(`https://login.microsoftonline.com/${tenantId}`);
const credentials = new ClientSecretCredential(tenantId,clientId, secret);
let scopes = ["User.Read", "User.Read.All", "User.ReadWrite", "profile", "Presence.ReadWrite", "Presence.Read.All" ,"Presence.Read" ,"openid" ,"offline_access", "email", "Directory.ReadWrite.All", "Directory.Read.All"];
authContext.acquireTokenWithClientCredentials("https://graph.microsoft.com", clientId, secret, async (err, tokenResponse) => {
    if (err) {
        console.log(err);
    } else {
        let btoken="";
        await credentials.getToken(scopes).then((res)=>{btoken=res.token;});
        const graphClient = Client.init({
            authProvider: (done) => {
                done(null,btoken );
            },
        });
        // Use the graphClient object to call Microsoft Graph APIs
    }
});

