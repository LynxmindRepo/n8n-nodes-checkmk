import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	JsonObject,
	NodeApiError,
	NodeOperationError,
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
			...customHeaders,
		},
		json: true,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'checkmkApi', options);
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
		},
		json: true,
		returnFullResponse: true,
	};

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'checkmkApi',
			options,
		);

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
			etag = headers.etag || headers['etag'] || headers['ETag'] || headers['Etag'];
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
/**
 * Normalize a human folder path ("/a/b") or an API id ("~a~b") to the
 * Checkmk API folder id form (~a~b). Exported for reuse by the node.
 */
export const normalizeFolderId = (folderPath: string): string => {
	if (!folderPath || folderPath === '/' || folderPath === '') {
		return '~';
	}

	let p = folderPath.trim();

	// If already in API-id style, normalize repeated tildes/slashes
	if (p.startsWith('~')) {
		// Handle mixed format like ~/a/b by replacing slashes with tildes
		// Also normalize repeated tildes
		// Ensure it starts with a single '~' and has no trailing slashes/tildes
		const cleaned = p.replace(/^~+/, '').replace(/~+$/g, '').replace(/^\/+/, '');
		// Replace any remaining slashes with tildes, then normalize tildes sequences
		const normalized = cleaned.replace(/\//g, '~').replace(/~+/g, '~');
		if (normalized === '') return '~';
		p = '~' + normalized;
		return p;
	}

	// Remove leading/trailing slashes and decode
	const clean = decodeURIComponent(p).replace(/^\/+|\/+$/g, '');
	if (clean === '') return '~';
	const segments = clean.split('/').filter(Boolean);
	if (segments.length === 0) return '~';
	return '~' + segments.join('~');
};

/**
 * Convert API folder id (~a~b) to human path (/a/b). If id is undefined or
 * root (~) returns '/'. Exported for UI-friendly outputs.
 */
export const folderIdToPath = (id?: string): string => {
	if (!id || id === '~') return '/';
	const cleaned = String(id).replace(/^~+/, '');
	if (cleaned === '') return '/';
	return '/' + cleaned.split('~').filter(Boolean).join('/');
};

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

	const normalizedId = normalizeFolderId(folderId);
	return prefix + encodeURIComponent(normalizedId) + suffix;
};

// Adicione ao final do GenericFunctions.ts

/**
 * Search for destination folders, excluding the source folder and its descendants.
 */
export async function searchDestinationFolders(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<Array<{ name: string; value: string; description: string }>> {
	// 1. Busca todas as pastas (reutilizando sua função existente)
	const allFolders = await searchFolders.call(this, filter || '');

	// 2. Tenta obter a pasta de origem (campo 'folder')
	// Como estamos no loadOptions, precisamos ser defensivos pois o campo pode não estar pronto
	let sourceFolderId: string | null = null;
	try {
		const folderParam = this.getNodeParameter('folder') as any;

		// Reutilizamos sua função de extração, passando o contexto 'this'
		if (folderParam) {
			sourceFolderId = await extractFolderIdFromLocator.call(this, folderParam);
		}
	} catch (error) {
		// Se der erro (ex: campo vazio ou expression), ignoramos e retornamos tudo
		// Isso evita que a UI quebre se o usuário ainda não escolheu a origem
	}

	// Se não conseguimos determinar a origem, ou é root, retorna tudo
	// (Checkmk não permite mover root, mas validamos isso no execute também)
	if (!sourceFolderId || sourceFolderId === '~') {
		return allFolders;
	}

	// 3. Filtra a lista
	return allFolders.filter((folder) => {
		const targetId = folder.value; // ex: ~pasta~subpasta

		// Não pode mover para si mesma
		if (targetId === sourceFolderId) {
			return false;
		}

		// Não pode mover para uma filha (ex: mover ~A para ~A~B)
		// Verifica se targetId começa com "sourceId + ~"
		if (targetId.startsWith(sourceFolderId + '~')) {
			return false;
		}

		return true;
	});
}

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
			if (
				errorMessage.includes('not found') ||
				errorMessage.includes('404') ||
				errorMessage.includes('could not be found') ||
				errorMessage.includes('resource you are requesting')
			) {
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
			message:
				'ETag not found in response headers. The API may not support ETags for this resource.',
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
			return await checkmkApiRequest.call(this, method, endpoint, body, qs, {
				'If-Match': ifMatchValue,
			});
		} catch (error: any) {
			// If we get a 412 (Precondition Failed) and haven't exhausted retries, get fresh ETag and retry
			if (error.statusCode === 412 || error.response?.status === 412) {
				if (attempt < maxRetries - 1) {
					// Get a fresh ETag and try again
					try {
						const freshResult = await checkmkApiRequestWithETag.call(
							this,
							'GET',
							etagEndpoint,
							{},
							qs,
						);
						const freshEtag = freshResult.etag || '';
						if (freshEtag && freshEtag !== '') {
							// Use the fresh ETag for the next attempt
							const freshIfMatchValue = `"${freshEtag}"`;
							try {
								return await checkmkApiRequest.call(this, method, endpoint, body, qs, {
									'If-Match': freshIfMatchValue,
								});
							} catch (retryError: any) {
								// If retry also fails with 412, throw the original error
								if (retryError.statusCode === 412 || retryError.response?.status === 412) {
									throw error; // Throw original error
								}
								throw retryError;
							}
						}
					} catch {
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
	throw new NodeOperationError(this.getNode(), 'Unexpected error in checkmkApiRequestWithIfMatch');
}

/**
 * Fetch all folders and format them as choices for resource locator list mode
 * Returns array of objects with id, name, and description properties
 * Format: "path (~id)"
 */
export async function getFoldersList(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<Array<{ name: string; value: string; description: string }>> {
	try {
		// CORREÇÃO: Adicionamos o 4º argumento (body vazio) e o 5º argumento (qs)
		// recursive: true -> Traz subpastas
		// parent: '~' -> Garante que começa da raiz
		// show_hosts: false -> Otimiza a busca trazendo apenas pastas
		const folders = await checkmkApiRequestAllItems.call(
			this,
			'GET',
			'/domain-types/folder_config/collections/all',
			{}, // body vazio
			{
				// Query Parameters
				parent: '~',
				recursive: true,
				show_hosts: false,
			},
		);

		if (!Array.isArray(folders)) {
			return [];
		}

		const choices = folders.map((folder: any) => {
			const id = folder.id || '';
			const path = folderIdToPath(id);
			const title = folder.title || path;

			// Format: "path (id)"
			const name = `${path} (${id})`;

			return {
				name,
				value: id, // Store the ID as the value
				description: title,
			};
		});

		// Sort by path for better UX
		return choices.sort((a, b) => a.name.localeCompare(b.name));
	} catch (error) {
		throw new NodeApiError(this.getNode(), {
			message: `Could not fetch folder list: ${(error as any).message || 'Unknown error'}`,
		} as JsonObject);
	}
}

/**
 * Search for folders matching a query string
 * Supports searching by folder path, title, or id
 */
export async function searchFolders(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	query: string,
): Promise<Array<{ name: string; value: string; description: string }>> {
	const allFolders = await getFoldersList.call(this);

	if (!query || query.trim() === '') {
		return allFolders;
	}

	const lowerQuery = query.toLowerCase();

	return allFolders.filter(
		(folder) =>
			folder.name.toLowerCase().includes(lowerQuery) ||
			folder.description.toLowerCase().includes(lowerQuery) ||
			folder.value.toLowerCase().includes(lowerQuery),
	);
}

/**
 * Extract folder ID from resource locator value
 * The resourceLocator value can be in different formats:
 * - Direct ID: "~someid" (from 'id' mode)
 * - URL: extracted folder parameter (from 'url' mode)
 *   - Checkmk URL with encoded start_url: https://checkmk.example.com/...?start_url=%2F...%3Ffolder%3Drock_and_roll...
 *   - Direct folder param: https://checkmk.example.com/...?folder=rock_and_roll
 * - List value: folder ID from list (from 'list' mode)
 *
 * Returns normalized folder ID
 */
export async function extractFolderIdFromLocator(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	locatorValue: any,
): Promise<string> {
	// Se estiver vazio, retorna Root
	if (!locatorValue) {
		return normalizeFolderId('/');
	}

	// Se for um objeto vindo do Resource Locator do n8n
	if (typeof locatorValue === 'object' && locatorValue !== null) {
		// CORREÇÃO CRÍTICA AQUI: A propriedade correta é 'mode', não 'modeName'
		const mode = locatorValue.mode;
		const value = locatorValue.value;

		// Aceitamos 'id' ou 'list'. Removemos a lógica de 'url'.
		if (mode === 'id' || mode === 'list') {
			return normalizeFolderId(value || '');
		}

		// Se por acaso vier algo diferente, tentamos usar o value diretamente
		if (value) {
			return normalizeFolderId(value);
		}
	}

	// Fallback: se o usuário passou uma string direta (ex: expressão)
	if (typeof locatorValue === 'string') {
		return normalizeFolderId(locatorValue);
	}

	// Se nada funcionar, manda para a pasta raiz
	return normalizeFolderId('/');
}
