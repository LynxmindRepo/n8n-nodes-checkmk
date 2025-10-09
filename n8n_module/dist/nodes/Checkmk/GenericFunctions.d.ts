import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions, IHttpRequestMethods } from 'n8n-workflow';
export declare function checkmkApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions, method: IHttpRequestMethods, endpoint: string, body?: any, qs?: any): Promise<any>;
export declare function checkmkApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions, method: IHttpRequestMethods, endpoint: string, body?: any, qs?: any): Promise<any>;
