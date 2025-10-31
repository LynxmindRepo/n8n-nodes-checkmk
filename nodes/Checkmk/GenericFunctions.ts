import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	JsonObject,
	NodeApiError,
	IHttpRequestOptions,
} from 'n8n-workflow';

export async function checkmkApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: Record<string, unknown> = {},
	qs: any = {},
	customHeaders?: any,
): Promise<any> {
	const credentials = await this.getCredentials('checkmkApi');

	const options: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: `${credentials.host}/${credentials.site}/check_mk/api/1.0${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${credentials.username} ${credentials.password}`,
			...customHeaders,
		},
		json: true,
	};

	try {
		return await this.helpers.httpRequest(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function checkmkApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: Record<string, unknown> = {},
	qs: any = {},
): Promise<any> {
	const returnData: any[] = [];
	let nextCall: string | undefined = endpoint;

	while (nextCall) {
		const responseData: { value?: any; links: { next: string | undefined } } =
			await checkmkApiRequest.call(this, method, nextCall, body, qs);

		if (responseData.value) {
			returnData.push(...responseData.value);
		} else if (Array.isArray(responseData)) {
			returnData.push(...responseData);
		} else {
			returnData.push(responseData);
		}

		nextCall = responseData.links.next ?? undefined;
	}

	return returnData;
}

export async function checkmkApiRequestWithETag(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: Record<string, unknown> = {},
	qs: any = {},
): Promise<{ data: any; etag: string }> {
	const credentials = await this.getCredentials('checkmkApi');

	const options: IHttpRequestOptions = {
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
		returnFullResponse: true,
	};

	try {
		const response = await this.helpers.httpRequest(options);
		const etag = response.headers.etag || response.headers['etag'];
		return {
			data: response.body,
			etag: etag ? etag.replace(/"/g, '') : '',
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
