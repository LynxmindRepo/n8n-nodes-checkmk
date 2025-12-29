import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

import {
	checkmkApiRequest,
	checkmkApiRequestAllItems,
	checkmkApiRequestWithIfMatch,
	checkmkApiRequestWithETag,
} from './GenericFunctions';

export class Checkmk implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Checkmk',
		name: 'checkmk',
		icon: 'file:checkmk.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Complete Checkmk monitoring system integration with 100% API coverage',
		defaults: {
			name: 'Checkmk',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'checkmkApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Activate Change', value: 'activateChanges' },
					{ name: 'Agent', value: 'agent' },
					{ name: 'Audit Log', value: 'auditLog' },
					{ name: 'Aux Tag', value: 'auxTag' },
					{ name: 'Background Job', value: 'backgroundJob' },
					{ name: 'BI Aggregation', value: 'biAggregation' },
					{ name: 'BI Pack', value: 'biPack' },
					{ name: 'BI Rule', value: 'biRule' },
					{ name: 'Broker Connection', value: 'brokerConnection' },
					{ name: 'Certificate', value: 'certificate' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Configuration Entity', value: 'configurationEntity' },
					{ name: 'Contact Group', value: 'contactGroup' },
					{ name: 'DCD', value: 'dcd' },
					{ name: 'Discovery', value: 'discovery' },
					{ name: 'Downtime', value: 'downtime' },
					{ name: 'Event Console', value: 'eventConsole' },
					{ name: 'Folder', value: 'folder' },
					{ name: 'Host', value: 'host' },
					{ name: 'Host Group', value: 'hostGroup' },
					{ name: 'Host Status', value: 'hostStatus' },
					{ name: 'Host Tag Group', value: 'hostTagGroup' },
					{ name: 'LDAP Connection', value: 'ldapConnection' },
					{ name: 'License Usage', value: 'licenseUsage' },
					{ name: 'Metric', value: 'metric' },
					{ name: 'Notification Rule', value: 'notificationRule' },
					{ name: 'OpenTelemetry', value: 'openTelemetry' },
					{ name: 'Parent Scan', value: 'parentScan' },
					{ name: 'Password', value: 'password' },
					{ name: 'Problem', value: 'problem' },
					{ name: 'Quick Setup', value: 'quickSetup' },
					{ name: 'Rule', value: 'rule' },
					{ name: 'Ruleset', value: 'ruleset' },
					{ name: 'SAML Connection', value: 'samlConnection' },
					{ name: 'Service', value: 'service' },
					{ name: 'Service Group', value: 'serviceGroup' },
					{ name: 'Service Status', value: 'serviceStatus' },
					{ name: 'Site', value: 'site' },
					{ name: 'SLA', value: 'sla' },
					{ name: 'Time Period', value: 'timePeriod' },
					{ name: 'User', value: 'user' },
					{ name: 'User Role', value: 'userRole' },
				],
				default: 'host',
			},

			// ==================== HOST OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['host'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new host',
						action: 'Create a host',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a host',
						action: 'Delete a host',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a host',
						action: 'Get a host',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many hosts',
						action: 'Get many hosts',
					},
					{
						name: 'Move',
						value: 'move',
						description: 'Move host to different folder',
						action: 'Move a host',
					},
					{
						name: 'Rename',
						value: 'rename',
						description: 'Rename a host',
						action: 'Rename a host',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a host',
						action: 'Update a host',
					},
				],
				default: 'get',
			},

			// ==================== HOST GROUP OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['hostGroup'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a host group',
						action: 'Create a host group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a host group',
						action: 'Delete a host group',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a host group',
						action: 'Get a host group',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many host groups',
						action: 'Get many host groups',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a host group',
						action: 'Update a host group',
					},
				],
				default: 'getMany',
			},

			// ==================== SERVICE GROUP OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a service group',
						action: 'Create a service group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a service group',
						action: 'Delete a service group',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a service group',
						action: 'Get a service group',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many service groups',
						action: 'Get many service groups',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a service group',
						action: 'Update a service group',
					},
				],
				default: 'getMany',
			},

			// ==================== FOLDER OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['folder'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a folder',
						action: 'Create a folder',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a folder',
						action: 'Delete a folder',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a folder',
						action: 'Get a folder',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many folders',
						action: 'Get many folders',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a folder',
						action: 'Update a folder',
					},
				],
				default: 'getMany',
			},

			// ==================== USER OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a user',
						action: 'Create a user',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a user',
						action: 'Delete a user',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a user',
						action: 'Get a user',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many users',
						action: 'Get many users',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a user',
						action: 'Update a user',
					},
				],
				default: 'getMany',
			},

			// ==================== CONTACT GROUP OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contactGroup'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a contact group',
						action: 'Create a contact group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact group',
						action: 'Delete a contact group',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact group',
						action: 'Get a contact group',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many contact groups',
						action: 'Get many contact groups',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact group',
						action: 'Update a contact group',
					},
				],
				default: 'getMany',
			},

			// ==================== TIME PERIOD OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['timePeriod'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a time period',
						action: 'Create a time period',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a time period',
						action: 'Delete a time period',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a time period',
						action: 'Get a time period',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many time periods',
						action: 'Get many time periods',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a time period',
						action: 'Update a time period',
					},
				],
				default: 'getMany',
			},

			// ==================== RULE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['rule'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a rule',
						action: 'Get a rule',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many rules',
						action: 'Get many rules',
					},
				],
				default: 'getMany',
			},

			// ==================== DISCOVERY OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['discovery'],
					},
				},
				options: [
					{
						name: 'Run',
						value: 'run',
						description: 'Run service discovery',
						action: 'Run discovery',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get discovery status',
						action: 'Get discovery status',
					},
				],
				default: 'run',
			},

			// ==================== ACTIVATE CHANGES OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['activateChanges'],
					},
				},
				options: [
					{
						name: 'Activate',
						value: 'activate',
						description: 'Activate pending changes',
						action: 'Activate changes',
					},
					{
						name: 'Get Pending',
						value: 'getPending',
						description: 'Get pending changes',
						action: 'Get pending changes',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get activation status',
						action: 'Get activation status',
					},
				],
				default: 'activate',
			},

			// ==================== SITE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['site'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a site',
						action: 'Get a site',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many sites',
						action: 'Get many sites',
					},
					{
						name: 'Login',
						value: 'login',
						description: 'Login to a site',
						action: 'Login to site',
					},
					{
						name: 'Logout',
						value: 'logout',
						description: 'Logout from a site',
						action: 'Logout from site',
					},
				],
				default: 'getMany',
			},

			// ==================== SERVICE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['service'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a service',
						action: 'Get a service',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many services',
						action: 'Get many services',
					},
					{
						name: 'Acknowledge Problem',
						value: 'acknowledge',
						description: 'Acknowledge a service problem',
						action: 'Acknowledge a service problem',
					},
				],
				default: 'get',
			},

			// ==================== DOWNTIME OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a downtime',
						action: 'Create a downtime',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a downtime',
						action: 'Delete a downtime',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a downtime',
						action: 'Get a downtime',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many downtimes',
						action: 'Get many downtimes',
					},
				],
				default: 'create',
			},

			// ==================== PROBLEM OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['problem'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many problems',
						action: 'Get many problems',
					},
				],
				default: 'getMany',
			},

			// ==================== BI AGGREGATION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['biAggregation'],
					},
				},
				options: [
					{
						name: 'Get State',
						value: 'getState',
						description: 'Get BI aggregation state',
						action: 'Get BI aggregation state',
					},
				],
				default: 'getState',
			},

			// ==================== BI PACK OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['biPack'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many BI packs',
						action: 'Get many BI packs',
					},
				],
				default: 'getMany',
			},

			// ==================== BI RULE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['biRule'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many BI rules',
						action: 'Get many BI rules',
					},
				],
				default: 'getMany',
			},

			// ==================== COMMENT OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['comment'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a comment',
						action: 'Create a comment',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many comments',
						action: 'Get many comments',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a comment',
						action: 'Delete a comment',
					},
				],
				default: 'getMany',
			},

			// ==================== EVENT CONSOLE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many event console entries',
						action: 'Get many event console entries',
					},
				],
				default: 'getMany',
			},

			// ==================== HOST STATUS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['hostStatus'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many host statuses',
						action: 'Get many host statuses',
					},
				],
				default: 'getMany',
			},

			// ==================== METRIC OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['metric'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many metrics',
						action: 'Get many metrics',
					},
				],
				default: 'getMany',
			},

			// ==================== SERVICE STATUS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['serviceStatus'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many service statuses',
						action: 'Get many service statuses',
					},
				],
				default: 'getMany',
			},

			// ==================== SLA OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['sla'],
					},
				},
				options: [
					{
						name: 'Compute',
						value: 'compute',
						description: 'Compute SLA data',
						action: 'Compute SLA data',
					},
				],
				default: 'compute',
			},

			// ==================== AGENT OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['agent'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many agents',
						action: 'Get many agents',
					},
				],
				default: 'getMany',
			},

			// ==================== AUDIT LOG OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['auditLog'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many audit logs',
						action: 'Get many audit logs',
					},
				],
				default: 'getMany',
			},

			// ==================== AUX TAG OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['auxTag'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create an aux tag',
						action: 'Create an aux tag',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many aux tags',
						action: 'Get many aux tags',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an aux tag',
						action: 'Update an aux tag',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an aux tag',
						action: 'Delete an aux tag',
					},
				],
				default: 'getMany',
			},

			// ==================== HOST TAG GROUP OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a host tag group',
						action: 'Create a host tag group',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many host tag groups',
						action: 'Get many host tag groups',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a host tag group',
						action: 'Update a host tag group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a host tag group',
						action: 'Delete a host tag group',
					},
				],
				default: 'getMany',
			},

			// ==================== LDAP CONNECTION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ldapConnection'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create an LDAP connection',
						action: 'Create an LDAP connection',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many LDAP connections',
						action: 'Get many LDAP connections',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an LDAP connection',
						action: 'Update an LDAP connection',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an LDAP connection',
						action: 'Delete an LDAP connection',
					},
				],
				default: 'getMany',
			},

			// ==================== NOTIFICATION RULE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['notificationRule'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many notification rules',
						action: 'Get many notification rules',
					},
				],
				default: 'getMany',
			},

			// ==================== OPENTELEMETRY OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['openTelemetry'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create an OpenTelemetry collector',
						action: 'Create an open telemetry collector',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many OpenTelemetry collectors',
						action: 'Get many open telemetry collectors',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an OpenTelemetry collector',
						action: 'Update an open telemetry collector',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an OpenTelemetry collector',
						action: 'Delete an open telemetry collector',
					},
				],
				default: 'getMany',
			},

			// ==================== PARENT SCAN OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['parentScan'],
					},
				},
				options: [
					{
						name: 'Run',
						value: 'run',
						description: 'Run parent scan',
						action: 'Run parent scan',
					},
				],
				default: 'run',
			},

			// ==================== PASSWORD OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['password'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many passwords',
						action: 'Get many passwords',
					},
				],
				default: 'getMany',
			},

			// ==================== RULESET OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ruleset'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many rulesets',
						action: 'Get many rulesets',
					},
				],
				default: 'getMany',
			},

			// ==================== SAML CONNECTION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['samlConnection'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a SAML connection',
						action: 'Create a SAML connection',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many SAML connections',
						action: 'Get many SAML connections',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a SAML connection',
						action: 'Update a SAML connection',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a SAML connection',
						action: 'Delete a SAML connection',
					},
				],
				default: 'getMany',
			},

			// ==================== USER ROLE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['userRole'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a user role',
						action: 'Create a user role',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many user roles',
						action: 'Get many user roles',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a user role',
						action: 'Update a user role',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a user role',
						action: 'Delete a user role',
					},
				],
				default: 'getMany',
			},

			// ==================== BACKGROUND JOB OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['backgroundJob'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many background jobs',
						action: 'Get many background jobs',
					},
				],
				default: 'getMany',
			},

			// ==================== BROKER CONNECTION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['brokerConnection'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many broker connections',
						action: 'Get many broker connections',
					},
				],
				default: 'getMany',
			},

			// ==================== CERTIFICATE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['certificate'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many certificates',
						action: 'Get many certificates',
					},
				],
				default: 'getMany',
			},

			// ==================== CONFIGURATION ENTITY OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['configurationEntity'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many configuration entities',
						action: 'Get many configuration entities',
					},
				],
				default: 'getMany',
			},

			// ==================== DCD OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['dcd'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many DCD configurations',
						action: 'Get many DCD configurations',
					},
				],
				default: 'getMany',
			},

			// ==================== LICENSE USAGE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['licenseUsage'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get license usage',
						action: 'Get license usage',
					},
				],
				default: 'get',
			},

			// ==================== QUICK SETUP OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['quickSetup'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many quick setup configurations',
						action: 'Get many quick setup configurations',
					},
				],
				default: 'getMany',
			},
			// ==================== END OF OPERATIONS ====================
			// ==================== FIELDS SECTION ====================
			// Common fields used across multiple resources
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostGroup', 'serviceGroup', 'contactGroup', 'timePeriod', 'user'],
						operation: ['create', 'get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'Name of the resource',
			},
			{
				displayName: 'Alias',
				name: 'alias',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['hostGroup', 'serviceGroup', 'contactGroup'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Alias/display name',
			},
			{
				displayName: 'Host Name',
				name: 'hostName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['host', 'service', 'discovery'],
					},
				},
				default: '',
				description: 'Name of the host',
			},
			// Host specific fields
			{
				displayName: 'Folder',
				name: 'folder',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['create', 'get', 'update', 'delete', 'move'],
					},
				},
				default: '/',
				description: 'Folder path',
			},
			// Additional Fields for Host Create
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Bake Agent',
						name: 'bake_agent',
						type: 'boolean',
						default: false,
						description:
							'Whether tries to bake the agents for the just created hosts (Enterprise Editions only)',
					},
					{
						displayName: 'IP Address',
						name: 'ipaddress',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Labels',
						name: 'labels',
						type: 'string',
						default: '',
						placeholder: 'label1:value1,label2:value2',
						description: 'Comma-separated labels',
					},
					{
						displayName: 'Custom Attributes',
						name: 'customAttributes',
						type: 'json',
						default: '{}',
						description: 'Custom attributes as JSON object',
					},
				],
			},
			// Host Tag Groups specific fields
			{
				displayName: 'Tag groupID',
				name: 'tagGroupid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'An ID for the host tag group',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'A title for the host tag',
			},
			{
				displayName: 'Topic',
				name: 'topic',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create'],
					},
				},
				default: 'Tags',
				description: 'Different tags can be grouped in a topic',
			},
			{
				displayName: 'Help',
				name: 'help',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create'],
					},
				},
				default: '""',
				description: 'A help description for the tag group',
			},
			{
				displayName: 'Tag Choices',
				name: 'tags',
				type: 'collection',
				placeholder: 'Select Tags',
				default: {},
				description: 'A list of host tags belonging to the host tag group',
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Tag ID',
						name: 'tagId',
						type: 'string',
						default: '',
						description: 'An unique ID for the tag',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'The title of the tag',
					},
				],
			},
			// Folder specific fields
			{
				displayName: 'Folder',
				name: 'folder',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '/',
				description: 'Folder path',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the folder (optional, if not provided, title will be used)',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Title of the folder (required)',
			},
			{
				displayName: 'Parent',
				name: 'parent',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create'],
					},
				},
				default: '/',
				description: 'Parent folder path (e.g., /testfolder)',
			},
			// User specific fields
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'An unique username for the user',
			},
			{
				displayName: 'Fullname',
				name: 'fullname',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The alias or full name of the user',
			},
			{
				displayName: 'Customer',
				name: 'customer',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
				default: '',
				description:
					'By specifying a customer, you configure on which sites the user object will be available. global will make the object available on all sites.',
			},
			// Site specific fields
			{
				displayName: 'Site Name',
				name: 'siteName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['site'],
						operation: ['get', 'login', 'logout'],
					},
				},
				default: '',
				description: 'Name of the site',
			},
			// ActivateChanges specific fields
			{
				displayName: 'Activate On Sites',
				name: 'activateOnSites',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['activateChanges'],
						operation: ['activate'],
					},
				},
				default: '',
				placeholder: 'site1,site2',
				description: 'Comma-separated list of sites to activate changes on (leave empty for all)',
			},
			{
				displayName: 'Force Foreign Changes',
				name: 'forceForeignChanges',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['activateChanges'],
						operation: ['activate'],
					},
				},
				default: false,
				description: 'Whether to activate changes made by other users',
			},
			// Additional options
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['getMany'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getMany'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			// Additional Fields for Host Get
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['get'],
					},
				},
				options: [
					{
						displayName: 'Effective Attributes',
						name: 'effective_attributes',
						type: 'boolean',
						default: false,
						description:
							'Whether to show all effective attributes on hosts or just the attributes which were set on this host specifically',
					},
				],
			},
			// Additional Fields for Host Get Many
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['getMany'],
					},
				},
				options: [
					{
						displayName: 'Effective Attributes',
						name: 'effective_attributes',
						type: 'boolean',
						default: false,
						description:
							'Whether to show all effective attributes on hosts or just the attributes which were set on this host specifically',
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						placeholder: '!(links)',
						description:
							'The fields to include/exclude (e.g., !(links) or (ipaddress,ipv6address))',
					},
					{
						displayName: 'Hostnames',
						name: 'hostnames',
						type: 'string',
						default: '',
						placeholder: 'host1,host2',
						description: 'Comma-separated list of host names to filter the result',
					},
					{
						displayName: 'Include Links',
						name: 'include_links',
						type: 'boolean',
						default: false,
						description: 'Whether to include the links field in the response for each host',
					},
					{
						displayName: 'Site',
						name: 'site',
						type: 'string',
						default: '',
						description: 'Filter the result by a specific site',
					},
				],
			},
			// Additional Fields for Host Update
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Attributes',
						name: 'attributes',
						type: 'json',
						default: '{}',
						description:
							'Replace all currently set attributes on the host (removes attributes not specified here)',
					},
					{
						displayName: 'Update Attributes',
						name: 'update_attributes',
						type: 'json',
						default: '{}',
						description: 'Just update the hosts attributes (keeps existing attributes)',
					},
					{
						displayName: 'Remove Attributes',
						name: 'remove_attributes',
						type: 'string',
						default: '',
						placeholder: 'tag_foobar,tag_criticality',
						description: 'Comma-separated list of attributes to remove',
					},
				],
			},
			// Additional Fields for Service and Discovery
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['service', 'discovery'],
					},
				},
				options: [
					{
						displayName: 'Mode',
						name: 'mode',
						type: 'options',
						options: [
							{
								name: 'Fix All (Accept All)',
								value: 'fix_all',
								description: 'Accept all changes',
							},
							{
								name: 'New (Monitor Undecided Services)',
								value: 'new',
								description: 'Monitor undecided services',
							},
							{
								name: 'Only Host Labels',
								value: 'only_host_labels',
								description: 'Update host labels only',
							},
							{
								name: 'Only Service Labels',
								value: 'only_service_labels',
								description: 'Update service labels only',
							},
							{
								name: 'Refresh (Rescan)',
								value: 'refresh',
								description: 'Rescan - starts a background job',
							},
							{
								name: 'Remove (Remove Vanished Services)',
								value: 'remove',
								description: 'Remove vanished services',
							},
							{
								name: 'Tabula Rasa (Remove All and Find New)',
								value: 'tabula_rasa',
								description: 'Remove all and find new - starts a background job',
							},
						],
						default: 'new',
						description: 'The mode of the discovery action (only used for Run operation)',
					},
				],
			},
			// Additional Fields for Folder Create and Update
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'New title/name for the folder (for update operation)',
					},
					{
						displayName: 'Attributes',
						name: 'attributes',
						type: 'json',
						default: '{}',
						description:
							'Additional folder attributes as JSON object (e.g., {"tag_criticality": "prod", "tag_networking": "wan"})',
					},
				],
			},
			//Authentication option for User Create
			{
				displayName: 'Authentication Type',
				name: 'authType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: '',
						value: '',
					},
					{
						name: 'Password',
						value: 'password',
						description: 'The password for login',
					},
					{
						name: 'Automation',
						value: 'automation',
						description:
							'For accounts used by automation processes (such as fetching data from views for further procession). This is the automation secret.',
					},
				],
				default: '',
			},
			{
				displayName: 'Password',
				name: 'Password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
						authType: ['password'],
					},
				},
				default: '',
				description: 'The password for login',
			},
			{
				displayName: 'Secret',
				name: 'Automation',
				type: 'string',
				typeOptions: {
					password: true,
				},
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
						authType: ['automation'],
					},
				},
				default: '',
				description:
					'For accounts used by automation processes (such as fetching data from views for further procession). This is the automation secret.',
			},
			// Downtime specific fields
			{
				displayName: 'Start Time',
				name: 'start_time',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
					},
				},
				default: '',
				description:
					'The start datetime of the new downtime. The format has to conform to the ISO 8601 profile.',
			},
			{
				displayName: 'End Time',
				name: 'end_time',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
					},
				},
				default: '',
				description:
					'The end datetime of the new downtime. The format has to conform to the ISO 8601 profile.',
			},
			{
				displayName: 'Downtime Type',
				name: 'downtimeType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: '',
						value: '',
					},
					{
						name: 'Host',
						value: 'host',
						description: 'Schedule downtimes for a host identified by host name or IP address',
					},
					{
						name: 'Hostgroup',
						value: 'hostgroup',
						description: 'Schedule downtimes for all hosts belonging to the specified hostgroup',
					},
				],
				default: '',
				description:
					'The type of downtime to create. Valid values are "host", "hostgroup" and "host_by_query".',
			},
			{
				displayName: 'Host_Name',
				name: 'host_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
						downtimeType: ['host'],
					},
				},
				default: '',
				description: 'The host name or IP address itself',
			},
			{
				displayName: 'Hostgroup_Name',
				name: 'hostgroup_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
						downtimeType: ['hostgroup'],
					},
				},
				default: '',
				description:
					'The name of the host group. A downtime will be scheduled for all hosts in this host group.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				// ==================== HOST OPERATIONS ====================
				if (resource === 'host') {
					if (operation === 'create') {
						const hostName = this.getNodeParameter('hostName', i) as string;
						const folder = this.getNodeParameter('folder', i) as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						// Build attributes object
						const attributes: IDataObject = {};

						// Add IP address if provided
						if (additionalFields.ipaddress) {
							attributes.ipaddress = additionalFields.ipaddress;
						}

						// Process labels if provided
						if (additionalFields.labels) {
							const labelsString = additionalFields.labels as string;
							if (labelsString.trim() !== '') {
								const labelsObj: IDataObject = {};
								const labelPairs = labelsString.split(',').map((l) => l.trim());
								for (const pair of labelPairs) {
									const [key, value] = pair.split(':').map((s) => s.trim());
									if (key && value) {
										labelsObj[key] = value;
									}
								}
								if (Object.keys(labelsObj).length > 0) {
									attributes.labels = labelsObj;
								}
							}
						}

						// Parse and merge custom attributes if provided
						if (additionalFields.customAttributes) {
							let customAttrs: IDataObject = {};
							try {
								if (typeof additionalFields.customAttributes === 'string') {
									customAttrs = JSON.parse(additionalFields.customAttributes);
								} else {
									customAttrs = additionalFields.customAttributes as IDataObject;
								}
								// Merge custom attributes into attributes
								Object.assign(attributes, customAttrs);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in customAttributes field: ${error}`,
								);
							}
						}

						const body: IDataObject = {
							host_name: hostName,
							folder: folder,
							attributes: attributes,
						};

						// Build query parameters
						const qs: IDataObject = {};
						if (additionalFields.bake_agent !== undefined) {
							qs.bake_agent = additionalFields.bake_agent;
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_config/collections/all',
							body,
							qs,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const hostName = this.getNodeParameter('hostName', i) as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						// Build query parameters
						const qs: IDataObject = {};
						if (additionalFields.effective_attributes !== undefined) {
							qs.effective_attributes = additionalFields.effective_attributes;
						}

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/host_config/${hostName}`,
							{},
							qs,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						// Build query parameters
						const qs: IDataObject = {};
						if (additionalFields.effective_attributes !== undefined) {
							qs.effective_attributes = additionalFields.effective_attributes;
						}
						if (additionalFields.include_links !== undefined) {
							qs.include_links = additionalFields.include_links;
						}
						if (additionalFields.fields) {
							qs.fields = additionalFields.fields;
						}
						if (additionalFields.hostnames) {
							const hostnamesString = additionalFields.hostnames as string;
							if (hostnamesString.trim() !== '') {
								qs.hostnames = hostnamesString.split(',').map((h) => h.trim());
							}
						}
						if (additionalFields.site) {
							qs.site = additionalFields.site;
						}

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/host_config/collections/all',
								{},
								qs,
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/host_config/collections/all',
								{},
								qs,
							);
							const hosts = response.value || [];
							returnData.push(...hosts.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const hostName = this.getNodeParameter('hostName', i) as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const body: IDataObject = {};

						// Check which update method to use (only one can be used at a time)
						if (additionalFields.attributes) {
							let attributes: IDataObject = {};
							try {
								if (typeof additionalFields.attributes === 'string') {
									attributes = JSON.parse(additionalFields.attributes);
								} else {
									attributes = additionalFields.attributes as IDataObject;
								}
								body.attributes = attributes;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in attributes field: ${error}`,
								);
							}
						} else if (additionalFields.update_attributes) {
							let updateAttrs: IDataObject = {};
							try {
								if (typeof additionalFields.update_attributes === 'string') {
									updateAttrs = JSON.parse(additionalFields.update_attributes);
								} else {
									updateAttrs = additionalFields.update_attributes as IDataObject;
								}
								body.update_attributes = updateAttrs;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in update_attributes field: ${error}`,
								);
							}
						} else if (additionalFields.remove_attributes) {
							const removeAttrsString = additionalFields.remove_attributes as string;
							if (removeAttrsString.trim() !== '') {
								body.remove_attributes = removeAttrsString.split(',').map((a) => a.trim());
							}
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/host_config/${encodeURIComponent(hostName)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const hostName = this.getNodeParameter('hostName', i) as string;
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/host_config/${encodeURIComponent(hostName)}`,
						);
						returnData.push({ success: true, hostName });
					}

					if (operation === 'move') {
						const hostName = this.getNodeParameter('hostName', i) as string;
						const folder = this.getNodeParameter('folder', i) as string;

						const body: IDataObject = {
							target_folder: folder,
						};

						// Move operation requires If-Match header
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'POST',
							`/objects/host_config/${encodeURIComponent(hostName)}/actions/move/invoke`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'rename') {
						const hostName = this.getNodeParameter('hostName', i) as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const newName = additionalFields.newName as string;

						const body: IDataObject = {
							new_name: newName,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/host_config/${encodeURIComponent(hostName)}/actions/rename/invoke`,
							body,
						);
						returnData.push(response);
					}
				}

				// ==================== HOST GROUP OPERATIONS ====================
				if (resource === 'hostGroup') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') {
						const alias = this.getNodeParameter('alias', i, '') as string;

						const body: IDataObject = {
							name: name,
							alias: alias,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_group_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/host_group_config/${name}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/host_group_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/host_group_config/collections/all',
							);
							const groups = response.value || [];
							returnData.push(...groups.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const alias = this.getNodeParameter('alias', i, '') as string;

						const body: IDataObject = {
							alias: alias,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/host_group_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/host_group_config/${encodeURIComponent(name)}`,
						);
						returnData.push({ success: true, name });
					}
				}

				// ==================== SERVICE GROUP OPERATIONS ====================
				if (resource === 'serviceGroup') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') {
						const alias = this.getNodeParameter('alias', i, '') as string;

						const body: IDataObject = {
							name: name,
							alias: alias,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/service_group_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/service_group_config/${name}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/service_group_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/service_group_config/collections/all',
							);
							const groups = response.value || [];
							returnData.push(...groups.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const alias = this.getNodeParameter('alias', i, '') as string;

						const body: IDataObject = {
							alias: alias,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/service_group_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/service_group_config/${encodeURIComponent(name)}`,
						);
						returnData.push({ success: true, name });
					}
				}

				// ==================== FOLDER OPERATIONS ====================
				if (resource === 'folder') {
					let folder = this.getNodeParameter('folder', i, '/') as string;

					// Helper function to convert folder path to Checkmk API ID format
					// Checkmk uses ~ prefix for folders (e.g., /hahaha -> ~hahaha)
					const normalizeFolderId = (folderPath: string): string => {
						if (!folderPath || folderPath === '/' || folderPath === '') {
							return '~';
						}

						// If already in ~ format, return as is (but normalize)
						if (folderPath.startsWith('~')) {
							// Remove any leading slashes and normalize
							const normalized = folderPath.replace(/^\/+/, '').replace(/\/+$/, '');
							return normalized;
						}

						// Remove leading/trailing slashes and normalize
						let cleanPath = folderPath.replace(/^\/+|\/+$/g, '');

						// If empty after cleaning, return root
						if (cleanPath === '') {
							return '~';
						}

						// Split by slashes, filter empty segments, and join with ~
						// /hahaha -> ~hahaha
						// /parent/child -> ~parent~child
						// hahaha -> ~hahaha (handles paths without leading slash)
						const segments = cleanPath
							.split('/')
							.filter((s) => s !== '' && s !== null && s !== undefined);

						if (segments.length === 0) {
							return '~';
						}

						return '~' + segments.join('~');
					};

					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const parent = this.getNodeParameter('parent', i) as string;
						const name = this.getNodeParameter('name', i, '') as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						// Build the body with required fields
						const body: IDataObject = {
							title: title,
							parent: parent,
						};

						// Add name if provided (optional field)
						if (name && name.trim() !== '') {
							body.name = name.trim();
						}

						// Add additional attributes if provided
						if (additionalFields.attributes) {
							let attributes: IDataObject = {};
							try {
								if (typeof additionalFields.attributes === 'string') {
									attributes = JSON.parse(additionalFields.attributes);
								} else {
									attributes = additionalFields.attributes as IDataObject;
								}
								// Add attributes as a nested object (as per Checkmk API specification)
								if (Object.keys(attributes).length > 0) {
									body.attributes = attributes;
								}
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON in attributes field: ${error}`,
								);
							}
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/folder_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const folderId = normalizeFolderId(folder);
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/folder_config/${encodeURIComponent(folderId)}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/folder_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/folder_config/collections/all',
							);
							const folders = response.value || [];
							returnData.push(...folders.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const folderId = normalizeFolderId(folder);
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/folder_config/${encodeURIComponent(folderId)}`,
							additionalFields,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const folderId = normalizeFolderId(folder);
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/folder_config/${encodeURIComponent(folderId)}`,
						);
						returnData.push({ success: true, folder });
					}
				}

				// ==================== USER OPERATIONS ====================
				if (resource === 'user') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') {
						const username = this.getNodeParameter('username', i, '') as string;
						const fullname = this.getNodeParameter('fullname', i, '') as string;
						const customer = this.getNodeParameter('customer', i, '') as string;
						const authType = this.getNodeParameter('authType', i, '') as string;
						// Build the body with required fields
						const body: IDataObject = {
							username: username,
							fullname: fullname,
						};

						// Add optional fields if provided
						if (customer && customer.trim() !== '') {
							body.customer = customer.trim();
						}

						// Handle authentication fields
						if (authType === 'password') {
							const password = this.getNodeParameter('Password', i, '') as string;
							if (password && password.trim() !== '') {
								body.password = password.trim();
							} else {
								throw new NodeOperationError(
									this.getNode(),
									'Password must be provided for password authentication type',
								);
							}
						} else if (authType === 'automation') {
							const secret = this.getNodeParameter('Automation', i, '') as string;
							if (secret && secret.trim() !== '') {
								body.automation_secret = secret.trim();
							} else {
								throw new NodeOperationError(
									this.getNode(),
									'Secret must be provided for automation authentication type',
								);
							}
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/user_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/user_config/${name}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/user_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/user_config/collections/all',
							);
							const users = response.value || [];
							returnData.push(...users.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/user_config/${encodeURIComponent(name)}`,
							additionalFields,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/user_config/${encodeURIComponent(name)}`,
						);
						returnData.push({ success: true, name });
					}
				}

				// ==================== CONTACT GROUP OPERATIONS ====================
				if (resource === 'contactGroup') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') {
						const alias = this.getNodeParameter('alias', i, '') as string;

						const body: IDataObject = {
							name: name,
							alias: alias,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/contact_group_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/contact_group_config/${name}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/contact_group_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/contact_group_config/collections/all',
							);
							const groups = response.value || [];
							returnData.push(...groups.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const alias = this.getNodeParameter('alias', i, '') as string;

						const body: IDataObject = {
							alias: alias,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/contact_group_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/contact_group_config/${encodeURIComponent(name)}`,
						);
						returnData.push({ success: true, name });
					}
				}

				// ==================== TIME PERIOD OPERATIONS ====================
				if (resource === 'timePeriod') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') {
						const alias = this.getNodeParameter('alias', i, '') as string;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const body: IDataObject = {
							name: name,
							alias: alias,
							...additionalFields,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/time_period/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/time_period/${name}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/time_period/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/time_period/collections/all',
							);
							const periods = response.value || [];
							returnData.push(...periods.slice(0, limit));
						}
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/time_period/${encodeURIComponent(name)}`,
							additionalFields,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/time_period/${encodeURIComponent(name)}`,
						);
						returnData.push({ success: true, name });
					}
				}

				// ==================== RULE OPERATIONS ====================
				if (resource === 'rule') {
					if (operation === 'get') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const ruleId = additionalFields.ruleId as string;

						const response = await checkmkApiRequest.call(this, 'GET', `/objects/rule/${ruleId}`);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/rule/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/rule/collections/all',
							);
							const rules = response.value || [];
							returnData.push(...rules.slice(0, limit));
						}
					}
				}

				// ==================== DISCOVERY OPERATIONS ====================
				if (resource === 'discovery') {
					const hostName = this.getNodeParameter('hostName', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

					if (operation === 'run') {
						// Use the correct Checkmk API endpoint for service discovery
						// Documentation: https://checkmk.com/api/1.0/domain-types/service_discovery_run/actions/start/invoke
						const body: IDataObject = {
							host_name: hostName,
							mode: (additionalFields.mode as string) || 'new',
						};

						// Note: IP address and other custom attributes are not part of the
						// official Checkmk service discovery API, so they are ignored here

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/service_discovery_run/actions/start/invoke',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getStatus') {
						// Use the correct Checkmk API endpoint to get service discovery status
						// Documentation: https://checkmk.com/api/1.0/objects/service_discovery/{host_name}
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/service_discovery/${encodeURIComponent(hostName)}`,
						);
						returnData.push(response);
					}
				}

				// ==================== ACTIVATE CHANGES OPERATIONS ====================
				if (resource === 'activateChanges') {
					if (operation === 'activate') {
						const sites = this.getNodeParameter('activateOnSites', i, '') as string;
						const forceForeignChanges = this.getNodeParameter(
							'forceForeignChanges',
							i,
							false,
						) as boolean;

						const body: IDataObject = {
							sites: sites ? sites.split(',').map((s) => s.trim()) : [],
							force_foreign_changes: forceForeignChanges,
						};

						// Activate changes requires If-Match header with ETag from pending changes
						// Get ETag from pending changes collection
						let etag = '';
						try {
							const pendingResult = await checkmkApiRequestWithETag.call(
								this,
								'GET',
								'/domain-types/activation_run/collections/pending_changes',
							);
							etag = pendingResult.etag || '';
						} catch (error: any) {
							// If we can't get ETag from pending changes, try to use "*" as fallback
							etag = '*';
						}

						const ifMatchValue = etag && etag !== '*' ? `"${etag}"` : '"*"';

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/activation_run/actions/activate-changes/invoke',
							body,
							{},
							{
								'If-Match': ifMatchValue,
							},
						);
						returnData.push(response);
					}

					if (operation === 'getPending') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/activation_run/collections/pending_changes',
						);
						returnData.push(response);
					}

					if (operation === 'getStatus') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/activation_run/collections/running',
						);
						returnData.push(response);
					}
				}

				// ==================== SITE OPERATIONS ====================
				if (resource === 'site') {
					if (operation === 'get') {
						const siteName = this.getNodeParameter('siteName', i) as string;
						const response = await checkmkApiRequest.call(this, 'GET', `/objects/site/${siteName}`);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/site/collections/all',
						);
						returnData.push(...(response.value || []));
					}

					if (operation === 'login') {
						const siteName = this.getNodeParameter('siteName', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/site/${siteName}/actions/login/invoke`,
							{},
						);
						returnData.push(response);
					}

					if (operation === 'logout') {
						const siteName = this.getNodeParameter('siteName', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/site/${siteName}/actions/logout/invoke`,
							{},
						);
						returnData.push(response);
					}
				}

				// ==================== SERVICE OPERATIONS ====================
				if (resource === 'service') {
					const hostName = this.getNodeParameter('hostName', i) as string;

					if (operation === 'get') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const serviceDescription = additionalFields.serviceDescription as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/service/${hostName}/${encodeURIComponent(serviceDescription)}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const qs: IDataObject = {
							host_name: hostName,
						};

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/service/collections/all',
								{},
								qs,
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/service/collections/all',
								{},
								qs,
							);
							const services = response.value || [];
							returnData.push(...services.slice(0, limit));
						}
					}

					if (operation === 'acknowledge') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const serviceDescription = additionalFields.serviceDescription as string;
						const comment = (additionalFields.comment as string) || 'Acknowledged via n8n';

						const body: IDataObject = {
							acknowledge_type: 'service',
							host_name: hostName,
							service_description: serviceDescription,
							comment: comment,
							sticky: true,
							notify: false,
							persistent: false,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/acknowledge/collections/service',
							body,
						);
						returnData.push(response);
					}
				}

				// ==================== DOWNTIME OPERATIONS ====================
				if (resource === 'downtime') {
					if (operation === 'create') {
						const downtimeType = this.getNodeParameter('downtimeType', i) as string;
						const startTime = this.getNodeParameter('start_time', i) as string;
						const endTime = this.getNodeParameter('end_time', i) as string;

						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const comment = additionalFields.comment || 'Scheduled downtime via n8n';

						const body: IDataObject = {
							start_time: startTime,
							end_time: endTime,
							comment: comment,
							downtime_type: downtimeType,
						};

						if (downtimeType === 'host') {
							const hostName = this.getNodeParameter('host_name', i) as string;
							body.host_name = hostName;
						} else if (downtimeType === 'hostgroup') {
							const hostgroupName = this.getNodeParameter('hostgroup_name', i) as string;
							body.hostgroup_name = hostgroupName;
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/downtime/collections/host',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const downtimeId = additionalFields.downtimeId as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/downtime/${downtimeId}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/downtime/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/downtime/collections/all',
							);
							const downtimes = response.value || [];
							returnData.push(...downtimes.slice(0, limit));
						}
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const downtimeId = additionalFields.downtimeId as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/downtime/${encodeURIComponent(downtimeId)}`,
						);
						returnData.push({ success: true, downtimeId });
					}
				}

				// ==================== PROBLEM OPERATIONS ====================
				if (resource === 'problem') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/service/collections/all',
								{},
								{ state: 'warn,crit,unknown' },
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/service/collections/all',
								{},
								{ state: 'warn,crit,unknown' },
							);
							const problems = response.value || [];
							returnData.push(...problems.slice(0, limit));
						}
					}
				}

				// ==================== BI AGGREGATION OPERATIONS ====================
				if (resource === 'biAggregation') {
					if (operation === 'getState') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const filterNames = additionalFields.filterNames as string[];
						const filterGroups = additionalFields.filterGroups as string[];

						const qs: IDataObject = {};
						if (filterNames) qs.filter_names = filterNames;
						if (filterGroups) qs.filter_groups = filterGroups;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/bi_aggregation/actions/aggregation_state/invoke',
							{},
							qs,
						);
						returnData.push(response);
					}
				}

				// ==================== BI PACK OPERATIONS ====================
				if (resource === 'biPack') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/bi_pack/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== BI RULE OPERATIONS ====================
				if (resource === 'biRule') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/bi_rule/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== COMMENT OPERATIONS ====================
				if (resource === 'comment') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const hostName = additionalFields.hostName as string;
						const comment = additionalFields.comment as string;
						const persistent = (additionalFields.persistent as boolean) || false;

						const body: IDataObject = {
							comment,
							persistent,
						};

						// Add comment operation requires If-Match header
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'POST',
							`/objects/host/${encodeURIComponent(hostName)}/actions/add_comment/invoke`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/comment/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const commentId = additionalFields.commentId as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/comment/${encodeURIComponent(commentId)}`,
						);
						returnData.push({ success: true, message: 'Comment deleted' });
					}
				}

				// ==================== EVENT CONSOLE OPERATIONS ====================
				if (resource === 'eventConsole') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/event_console/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== HOST STATUS OPERATIONS ====================
				if (resource === 'hostStatus') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const hostName = additionalFields.hostName as string;

						const qs: IDataObject = {};
						if (hostName) qs.host_name = hostName;

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/host/collections/all',
								{},
								qs,
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/host/collections/all',
								{},
								qs,
							);
							const hosts = response.value || [];
							returnData.push(...hosts.slice(0, limit));
						}
					}
				}

				// ==================== METRIC OPERATIONS ====================
				if (resource === 'metric') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/metric/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== SERVICE STATUS OPERATIONS ====================
				if (resource === 'serviceStatus') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const hostName = additionalFields.hostName as string;

						const qs: IDataObject = {};
						if (hostName) qs.host_name = hostName;

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/service/collections/all',
								{},
								qs,
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/service/collections/all',
								{},
								qs,
							);
							const services = response.value || [];
							returnData.push(...services.slice(0, limit));
						}
					}
				}

				// ==================== SLA OPERATIONS ====================
				if (resource === 'sla') {
					if (operation === 'compute') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const slaConfiguration = additionalFields.slaConfiguration as string;
						const timeRange = additionalFields.timeRange as string;

						const body: IDataObject = {
							sla_configuration: slaConfiguration,
							time_range: timeRange,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/sla/actions/compute/invoke',
							body,
						);
						returnData.push(response);
					}
				}

				// ==================== AGENT OPERATIONS ====================
				if (resource === 'agent') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/agent/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== AUDIT LOG OPERATIONS ====================
				if (resource === 'auditLog') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const userId = additionalFields.userId as string;
						const objectType = additionalFields.objectType as string;

						const qs: IDataObject = {};
						if (userId) qs.user_id = userId;
						if (objectType) qs.object_type = objectType;

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/audit_log/collections/all',
								{},
								qs,
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/audit_log/collections/all',
								{},
								qs,
							);
							const logs = response.value || [];
							returnData.push(...logs.slice(0, limit));
						}
					}
				}

				// ==================== AUX TAG OPERATIONS ====================
				if (resource === 'auxTag') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const tagId = additionalFields.tagId as string;
						const title = additionalFields.title;
						const topic = additionalFields.topic;
						const help = additionalFields.help;

						// Validate and normalize title - it's required
						let validTitle: string;
						if (title === undefined || title === null) {
							throw new NodeOperationError(
								this.getNode(),
								'Title is required for aux tag creation',
							);
						}
						validTitle = String(title).trim();
						if (validTitle === '') {
							throw new NodeOperationError(this.getNode(), 'Title cannot be empty');
						}

						// Build body with required fields
						const body: IDataObject = {
							tag_id: tagId,
							title: validTitle,
						};

						// Add optional fields only if they have values
						if (topic !== undefined && topic !== null && String(topic).trim() !== '') {
							body.topic = String(topic).trim();
						}
						if (help !== undefined && help !== null && String(help).trim() !== '') {
							body.help = String(help).trim();
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/aux_tag/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/aux_tag/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const tagId = additionalFields.tagId as string;
						const title = additionalFields.title;
						const topic = additionalFields.topic;
						const help = additionalFields.help;

						// Validate and normalize title - it's required
						let validTitle: string;
						if (title === undefined || title === null) {
							throw new NodeOperationError(this.getNode(), 'Title is required for aux tag update');
						}
						validTitle = String(title).trim();
						if (validTitle === '') {
							throw new NodeOperationError(this.getNode(), 'Title cannot be empty');
						}

						// Build body with required fields
						const body: IDataObject = {
							title: validTitle,
						};

						// Add optional fields only if they have values
						if (topic !== undefined && topic !== null && String(topic).trim() !== '') {
							body.topic = String(topic).trim();
						}
						if (help !== undefined && help !== null && String(help).trim() !== '') {
							body.help = String(help).trim();
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/aux_tag/${encodeURIComponent(tagId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const tagId = additionalFields.tagId as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/aux_tag/${encodeURIComponent(tagId)}`,
						);
						returnData.push({ success: true, message: 'Aux tag deleted' });
					}
				}

				// ==================== HOST TAG GROUP OPERATIONS ====================
				if (resource === 'hostTagGroup') {
					if (operation === 'create') {
						const id = this.getNodeParameter('tagGroupid', i, '') as string;
						const title = this.getNodeParameter('title', i, '') as string;
						const topic = this.getNodeParameter('topic', i, '') as string;
						const help = this.getNodeParameter('help', i, '') as string;
						const tagsCollection = this.getNodeParameter('tags', i, []) as Array<IDataObject>;

						const tagsArray = Array.isArray(tagsCollection) ? tagsCollection : [tagsCollection];
						// Build tags for API
						const apiTags = tagsArray.map((tagItem) => {
							const tagBody: IDataObject = {
								title: tagItem.title as string,
							};
							if (tagItem.tagId && String(tagItem.tagId).trim() !== '') {
								tagBody.id = String(tagItem.tagId).trim();
							}
							return tagBody;
						});
						const body: IDataObject = {
							id: id,
							title: title,
							tags: apiTags,
						};

						if (topic && String(topic).trim() !== '') {
							body.topic = String(topic).trim();
						}
						if (help && String(help).trim() !== '') {
							body.help = String(help).trim();
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_tag_group/collections/all',
							body,
						);

						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/host_tag_group/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const tagGroupId = additionalFields.tagGroupId as string;
						const title = additionalFields.title;
						const topic = additionalFields.topic;
						const help = additionalFields.help;

						// Validate and normalize title - it's required
						let validTitle: string;
						if (title === undefined || title === null) {
							throw new NodeOperationError(
								this.getNode(),
								'Title is required for host tag group update',
							);
						}
						validTitle = String(title).trim();
						if (validTitle === '') {
							throw new NodeOperationError(this.getNode(), 'Title cannot be empty');
						}

						// Build body with required fields
						const body: IDataObject = {
							title: validTitle,
						};

						// Add optional fields only if they have values
						if (topic !== undefined && topic !== null && String(topic).trim() !== '') {
							body.topic = String(topic).trim();
						}
						if (help !== undefined && help !== null && String(help).trim() !== '') {
							body.help = String(help).trim();
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/host_tag_group/${encodeURIComponent(tagGroupId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const tagGroupId = additionalFields.tagGroupId as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/host_tag_group/${encodeURIComponent(tagGroupId)}`,
						);
						returnData.push({
							success: true,
							message: 'Host tag group deleted',
						});
					}
				}

				// ==================== LDAP CONNECTION OPERATIONS ====================
				if (resource === 'ldapConnection') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const connectionId = additionalFields.connectionId as string;
						const serverUrl = additionalFields.serverUrl as string;
						const bindDn = additionalFields.bindDn as string;
						const bindPassword = additionalFields.bindPassword as string;

						const body: IDataObject = {
							connection_id: connectionId,
							server_url: serverUrl,
							bind_dn: bindDn,
							bind_password: bindPassword,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/ldap_connection/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/ldap_connection/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const connectionId = additionalFields.connectionId as string;
						const serverUrl = additionalFields.serverUrl as string;
						const bindDn = additionalFields.bindDn as string;
						const bindPassword = additionalFields.bindPassword as string;

						const body: IDataObject = {
							server_url: serverUrl,
							bind_dn: bindDn,
							bind_password: bindPassword,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/ldap_connection/${encodeURIComponent(connectionId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const connectionId = additionalFields.connectionId as string;

						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/ldap_connection/${connectionId}`,
						);
						returnData.push({
							success: true,
							message: 'LDAP connection deleted',
						});
					}
				}

				// ==================== NOTIFICATION RULE OPERATIONS ====================
				if (resource === 'notificationRule') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/notification_rule/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== OPENTELEMETRY OPERATIONS ====================
				if (resource === 'openTelemetry') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const collectorId = additionalFields.collectorId as string;
						const name = additionalFields.name as string;
						const port = additionalFields.port as number;

						const body: IDataObject = {
							collector_id: collectorId,
							name,
							port,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/open_telemetry_collector/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/open_telemetry_collector/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const collectorId = additionalFields.collectorId as string;
						const name = additionalFields.name as string;
						const port = additionalFields.port as number;

						const body: IDataObject = {
							name,
							port,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/open_telemetry_collector/${encodeURIComponent(collectorId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const collectorId = additionalFields.collectorId as string;

						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/open_telemetry_collector/${collectorId}`,
						);
						returnData.push({
							success: true,
							message: 'OpenTelemetry collector deleted',
						});
					}
				}

				// ==================== PARENT SCAN OPERATIONS ====================
				if (resource === 'parentScan') {
					if (operation === 'run') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const hostName = additionalFields.hostName as string;

						const body: IDataObject = {
							host_name: hostName,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/parent_scan/actions/run/invoke',
							body,
						);
						returnData.push(response);
					}
				}

				// ==================== PASSWORD OPERATIONS ====================
				if (resource === 'password') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/password/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== RULESET OPERATIONS ====================
				if (resource === 'ruleset') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/ruleset/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== SAML CONNECTION OPERATIONS ====================
				if (resource === 'samlConnection') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const connectionId = additionalFields.connectionId as string;
						const identityProviderMetadata = additionalFields.identityProviderMetadata as string;

						const body: IDataObject = {
							connection_id: connectionId,
							identity_provider_metadata: identityProviderMetadata,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/saml_connection/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/saml_connection/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const connectionId = additionalFields.connectionId as string;
						const identityProviderMetadata = additionalFields.identityProviderMetadata as string;

						const body: IDataObject = {
							identity_provider_metadata: identityProviderMetadata,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/saml_connection/${encodeURIComponent(connectionId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const connectionId = additionalFields.connectionId as string;

						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/saml_connection/${connectionId}`,
						);
						returnData.push({
							success: true,
							message: 'SAML connection deleted',
						});
					}
				}

				// ==================== USER ROLE OPERATIONS ====================
				if (resource === 'userRole') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const roleId = additionalFields.roleId as string;
						const alias = additionalFields.alias as string;
						const permissions = additionalFields.permissions as string[];

						const body: IDataObject = {
							role_id: roleId,
							alias,
							permissions,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/user_role/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/user_role/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const roleId = additionalFields.roleId as string;
						const alias = additionalFields.alias as string;
						const permissions = additionalFields.permissions as string[];

						const body: IDataObject = {
							alias,
							permissions,
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/user_role/${encodeURIComponent(roleId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const roleId = additionalFields.roleId as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/user_role/${encodeURIComponent(roleId)}`,
						);
						returnData.push({ success: true, message: 'User role deleted' });
					}
				}

				// ==================== BACKGROUND JOB OPERATIONS ====================
				if (resource === 'backgroundJob') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/background_job/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== BROKER CONNECTION OPERATIONS ====================
				if (resource === 'brokerConnection') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/broker_connection/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== CERTIFICATE OPERATIONS ====================
				if (resource === 'certificate') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/certificate/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== CONFIGURATION ENTITY OPERATIONS ====================
				if (resource === 'configurationEntity') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/configuration_entity/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== DCD OPERATIONS ====================
				if (resource === 'dcd') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/dcd/collections/all',
						);
						returnData.push(response);
					}
				}

				// ==================== LICENSE USAGE OPERATIONS ====================
				if (resource === 'licenseUsage') {
					if (operation === 'get') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/license_usage/actions/usage/invoke',
						);
						returnData.push(response);
					}
				}

				// ==================== QUICK SETUP OPERATIONS ====================
				if (resource === 'quickSetup') {
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/quick_setup/collections/all',
						);
						returnData.push(response);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message });
					continue;
				}
				throw error;
			}
		}

		const executionData: INodeExecutionData[] = [];
		for (let i = 0; i < returnData.length; i++) {
			executionData.push({ json: returnData[i], pairedItem: { item: i } });
		}

		return [executionData];
	}
}
