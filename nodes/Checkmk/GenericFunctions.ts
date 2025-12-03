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
		
		// Try different possible header names for ETag (case-insensitive search)
		const headers = response.headers || {};
		let etag: string | undefined;
		
		// Check all possible variations
		for (const key in headers) {
			if (key.toLowerCase() === 'etag') {
				etag = headers[key];
				break;
			}
		}
		
		// If still not found, try direct access
		if (!etag) {
			etag = headers.etag || 
			       headers['etag'] || 
			       headers['ETag'] ||
			       headers['Etag'];
		}
		
		// Clean up ETag: remove quotes and whitespace
		// Store the raw value for If-Match (needs quotes)
		let cleanedEtag = '';
		if (etag) {
			// Remove quotes if present (both single and double quotes)
			// Remove any whitespace
			// The ETag should be a clean hash string
			cleanedEtag = String(etag)
				.replace(/^["']+|["']+$/g, '') // Remove quotes at start and end
				.replace(/^W\/["']|["']$/g, '') // Remove weak ETag format (W/")
				.trim()
				.replace(/\s+/g, ''); // Remove any whitespace
		}
		
		return {
			data: response.body,
			etag: cleanedEtag,
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

// Helper function to normalize folder IDs in endpoints
// Checkmk uses ~ prefix for folder IDs (e.g., /hahaha -> ~hahaha)
const normalizeFolderEndpoint = (endpoint: string): string => {
	// Only process folder_config endpoints
	if (!endpoint.includes('/folder_config/')) {
		return endpoint;
	}
	
	// Extract the folder ID from the endpoint
	// Pattern: /objects/folder_config/{folderId}
	const match = endpoint.match(/^(\/objects\/folder_config\/)(.+?)(\/.*)?$/);
	if (!match) {
		return endpoint;
	}
	
	const prefix = match[1];
	const folderId = match[2];
	const suffix = match[3] || '';
	
	// If already in ~ format, return as is
	if (folderId.startsWith('~')) {
		return endpoint;
	}
	
	// Normalize the folder ID
	const normalizeFolderId = (folderPath: string): string => {
		if (!folderPath || folderPath === '/' || folderPath === '') {
			return '~';
		}
		if (folderPath.startsWith('~')) {
			return folderPath.replace(/^\/+/, '').replace(/\/+$/, '');
		}
		let cleanPath = decodeURIComponent(folderPath).replace(/^\/+|\/+$/g, '');
		if (cleanPath === '') {
			return '~';
		}
		const segments = cleanPath.split('/').filter(s => s !== '' && s !== null && s !== undefined);
		if (segments.length === 0) {
			return '~';
		}
		return '~' + segments.join('~');
	};
	
	const normalizedId = normalizeFolderId(folderId);
	return prefix + encodeURIComponent(normalizedId) + suffix;
};

// Helper function to perform PUT/DELETE operations that require If-Match header
export async function checkmkApiRequestWithIfMatch(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: Record<string, unknown> = {},
	qs: any = {},
): Promise<any> {
	// Normalize folder endpoints to ensure folder IDs are in correct format
	endpoint = normalizeFolderEndpoint(endpoint);
	
	// Determine the correct endpoint to get ETag from
	// For PUT/DELETE on /objects/host_config/name, get ETag from /objects/host_config/name
	// For actions like /objects/host_config/name/actions/move/invoke, get ETag from /objects/host_config/name
	let etagEndpoint = endpoint;
	
	// For actions/invoke endpoints, extract the base object path
	if (endpoint.includes('/actions/')) {
		// Extract the base object path (e.g., /objects/host_config/name from /objects/host_config/name/actions/rename/invoke)
		const match = endpoint.match(/^(\/objects\/[^\/]+\/[^\/]+)/);
		if (match) {
			etagEndpoint = match[1];
		}
	}
	// For PUT/DELETE on /objects/host_config/name, use the same endpoint
	// The endpoint is already correct for direct object operations

	// Get the ETag by doing a GET request on the resource
	// This must be done immediately before the PUT/DELETE to ensure we have the latest ETag
	let etag: string = '';
	try {
		const result = await checkmkApiRequestWithETag.call(this, 'GET', etagEndpoint, {}, qs);
		etag = result.etag || '';
		
		if (!etag || etag === '') {
			throw new NodeApiError(this.getNode(), {
				message: `ETag not found in response headers for ${etagEndpoint}. The API may not support ETags for this resource.`,
			} as JsonObject);
		}
	} catch (error: any) {
		// Helper function to check if error is a 404
		const is404Error = (err: any): boolean => {
			// Check status code in various possible locations
			if (err.statusCode === 404 || err.httpCode === 404 || err.code === 404) {
				return true;
			}
			// Check response object
			if (err.response?.status === 404 || err.response?.statusCode === 404) {
				return true;
			}
			// Check response data
			if (err.response?.data) {
				const data = err.response.data;
				if (typeof data === 'object') {
					if (data.status === 404 || data.statusCode === 404) {
						return true;
					}
					if (data.title === 'Not Found' || data.title === 'NotFound') {
						return true;
					}
				}
			}
			// Check error message for common 404 indicators
			const errorMessage = String(err.message || '').toLowerCase();
			if (errorMessage.includes('not found') || 
			    errorMessage.includes('404') ||
			    errorMessage.includes('could not be found') ||
			    errorMessage.includes('resource you are requesting')) {
				return true;
			}
			return false;
		};
		
		// Check if it's a 404 error first
		if (is404Error(error)) {
			// Provide a more helpful error message
			const resourceName = etagEndpoint.split('/').pop() || etagEndpoint;
			const decodedResourceName = decodeURIComponent(resourceName);
			throw new NodeApiError(this.getNode(), {
				message: `Resource not found: ${decodedResourceName}. The resource you are requesting could not be found. Please verify that the resource exists and the identifier is correct.`,
				description: `Endpoint: ${etagEndpoint}. Make sure the folder ID is correct (Checkmk uses ~ prefix for folder IDs, e.g., ~hahaha instead of /hahaha).`,
			} as JsonObject);
		}
		
		// If GET on base object fails, try to get ETag from the original endpoint
		if (etagEndpoint !== endpoint) {
			try {
				const result = await checkmkApiRequestWithETag.call(this, 'GET', endpoint, {}, qs);
				etag = result.etag || '';
			} catch (error2: any) {
				// If both fail, check if it's a 404 - maybe the resource doesn't exist
				if (is404Error(error2)) {
					const resourceName = endpoint.split('/').pop() || endpoint;
					const decodedResourceName = decodeURIComponent(resourceName);
					throw new NodeApiError(this.getNode(), {
						message: `Resource not found: ${decodedResourceName}. The resource you are requesting could not be found. Please verify that the resource exists and the identifier is correct.`,
						description: `Endpoint: ${endpoint}. Make sure the folder ID is correct (Checkmk uses ~ prefix for folder IDs, e.g., ~hahaha instead of /hahaha).`,
					} as JsonObject);
				}
				throw new NodeApiError(this.getNode(), {
					message: `Could not retrieve ETag for If-Match header: ${error2.message || error.message || 'Unknown error'}`,
				} as JsonObject);
			}
		} else {
			// If it's not a 404, throw the original error with more context
			throw new NodeApiError(this.getNode(), {
				message: `Could not retrieve ETag for If-Match header: ${error.message || 'Unknown error'}`,
				description: `Endpoint: ${etagEndpoint}`,
			} as JsonObject);
		}
	}
	
	if (!etag || etag === '') {
		throw new NodeApiError(this.getNode(), {
			message: 'ETag not found in response headers. The API may not support ETags for this resource.',
		} as JsonObject);
	}

	// Now perform the operation with If-Match header
	// Checkmk API requires If-Match header with ETag in quotes (RFC 7232 format)
	// Format: If-Match: "etag-value" (without quotes in the value itself)
	// The ETag should be a clean hash string, then we wrap it in quotes for the header
	const ifMatchValue = `"${etag}"`;
	
	// Try the operation with retry mechanism for 412 errors
	// If we get a 412 (ETag mismatch), retry once with a fresh ETag
	const maxRetries = 2;
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await checkmkApiRequest.call(
				this,
				method,
				endpoint,
				body,
				qs,
				{
					'If-Match': ifMatchValue,
				},
			);
		} catch (error: any) {
			// If we get a 412 (Precondition Failed) and haven't exhausted retries, get fresh ETag and retry
			if (error.statusCode === 412 || error.response?.status === 412) {
				if (attempt < maxRetries - 1) {
					// Get a fresh ETag and try again
					try {
						const freshResult = await checkmkApiRequestWithETag.call(this, 'GET', etagEndpoint, {}, qs);
						const freshEtag = freshResult.etag || '';
						if (freshEtag && freshEtag !== '') {
							// Use the fresh ETag for the next attempt
							const freshIfMatchValue = `"${freshEtag}"`;
							try {
								return await checkmkApiRequest.call(
									this,
									method,
									endpoint,
									body,
									qs,
									{
										'If-Match': freshIfMatchValue,
									},
								);
							} catch (retryError: any) {
								// If retry also fails with 412, throw the original error
								if (retryError.statusCode === 412 || retryError.response?.status === 412) {
									throw error; // Throw original error
								}
								throw retryError;
							}
						}
					} catch (etagError: any) {
						// If we can't get fresh ETag, throw original error
						throw error;
					}
				}
			}
			// If it's not a 412 or we've exhausted retries, throw the error
			throw error;
		}
	}
	
	// This should never be reached, but TypeScript needs it
	throw new Error('Unexpected error in checkmkApiRequestWithIfMatch');
}