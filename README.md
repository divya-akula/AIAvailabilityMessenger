# AIAvailabilityMessenger

This is an Azure OpenAI based messenger. You can ask the messenger to check if a user is online or send a message when the user is online. This would be helpful in situations where I do not need to wait on a specific person and also can be used specifically when delegating tasks.

## APIs Used
The following are the APIs used
1. Azure OpenAI
2. GraphAPI
3. GraphAPI Beta 

## Challenges Faced
1. Azure Open AI , there is no actual code available in typescript that helps
2. Graph API with beta is needed for user presence , which is unfortunately not working with Application Registration

## Challenges Open
1. I could not figure out how delegated permissions work with Azure Bot (SSO & delegated)
