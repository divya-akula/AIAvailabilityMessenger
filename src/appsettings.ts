const settings: AppSettings = {
    'clientId': 'eb4cc600-e210-46e6-a4fa-b7be8aad90cd',//'a4ac9469-cca5-4c55-8742-6c5b3236bc97',
    'clientSecret': 'PxN8Q~2-WckHGkzBRFyg-irYOexxOGVnH7LbXach',//'H5v8Q~1xZTwYAiO03Qo1J1SEFMnirEoWhvpdQbTB',
    'tenantId': 'c09030dd-81e0-44af-a342-68c9358c43dd',
    'connectionName':'AIApp'
  };
  
  export interface AppSettings {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    connectionName:string;
  }
  
  export default settings;