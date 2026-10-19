'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { Checkmk } = require('../dist/nodes/Checkmk/Checkmk.node.js');

const CREDENTIALS = {
	host: 'https://cmk.example.test',
	site: 'mysite',
	username: 'automation',
	password: 'secret',
};

function host(name, state, extra = {}) {
	return {
		id: name,
		title: name,
		domainType: 'host',
		extensions: { name, state, plugin_output: `${name} output`, ...extra },
	};
}

function makeContext({ resource = 'hostStatus', operation = 'getMany', params = {}, responses = [] }) {
	const calls = [];
	params = { resource, operation, ...params };

	return {
		calls,
		getInputData: () => [{ json: {} }],
		continueOnFail: () => false,
		getNodeParameter(name, _index, fallback) {
			if (Object.prototype.hasOwnProperty.call(params, name)) return params[name];
			if (fallback !== undefined) return fallback;
			throw new Error(`Missing node parameter: ${name}`);
		},
		getNode: () => ({
			name: 'Checkmk',
			type: 'n8n-nodes-checkmk.checkmk',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		getCredentials: async () => CREDENTIALS,
		helpers: {
			httpRequestWithAuthentication: async (_credentialName, options) => {
				calls.push(options);
				const response = responses.shift();
				if (response === undefined) throw new Error('No mocked response left');
				if (response instanceof Error) throw response;
				return response;
			},
		},
	};
}

async function execute(node, context) {
	return node.execute.call(context);
}

test('host status maps states 0, 1 and 2 and exposes name, state and label', async () => {
	const context = makeContext({
		params: { returnAll: true, additionalFields: {} },
		responses: [{ value: [host('up01', 0), host('down01', 1), host('unreach01', 2)], links: {} }],
	});

	const [items] = await execute(new Checkmk(), context);

	assert.deepEqual(
		items.map(({ json }) => [json.extensions.name, json.extensions.state, json.extensions.state_label]),
		[
			['up01', 0, 'UP'],
			['down01', 1, 'DOWN'],
			['unreach01', 2, 'UNREACHABLE'],
		],
	);
	assert.equal(context.calls[0].url, 'https://cmk.example.test/mysite/check_mk/api/1.0/domain-types/host/collections/all');
	assert.deepEqual(context.calls[0].qs.columns, ['name', 'state', 'plugin_output', 'address', 'alias', 'last_check']);
});

test('host status returns no items for an empty collection', async () => {
	const context = makeContext({
		params: { returnAll: true, additionalFields: {} },
		responses: [{ value: [], links: {} }],
	});

	const [items] = await execute(new Checkmk(), context);

	assert.deepEqual(items, []);
});

test('host status filters by host name with a Livestatus query expression', async () => {
	const context = makeContext({
		params: { returnAll: true, additionalFields: { hostName: 'web01' } },
		responses: [{ value: [host('web01', 0)], links: {} }],
	});

	const [items] = await execute(new Checkmk(), context);
	const { qs } = context.calls[0];

	assert.equal(items.length, 1);
	assert.deepEqual(JSON.parse(qs.query), { op: '=', left: 'name', right: 'web01' });
	assert.equal(qs.host_name, undefined);
});

test('host status honors custom columns and always includes name and state', async () => {
	const context = makeContext({
		params: {
			returnAll: true,
			additionalFields: { columns: 'alias, plugin_output, alias' },
		},
		responses: [{ value: [host('web01', 0)], links: {} }],
	});

	await execute(new Checkmk(), context);

	assert.deepEqual(context.calls[0].qs.columns, [
		'name',
		'state',
		'alias',
		'plugin_output',
	]);
	// Checkmk only accepts repeated query keys, not columns[0]=...
	assert.equal(context.calls[0].arrayFormat, 'repeat');
});

test('host status limit restricts results when Return All is disabled', async () => {
	const context = makeContext({
		params: { returnAll: false, limit: 2, additionalFields: {} },
		responses: [{ value: [host('a', 0), host('b', 1), host('c', 2)], links: {} }],
	});

	const [items] = await execute(new Checkmk(), context);

	assert.deepEqual(
		items.map(({ json }) => json.extensions.name),
		['a', 'b'],
	);
});

test('host status Return All follows pagination links', async () => {
	const context = makeContext({
		params: { returnAll: true, additionalFields: {} },
		responses: [
			{ value: [host('a', 0)], links: { next: '/domain-types/host/collections/all?page=2' } },
			{ value: [host('b', 1)], links: {} },
		],
	});

	const [items] = await execute(new Checkmk(), context);

	assert.deepEqual(
		items.map(({ json }) => json.extensions.name),
		['a', 'b'],
	);
	assert.equal(context.calls.length, 2);
	assert.equal(context.calls[1].url, 'https://cmk.example.test/mysite/check_mk/api/1.0/domain-types/host/collections/all?page=2');
});

test('host status surfaces API errors', async () => {
	const error = Object.assign(new Error('Internal Server Error'), {
		statusCode: 500,
		response: { status: 500, data: { title: 'Internal Server Error' } },
	});
	const context = makeContext({
		params: { returnAll: false, limit: 10, additionalFields: {} },
		responses: [error],
	});

	await assert.rejects(
		execute(new Checkmk(), context),
		(error) => error.name === 'NodeApiError',
	);
});

test('host status rejects an unexpected response structure', async () => {
	const context = makeContext({
		params: { returnAll: false, limit: 10, additionalFields: {} },
		responses: [{ unexpected: true }],
	});

	await assert.rejects(
		execute(new Checkmk(), context),
		/Unexpected response from the Checkmk host status endpoint/,
	);
});

test('host status rejects host entries without extensions.name', async () => {
	const context = makeContext({
		params: { returnAll: true, additionalFields: {} },
		responses: [{ value: [{ id: 'broken', extensions: { state: 0 } }], links: {} }],
	});

	await assert.rejects(
		execute(new Checkmk(), context),
		/Unexpected response from the Checkmk host status endpoint/,
	);
});

test('host Get Many merges live status by host name', async () => {
	const context = makeContext({
		resource: 'host',
		operation: 'getMany',
		params: { returnAll: false, limit: 2, additionalFields: {} },
		responses: [
			{
				value: [
					{ id: 'cfg01', title: 'cfg01', extensions: {} },
					{ id: 'cfg02', title: 'cfg02', extensions: {} },
				],
				links: {},
			},
			{ value: [host('cfg01', 0)], links: {} },
		],
	});

	const [items] = await execute(new Checkmk(), context);

	assert.equal(context.calls[0].url, 'https://cmk.example.test/mysite/check_mk/api/1.0/domain-types/host_config/collections/all');
	assert.equal(context.calls[1].url, 'https://cmk.example.test/mysite/check_mk/api/1.0/domain-types/host/collections/all');
	assert.deepEqual(context.calls[1].qs.columns, [
		'name',
		'state',
		'plugin_output',
		'address',
		'alias',
		'last_check',
	]);
	assert.deepEqual(
		items.map(({ json }) => json.id),
		['cfg01', 'cfg02'],
	);
	assert.equal(items[0].json.host_status.extensions.state_label, 'UP');
	assert.equal(items[1].json.host_status, null);
});

test('host Get attaches live status', async () => {
	const context = makeContext({
		resource: 'host',
		operation: 'get',
		params: { hostName: 'web01', additionalFields: { columns: 'plugin_output' } },
		responses: [
			{ id: 'web01', title: 'web01', extensions: { name: 'web01' } },
			{ value: [host('web01', 1)], links: {} },
		],
	});

	const [items] = await execute(new Checkmk(), context);

	assert.equal(context.calls[1].qs.query, '{"op":"=","left":"name","right":"web01"}');
	assert.deepEqual(context.calls[1].qs.columns, ['name', 'state', 'plugin_output']);
	assert.equal(items[0].json.host_status.extensions.state_label, 'DOWN');
});

test('service Get Many sends configurable columns with mandatory service columns', async () => {
	const context = makeContext({
		resource: 'service',
		operation: 'getMany',
		params: {
			hostName: 'web01',
			returnAll: false,
			limit: 10,
			additionalFields: { columns: 'state, plugin_output' },
		},
		responses: [{ value: [], links: {} }],
	});

	await execute(new Checkmk(), context);

	assert.deepEqual(context.calls[0].qs.columns, [
		'host_name',
		'description',
		'state',
		'plugin_output',
	]);
	assert.equal(context.calls[0].qs.host_name, 'web01');
});

test('node and credential identifiers match the package codex', async () => {
	const { CheckmkApi } = require('../dist/credentials/CheckmkApi.credentials.js');
	const description = new Checkmk().description;
	const codex = require('../nodes/Checkmk/Checkmk.node.json');

	assert.equal(description.name, 'checkmk');
	assert.equal(description.credentials[0].name, 'checkmkApi');
	assert.equal(new CheckmkApi().name, 'checkmkApi');
	assert.equal(codex.node, 'n8n-nodes-checkmk.checkmk');
});

test('service status Get Many always includes service identity columns', async () => {
	const context = makeContext({
		resource: 'serviceStatus',
		operation: 'getMany',
		params: { returnAll: true, additionalFields: { columns: 'state' } },
		responses: [{ value: [], links: {} }],
	});

	await execute(new Checkmk(), context);

	assert.deepEqual(context.calls[0].qs.columns, ['host_name', 'description', 'state']);
	assert.equal(context.calls[0].qs.host_name, undefined);
});
