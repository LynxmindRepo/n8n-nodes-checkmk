import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export async function checkmkApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	qs: any = {},
): Promise<any> {
	const credentials = await this.getCredentials('checkmkApi');

	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: `${credentials.host}/${credentials.site}/check_mk/api/1.0${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${credentials.username} ${credentials.password}`,
		},
		json: true,
	};

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function checkmkApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	qs: any = {},
): Promise<any> {
	const returnData: any[] = [];
	let responseData;

	do {
		responseData = await checkmkApiRequest.call(this, method, endpoint, body, qs);
		
		if (responseData.value) {
			returnData.push(...responseData.value);
		} else if (Array.isArray(responseData)) {
			returnData.push(...responseData);
		} else {
			returnData.push(responseData);
		}

		// Check if there's a next page
		if (responseData.links && responseData.links.next) {
			endpoint = responseData.links.next;
		} else {
			break;
		}
	} while (true);

	return returnData;
}

