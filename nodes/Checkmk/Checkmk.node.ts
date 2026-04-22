import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import {
	checkmkApiRequest,
	checkmkApiRequestAllItems,
	checkmkApiRequestWithIfMatch,
	checkmkApiRequestWithETag,
	normalizeFolderId,
	folderIdToPath,
	getFoldersList,
	searchFolders,
	extractFolderIdFromLocator,
	searchDestinationFolders,
} from './GenericFunctions';

export class Checkmk implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Checkmk',
		name: 'checkmk',
		icon: 'file:svg-icons/cmk.svg',
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
				options: [ // MATEUS NOTES Those are all the resource options, we'll be using it to undoubtly identify a resource under displayOptions: { show: { resource: ['resource_name']}}
					{ name: 'Activate Change', value: 'activateChanges' }, // MATEUS NOTES: It takes the name, converts it to Uppercase and add "ACTIONS" in the end
					{ name: 'Agent', value: 'agent' }, // MATEUS NOTES: We use the value to identify a certain resource, it will be used in the execute() method
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
					{ name: 'Miscellaneous', value: 'miscellaneous' },
					{ name: 'Acknowledge', value: 'acknowledge' },
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
					{ //CMK_MOVEHOSTSTOANOTHERFOLDER
						name: 'Move',
						value: 'move',
						description: 'Move host to different folder',
						action: 'Move a host',
					},
					{
						name: 'Bulk Delete',
						value: 'bulk_delete',
						description: 'Delete multiple hosts',
						action: 'Bulk delete hosts',
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
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many hosts',
						action: 'Get many hosts',
					},
					{
						name: 'Create Cluster',
						value: 'create_cluster',
						description: 'Create a new cluster host',
						action: 'Create a cluster host',
					},
					{
						name: 'Update Cluster Nodes',
						value: 'update_cluster_nodes',
						description: 'Update the nodes of a cluster host',
						action: 'Update cluster nodes',
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
						name: 'Show All Host Groups',
						value: 'getMany',
						description: 'Get All host groups',
						action: 'Get many host groups',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a host group',
						action: 'Update a host group',
					},
					{
						name: 'Bulk Create',
						value: 'bulk_create',
						description: 'Create multiple host groups at once',
						action: 'Bulk create host groups',
					},
					{
						name: 'Bulk Delete',
						value: 'bulk_delete',
						description: 'Delete multiple host groups',
						action: 'Bulk delete host groups',
					},
					{
						name: 'Bulk Update',
						value: 'bulk_update',
						description: 'Update multiple host groups',
						action: 'Bulk update host groups',
					},
							],
				default: 'getMany',
			},
			{
				displayName: 'Host Group Names',
				name: 'hostGroupNames',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_delete'],
					},
				},
				default: '',
				placeholder: 'windows, linux, servers',
				description: 'Comma-separated list of host group names to delete',
			},
			
			// ==================== HOST GROUP BULK UPDATE FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'hostGroupUpdateMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_update'],
					},
				},
				options: [
					{
						name: 'Manual Entries (UI)',
						value: 'ui',
						description: 'Update host groups manually using the interface',
					},
					{
						name: 'JSON (Dynamic)',
						value: 'json',
						description: 'Pass a raw JSON array of entries',
					},
				],
				default: 'ui',
				description: 'Choose how to provide the host groups to update',
			},

			// MODO UI: Fixed Collection para Update
			{
				displayName: 'Entries',
				name: 'hostGroupUpdateEntries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Host Group Update',
				default: {},
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_update'],
						hostGroupUpdateMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name (ID)',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The internal identifier of the host group to update',
							},
							{
								displayName: 'New Alias',
								name: 'alias',
								type: 'string',
								default: '',
								description: 'The new display name (optional)',
							},
							{
								displayName: 'New Customer',
								name: 'customer',
								type: 'string',
								default: '',
								description: 'The new customer ID (optional)',
							},
						],
					},
				],
			},

			// MODO JSON
			{
				displayName: 'Entries JSON',
				name: 'hostGroupUpdateEntriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_update'],
						hostGroupUpdateMode: ['json'],
					},
				},
				default: '[]',
				description: 'Array of objects. Example: [{"name": "hg1", "attributes": {"alias": "New Name"}}].',
			},
			// ==================== HOST GROUP BULK CREATE FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'hostGroupCreateMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_create'],
					},
				},
				options: [
					{
						name: 'Manual Entries (UI)',
						value: 'ui',
						description: 'Add host groups manually using the interface',
					},
					{
						name: 'JSON (Dynamic)',
						value: 'json',
						description: 'Pass a raw JSON array of entries',
					},
				],
				default: 'ui',
				description: 'Choose how to provide the host groups to create',
			},

			// MODO UI: Fixed Collection
			{
				displayName: 'Entries',
				name: 'hostGroupEntries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Host Group',
				default: {},
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_create'],
						hostGroupCreateMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name (ID)',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The internal identifier (e.g. "windows_servers")',
							},
							{
								displayName: 'Alias',
								name: 'alias',
								type: 'string',
								required: true,
								default: '',
								description: 'The display name (e.g. "Windows Servers")',
							},
							{
								displayName: 'Customer',
								name: 'customer',
								type: 'string',
								default: 'provider',
								description: 'The customer ID',
							},
						],
					},
				],
			},

			// MODO JSON
			{
				displayName: 'Entries JSON',
				name: 'hostGroupEntriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['hostGroup'],
						operation: ['bulk_create'],
						hostGroupCreateMode: ['json'],
					},
				},
				default: '[]',
				description: 'Array of objects. Example: [{"name": "hg1", "alias": "HG 1", "customer": "provider"}].',
			},
			// ==================== ACKNOWLEDGE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
					},
				},
				options: [
					{
						name: 'Remove',
						value: 'remove',
						description: 'Remove acknowledgement on host or service problems',
						action: 'Remove acknowledgement',
					},
					{
						name: 'Set Acknowledgement',
						value: 'create', 
						description: 'Set acknowledgement on related hosts or services',
						action: 'Set acknowledgement on related hosts',
					},
				],
				default: 'remove',
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create', 'remove'],
						acknowledge_type: ['host_by_query', 'service_by_query'],
					},
				},
				default: '{}',
				description: 'Livestatus query expression (e.g. {"op": "=", "left": "name", "right": "myhost"})',
			},
			{
				displayName: 'Acknowledge Type',
				name: 'acknowledge_type',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['remove', 'create'],
					},
				},
				options: [
					{ name: 'Host', value: 'host' },
					{ name: 'Service', value: 'service' },
					{ name: 'Host Group', value: 'hostgroup' },
					{ name: 'Service Group', value: 'servicegroup' },
					{ name: 'Host by Query', value: 'host_by_query' },
					{ name: 'Service by Query', value: 'service_by_query' },
				],
				default: 'host',
				description: 'Select the type of object to remove acknowledgement from',
			},
			{
				displayName: 'Host Group',
				name: 'hostgroup_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['remove'],
						acknowledge_type: ['hostgroup'],
					},
				},
				default: '',
				description: 'The host group name',
			},
			{
				displayName: 'Service Group',
				name: 'servicegroup_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['remove', 'create'],
						acknowledge_type: ['servicegroup'],
					},
				},
				default: '',
				description: 'The service group name',
			},
			// ==================== MISCELLANEOUS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['miscellaneous'],
					},
				},
				options: [
					{
						name: 'Display Some Version Information',
						value: 'version',

						action: 'Display some version information',
					},
				],
				default: 'version',
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
						name: 'Bulk Create',
						value: 'bulk_create',
						description: 'Create multiple service groups simultaneously',
						action: 'Create multiple service groups simultaneously',
					},
					{
						name: 'Bulk Delete',
						value: 'bulk_delete',
						description: 'Delete multiple service groups simultaneously',
						action: 'Delete multiple service groups simultaneously',
					},
					{
						name: 'Bulk Update',
						value: 'bulk_update',
						description: 'Update multiple service groups simultaneously',
						action: 'Update multiple service groups simultaneously',
					},
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
					{ //CMK_CreateFolder
						name: 'Create',
						value: 'create',
						description: 'Create a folder',
						action: 'Create a folder',
					},
					{ //CMK_DeleteFolder
						name: 'Delete',
						value: 'delete',
						description: 'Delete a folder',
						action: 'Delete a folder',
					},
					{ //CMK_GetFolder
						name: 'Get',
						value: 'get',
						description: 'Get a folder',
						action: 'Get a folder',
					},
					{ //CMK_GetManyFolders
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many folders',
						action: 'Get many folders',
					},
					{ //CMK_HostsInFolder
						name: 'Get Hosts',
						value: 'getHosts',
						description: 'Get hosts from a specific folder',
						action: 'Get hosts from a folder',
					},
					{ //CMK_UpdateFolder
						name: 'Update',
						value: 'update',
						description: 'Update a folder',
						action: 'Update a folder',
					},
					{ //CMK_UpdateFolder
						name: 'Bulk Update',
						value: 'bulk_update',
						description: 'Update multiple folders simultaneously',
						action: 'Update multiple folders simultaneously',
					},
					{ //CMK_MoveFolder
						name: 'Move',
						value: 'move',
						description: 'Move a folder',
						action: 'Move a folder',
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
						name: 'Show All', 
						value: 'getMany',
						description: 'Get all contact groups',
						action: 'Get all contact groups',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact group',
						action: 'Update a contact group',
					},
					{
						name: 'Bulk Create',
						value: 'bulk_create',
						description: 'Create multiple contact groups at once',
						action: 'Bulk create contact groups',
					},
					{
						name: 'Bulk Update',
						value: 'bulk_update',
						description: 'Update multiple contact groups',
						action: 'Bulk update contact groups',
					},
					{
						name: 'Bulk Delete',
						value: 'bulk_delete',
						description: 'Delete multiple contact groups',
						action: 'Bulk delete contact groups',
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
						name: 'Create',
						value: 'create',
						description: 'Create a rule',
						action: 'Create a rule',
					},
					{
						name: 'Show a Rule',
						value: 'show',

						action: 'Show a rule',
					},
					{
						name: 'List Rules',
						value: 'list',

						action: 'List rules',
					},
					{
						name: 'Delete a Rule',
						value: 'delete',

						action: 'Delete a rule',
					},
					{
						name: 'Modify a Rule',
						value: 'modify',

						action: 'Modify a rule',
					},
					{
						name: 'Move a Rule',
						value: 'move',

						action: 'Move a rule'
					}
				],
				default: 'create',
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
						description: 'Execute a service discovery on a host',
						action: 'Execute a service discovery on a host',
					},
					{
						name: 'Wait for Discovery Completion',
						value: 'wait',
						description: 'Wait for service discovery completion',
						action: 'Wait for service discovery completion',
					},
					{
						name: 'Show the Current Service Discovery Result',
						value: 'showResult',

						action: 'Show the current service discovery result',
					},
					{
						name: 'Show the Last Service Discovery Background Job on a Host',
						value: 'showLast',

						action: 'Show the last service discovery background job on a host',
					},
					{
						name: 'Update the Phase of a Service',
						value: 'update',

						action: 'Update the phase of a service',
					},	
					{
						name: 'Start Bulk Discovery',
						value: 'bulkDiscovery',
						description: 'Start a bulk discovery job for multiple hosts',
						action: 'Start a bulk discovery job',
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
						name: 'Get',
						value: 'get',
						description: 'Show the activation status of a specific run',
						action: 'Get an activation run',
					},
					{
						name: 'Get Pending',
						value: 'getPending',
						description: 'Get pending changes',
						action: 'Get pending changes',
					},
					{
						name: 'Get All Currently Running Activations',
						value: 'getRunning',
						description: 'Show all currently running activations',
						action: 'Show all currently running activations',
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
						name: 'Create a Site Connection',
						value: 'create',

						action: 'Create a site connection',
					},
					{
						name: 'Show a Site Connection',
						value: 'show',

						action: 'Show a site connection',
					},
					{
						name: 'Show All Site Connections',
						value: 'showAll',

						action: 'Show all site connections',
					},
					{
						name: 'Login to a Remote Site',
						value: 'login',

						action: 'Login to a remote site',
					},
					{
						name: 'Logout From a Remote Site',
						value: 'logout',

						action: 'Logout from a remote site',
					},
					{
						name: 'Delete a Site Connection',
						value: 'delete',

						action: 'Delete a site connection',
					},
					{
						name: 'Update a Site Connection',
						value: 'update',

						action: 'Update a site connection',
					},
					
				],
				default: 'showAll',
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
					{
						name: 'Update',
						value: 'update',
						description: 'Update a downtime (e.g. extend end time or change comment)',
						action: 'Update a downtime',
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
						name: 'Create',
						value: 'create',
						description: 'Create a new BI pack',
						action: 'Create a BI pack',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many BI packs',
						action: 'Get many BI packs',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a BI pack',
						action: 'Delete a BI pack',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a BI pack and its rules and aggregations',
						action: 'Get a BI pack',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing BI pack',
						action: 'Update a BI pack',
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
						name: 'Create',
						value: 'create',
						description: 'Create a new BI rule',
						action: 'Create a BI rule',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing BI rule',
						action: 'Update a BI rule',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many BI rules',
						action: 'Get many BI rules',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a BI rule',
						action: 'Delete a BI rule',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a BI rule',
						action: 'Get a BI rule',
					},

				],
				default: 'getMany',
			},

/// ==================== COMMENT OPERATIONS ====================
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
						description: 'Create a comment for a host, host group or query',
						action: 'Create a comment',
					},
					{
						name: 'Get', // Nova operação
						value: 'get',
						description: 'Show a specific comment',
						action: 'Get a comment',
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
            // --- End Fields for Create Comment ---			
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
						name: 'Archive Events',
						value: 'archive',

						action: 'Archive events',
					},
					{
						name: 'Change Event State',
						value: 'changeState',

						action: 'Change event state',
					},
					{
						name: 'Change Multiple Event States',
						value: 'changeMultipleStates',

						action: 'Change multiple event states',
					},
					{
						name: 'Show an Event',
						value: 'show',

						action: 'Show an event',
					},
					{
						name: 'Show Events',
						value: 'showEvents',

						action: 'Show events',
					},
					{
						name: 'Update and Acknowledge an Event',
						value: 'updateEvent',

						action: 'Update and acknowledge an event',
					},
					{
						name: 'Update and Acknowledge Events',
						value: 'updateEvents',

						action: 'Update and acknowledge events',
					},
				],
				default: 'showEvents',
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
						description: 'Get hosts based on a specific query condition',
						action: 'Get many hosts status',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get the live status of a host',
						action: 'Get a host status',
					},
				],
				default: 'get',
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
					{
						name: 'Get Custom Graph',
						value: 'getCustomGraph',
						description: 'Get data for a custom graph',
						action: 'Get a custom graph',
					},
					{
						name: 'Get Metrics',
						value: 'getMetrics',
						description: 'Get a single metric or a predefined graph',
						action: 'Get metrics',
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
						name: 'Create',
						value: 'create',
						description: 'Create a dynamic host configuration',
						action: 'Create a dynamic host configuration',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many DCD configurations',
						action: 'Get many DCD configurations',
					},
				],
				default: 'getMany',
			},
			// --- Campos para DCD Create ---
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['dcd'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name your connection for easy recognition',
			},
			{
				displayName: 'DCD ID',
				name: 'dcd_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['dcd'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The unique ID of the Piggyback dynamic host configuration to be created',
			},
			{
				displayName: 'Site',
				name: 'site',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['dcd'],
						operation: ['create'],
					},
				},
				default: 'global',
				description: 'Specify the site where you want this connector to run',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['dcd'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Disabled',
						name: 'disabled',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Documentation URL',
						name: 'documentation_url',
						type: 'string',
						default: '',
					},
				],
			},
			{
				displayName: 'Connector Configuration',
				name: 'connectorUi',
				type: 'collection',
				placeholder: 'Configure Connector',
				default: {},
				displayOptions: {
					show: {
						resource: ['dcd'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Connector Type',
						name: 'connector_type',
						type: 'options',
						options: [
							{ name: 'Piggyback', value: 'piggyback' },
						],
						default: 'piggyback',
					},
					{
						displayName: 'Execution Interval (Seconds)',
						name: 'interval',
						type: 'number',
						default: 60,
					},
					{
						displayName: 'Restrict Source Hosts',
						name: 'restrict_source_hosts',
						type: 'string',
						default: '',
						placeholder: 'host1, host2, regular.+expression',
						description: 'Comma-separated list of host names or regex',
					},
					{
						displayName: 'Discover on Creation',
						name: 'discover_on_creation',
						type: 'boolean',
						default: true,
					},
				],
			},
			// --- Creation Rules (Movido para fora do connectorUi para evitar erro de Max Iterations) ---
			{
				displayName: 'Creation Rules',
				name: 'creation_rules_ui',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Creation Rule',
				displayOptions: {
					show: {
						resource: ['dcd'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Rule',
						name: 'rule',
						values: [
							{
								displayName: 'Folder Path',
								name: 'folder_path',
								type: 'string',
								default: '/',
								description: 'The folder where the connection creates hosts',
							},
							{
								displayName: 'Delete Hosts',
								name: 'delete_hosts',
								type: 'boolean',
								default: false,
								description: 'Whether to delete hosts when piggyback data is missing',
							},
							{
								displayName: 'Matching Hosts (Regex)',
								name: 'matching_hosts',
								type: 'string',
								default: '',
								placeholder: 'regex1, regex2',
								description: 'Comma-separated list of regex patterns to restrict host creation',
							},
							{
								displayName: 'Host Attributes (JSON)',
								name: 'host_attributes',
								type: 'json',
								default: '{"tag_agent": "no-agent"}',
								description: 'Attributes to set on the newly created host (e.g. tags)',
							},
						],
					},
				],
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
						name: 'Show All Monitored Services',
						value: 'showAll',
						description: 'Get monitored services with advanced filtering (POST)',
						action: 'Show all monitored services',
					},
					{
						name: 'Show the Monitored Services of a Host',
						value: 'showHost', 
						description: 'Get monitored services with advanced filtering (POST)',
						action: 'Show all monitored services of a host',
					},
					{
						name: 'Show a Single Service of a Specific Host',
						value: 'show', 
						description: 'Get a single service with advanced filtering (POST)',
						action: 'Show a single service of a specific host',
					},
				],
				default: 'showAll',
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
			// ==================== SLA FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'slaInputMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['sla'],
						operation: ['compute'],
					},
				},
				options: [
					{ name: 'Manual Entry (UI)', value: 'ui', description: 'Compute a single SLA target via interface' },
					{ name: 'JSON (Multiple Targets)', value: 'json', description: 'Pass a raw JSON array of SLA targets' },
				],
				default: 'ui',
				description: 'Choose how to provide the SLA compute targets',
			},
			{
				displayName: 'SLA IDs',
				name: 'sla_ids',
				type: 'string',
				typeOptions: { multipleValues: true },
				required: true,
				displayOptions: {
					show: {
						resource: ['sla'],
						operation: ['compute'],
						slaInputMode: ['ui'],
					},
				},
				default: [],
				description: 'The IDs of the SLA configurations for which the SLA should be computed (e.g. sla_configuration_1)',
			},
			{
				displayName: 'Services',
				name: 'sla_services_ui',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				required: true,
				displayOptions: {
					show: {
						resource: ['sla'],
						operation: ['compute'],
						slaInputMode: ['ui'],
					},
				},
				default: {},
				placeholder: 'Add Service',
				options: [
					{
						displayName: 'Service',
						name: 'service',
						values: [
							{
								displayName: 'Host Name',
								name: 'host_name',
								type: 'string',
								required: true,
								default: '',
								description: 'The hostname the service belongs to',
							},
							{
								displayName: 'Service Description',
								name: 'service_description',
								type: 'string',
								required: true,
								default: '',
								description: 'The service whose SLA data is to be computed (e.g., "CPU load")',
							},
						],
					},
				],
			},
			{
				displayName: 'Time Ranges',
				name: 'sla_time_ranges_ui',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				required: true,
				displayOptions: {
					show: {
						resource: ['sla'],
						operation: ['compute'],
						slaInputMode: ['ui'],
					},
				},
				default: {},
				placeholder: 'Add Time Range',
				options: [
					{
						displayName: 'Time Range',
						name: 'time_range',
						values: [
							{
								displayName: 'Range Type',
								name: 'range_type',
								type: 'options',
								options: [
									{ name: 'Pre-Defined', value: 'pre_defined' },
									{ name: 'Custom (JSON)', value: 'custom' },
								],
								default: 'pre_defined',
							},
							{
								displayName: 'Pre-Defined Range',
								name: 'range',
								type: 'options',
								displayOptions: {
									show: {
										range_type: ['pre_defined'],
									},
								},
								options: [
									{ name: 'Today', value: 'today' },
									{ name: 'Yesterday', value: 'yesterday' },
									{ name: 'This Week', value: 'this_week' },
									{ name: 'Last Week', value: 'last_week' },
									{ name: 'This Month', value: 'this_month' },
									{ name: 'Last Month', value: 'last_month' },
									{ name: 'This Year', value: 'this_year' },
									{ name: 'Last Year', value: 'last_year' },
								],
								default: 'today',
							},
							{
								displayName: 'Custom Range Config (JSON)',
								name: 'custom_config',
								type: 'json',
								displayOptions: {
									show: {
										range_type: ['custom'],
									},
								},
								default: '{"start": "2023-01-01T00:00:00Z", "end": "2023-01-31T23:59:59Z"}',
								description: 'Supply the custom properties (usually start and end) as JSON',
							},
						],
					},
				],
			},
			{
				displayName: 'SLA Compute Targets (JSON)',
				name: 'slaComputeTargetsJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['sla'],
						operation: ['compute'],
						slaInputMode: ['json'],
					},
				},
				default: '[\n  {\n    "sla_ids": ["sla_configuration_1"],\n    "services": [\n      { "host_name": "myhost", "service_description": "CPU load" }\n    ],\n    "time_ranges": [\n      { "range_type": "pre_defined", "range": "today" }\n    ]\n  }\n]',
				description: 'Array of SLA compute targets',
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
					{
						name: 'Archive',
						value: 'archive',
						description: 'Move audit log entries to archive',
						action: 'Move audit log entries to archive',
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
					{
						name: 'Get',
						value: 'get',
						description: 'Show an auxiliary tag',
						action: 'Get an auxiliary tag',
					},
				],
				default: 'getMany',
			},

			// ==================== HOST TAG GROUP OPERATIONS ==================== 29/01
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
						//CMK_CreateHostTagGroup
						name: 'Create',
						value: 'create',
						description: 'Create a host tag group',
						action: 'Create a host tag group',
					},
					{
						name: 'Show All',
						value: 'showAll',
						description: 'Get many host tag groups',
						action: 'Get many host tag groups',
					},
					{
						name: 'Show',
						value: 'show',
						description: 'Get a single host tag group',
						action: 'Get a single host tag group',
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
				default: 'showAll',
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
					{
						name: 'Get',
						value: 'get',
						description: 'Show an LDAP connection',
						action: 'Show an LDAP connection',
					},
				],
				default: 'getMany',
			},

			// ==================== LDAP CONNECTION FIELDS ====================
			{
				displayName: 'Connection ID',
				name: 'ldapConnectionId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ldapConnection'],
						operation: ['delete', 'update', 'get'],
					},
				},
				default: '',
				description: 'The ID of the LDAP connection (e.g., LDAP_1)',
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
						name: 'Delete a Notification Rule',
						value: 'delete',

						action: 'Delete a notification rule',
					},
					{
						name: 'Create a Notification Rule',
						value: 'create',

						action: 'Create a notification rule',
					},
					{
						name: 'Show All Notification Rules',
						value: 'showAll',

						action: 'Show all notification rules',
					},
					{
						name: 'Update a Notification Rule',
						value: 'update',

						action: 'Update a notification rule',
					},
					{
						name: 'Show a Notification Rule',
						value: 'show',

						action: 'Show a notification rule',
					},

				],
				default: 'showAll',
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

			// ----------------------------------
			//         Operation Definition
			// ----------------------------------
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
						name: 'Create',
						value: 'create',
						description: 'Create a BI aggregation',
						action: 'Create a BI aggregation',
					},
					{
						name: 'Get State',
						value: 'getState',
						description: 'Get the state of BI aggregations',
						action: 'Get the state of bi aggregations',
						routing: {
							request: {
								method: 'GET',
								url: '/domain-types/bi_aggregation/actions/aggregation_state/invoke',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a BI aggregation',
						action: 'Delete a BI aggregation',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a BI aggregation',
						action: 'Get a BI aggregation',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing BI aggregation',
						action: 'Update a BI aggregation',
					},


				],
				default: 'getState',
			},

			// ----------------------------------
			//         Additional Fields
			// ----------------------------------
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['getState'],
					},
				},
				options: [
					{
						displayName: 'Filter Names',
						name: 'filter_names',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: [],
						description: 'Filter by names',
						routing: {
							send: {
								type: 'query',
								property: 'filter_names',
							},
						},
					},
					{
						displayName: 'Filter Groups',
						name: 'filter_groups',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: [],
						description: 'Filter by group',
						routing: {
							send: {
								type: 'query',
								property: 'filter_groups',
							},
						},
					},
				],
			},
			// --- Parametros do BI Rule ---
			{
				displayName: 'Pack ID',
				name: 'pack_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				default: '',
				description: 'The identifier of the BI pack',
			},
			{
				displayName: 'Rule Arguments',
				name: 'rule_arguments',
				type: 'string',
				typeOptions: { multipleValues: true },
				required: true,
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				default: [],
				description: 'List of arguments for the rule',
			},
			{
				displayName: 'Aggregation Function',
				name: 'aggregationFunctionUi',
				type: 'collection',
				placeholder: 'Add Aggregation Config',
				default: {},
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				options: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Best', value: 'best' },
							{ name: 'Worst', value: 'worst' },
							{ name: 'Count OK', value: 'count_ok' },
						],
						default: 'best',
					},
					{
						displayName: 'Count',
						name: 'count',
						type: 'number',
						default: 1,
					},
					{
						displayName: 'Restrict State',
						name: 'restrict_state',
						type: 'options',
						options: [
							{ name: '0 (OK)', value: 0 },
							{ name: '1 (WARN)', value: 1 },
							{ name: '2 (CRIT)', value: 2 },
						],
						default: 2,
					},
				],
			},
			{
				displayName: 'Computation Options',
				name: 'computationOptionsUi',
				type: 'collection',
				placeholder: 'Add Computation Config',
				default: {},
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				options: [
					{
						displayName: 'Disabled',
						name: 'disabled',
						type: 'boolean',
						default: false,
					},
				],
			},
			{
				displayName: 'Node Visualization',
				name: 'nodeVisualizationUi',
				type: 'collection',
				placeholder: 'Add Node Visualization',
				default: {},
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				options: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'None', value: 'none' },
							{ name: 'Block', value: 'block' },
							{ name: 'Hierarchy', value: 'hierarchy' },
							{ name: 'Radial', value: 'radial' },
							{ name: 'Force', value: 'force' },
						],
						default: 'none',
					},
					{
						displayName: 'Style Config (JSON)',
						name: 'style_config',
						type: 'json',
						default: '{}',
					},
				],
			},
			{
				displayName: 'Properties',
				name: 'propertiesUi',
				type: 'collection',
				placeholder: 'Add Properties',
				default: {},
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Documentation URL',
						name: 'docu_url',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Icon',
						name: 'icon',
						type: 'string',
						default: '',
					},
					{
						displayName: 'State Messages (JSON)',
						name: 'state_messages',
						type: 'json',
						default: '{}',
					},
				],
			},
			{
				displayName: 'Nodes',
				name: 'nodesUi',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Node',
				default: {},
				displayOptions: {
					show: {
						resource: ['biRule'],
						operation: ['create','update'],
					},
				},
				options: [
					{
						displayName: 'Node',
						name: 'node',
						values: [
							{
								displayName: 'Search Type',
								name: 'search_type',
								type: 'options',
								options: [
									{ name: 'Empty', value: 'empty' },
								],
								default: 'empty',
							},
							{
								displayName: 'Action Type',
								name: 'action_type',
								type: 'options',
								options: [
									{ name: 'Call A Rule', value: 'call_a_rule' },
								],
								default: 'call_a_rule',
							},
							{
								displayName: 'Rule ID',
								name: 'rule_id',
								type: 'string',
								default: '',
								description: 'ID of the rule to call',
							},
							{
								displayName: 'Action Params (JSON)',
								name: 'action_params',
								type: 'json',
								default: '{}',
							},
						],
					},
				],
			},
			{
				displayName: 'Aggregation ID',
				name: 'aggregation_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['delete', 'get', 'create', 'update'],
					},
				},
				default: '',
				description: 'The ID of the BI aggregation',
			},
			{
				displayName: 'Pack ID',
				name: 'pack_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'The identifier of the BI pack',
			},
			{
				displayName: 'Pack ID',
				name: 'pack_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['biPack'],
						operation: ['delete','get','create','update',],
					},
				},
				default: '',
				description: 'The identifier of the BI pack',
			},

			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['biPack'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'The title of the BI pack',
			},
			{
				displayName: 'Contact Groups',
				name: 'contact_groups',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['biPack'],
						operation: ['create', 'update'],
					},
				},
				default: [],
				description: 'A list of contact group identifiers (e.g., "contact1", "contact2")',
			},
			{
				displayName: 'Public',
				name: 'public',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						resource: ['biPack'],
						operation: ['create', 'update'],
					},
				},
				default: false,
				description: 'Whether the BI pack should be public or not',
			},
			{
				displayName: 'Groups Configuration',
				name: 'groupsUi',
				type: 'collection',
				placeholder: 'Add Groups Config',
				default: {},
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Names',
						name: 'names',
						type: 'string',
						typeOptions: { multipleValues: true },
						default: [],
						description: 'List of group names',
					},
					{
						displayName: 'Paths (JSON)',
						name: 'paths',
						type: 'json',
						default: '[]',
						description: 'List of group paths (Array of Arrays). Example: [["path", "group", "a"], ["path", "group", "b"]].',
					},
				],
			},
			{
				displayName: 'Node Configuration',
				name: 'nodeUi',
				type: 'collection',
				placeholder: 'Add Node Config',
				default: {},
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Search Type',
						name: 'search_type',
						type: 'options',
						options: [
							{ name: 'Empty', value: 'empty' },
							{ name: 'Host Search', value: 'host_search' },
							{ name: 'Service Search', value: 'service_search' },
							{ name: 'Fixed Arguments', value: 'fixed_arguments' },
						],
						default: 'empty',
					},
					{
						displayName: 'Action Type',
						name: 'action_type',
						type: 'options',
						options: [
							{ name: 'Call A Rule', value: 'call_a_rule' },
							{ name: 'State Of Host', value: 'state_of_host' },
							{ name: 'State Of Service', value: 'state_of_service' },
							{ name: 'State Of Remaining Services', value: 'state_of_remaining_services' },
						],
						default: 'call_a_rule',
					},
					{
						displayName: 'Action Params (JSON)',
						name: 'action_params',
						type: 'json',
						default: '{}',
						description: 'Additional parameters for the action (e.g., {"host_regex": "", "rule_id": "my_rule"})',
					},
				],
			},
			{
				displayName: 'Aggregation Visualization',
				name: 'visualizationUi',
				type: 'collection',
				placeholder: 'Add Visualization',
				default: {},
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Ignore Rule Styles',
						name: 'ignore_rule_styles',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Layout ID',
						name: 'layout_id',
						type: 'string',
						default: 'builtin_default',
					},
					{
						displayName: 'Line Style',
						name: 'line_style',
						type: 'string',
						default: 'round',
					},
				],
			},
			{
				displayName: 'Computation Options',
				name: 'computationUi',
				type: 'collection',
				placeholder: 'Add Computation',
				default: {},
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Disabled',
						name: 'disabled',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Use Hard States',
						name: 'use_hard_states',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Escalate Downtimes As Warn',
						name: 'escalate_downtimes_as_warn',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Freeze Aggregations',
						name: 'freeze_aggregations',
						type: 'boolean',
						default: false,
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['biAggregation'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Customer',
						name: 'customer',
						type: 'string',
						default: '',
					},
				],
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
						name: 'Start Background Scan',
						value: 'start',
						description: 'Start the parent scan background job',
						action: 'Start a parent scan',
					},
				],
				default: 'start',
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
						name: 'Create',
						value: 'create',
						description: 'Create a password',
						action: 'Create a password',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many passwords',
						action: 'Get many passwords',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a password',
						action: 'Delete a password',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single password',
						action: 'Get a password',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a password',
						action: 'Update a password',
					},
				],
				default: 'getMany',
			},

			// ==================== PARENT SCAN FIELDS ====================
			{
				displayName: 'Hostnames',
				name: 'hostNames',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['parentScan'],
						operation: ['start'],
					},
				},
				default: '',
				placeholder: 'host1, host2',
				description: 'Comma-separated list of host names to scan',
			},
			{
				displayName: 'Gateway Hosts Option',
				name: 'gatewayOption',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['parentScan'],
						operation: ['start'],
					},
				},
				options: [
					{ name: 'No Gateway Hosts', value: 'no_gateway_hosts' },
					{ name: 'Create in Folder', value: 'create_in_folder' },
					{ name: 'Create in Host Location', value: 'create_in_host_location' },
				],
				default: 'no_gateway_hosts',
				description: 'How to handle gateway hosts creation',
			},
			{
				displayName: 'Scan Configuration',
				name: 'scanConfig',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['parentScan'],
						operation: ['start'],
					},
				},
				options: [
					{
						displayName: 'Force Explicit Parents',
						name: 'force_explicit_parents',
						type: 'boolean',
						default: false,
						description: 'Force explicit setting for parents even if setting matches that of the folder',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'responses_timeout',
						type: 'number',
						default: 8,
						description: 'Timeout for responses',
					},
					{
						displayName: 'Hop Probes',
						name: 'hop_probes',
						type: 'number',
						default: 2,
						description: 'Number of probes per hop',
					},
					{
						displayName: 'Max Gateway Distance (TTL)',
						name: 'max_gateway_distance',
						type: 'number',
						default: 10,
						description: 'Maximum distance (TTL) to gateway',
					},
					{
						displayName: 'Ping Probes',
						name: 'ping_probes',
						type: 'number',
						default: 5,
						description: 'Number of ping probes',
					},
				],
			},
			//Password update fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['password'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Password',
						name: 'password',
						type: 'string',
						typeOptions: { password: true },
						default: '',
					},
					{
						displayName: 'Customer',
						name: 'customer',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Documentation URL',
						name: 'documentation_url',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Editable By',
						name: 'editable_by',
						type: 'string',
						default: '',
						description: 'Group of users able to edit this password',
					},
					{
						displayName: 'Shared With',
						name: 'shared',
						type: 'string',
						default: '',
						description: 'Comma-separated list (e.g. "admin, user")',
					},
				],
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
						name: 'Get',
						value: 'get',
						description: 'Show a ruleset',
						action: 'Show a ruleset',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many rulesets',
						action: 'Get many rulesets',
					},
					{
						name: 'Search Rule Sets',
						value: 'search',
						description: 'Search rule sets with filters',
						action: 'Search rule sets',
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
						name: 'Delete',
						value: 'delete',
						description: 'Delete a SAML connection',
						action: 'Delete a SAML connection',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Show a SAML connection',
						action: 'Get a SAML connection',
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
						description: 'Get all user roles',
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
					{
						name: 'Clone',
						value: 'clone',
						description: 'Clone an existing user role',
						action: 'Clone a user role',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a single user role',
						action: 'Get a user role',
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
			// ==================== PASSWORD FIELDS ====================
			{
				displayName: 'Password ID',
				name: 'ident',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['password'],
						operation: ['create', 'delete', 'get', 'update'],
					},
				},
				default: '',
				description: 'The unique identifier for the password',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['password'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The name of your password for easy recognition',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true, 
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['password'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The password string',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['password'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
						description: 'An optional comment',
					},
					{
						displayName: 'Documentation URL',
						name: 'documentation_url',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Editable By',
						name: 'editable_by',
						type: 'string',
						default: '',
						description: 'Group of users able to edit this password (e.g. "admin")',
					},
					{
						displayName: 'Shared With',
						name: 'shared',
						type: 'string',
						default: '',
						description: 'Comma-separated list of groups/users to share with (e.g. "all")',
					},
				],
			},
			// ==================== UPDATE FIELDS COLLECTION ====================
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['userRole'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'New Role ID',
						name: 'new_role_id',
						type: 'string',
						default: '',
						description: 'New ID for the user role (must be unique)',
					},
					{
						displayName: 'New Alias',
						name: 'new_alias',
						type: 'string',
						default: '',
						description: 'New display name for the user role',
					},
					{
						displayName: 'New Based On',
						name: 'new_basedon',
						type: 'string',
						default: 'guest',
						description: 'A built-in user role that you want this role to be based on (e.g. "guest", "user", "admin")',
					},
					{
						displayName: 'New Permissions',
						name: 'new_permissions_ui',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Set specific permissions to yes, no, or default',
						options: [
							{
								displayName: 'Permissions',
								name: 'permissionsValues',
								values: [
									{
										displayName: 'Permission Name',
										name: 'name',
										type: 'string',
										default: '',
										placeholder: 'e.g. general.edit_profile',
										description: 'The internal name of the permission',
									},
									{
										displayName: 'State',
										name: 'state',
										type: 'options',
										options: [
											{ name: 'Yes', value: 'yes' },
											{ name: 'No', value: 'no' },
											{ name: 'Default', value: 'default' },
										],
										default: 'yes',
									},
								],
							},
						],
					},
				],
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
			// --- Configuration Fields for Set Acknowledgement ---
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Comment to be stored alongside the acknowledgement',
			},
			{
				displayName: 'Sticky',
				name: 'sticky',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create'],
					},
				},
				default: true,
				description: 'If set, only a state-change to the UP/OK state will discard the acknowledgement',
			},
			{
				displayName: 'Notify',
				name: 'notify',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create'],
					},
				},
				default: true,
				description: 'If set, notifications will be sent out to the configured contacts',
			},
			{
				displayName: 'Persistent',
				name: 'persistent',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create'],
					},
				},
				default: false,
				description: 'If set, the comment will persist a restart',
			},
			{
				displayName: 'Expire On',
				name: 'expire_on',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'If set, the acknowledgement will expire at this time. The timezone will default to UTC.',
			},
			// ==================== EVENT CONSOLE SPECIFIC FIELDS ====================

			// ==================== EVENT CONSOLE ARCHIVE FIELDS ====================
			{
				displayName: 'Filter Type',
				name: 'filter_type_archive',
				type: 'options',
				required: true,
				options: [
					{
						name: 'By ID',
						value: 'by_id',
						description: 'Target a specific event by its ID and Site ID',
					},
					{
						name: 'Parameters',
						value: 'params',
						description: 'Filter events based on specific parameters (JSON)',
					},
					{
						name: 'Query (Livestatus)',
						value: 'query',
						description: 'Filter events using a raw Livestatus query expression',
					},
				],
				default: 'by_id',
				description: 'The way you would like to filter events',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['archive'], // Adicione suas operações aqui
					},
				},
			},
			{
				displayName: 'Event ID',
				name: 'event_id',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_archive: ['by_id'],
					},
				},
			},
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_archive: ['by_id'],
					},
				},
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_archive: ['query'],
					},
				},
				description: 'Nested dictionary Livestatus query',
			},
			{
				displayName: 'Filters (JSON)',
				name: 'filters',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_archive: ['params'],
					},
				},
				description: 'JSON object defining the filter parameters',
			},			
			// ==================== EVENT CONSOLE CHANGE STATE FIELDS ====================
			{
				displayName: 'Event ID',
				name: 'event_id',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['changeState'],
					},
				},
			},
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['changeState']
					}
				},
				default: '',
				description: 'An existing site ID'
			},
			{
				displayName: 'New State',
				name: 'new_state',
				type: 'options',
				required: true,
				options: [
					{ 
						name: 'OK',
						value: 'ok' 
					},
					{
						name: 'WARNING',
						 value: 'warning' 
					},
					{
						name: 'CRITICAL',
						 value: 'critical' 
					},
					{
						name: 'UNKNOWN',
						 value: 'unknown' 
					},
				],
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['changeState']
					}
				},
				default: 'ok',
				description: 'The state'
			},
			// ==================== EVENT CONSOLE CHANGE MULTIPLE STATES FIELDS ====================
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['changeMultipleStates']
					}
				},
				default: '',
				description: 'An existing site ID'
			},
			{
				displayName: 'New State',
				name: 'new_state',
				type: 'options',
				required: true,
				options: [
					{ 
						name: 'OK',
						value: 'ok' 
					},
					{
						name: 'WARNING',
						 value: 'warning' 
					},
					{
						name: 'CRITICAL',
						 value: 'critical' 
					},
					{
						name: 'UNKNOWN',
						 value: 'unknown' 
					},
				],
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['changeMultipleStates']
					}
				},
				default: 'ok',
				description: 'The state'
			},
			{
				displayName: 'Filter Type',
				name: 'filter_type_change', // MESMO NOME!
				type: 'options',
				options: [
					{ name: 'Parameters', value: 'params', description: 'Filter events based on specific parameters (JSON)' },
					{ name: 'Query (Livestatus)', value: 'query', description: 'Filter events using a raw Livestatus query' },
				],
				default: 'params', // Default diferente
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['changeMultipleStates'], // Operação Bulk
					},
				},
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_change: ['query'],
					},
				},
				description: 'Nested dictionary Livestatus query',
			},
			{
				displayName: 'Filters (JSON)',
				name: 'filters',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_change: ['params'],
					},
				},
				description: 'JSON object defining the filter parameters',
			},	
			// ==================== EVENT CONSOLE SHOW AN EVENT FIELDS ====================
			{
				displayName: 'Event ID',
				name: 'event_id',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['show'],
					},
				},
			},
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['show']
					}
				},
				default: '',
				description: 'An existing site ID'
			},
			// ==================== EVENT CONSOLE SHOW EVENTS FIELDS ====================
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['showEvents']
					}
				},
				default: '',
				description: 'An existing site ID'
			},
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['showEvents']
					}
				},
				default: '',
				description: 'The host name. No exception is raised when the specified host name does not exist.'
			},
			{
				displayName: 'Application',
				name: 'application',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['showEvents']
					}
				},
				default: '',
				description: 'Show events that originated from this app'
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['showEvents']
					}
				},
				options: [
					{
						name: 'OK',
						value: 'ok'
					},
					{
						name: 'WARNING',
						value: 'warning'
					},
					{
						name: 'CRITICAL',
						value: 'critical'
					},
					{
						name: 'UNKNOWN',
						value: 'unknown'
					}
				],
				default: 'ok',
				description: 'Show events that originated from this app'
			},
			{
				displayName: 'Phase',
				name: 'phase',
				type: 'options',
				options: [
					{ 
						name: 'ACK',
						value: 'ack' 
					},
					{
						name: 'OPEN',
						 value: 'open' 
					},
				],
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['showEvents']
					}
				},
				default: 'ack',
				description: 'To change the phase of an event'
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['showEvents'],
					},
				},
				description: 'Nested dictionary Livestatus query',
			},
			// ==================== EVENT CONSOLE UPDATE EVENT FIELDS ====================
			{
				displayName: 'Event ID',
				name: 'event_id',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvent'],
					},
				},
			},
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvent'],
					},
				},
			},
			{
				displayName: 'Change Comment',
				name: 'change_comment',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvent'],
					},
				},
				default: '',
				description: 'Event comment',
			},
			{
				displayName: 'Change Contact',
				name: 'change_contact',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvent'],
					},
				},
				default: '',
				description: 'Contact information',
			},
			{
				displayName: 'Phase',
				name: 'phase',
				type: 'options',
				options: [
					{ 
						name: 'ACK',
						value: 'ack' 
					},
					{
						name: 'OPEN',
						 value: 'open' 
					},
				],
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvent']
					}
				},
				default: 'ack',
				description: 'To change the phase of an event'
			},
			// ==================== EVENT CONSOLE UPDATE EVENTS FIELDS ====================
			{
				displayName: 'Site ID',
				name: 'site_id',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvents'],
					},
				},
			},
			{
				displayName: 'Change Comment',
				name: 'change_comment',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvents'],
					},
				},
				default: '',
				description: 'Event comment',
			},
			{
				displayName: 'Change Contact',
				name: 'change_contact',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvents'],
					},
				},
				default: '',
				description: 'Contact information',
			},
			{
				displayName: 'Phase',
				name: 'phase',
				type: 'options',
				options: [
					{ 
						name: 'ACK',
						value: 'ack' 
					},
					{
						name: 'OPEN',
						 value: 'open' 
					},
				],
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvents']
					}
				},
				default: 'ack',
				description: 'To change the phase of an event'
			},
			{
				displayName: 'Filter Type',
				name: 'filter_type_update', // MESMO NOME!
				type: 'options',
				options: [
					{ name: 'Parameters', value: 'params', description: 'Filter events based on specific parameters (JSON)' },
					{ name: 'Query (Livestatus)', value: 'query', description: 'Filter events using a raw Livestatus query' },
					{ name: 'All', value: 'all', description: 'Update all events' },
				],
				default: 'all', // Default diferente
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						operation: ['updateEvents'], // Operação Bulk
					},
				},
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_update: ['query'],
					},
				},
				description: 'Nested dictionary Livestatus query',
			},
			{
				displayName: 'Filters (JSON)',
				name: 'params',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['eventConsole'],
						filter_type_update: ['params'],
					},
				},
				description: 'JSON object defining the filter parameters',
			},	
			// --- Inputs for Comment Operations ---
			{
				displayName: 'Comment ID',
				name: 'commentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['get', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the comment',
			},
			// --- Inputs for Create Comment ---
			{
				displayName: 'Comment Type',
				name: 'commentType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Host',
						value: 'host',
						description: 'Add a comment to a specific host',
					},
					{
						name: 'Host Group',
						value: 'host_group',
						description: 'Add a comment to all hosts in a group',
					},
					{
						name: 'Host by Query',
						value: 'host_by_query',
						description: 'Add a comment to hosts matching a Livestatus query',
					},
					{
						name: 'Service',
						value: 'service',
						description: 'Add a comment to a specific service on a host',
					},
					{
						name: 'Service by Query',
						value: 'service_by_query',
						description: 'Add a comment to services matching a Livestatus query',
					},
				],
				default: 'host',
				description: 'Select the target type for the comment',
			},
			{
				displayName: 'Service Description',
				name: 'service_description',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['serviceStatus', 'metric', 'comment', 'acknowledge'], 
						operation: ['show', 'getMetrics', 'create', 'remove'], 
                        acknowledge_type: ['service'],
					},
				},
				default: '',
			},
			{
				displayName: 'Host Group',
				name: 'host_group_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
						commentType: ['host_group'],
					},
				},
				default: '',
				description: 'The host group name',
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
						commentType: ['host_by_query', 'service_by_query'],
					},
				},
				default: '{}',
				description: 'Livestatus query expression (e.g. {"op": "=", "left": "name", "right": "myhost"})',
			},
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The text content of the comment',
			},
			{
				displayName: 'Persistent',
				name: 'persistent',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['comment'],
						operation: ['create'],
					},
				},
				default: false,
				description: 'Whether the comment should persist after a restart',
			},
			// ==================== CONTACT GROUP BULK DELETE FIELDS ====================
			{
				displayName: 'Contact Group Names',
				name: 'contactGroupNames',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_delete'],
					},
				},
				default: '',
				placeholder: 'windows, panels, linux_admins',
				description: 'Comma-separated list of contact group names to delete',
			},
			// ==================== METRIC GET FIELDS ====================
			{
				displayName: 'Metric Type',
				name: 'metric_type',
				type: 'options',
				options: [
					{ name: 'Predefined Graph', value: 'predefined_graph' },
					{ name: 'Single Metric', value: 'single_metric' },
				],
				default: 'predefined_graph',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
					},
				},
				description: 'Specify whether you want to receive a single metric or a predefined graph',
			},
			{
				displayName: 'Graph ID',
				name: 'graph_id',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
						metric_type: ['predefined_graph'],
					},
				},
				description: 'The ID of the predefined graph',
			},
			{
				displayName: 'Metric ID',
				name: 'metric_id',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
						metric_type: ['single_metric'],
					},
				},
				description: 'The ID of the single metric',
			},
			{
				displayName: 'Start Time',
				name: 'start_time',
				type: 'dateTime',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
					},
				},
				description: 'The approximate time of the first sample',
			},
			{
				displayName: 'End Time',
				name: 'end_time',
				type: 'dateTime',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
					},
				},
				description: 'The approximate time of the last sample',
			},
			{
				displayName: 'Reduce',
				name: 'reduce',
				type: 'options',
				options: [
					{ name: 'Average', value: 'average' },
					{ name: 'Max', value: 'max' },
					{ name: 'Min', value: 'min' },
				],
				default: 'average',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
					},
				},
				description: 'Specify how to reduce a segment of data points to a single data point',
			},
			{
				displayName: 'Site',
				name: 'site',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getMetrics'],
					},
				},
				description: 'The name of the site. Specifying a site will greatly improve performance.',
			},
			// ==================== METRIC STATUS FIELDS END ====================
			// ==================== CONTACT GROUP BULK CREATE FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'contactGroupCreateMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_create'],
					},
				},
				options: [
					{
						name: 'Manual Entries (UI)',
						value: 'ui',
						description: 'Add contact groups manually using the interface',
					},
					{
						name: 'JSON (Dynamic)',
						value: 'json',
						description: 'Pass a raw JSON array of entries',
					},
				],
				default: 'ui',
				description: 'Choose how to provide the contact groups to create',
			},

			// MODO UI: Fixed Collection
			{
				displayName: 'Entries',
				name: 'contactGroupEntries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Contact Group',
				default: {},
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_create'],
						contactGroupCreateMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name (ID)',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The internal identifier (e.g. "on_call")',
							},
							{
								displayName: 'Alias',
								name: 'alias',
								type: 'string',
								required: true,
								default: '',
								description: 'The display name (e.g. "On Call Team")',
							},
						],
					},
				],
			},

			// MODO JSON
			{
				displayName: 'Entries JSON',
				name: 'contactGroupEntriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_create'],
						contactGroupCreateMode: ['json'],
					},
				},
				default: '[]',
				description: 'Array of objects. Example: [{"name": "cg1", "alias": "CG 1", "customer": "provider"}].',
			},
			// ==================== END CONTACT GROUP BULK CREATE FIELDS ====================
			// ==================== CONTACT GROUP BULK UPDATE FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'contactGroupUpdateMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_update'],
					},
				},
				options: [
					{
						name: 'Manual Entries (UI)',
						value: 'ui',
						description: 'Update contact groups manually using the interface',
					},
					{
						name: 'JSON (Dynamic)',
						value: 'json',
						description: 'Pass a raw JSON array of entries',
					},
				],
				default: 'ui',
				description: 'Choose how to provide the contact groups to update',
			},

			{
				displayName: 'Entries',
				name: 'contactGroupUpdateEntries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Contact Group Update',
				default: {},
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_update'],
						contactGroupUpdateMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name (ID)',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The internal identifier of the contact group to update',
							},
							{
								displayName: 'New Alias',
								name: 'alias',
								type: 'string',
								default: '',
								description: 'The new display name (optional)',
							},
							{
								displayName: 'Inventory Paths Policy',
								name: 'inventoryPathsType',
								type: 'options',
								options: [
									{ name: 'Ignore (Do Not Change)', value: '' }, // Opção para não alterar
									{ name: 'Allow All', value: 'allow_all' },
									{ name: 'Forbid All', value: 'forbid_all' },
									{ name: 'Specific Paths', value: 'specific_paths' },
								],
								default: '',
								description: 'Update the HW/SW Inventory paths permissions',
							},
							{
								displayName: 'Specific Paths Config',
								name: 'specificPathsUi',
								type: 'fixedCollection',
								typeOptions: { multipleValues: true },
								displayOptions: {
									show: {
										inventoryPathsType: ['specific_paths'],
									},
								},
								default: {},
								description: 'Define the specific paths and their restrictions',
								options: [
									{
										displayName: 'Path Entry',
										name: 'pathEntry',
										values: [
									{
										displayName: 'Attributes Allowed Values',
										name: 'attributesValues',
										type: 'string',
										default: '',
										description: 'Comma-separated values to be allowed',
									},
									{
										displayName: 'Attributes Restriction',
										name: 'attributesType',
										type: 'options',
										options: [
													{
												name: 'No Restriction',
												value: 'no_restriction',
													},
													{
												name: 'Restrict All',
												value: 'restrict_all',
													},
													{
												name: 'Restrict Specific Values',
												value: 'restrict_values',
													},
												],
										default: 'no_restriction',
									},
									{
										displayName: 'Columns Allowed Values',
										name: 'columnsValues',
										type: 'string',
										default: '',
										description: 'Comma-separated values to be allowed',
									},
									{
										displayName: 'Columns Restriction',
										name: 'columnsType',
										type: 'options',
										options: [
													{
												name: 'No Restriction',
												value: 'no_restriction',
													},
													{
												name: 'Restrict All',
												value: 'restrict_all',
													},
													{
												name: 'Restrict Specific Values',
												value: 'restrict_values',
													},
											],
										default: 'no_restriction',
									},
									{
										displayName: 'Nodes Allowed Values',
										name: 'nodesValues',
										type: 'string',
										default: '',
										description: 'Comma-separated values to be allowed',
									},
									{
										displayName: 'Nodes Restriction',
										name: 'nodesType',
										type: 'options',
										options: [
													{
												name: 'No Restriction',
												value: 'no_restriction',
													},
													{
												name: 'Restrict All',
												value: 'restrict_all',
													},
													{
												name: 'Restrict Specific Values',
												value: 'restrict_values',
													},
											],
										default: 'no_restriction',
									},
									{
										displayName: 'Path',
										name: 'path',
										type: 'string',
											required:	true,
										default: '',
										description: 'Path to category (e.g.	/software)',
									},
					],
									},
								],
							},
						],
					},
				],
			},

			// MODO JSON
			{
				displayName: 'Entries JSON',
				name: 'contactGroupUpdateEntriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['bulk_update'],
						contactGroupUpdateMode: ['json'],
					},
				},
				default: '[]',
				description: 'Array of objects. Example: [{"name": "cg1", "attributes": {"alias": "New Name"}}].',
			},

			// ==================== END CONTACT GROUP BULK UPDATE FIELDS ====================
			// ==================== HOST STATUS FIELDS ====================
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['hostStatus'],
						operation: ['get','getMany','getForHost'],
					},
				},
				default: '',
				placeholder: 'name,state,last_check',
				description: 'Comma-separated list of columns to retrieve. If empty, returns default columns.',
			},
			{
				displayName: 'Sites',
				name: 'sites',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['hostStatus'],
						operation: ['getMany','getForHost'],
					},
				},
				default: '',
				placeholder: 'heute, site_b',
				description: 'Comma-separated list of sites to restrict the query. Leave empty for all.',
			},
			{
				displayName: 'Query Mode',
				name: 'queryMode',
				type: 'options',
				options: [
					{ name: 'Simple Builder', value: 'builder' },
					{ name: 'Raw JSON', value: 'json' },
				],
				default: 'builder',
				displayOptions: {
					show: {
						resource: ['hostStatus',],
						operation: ['getMany', 'showAll', 'showHost'],
					},
				},
				description: 'Choose "Simple Builder" for standard filtering or "Raw JSON" for complex nested queries (AND inside OR)',
			},
			// --- OPÇÃO 2: QUERY BUILDER VISUAL ---
			{
				displayName: 'Logical Operator',
				name: 'globalOperator',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['hostStatus'],
						operation: ['getMany','getForHost'],
						queryMode: ['builder'],
					},
				},
				options: [
					{ name: 'AND (Match All)', value: 'and' },
					{ name: 'OR (Match Any)', value: 'or' },
				],
				default: 'and',
				description: 'How to combine the conditions below',
			},
			{
				displayName: 'Conditions',
				name: 'conditionsUi',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['hostStatus'],
						operation: ['getMany','getForHost'],
						queryMode: ['builder'],
					},
				},
				default: {},
				placeholder: 'Add Condition',
				options: [
					{
						displayName: 'Condition',
						name: 'rules',
						values: [
							{
								displayName: 'Field',
								name: 'left',
								type: 'string',
								default: 'name',
								description: 'The column to check (e.g. name, state)',
							},
							{
										displayName: 'Operator',
										name: 'op',
										type: 'options',
										default: '=',
										options: [
											{ name: '= (Equal)', value: '=' },
											{ name: '!= (Not Equal)', value: '!=' },
											{ name: '~ (Regex Match)', value: '~' },
											{ name: '!~ (Regex No Match)', value: '!~' },
											{ name: '~~ (Case Insensitive Regex)', value: '~~' },
											{ name: '!~~ (No Case Insensitive Regex)', value: '!~~' },
											{ name: '< (Less Than)', value: '<' },
											{ name: '> (Greater Than)', value: '>' },
											{ name: '<= (Less or Equal)', value: '<=' },
											{ name: '>= (Greater or Equal)', value: '>=' },
											{ name: '!< (Not Less Than)', value: '!<' },
											{ name: '!> (Not Greater Than)', value: '!>' },
											{ name: '!<= (Not Less or Equal)', value: '!<=' },
											{ name: '!>= (Not Greater or Equal)', value: '!>=' },
										],
									},
							{
								displayName: 'Value',
								name: 'right',
								type: 'string',
								default: '',
								description: 'The value to compare against',
							},
						],
					},
				],
			},
			// ==================== AUDIT LOG FIELDS ====================
			{
				displayName: 'Since Date',
				name: 'date',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['auditLog'],
						operation: ['getMany'],
					},
				},
				default: '',
				description: 'The date from which to obtain the audit log entries (ISO 8601)',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['auditLog'],
						operation: ['getMany'],
					},
				},
				options: [
					{
						displayName: 'Object Type',
						name: 'object_type',
						type: 'options',
						options: [
							{ name: 'All', value: 'All' },
							{ name: 'None', value: 'None' },
							{ name: 'Folder', value: 'Folder' },
							{ name: 'Host', value: 'Host' },
							{ name: 'User', value: 'User' },
							{ name: 'Rule', value: 'Rule' },
							{ name: 'Ruleset', value: 'Ruleset' },
						],
						default: 'All',
						description: 'The type of object we want to filter on',
					},
					{
						displayName: 'Object ID',
						name: 'object_id',
						type: 'string',
						default: '',
						description: 'Name of an object to filter by (e.g. host_01)',
					},
					{
						displayName: 'User ID',
						name: 'user_id',
						type: 'string',
						default: '',
						description: 'A username to filter by',
					},
					{
						displayName: 'Regex',
						name: 'regexp',
						type: 'string',
						default: '',
						description: 'A regular expression to be applied to the user_id, action and summary fields',
					},
				],
			},
			// ==========================================================
			// ==================== METRIC CUSTOM GRAPH FIELDS ====================
			{
				displayName: 'Custom Graph ID',
				name: 'custom_graph_id',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getCustomGraph'],
					},
				},
				description: 'The ID of the requested custom graph',
			},
			{
				displayName: 'Start Time',
				name: 'start_time',
				type: 'dateTime',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getCustomGraph'],
					},
				},
				description: 'The approximate time of the first sample',
			},
			{
				displayName: 'End Time',
				name: 'end_time',
				type: 'dateTime',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getCustomGraph'],
					},
				},
				description: 'The approximate time of the last sample',
			},
			{
				displayName: 'Reduce',
				name: 'reduce',
				type: 'options',
				options: [
					{ name: 'Average', value: 'average' },
					{ name: 'Max', value: 'max' },
					{ name: 'Min', value: 'min' },
				],
				default: 'average',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['getCustomGraph'],
					},
				},
				description: 'Specify how to reduce a segment of data points to a single data point',
			},
			{
				displayName: 'Host Name',
				name: 'host_name', 
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['acknowledge'],
						operation: ['create', 'remove'],
						acknowledge_type: ['host', 'service'],
					},
				},
				default: '',
				description: 'The name of the host',
			},
			// ==================== FIELDS SECTION ====================
			// Common fields used across multiple resources
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostGroup', 'serviceGroup', 'contactGroup', 'timePeriod'],
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
				required: true,
				displayOptions: {
					show: {
						resource: ['serviceGroup', 'hostGroup', 'contactGroup','timePeriod'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Alias/display name',
			},
			{
				displayName: 'Inventory Paths Policy',
				name: 'inventoryPathsType',
				type: 'options',
				options: [
					{ name: 'Allow All', value: 'allow_all' },
					{ name: 'Forbid All', value: 'forbid_all' },
					{ name: 'Specific Paths', value: 'specific_paths' },
				],
				default: 'allow_all',
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['create', 'update'],
					},
				},
				description: 'Define the HW/SW Inventory paths permissions',
			},
			{
				displayName: 'Specific Paths Config',
				name: 'specificPathsUi',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						resource: ['contactGroup'],
						operation: ['create', 'update'],
						inventoryPathsType: ['specific_paths'],
					},
				},
				default: {},
				description: 'Define the specific paths and their restrictions',
				options: [
					{
						displayName: 'Path Entry',
						name: 'pathEntry',
						values: [
							{
						displayName: 'Attributes Allowed Values',
						name: 'attributesValues',
						type: 'string',
						default: '',
						description: 'Comma-separated values to be allowed',
							},
							{
						displayName: 'Attributes Restriction',
						name: 'attributesType',
						type: 'options',
						options: [
									{
										name: 'No Restriction',
										value: 'no_restriction',
									},
									{
										name: 'Restrict All',
										value: 'restrict_all',
									},
									{
										name: 'Restrict Specific Values',
										value: 'restrict_values',
									},
								],
						default: 'no_restriction',
							},
							{
						displayName: 'Columns Allowed Values',
						name: 'columnsValues',
						type: 'string',
						default: '',
						description: 'Comma-separated values to be allowed',
							},
							{
						displayName: 'Columns Restriction',
						name: 'columnsType',
						type: 'options',
						options: [
									{
										name: 'No Restriction',
										value: 'no_restriction',
									},
									{
										name: 'Restrict All',
										value: 'restrict_all',
									},
									{
										name: 'Restrict Specific Values',
										value: 'restrict_values',
									},
					],
						default: 'no_restriction',
							},
							{
						displayName: 'Nodes Allowed Values',
						name: 'nodesValues',
						type: 'string',
						default: '',
						description: 'Comma-separated values to be allowed',
							},
							{
						displayName: 'Nodes Restriction',
						name: 'nodesType',
						type: 'options',
						options: [
									{
										name: 'No Restriction',
										value: 'no_restriction',
									},
									{
										name: 'Restrict All',
										value: 'restrict_all',
									},
									{
										name: 'Restrict Specific Values',
										value: 'restrict_values',
									},
					],
						default: 'no_restriction',
							},
							{
						displayName: 'Path',
						name: 'path',
						type: 'string',
							required:	true,
						default: '',
						description: 'Path to category (e.g.	/software)',
							},
					],
					},
				],
			},
			{
				displayName: 'Host Name',
				name: 'hostName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['host', 'service', 'discovery','hostStatus','metric'],
						operation: ['create', 'delete', 'get', 'move', 'rename', 'update', 'create_cluster', 'update_cluster_nodes', 'getForHost', 'getMetrics', 'run', 'showResult', 'showLast', 'wait', 'remove'],
					},
				},
				default: '',
				description: 'Name of the host',
			},

			// ==================== DISCOVERY BULK FIELDS ====================
			{
				displayName: 'Hostnames',
				name: 'hostNames',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['bulkDiscovery'],
					},
				},
				default: '',
				placeholder: 'host1, host2, host3',
				description: 'Comma-separated list of host names to discover',
			},
			// 1. O Objeto "options" da API (Regras do Discovery)
			{
				displayName: 'Discovery Options',
				name: 'discoveryOptions',
				type: 'collection',
				placeholder: 'Configure Rules',
				default: {},
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['bulkDiscovery'],
					},
				},
				description: 'Configuration for the discovery logic (services to add/remove)',
				options: [
					{
						displayName: 'Monitor Undecided Services',
						name: 'monitor_undecided_services',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Remove Vanished Services',
						name: 'remove_vanished_services',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Update Service Labels',
						name: 'update_service_labels',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Update Service Parameters',
						name: 'update_service_parameters',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Update Host Labels',
						name: 'update_host_labels',
						type: 'boolean',
						default: false,
					},
				],
			},
			// 2. Os campos da Raiz (Configuração do Job)
			{
				displayName: 'Job Configuration',
				name: 'jobConfiguration',
				type: 'collection',
				placeholder: 'Configure Job',
				default: {},
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['bulkDiscovery'],
					},
				},
				description: 'Configuration for the execution of the job',
				options: [
					{
						displayName: 'Do Full Scan',
						name: 'do_full_scan',
						type: 'boolean',
						default: true,
						description: 'Whether to perform a full scan or not',
					},
					{
						displayName: 'Bulk Size',
						name: 'bulk_size',
						type: 'number',
						default: 10,
						description: 'The number of hosts to be handled at once',
					},
					{
						displayName: 'Ignore Errors',
						name: 'ignore_errors',
						type: 'boolean',
						default: true,
						description: 'Whether to ignore errors in single check plug-ins',
					},
				],
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['run'],
					},
				},
				default: 'fix_all',
				options: [
					{ name: 'New', value: 'new', description: 'Monitor undecided services' },
					{ name: 'Remove', value: 'remove', description: 'Remove vanished services' },
					{ name: 'Fix All', value: 'fix_all', description: 'Accept all' },
					{ name: 'Refresh', value: 'refresh', description: 'Rescan (starts background job)' },
					{ name: 'Only Host Labels', value: 'only_host_labels', description: 'Update host labels' },
					{ name: 'Only Service Labels', value: 'only_service_labels', description: 'Update service labels' },
					{ name: 'Tabula Rasa', value: 'tabula_rasa', description: 'Remove all and find new (starts background job)' },
				],
				description: "Discovery mode to use. 'refresh' and 'tabula_rasa' start background jobs and redirect to wait-for-completion.",
			},
			{
				displayName: 'Target Phase',
				name: 'target_phase',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['update'],
					},
				},
				default: 'active',
				options: [
					{ name: 'Active', value: 'active', description: 'Service is actively monitored' },
					{ name: 'Changed', value: 'changed', description: 'Service configuration has changed' },
					{ name: 'Clustered Ignored', value: 'clustered_ignored', description: 'Clustered service that is ignored' },
					{ name: 'Clustered Monitored', value: 'clustered_monitored', description: 'Clustered service that is monitored' },
					{ name: 'Clustered Undecided', value: 'clustered_undecided', description: 'Clustered service awaiting decision' },
					{ name: 'Clustered Vanished', value: 'clustered_vanished', description: 'Clustered service that has vanished' },
					{ name: 'Custom', value: 'custom', description: 'Service with custom configuration' },
					{ name: 'Ignored', value: 'ignored', description: 'Service is ignored' },
					{ name: 'Ignored Active', value: 'ignored_active', description: 'Previously active service that is now ignored' },
					{ name: 'Ignored Custom', value: 'ignored_custom', description: 'Custom service that is ignored' },
					{ name: 'Legacy', value: 'legacy', description: 'Legacy service configuration' },
					{ name: 'Legacy Ignored', value: 'legacy_ignored', description: 'Legacy service that is ignored' },
					{ name: 'Manual', value: 'manual', description: 'Service configured manually' },
					{ name: 'Monitored', value: 'monitored', description: 'Service is monitored' },
					{ name: 'Removed', value: 'removed', description: 'Service has been removed' },
					{ name: 'Undecided', value: 'undecided', description: 'Service awaiting decision' },
					{ name: 'Vanished', value: 'vanished', description: 'Service has vanished' },
					
				],
				description: 'Target phase to move the service to',
			},
			{
				displayName: 'Check Type',
				name: 'check_type',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'The name of the check which this service uses',
			},
			{
				displayName: 'Service Item',
				name: 'service_item',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['discovery'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'The value uniquely identifying the service on a given host',
			},
			{
				displayName: 'Customer',
				name: 'customer',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['serviceGroup','hostGroup', 'password'],
						operation: ['create', 'update'],
					},
				},
				default: 'global',
				description: 'By specifying a customer, you configure on which sites the user object will be available. global will make the object available on all sites.',
			},

// ==================== SERVICE GROUP BULK CREATE FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'createMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_create','bulk_update','bulk_delete'],
					},
				},
				options: [
					{
						name: 'Manual Entries (UI)',
						value: 'ui',
						description: 'Add service groups manually using the interface',
					},
					{
						name: 'JSON (Dynamic)',
						value: 'json',
						description: 'Pass a raw JSON array of service groups (good for large batches)',
					},
				],
				default: 'ui',
				description: 'Choose how to provide the service group entries',
			},
			
			// OPÇÃO 1: MODO UI (Fixed Collection)
			{
				displayName: 'Entries',
				name: 'entries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Service Group Entry',
				default: {},
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_create'],
						createMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'A name used as identifier',
							},
							{
								displayName: 'Alias',
								name: 'alias',
								type: 'string',
								required: true,
								default: '',
								description: 'The name used for displaying in the GUI',
							},
							{
								displayName: 'Customer',
								name: 'customer',
								type: 'string',
								required: true,
								default: 'global',
								description: 'By specifying a customer, you configure on which sites the object will be available. global will make the object available on all sites.',
							},
						],
					},
				],
			},


			// OPÇÃO 2: MODO JSON (Raw)
			{
				displayName: 'Entries JSON',
				name: 'entriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_create'],
						createMode: ['json'],
					},
				},
				default: '[]',
				description: 'An array of objects. Example: [{"name": "sg1", "alias": "Service Group 1", "customer": "global"}].',
			},

// ==================== SERVICE GROUP BULK UPDATE FIELDS ====================
			{
				displayName: 'Entries',
				name: 'updateEntries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Service Group Entry',
				default: {},
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_update'],
						createMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The name of the service group to update',
							},
							{
								displayName: 'Alias',
								name: 'alias',
								type: 'string',
								default: '',
								description: 'The new alias/display name',
							},
							{
								displayName: 'Customer',
								name: 'customer',
								type: 'string',
								default: 'global',
								description: 'By specifying a customer, you configure on which sites the object will be available',
							},
						],
					},
				],
			},

			{
				displayName: 'Update Entries JSON',
				name: 'updateEntriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_update'],
						createMode: ['json'],
					},
				},
				default: '[]',
				description: 'An array of objects with name and attributes to update. Example: [{"name": "sg1", "attributes": {"alias": "New Alias", "customer": "global"}}].',
			},

// ==================== SERVICE GROUP BULK DELETE FIELDS ====================
			{
				displayName: 'Entries',
				name: 'deleteEntries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Service Group Name',
				default: {},
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_delete'],
						createMode: ['ui'],
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The name of the service group to delete',
							},
						],
					},
				],
			},

			{
				displayName: 'Delete Entries JSON',
				name: 'deleteEntriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['serviceGroup'],
						operation: ['bulk_delete'],
						createMode: ['json'],
					},
				},
				default: '[]',
				description: 'An array of service group names to delete. Example: ["sg1", "sg2"].',
			},
		
			{
				displayName: 'Hostnames (List)',
				name: 'hostNames', 
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['bulk_delete'],
					},
				},
				default: '',
				placeholder: 'host1, host2, host3',
				description: 'Comma-separated list of hostnames to delete',
			},
			{
				displayName: 'New Name',
				name: 'newName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['rename'],
					},
				},
				default: '',
				description: 'New name for the host',
			},
			// Host specific fields
			{
				displayName: 'Folder',
				name: 'folder',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['create', 'get', 'update', 'delete', 'move', 'create_cluster'],
					},
				},
				default: '/',
				description: 'Folder path',
			},
			{
				displayName: 'Nodes',
				name: 'nodes',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['create_cluster','update_cluster_nodes'],
					},
				},
				default: '',
				placeholder: 'host1, host2, host3',
				description: 'Comma-separated list of hostnames to include in the cluster',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['host'],
						operation: ['create_cluster'],
					},
				},
				options: [
					{
						displayName: 'IP Address',
						name: 'ipaddress',
						type: 'string',
						default: '',
					},
					{
						displayName: 'IPv6 Address',
						name: 'ipv6address',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Agent Tag',
						name: 'tag_agent',
						type: 'string',
						default: '',
						description: 'E.g. cmk-agent | no-agent | special-agents.',
					},
				],
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
					// --- Identification & Location ---
					{
						displayName: 'Alias',
						name: 'alias',
						type: 'string',
						default: '',
						description: 'An alias for the host',
					},
					{
						displayName: 'Site',
						name: 'site',
						type: 'string',
						default: '',
						description: 'The site ID where this host is monitored',
					},
					
					// --- Networking & Addresses ---
					{
						displayName: 'IP Address (IPv4)',
						name: 'ipaddress',
						type: 'string',
						default: '',
					},
					{
						displayName: 'IPv6 Address',
						name: 'ipv6address',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Additional IPv4 Addresses',
						name: 'additional_ipv4addresses',
						type: 'string',
						default: '',
						placeholder: '10.0.0.2, 10.0.0.3',
						description: 'Comma-separated list of additional IPv4 addresses',
					},
					{
						displayName: 'Additional IPv6 Addresses',
						name: 'additional_ipv6addresses',
						type: 'string',
						default: '',
						placeholder: '2001:db8::1, 2001:db8::2',
						description: 'Comma-separated list of additional IPv6 addresses',
					},
					{
						displayName: 'Parents',
						name: 'parents',
						type: 'string',
						default: '',
						placeholder: 'switch_01, router_main',
						description: 'Comma-separated list of parent host names',
					},

					// --- Tags & Agents ---
					{
						displayName: 'Address Family Tag',
						name: 'tag_address_family',
						type: 'options',
						options: [
							{ name: 'IPv4 Only', value: 'ip-v4-only' },
							{ name: 'IPv6 Only', value: 'ip-v6-only' },
							{ name: 'IPv4 and IPv6', value: 'ip-v4v6' },
							{ name: 'No IP', value: 'no-ip' },
						],
						default: 'ip-v4-only',
					},
					{
						displayName: 'Agent Tag',
						name: 'tag_agent',
						type: 'options',
						options: [
							{ name: 'No Agent', value: 'no-agent' },
							{ name: 'Checkmk Agent (Server)', value: 'cmk-agent' },
							{ name: 'Special Agents (Datasource)', value: 'special-agents' },
							{ name: 'Ping Only', value: 'ping' },
						],
						default: 'cmk-agent',
					},
					{
						displayName: 'Agent Connection Mode',
						name: 'cmk_agent_connection',
						type: 'options',
						options: [
							{ name: 'Pull (Checkmk Connects to Agent)', value: 'pull-agent' },
							{ name: 'Push (Agent Connects to Checkmk)', value: 'push-agent' },
						],
						default: 'pull-agent',
					},
					{
						displayName: 'SNMP Tag',
						name: 'tag_snmp_ds',
						type: 'options',
						options: [
							{ name: 'No SNMP', value: 'no-snmp' },
							{ name: 'SNMP V1', value: 'snmp-v1' },
							{ name: 'SNMP V2c', value: 'snmp-v2' },
							{ name: 'SNMP V3', value: 'snmp-v3' },
						],
						default: 'no-snmp',
					},
					{
						displayName: 'Piggyback Tag',
						name: 'tag_piggyback',
						type: 'options',
						options: [
							{ name: 'Use Piggyback Data', value: 'piggyback' },
							{ name: 'Always Use Piggyback', value: 'auto-piggyback' },
							{ name: 'Do Not Use Piggyback', value: 'no-piggyback' },
						],
						default: 'auto-piggyback',
					},
					{
						displayName: 'Criticality Tag',
						name: 'tag_criticality',
						type: 'string',
						default: '',
						placeholder: 'prod, test, offline',
					},
					{
						displayName: 'Networking Tag',
						name: 'tag_networking',
						type: 'string',
						default: '',
						placeholder: 'lan, wan, dmz',
					},

					// --- Management Board ---
					{
						displayName: 'Management Protocol',
						name: 'management_protocol',
						type: 'options',
						options: [
							{ name: 'None', value: 'none' },
							{ name: 'SNMP', value: 'snmp' },
							{ name: 'IPMI', value: 'ipmi' },
							{ name: 'Redfish', value: 'redfish' },
						],
						default: 'none',
					},
					{
						displayName: 'Management Address',
						name: 'management_address',
						type: 'string',
						default: '',
						description: 'IP address or hostname of the management board',
					},

					// --- Contact Groups (Complex Object) ---
					{
						displayName: 'Contact Groups Config',
						name: 'contactgroups_ui',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: false,
						},
						default: {},
						placeholder: 'Configure Contact Groups',
						options: [
							{
								displayName: 'Settings',
								name: 'settings',
								values: [
							{
								displayName: 'Groups',
								name: 'groups',
								type: 'string',
								default: '',
								description: 'Comma-separated list of contact group names (e.g. admins, operators)',
							},
							{
								displayName: 'Recurse Perms',
								name: 'recurse_perms',
								type: 'boolean',
								default: true,
							},
							{
								displayName: 'Recurse Use',
								name: 'recurse_use',
								type: 'boolean',
								default: true,
							},
							{
								displayName: 'Use',
								name: 'use',
								type: 'boolean',
								default: true,
							},
							{
								displayName: 'Use For Services',
								name: 'use_for_services',
								type: 'boolean',
								default: true,
							},
						],
							},
						],
					},

					// --- Flags & Others ---
					{
						displayName: 'Bake Agent',
						name: 'bake_agent',
						type: 'boolean',
						default: false,
						description: 'Whether to bake the agents (Enterprise only)',
					},
					{
						displayName: 'Bake Agent Package',
						name: 'bake_agent_package',
						type: 'boolean',
						default: false,
						description: 'Attribute: bake_agent_package',
					},
					{
						displayName: 'Waiting for Discovery',
						name: 'waiting_for_discovery',
						type: 'boolean',
						default: false,
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

			// ==================== USER ROLE FIELDS ====================
			{
				displayName: 'Source Role ID',
				name: 'roleId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['userRole'],
						operation: ['clone', 'delete', 'update','get'],
					},
				},
				default: 'admin',
				description: 'The ID of the role to act upon (e.g. source role for cloning)',
			},
			{
				displayName: 'New Role ID',
				name: 'newRoleId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['userRole'],
						operation: ['clone'],
					},
				},
				default: '',
				description: 'The ID for the new role (e.g. "limited_user")',
			},
			{
				displayName: 'New Alias',
				name: 'newAlias',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['userRole'],
						operation: ['clone'],
					},
				},
				default: '',
				description: 'The display name for the new role (e.g. "Limited User")',
			},
			// ==================== USER ROLE FIELDS END ====================


			// RULESET SPECIFIC FIELDS

			// RULESET search fields
			{
				displayName: 'Full Text Search',
				name: 'fulltext',
				type: 'string',

				displayOptions: {
					show: {
						resource: ['ruleset'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'Search all keys (like name, title, help, etc.) for this text. Regex allowed.',
			},
			{
				displayName: 'Folder',
				name: 'folder',
				type: 'string',

				displayOptions: {
					show: {
						resource: ['ruleset'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'The folder in which to search for rules. Path delimiters can be either ~, / or \\. Please use the one most appropriate for your quoting/escaping needs. A good default choice is ~.',
			},
			{
				displayName: 'Only Deprecated',
				name: 'deprecated',
				type: 'boolean',

				displayOptions: {
					show: {
						resource: ['ruleset'],
						operation: ['search'],
					},
				},
				default: false,
				description: 'Only show deprecated rulesets. Defaults to False.',
			},
			{
				displayName: 'Only Used',
				name: 'used',
				type: 'boolean',

				displayOptions: {
					show: {
						resource: ['ruleset'],
						operation: ['search'],
					},
				},
				default: true,
				description: 'Only show used rulesets. Defaults to True.',
			},
			{
				displayName: 'Name Regex',
				name: 'name',
				type: 'string',

				displayOptions: {
					show: {
						resource: ['ruleset'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'A regex of the name',
			},
			// SAML FIELDS
			{
				displayName: 'Connection ID',
				name: 'connectionId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['samlConnection'],
						operation: ['get', 'delete', 'update', 'create'],
					},
				},
				default: '',
				description: 'The ID of the SAML connection (e.g., saml_connection_1)',
			},
			// ==================== SAML CONNECTION CREATE FIELDS ====================
			{
				displayName: 'Name',
				name: 'samlName',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'] } },
				default: '',
				description: 'Display name for the connection',
			},
			{
				displayName: 'Checkmk Server URL',
				name: 'serverUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'] } },
				default: '',
				placeholder: 'https://checkmk.server',
			},
			{
				displayName: 'Metadata Type',
				name: 'metadataType',
				type: 'options',
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'] } },
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'XML', value: 'xml' },
				],
				default: 'url',
			},
			{
				displayName: 'Metadata URL',
				name: 'metadataUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'], metadataType: ['url'] } },
				default: '',
			},
			{
				displayName: 'Metadata XML',
				name: 'metadataXml',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'], metadataType: ['xml'] } },
				default: '',
			},
			{
				displayName: 'Signing Certificate Type',
				name: 'signingType',
				type: 'options',
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'] } },
				options: [
					{ name: 'Built-In', value: 'builtin' },
					{ name: 'Custom', value: 'custom' },
				],
				default: 'builtin',
			},
			{
				displayName: 'Signing Private Key (PEM)',
				name: 'signingKey',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'], signingType: ['custom'] } },
				default: '',
			},
			{
				displayName: 'Signing Certificate (PEM)',
				name: 'signingCert',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'], signingType: ['custom'] } },
				default: '',
			},
			{
				displayName: 'Contact Groups Sync Type',
				name: 'cgType',
				type: 'options',
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'] } },
				options: [
					{ name: 'Map', value: 'map' },
					{ name: 'CN From LDAP DN', value: 'cn_from_ldap_dn' },
					{ name: 'From Attribute Value', value: 'from_attribute_value' },
				],
				default: 'map',
			},
			{
				displayName: 'Contact Groups Mapping',
				name: 'cgMappingUi',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Mapping',
				displayOptions: { show: { resource: ['samlConnection'], operation: ['create'], cgType: ['map'] } },
				default: {},
				options: [
					{
						displayName: 'Mapping',
						name: 'mapping',
						values: [
							{ displayName: 'Attribute Value', name: 'value', type: 'string', default: '' },
							{ displayName: 'Contact Groups (Comma Separated)', name: 'groups', type: 'string', default: '' },
						],
					},
				],
			},


			// ==================== END SAML CONNECTION CREATE FIELDS ====================

			// Ruleset get field
			{
				displayName: 'Ruleset Name',
				name: 'rulesetName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['ruleset'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The name of the ruleset',
			},

			// RULE SPECIFIC FIELDS

			{
				displayName: 'Rule ID',
				name: 'rule_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule', 'notificationRule', 'biRule','get'],
						operation: ['delete', 'modify', 'show', 'move', 'update','create'],
					},
				},
				default: '',
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['move'],
					},
				},
				options: [
					{
						name: 'Top of Folder',
						value: 'top_of_folder',
						description: 'Move rule to the top of a specific folder',
					},
					{
						name: 'Bottom of Folder',
						value: 'bottom_of_folder',
						description: 'Move rule to the bottom of a specific folder',
					},
					{
						name: 'Before Specific Rule',
						value: 'before_specific_rule',
						description: 'Move rule to immediately before another rule',
					},
					{
						name: 'After Specific Rule',
						value: 'after_specific_rule',
						description: 'Move rule to immediately after another rule',
					},
				],
				default: 'top_of_folder',
				description: 'Where to move the rule to',
			},
			{
				displayName: 'Target Folder',
				name: 'targetFolder', // Nome diferente para não confundir com source folder
				type: 'resourceLocator',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['move'],
						position: ['top_of_folder', 'bottom_of_folder'],
					},
				},
				default: { mode: 'id', value: '~' },
				modes: [
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '~folder_id',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^~.*',
									errorMessage: 'Folder ID must start with ~',
								},
							},
						],
					},
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'searchFolders',
							searchable: true,
							searchFilterRequired: false,
						},
					},
				],
				description: 'The folder to move the rule into',
			},
			{
				displayName: 'Reference Rule ID',
				name: 'referenceRuleId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['move'],
						position: ['before_specific_rule', 'after_specific_rule'],
					},
				},
				default: '',
				description: 'The ID of the rule to be used as a reference point',
			},
			{
				displayName: 'Folder',
				name: 'folder',
				type: 'resourceLocator',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule'],
								operation: ['create'],
					},
				},
				default: { mode: 'id', value: '~' },
				modes: [
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '~folder_id',
						hint: 'Enter the folder ID (e.g., ~production or ~monitored~servers)',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^~.*',
									errorMessage: 'Folder ID must start with ~',
								},
							},
						],
					},
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'searchFolders',
							searchable: true,
							searchFilterRequired: false,
						},
					},
				],
			},
			{
				displayName: 'Value Raw',
				name: 'value_raw',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['create', 'modify'],
					},
				},
				default: '',
				description: 'The raw parameter value for this rule. To create the correct structure, for now use the \'export for API\' menu item in the Rule Editor of the GUI. The value is expected to be a valid Python type.',
			},
			// Rule create fields
			{
				displayName: 'Ruleset',
				name: 'ruleset',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['create', 'list'],
					},
				},
				default: '',
				description: 'Name of rule set',
			},
			{
				displayName: 'Properties',
				name: 'properties',
				type: 'json',

				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['create', 'modify'],
					},
				},
				default: '{}',
				description: 'Configuration values for rules',
			},
			{
				displayName: 'Conditions',
				name: 'conditions',
				type: 'json',

				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['create', 'modify'],
					},
				},
				default: '{}',

			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['rule'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'A description for this rule to inform other users about its intent',
					},
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
						description: 'Any comment string',
					},
					{
						displayName: 'Documentation URL',
						name: 'documentationUrl',
						type: 'string',
						default: '',
						description: 'An URL (e.g. an internal Wiki entry) which explains this rule',
					},
					{
						displayName: 'Disabled',
						name: 'disabled',
						type: 'boolean',
						default: false,
						description: 'When set to False, the rule will be evaluated. Default is False.',
					},
				],
			},
			
			// HOST TAG GROUP specific fields
			{
				displayName: 'Tag groupID',
				name: 'tagGroupId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The unique ID for the host tag group (e.g. "criticality")',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['delete','show', 'update'],
					},
				},
				default: '',
				description: 'The name of the host tag group',
			},
			{
				displayName: 'Delete Mode',
				name: 'deleteMode', // Nome interno no n8n
				type: 'options',
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['delete'],
					},
				},
				options: [
					{
						name: 'Abort',
						value: 'abort',
						description: 'Explicitly abort the deletion if used',
					},
					{
						name: 'Delete Affected Rules',
						value: 'delete',
						description: 'Delete rules that use this tag group',
					},
					{
						name: 'Remove Tag From Rules',
						value: 'remove',
						description: 'Remove the tag from affected rules but keep the rules',
					},
				],
				default: 'abort', // Padrão seguro (nulo/abort implícito)
				description: 'Determine what should happen if the host tag group is still in use',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['hostTagGroup','auxTag'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'A title for the host tag',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['auxTag'],
						operation: ['update'],
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
						resource: ['hostTagGroup','auxTag'],
						operation: ['create','update'],
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
						resource: ['hostTagGroup','auxTag'],
						operation: ['create','update'],
					},
				},
				default: '""',
				description: 'A help description for the tag group',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'fixedCollection',
				placeholder: 'Add Tag',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'A list of host tags belonging to the host tag group',
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Manual',
						name: 'manual',
						values: [
							{
								displayName: 'Tag ID',
								name: 'TagID',
								type: 'string',
								default: '',
								description: 'An unique ID for the tag (optional, auto-generated if empty)',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								// Required removed from UI property to avoid validation locking, handled in code
								description: 'The title of the tag',
							},
							{
								displayName: 'Aux Tags',
								name: 'aux_tags',
								type: 'string',
								default: '',
								placeholder: 'ip-v4, ip-v6',
								description: 'Comma-separated list of auxiliary tag IDs',
							},
						],
					},
					{
						displayName: 'JSON',
						name: 'json',
						values: [
							{
								displayName: 'Tags JSON',
								name: 'tagsJson',
								type: 'json',
								default: '[]',
								placeholder: '[{"ID":"tag1","title":"Tag 1"}]',
								description: 'Raw JSON array of tag objects',
							},
						],
					},
				],
			},
			{
				displayName: 'Repair',
				name: 'repair',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['hostTagGroup'],
						operation: ['update', 'delete'],
					},
				},
				description: 'Allow repairing/updating tags on hosts that reference this tag group',
			},




			// FOLDER SPECIFIC FIELDS MATEUS
			{
				displayName: 'Folder',
				name: 'folder',
				type: 'resourceLocator',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
								operation: ['get', 'update', 'delete', 'getHosts', 'move'],
					},
				},
				default: { mode: 'id', value: '~' },
				modes: [
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '~folder_id',
						hint: 'Enter the folder ID (e.g., ~production or ~monitored~servers)',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^~.*',
									errorMessage: 'Folder ID must start with ~',
								},
							},
						],
					},
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'searchFolders',
							searchable: true,
							searchFilterRequired: false,
						},
					},
				],
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'resourceLocator',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['move'],
					},
				},
				default: { mode: 'id', value: '~' },
				modes: [
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '~folder_id',
						hint: 'Enter the folder ID (e.g., ~production or ~monitored~servers)',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^~.*',
									errorMessage: 'Folder ID must start with ~',
								},
							},
						],
					},
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'searchDestinationFolders',
							searchable: true,
							searchFilterRequired: false,
						},
					},
				],
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['update'],
					},
				},
				default: '',
				description: 'New title/name for the folder (optional)',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['getHosts'],
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
						resource: ['folder'],
						operation: ['getHosts'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},

// ==================== FOLDER BULK UPDATE FIELDS ====================
			{
				displayName: 'Input Mode',
				name: 'updateMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['bulk_update'],
					},
				},
				options: [
					{
						name: 'Manual Entries (UI)',
						value: 'ui',
						description: 'Add folder updates manually using the interface',
					},
					{
						name: 'JSON (Dynamic)',
						value: 'json',
						description: 'Pass a raw JSON array of updates (good for large batches)',
					},
				],
				default: 'ui',
				description: 'Choose how to provide the folder update entries',
			},
			
			// OPÇÃO 1: MODO UI (Fixed Collection)
			{
				displayName: 'Entries',
				name: 'entries', // Mantemos o nome 'entries' para a collection
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Folder Update Entry',
				default: {},
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['bulk_update'],
						updateMode: ['ui'], // Só mostra se o modo for UI
					},
				},
				options: [
					{
						displayName: 'Entry',
						name: 'entry',
						values: [
							{
						displayName: 'Attribute Choice',
						name: 'attributeChoice',
						type: 'options',
						options: [
									{
										name: 'Update Attributes (Merge)',
										value: 'update_attributes',
									},
									{
										name: 'Replace Attributes',
										value: 'attributes',
									},
									{
										name: 'Remove Attributes',
										value: 'remove_attributes',
									},
								],
						default: 'update_attributes',
							},
							{
						displayName: 'Attributes (JSON)',
						name: 'attributes_json',
						type: 'json',
						default: '{}',
						description: 'Attributes e.g.	{\'tag_criticality\': \'prod\'}',
							},
							{
						displayName: 'Attributes to Remove',
						name: 'remove_attributes_list',
						type: 'string',
						default: '',
						description: 'Comma-separated list (e.g. \'tag_foo,tag_bar\')',
							},
							{
						displayName: 'Folder',
						name: 'folder',
						type: 'resourceLocator',
						default: 'undefined',
							required:	true,
						description: 'The folder path to update',
							modes:	[
									{
										displayName: 'By ID',
										name: 'id',
										type: 'string',
										placeholder: '~folder_id',
											validation:	[
													{
												type: 'regex',
												properties: {
													regex: '^~.*',
													errorMessage: 'Folder ID must start with ~',
												},
													},
											]
									},
									{
										displayName: 'From List',
										name: 'list',
										type: 'list',
									},
					]
							},
							{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'The new title of the folder (optional)',
							},
					],
					},
				],
			},

			// OPÇÃO 2: MODO JSON (Raw)
			{
				displayName: 'Entries JSON',
				name: 'entriesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['bulk_update'],
						updateMode: ['json'], // Só mostra se o modo for JSON
					},
				},
				default: '[]',
				description: 'An array of objects. Example: [{"folder": "~my_folder", "title": "New Title", "attributes": {"tag_foo": "bar"}}].',
			},
				// Additional Fields for Get Hosts from Folder
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['getHosts'],
					},
				},
				options: [
					{
						displayName: 'Effective Attributes',
						name: 'effective_attributes',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Include Links',
						name: 'include_links',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						description: 'Comma-separated list of fields to include',
					},
					{
						displayName: 'Site',
						name: 'site',
						type: 'string',
						default: '',
						description: 'Site name to filter by',
					},
				],
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
				description: 'Display name for the folder. Checkmk will automatically generate the unique ID.',
			},
			{
				displayName: 'Parent',
				name: 'parent',
				type: 'resourceLocator',
				required: true,
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create', 'getMany'],
					},
				},
				default: { mode: 'id', value: '~' },
				modes: [
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: '~folder_id',
						hint: 'Enter the folder ID (e.g., ~production or ~monitored~servers)',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^~.*',
									errorMessage: 'Folder ID must start with ~',
								},
							},
						],
					},
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'searchFolders',
							searchable: true,
							searchFilterRequired: false,
						},
					},
				],
			},
			{
				displayName: 'Attributes',
				name: 'attributes',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['create'],
					},
				},
				default: '{}',
				description: 'Replace all attributes with the ones given in this JSON object (e.g., {"tag_criticality": "prod"})',
			},
			{
				displayName: 'Delete Mode',
				name: 'delete_mode',
				type: 'options',
				options: [
					{
						name: 'Recursive',
						value: 'recursive',
						description: 'Deletes the folder and all the elements it contains',
					},
					{
						name: 'Abort on Nonempty',
						value: 'abort_on_nonempty',
						description: 'Deletes the folder only if it is empty',
					},
				],
				default: 'recursive',
				description: 'Choose how to handle folder deletion',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['delete'],
					},
				},
			},
			{
				displayName: 'Attribute Choice',
				name: 'attributeChoice',
				type: 'options',
				options: [
					{
						name: 'Attributes',
						value: 'attributes',
						description: 'Replace all attributes with the ones given in this field',
					},
					{
						name: 'Update Attributes',
						value: 'update_attributes',
						description: 'Just update the folder attributes with these attributes',
					},
					{
						name: 'Remove Attributes',
						value: 'remove_attributes',
						description: 'A list of attributes which should be removed',
					},
				],
				default: 'attributes',
				description: 'Choose how you want to update the attributes of a folder',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['update'],
					},
				},
			},
			{
				displayName: 'Attributes',
				name: 'attributes',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['update'],
						attributeChoice: ['attributes'],
					},
				},
				default: '{}',
				description: 'Replace all attributes with the ones given in this JSON object (e.g., {"tag_criticality": "prod"})',
			},
			{
				displayName: 'Update Attributes',
				name: 'update_attributes',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['update'],
						attributeChoice: ['update_attributes'],
					},
				},
				default: '{}',
				description: 'Update the folder attributes with these attributes (merges with existing ones, e.g., {"tag_networking": "wan"})',
			},
			{
				displayName: 'Remove Attributes',
				name: 'remove_attributes',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['update'],
						attributeChoice: ['remove_attributes'],
					},
				},
				default: '',
				description: 'Comma-separated list of attributes to remove (e.g., "tag_criticality,tag_networking")',
			},
			{
				displayName: 'Show Hosts',
				name: 'show_hosts',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['get', 'getMany'],
					},
				},
				default: false,
				description: 'Whether to show or not hosts in the folder',
			},
			{
				displayName: 'Recursive Folder Query',
				name: 'recursive',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['folder'],
						operation: ['getMany'],
					},
				},
				default: false,
				description: 'Whether to look for folders inside other folders',
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
						operation: ['create', 'get', 'update', 'delete'],
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
						operation: ['create','update'],
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
						operation: ['create', 'update' ],
					},
				},
				default: '',
				description: 'By specifying a customer, you configure on which sites the user object will be available. global will make the object available on all sites.',
			},
			{
				displayName: 'Authorized Sites',
				name: 'authorizedSites', // Nome interno da variável
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: 'all',
				description: 'Comma-separated list of sites the user is authorized to handle (e.g. "all" or "site1,site2")',
			},
			{
				displayName: 'Roles',
				name: 'roles',
				type: 'multiOptions', // Permite escolher múltiplas opções
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				// Lista das roles standard do Checkmk
				options: [
					{
						name: 'Administrator',
						value: 'admin',
					},
					{
						name: 'Normal Monitoring User',
						value: 'user',
					},
					{
						name: 'Guest User',
						value: 'guest',
					},
					{
						name: 'Agent Registration User',
						value: 'agent_registration',
					},
				],
				default: ['user'], // Pré-selecionado para evitar erros de validação
				description: 'The roles assigned to the user',
			},
			{
				displayName: 'Tag ID',
				name: 'tagId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['auxTag'],
						operation: ['get', 'create', 'delete', 'update'],
					},
				},
				default: '',
				description: 'The unique ID of the auxiliary tag (e.g. "ip-v4")',
			},

			// Site specific fields
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['site'],
						operation: ['login'],
					},
				},
				default: '',
				description: "An administrative user's username",
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'credentials',
				typeOptions:{
					password:true,
				},
				displayOptions: {
					show: {
						resource: ['site'],
						operation: ['login'],
					},
				},
				default: '',
				description: 'The password for the username given',
			},
			{
				displayName: 'Site Configuration',
				name: 'site_config',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['site'],
						operation: ['create', 'update'],
					},
				},
				default: '{}',
				description: "A site's connection",
			},
			// ActivateChanges specific fields
			{
				displayName: 'Activation ID',
				name: 'activationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['activateChanges' ],
						operation: ['get', 'waitForCompletion'],
					},
				},
				default: '',
				description: 'The ID of the activation run',
			},
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
						operation: ['getMany','getAll'],
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
						operation: ['getMany', 'getAll'],
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
								description: 'Whether to show all effective attributes on hosts, not just the attributes which were set on this host specifically',
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
									description: 'Whether to show all effective attributes on hosts, not just the attributes which were set on this host specifically',
								},
								{
									displayName: 'Fields',
									name: 'fields',
									type: 'string',
									default: '',
									placeholder: '!(links)',
									description: 'The fields to include/exclude (e.g., !(links) or (ipaddress,ipv6address))',
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
								displayName: 'Hostnames',
								name: 'hostNames',
								type: 'string',
								required: true,
								displayOptions: {
									show: {
										resource: ['host'],
										operation: ['bulk_delete'],
									},
								},
								default: '',
								description: 'Comma-separated list of hostnames to delete (e.g. "host1, host2")',
							},
								{
									displayName: 'Include Links',
									name: 'include_links',
									type: 'boolean',
									default: false,
									description: 'Whether the links field of the individual hosts should be populated',
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
						description: 'Replace all currently set attributes on the host (removes attributes not specified here)',
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
						resource: ['service'],
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

			//Authentication option for User Create
			{
				displayName: 'Authentication Type',
				name: 'authType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
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
						description: 'For accounts used by automation processes (such as fetching data from views for further procession). This is the automation secret.',
					},
				],
				default: '',

			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions:{
					password:true,
				},
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create','update'],
						authType: ['password'],
					},
				},
				default: '',
				description: 'The password for login',
			},
			{
				displayName: 'Secret',
				name: 'automation',
				type: 'string',
				typeOptions:{
					password:true,
				},
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create','update'],
						authType: ['automation'],
					},
				},
				default: '',
				description: 'For accounts used by automation processes (such as fetching data from views for further procession). This is the automation secret.',
			},

			// ==================== SERVICE STATUS FIELDS (showAll) ====================
			{
				displayName: 'Host Name',
				name: 'host_name', 
				type: 'string',
				displayOptions: {
					show: {
						resource: ['serviceStatus'],
						operation: ['showAll'],
					},
				},
				default: '',
				description: 'Restrict the query to this particular host name',
			},
			{
				displayName: 'Host Name',
				name: 'host_name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['serviceStatus'],
						operation: ['showHost', 'show'],
					},
				},
				default: '',
				description: 'Restrict the query to this particular host name',
			},			
			{
				displayName: 'Sites',
				name: 'sites',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['serviceStatus'],
						operation: ['showAll', 'showHost'],
					},
				},
				default: '',
				placeholder: 'site1,site2',
				description: 'Comma-separated list of sites to restrict the query (e.g. "munich,boston")',
			},
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['serviceStatus'],
						operation: ['showAll', 'showHost', 'show'],
					},
				},
				default: '',
				placeholder: 'host_name,description,state',
				description: 'Comma-separated list of columns to return. Leave empty for defaults.',
			},
			{
				displayName: 'Service Description',
				name: 'service_description',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['serviceStatus', 'metric'],
						operation: ['show','getMetrics'],
					},
				},
				default: '',
				placeholder: 'service_description=Filesystem /boot',
				description: 'The service name of the selected host',
			},
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['serviceStatus'],
						operation: ['showAll', 'showHost'],
					},
				},
				default: '{}',
				description: 'Livestatus query expression in nested dictionary form (e.g. {"op": "=", "left": "state", "right": "2"})',
			},

			// NOTIFICATION RULES SPECIFIC FIELDS
			{
				displayName: 'Rule Config',
				name: 'rule_config',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['notificationRule'],
						operation: ['create', 'update']
					},
				},
				default: '{}',
			},
			// Downtime specific fields
			{
				displayName: 'Start Time',
				name: 'start_time',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The start datetime of the new downtime (ISO 8601)',
			},
			{
				displayName: 'Delete Type',
				name: 'deleteType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['delete'],
					},
				},
				options: [
					{ name: 'By ID', value: 'by_id' },
					{ name: 'Params', value: 'params' },
					{ name: 'Query', value: 'query' },
					{ name: 'Hostgroup', value: 'hostgroup' },
					{ name: 'Servicegroup', value: 'servicegroup' },
				],
				default: 'by_id',
				description: 'Specifies how the downtime should be deleted',
			},
			{
				displayName: 'Modify Type',
				name: 'modifyType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['update'],
					},
				},
				options: [
					{ name: 'By ID', value: 'by_id' },
					// ... outras opções ...
				],
				default: 'by_id',
				description: 'How to select the downtimes to be targeted',
			},
			{
				displayName: 'Update End Time',
				name: 'updateEndTime',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['update'],
					},
				},
				description: 'Enable to modify the end time of the downtime',
			},
			{
				displayName: 'End Time Modify Type',
				name: 'endTimeMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['update'],
						updateEndTime: [true], // Só aparece se o switch acima estiver ligado
					},
				},
				options: [
					{
						name: 'Absolute (Set Date)',
						value: 'absolute',
					},
					{
						name: 'Relative (Add Minutes)',
						value: 'relative',
					},
				],
				default: 'absolute',
				description: 'How to modify the end time',
			},
			{
				displayName: 'New End Time Value',
				name: 'endTimeDate',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['update'],
						updateEndTime: [true],
						endTimeMode: ['absolute'],
					},
				},
				description: 'The new specific end date and time (ISO 8601)',
			},
			{
				displayName: 'Extension Value (Minutes)',
				name: 'endTimeDuration',
				type: 'number',
				default: 60,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['update'],
						updateEndTime: [true],
						endTimeMode: ['relative'],
					},
				},
				description: 'Minutes to add to the current end time',
			},
			{
				displayName: 'Site ID',
				name: 'site',
				type: 'string',
				required: true, // O utilizador indicou que é required
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['get', 'delete', 'update'],
					},
				},
				default: '',
				description: 'The site ID where the downtime is located',
			},
			{
				displayName: 'End Time',
				name: 'end_time',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The end datetime of the new downtime. The format has to conform to the ISO 8601 profile.',
			},
			{
				displayName: 'Downtime ID',
				name: 'downtimeId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['get','delete','update'],
					},
				},
				default: '',
				description: 'The ID of the downtime'
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
						name: 'Host',
						value: 'host',
						description: 'Schedule downtimes for a host identified by host name or IP address',
					},
					{
						name: 'Hostgroup',
						value: 'hostgroup',
						description: 'Schedule downtimes for all hosts belonging to the specified hostgroup',
					},
					{
						name: 'Host by Query',
						value: 'hostByQuery',
						description: 'Schedule based on a Livestatus query expression'
					},
				],
				default: 'host',
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
						resource: ['downtime', 'comment'], 
						operation: ['create', 'remove'], 
						downtimeType: ['host'],
                        commentType: ['host', 'service'],
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
			{
				displayName: 'Query (JSON)',
				name: 'query',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
						downtimeType: ['hostByQuery'],
					},
				},
				default: {},
				description:
					'Livestatus query expression in nested dictionary format',
			},
			{
				displayName: 'Comment',
				name: 'comment',
				type: 'string',
                required: true,
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Reason for the downtime',
			},
			// Additional Fields for Downtime Update
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['downtime'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Comment',
						name: 'comment',
						type: 'string',
						default: '',
						description: 'Update the comment',
					},
					// NOVA LÓGICA PARA END TIME
					{
						displayName: 'End Time Mode',
						name: 'endTimeMode',
						type: 'options',
						options: [
							{ name: 'Absolute (Set Date)', value: 'absolute' },
							{ name: 'Relative (Add Minutes)', value: 'relative' },
						],
						default: 'absolute',
						description: 'Define if the end time is a specific date or a relative extension',
					},
					{
						displayName: 'New End Time',
						name: 'end_time_absolute',
						type: 'dateTime',
						default: '',
						displayOptions: {
							show: {
								'/additionalFields.endTimeMode': ['absolute'],
							},
						},
						description: 'The new specific end date and time',
					},
					{
						displayName: 'Extension (Minutes)',
						name: 'end_time_relative',
						type: 'number',
						default: 60,
						displayOptions: {
							show: {
								'/additionalFields.endTimeMode': ['relative'],
							},
						},
						description: 'Number of minutes to extend the downtime',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			searchFolders: async function (this: ILoadOptionsFunctions, filter?: string): Promise<any> {
				if (filter && filter.trim() !== '') {
					return {
						results: await searchFolders.call(this, filter),
					};
				}
				return {
					results: await getFoldersList.call(this),
				};
			},
			searchDestinationFolders: async function (this: ILoadOptionsFunctions, filter?: string): Promise<any> {
				return {
					results: await searchDestinationFolders.call(this, filter),
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		// Track seen host ids to avoid duplicates when node runs per input item
		const seenHostIds = new Set<string>();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				// ==================== HOST OPERATIONS ====================
				if (resource === 'host') {
					if (operation === 'create') {  //CMK_CREATEHOSTS
						const hostName = this.getNodeParameter('hostName', i) as string;
						// Correção da Pasta: Remove o prefixo '~' se existir
						let folder = this.getNodeParameter('folder', i) as string;
						if (folder.startsWith('~')) {
							folder = folder.substring(1);
						}
						
						const additionalFields = this.getNodeParameter('additionalFields', i, {},) as IDataObject;
						const attributes: IDataObject = {};

						// --- 1. Basic Fields ---
						if (additionalFields.alias) attributes.alias = additionalFields.alias;
						if (additionalFields.site) attributes.site = additionalFields.site;
						
						// --- 2. Networking ---
						if (additionalFields.ipaddress) attributes.ipaddress = additionalFields.ipaddress;
						if (additionalFields.ipv6address) attributes.ipv6address = additionalFields.ipv6address;

						// Arrays de IPs (split comma)
						if (additionalFields.additional_ipv4addresses) {
							attributes.additional_ipv4addresses = (additionalFields.additional_ipv4addresses as string)
								.split(',').map(ip => ip.trim()).filter(ip => ip);
						}
						if (additionalFields.additional_ipv6addresses) {
							attributes.additional_ipv6addresses = (additionalFields.additional_ipv6addresses as string)
								.split(',').map(ip => ip.trim()).filter(ip => ip);
						}

						// Parents (split comma)
						if (additionalFields.parents) {
							attributes.parents = (additionalFields.parents as string)
								.split(',').map(p => p.trim()).filter(p => p);
						}

						// --- 3. Tags & Enums ---
						if (additionalFields.tag_address_family) attributes.tag_address_family = additionalFields.tag_address_family;
						if (additionalFields.tag_agent) attributes.tag_agent = additionalFields.tag_agent;
						if (additionalFields.cmk_agent_connection) attributes.cmk_agent_connection = additionalFields.cmk_agent_connection;
						if (additionalFields.tag_snmp_ds) attributes.tag_snmp_ds = additionalFields.tag_snmp_ds;
						if (additionalFields.tag_piggyback) attributes.tag_piggyback = additionalFields.tag_piggyback;
						if (additionalFields.tag_criticality) attributes.tag_criticality = additionalFields.tag_criticality;
						if (additionalFields.tag_networking) attributes.tag_networking = additionalFields.tag_networking;

						// --- 4. Management Board ---
						if (additionalFields.management_protocol && additionalFields.management_protocol !== 'none') {
							attributes.management_protocol = additionalFields.management_protocol;
						}
						if (additionalFields.management_address) attributes.management_address = additionalFields.management_address;

						// --- 5. Booleans ---
						if (additionalFields.waiting_for_discovery !== undefined) attributes.waiting_for_discovery = additionalFields.waiting_for_discovery;
						if (additionalFields.bake_agent_package !== undefined) attributes.bake_agent_package = additionalFields.bake_agent_package;

						// --- 6. Contact Groups (Complex Object) ---
						const cgUi = additionalFields.contactgroups_ui as IDataObject;
						if (cgUi && cgUi.settings) {
							const settings = cgUi.settings as IDataObject;
							
							// Transforma string "admins,users" em array ["admins", "users"]
							const groupsArray = (settings.groups as string || '')
								.split(',')
								.map(g => g.trim())
								.filter(g => g !== '');

							// Checkmk espera este formato exato para contactgroups
							attributes.contactgroups = {
								groups: groupsArray,
								use: settings.use ?? true,
								use_for_services: settings.use_for_services ?? true,
								recurse_use: settings.recurse_use ?? true,
								recurse_perms: settings.recurse_perms ?? true,
							};
						}

						// --- 7. Labels ---
						if (additionalFields.labels) {
							const labelsString = additionalFields.labels as string;
							if (labelsString.trim() !== '') {
								const labelsObj: IDataObject = {};
								const labelPairs = labelsString.split(',').map(l => l.trim());
								for (const pair of labelPairs) {
									const [key, value] = pair.split(':').map(s => s.trim());
									if (key && value) {
										labelsObj[key] = value;
									}
								}
								if (Object.keys(labelsObj).length > 0) {
									attributes.labels = labelsObj;
								}
							}
						}

						// --- 8. Custom Attributes (JSON) ---
						if (additionalFields.customAttributes) {
							let customAttrs: IDataObject = {};
							try {
								if (typeof additionalFields.customAttributes === 'string') {
									customAttrs = JSON.parse(additionalFields.customAttributes);
								} else {
									customAttrs = additionalFields.customAttributes as IDataObject;
								}
								Object.assign(attributes, customAttrs);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `Invalid JSON in customAttributes field: ${error}`);
							}
						}

						const body: IDataObject = {
							host_name: hostName,
							folder: normalizeFolderId(folder),
							attributes: attributes,
						};

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

					if (operation === 'create_cluster') { //CMK_CREATECLUSTER
						const hostName = this.getNodeParameter('hostName', i) as string;
						const folder = this.getNodeParameter('folder', i) as string;
						const nodesInput = this.getNodeParameter('nodes', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const nodes = nodesInput
							.split(',')
							.map((n) => n.trim())
							.filter((n) => n !== '');

						if (nodes.length === 0) {
							throw new NodeOperationError(this.getNode(), 'A cluster must have at least one node.');
						}

						const attributes: IDataObject = {};
						if (additionalFields.ipaddress) attributes.ipaddress = additionalFields.ipaddress;
						if (additionalFields.ipv6address) attributes.ipv6address = additionalFields.ipv6address;
						if (additionalFields.tag_agent) attributes.tag_agent = additionalFields.tag_agent;

						const body: IDataObject = {
							host_name: hostName,
							folder: normalizeFolderId(folder), 
							nodes: nodes,
							attributes: attributes,
						};

					
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_config/collections/clusters',
							body,
						);
						returnData.push(response);
					}
					if (operation === 'update_cluster_nodes') { //CMK_UPDATECLUSTERNODES
						const hostName = this.getNodeParameter('hostName', i) as string;
						const nodesInput = this.getNodeParameter('nodes', i) as string;

						const nodes = nodesInput
							.split(',')
							.map((n) => n.trim())
							.filter((n) => n !== '');

						if (nodes.length === 0) {
							throw new NodeOperationError(this.getNode(), 'A cluster must have at least one node.');
						}

						
						const hostData = await checkmkApiRequestWithETag.call(
							this,
							'GET',
							`/objects/host_config/${encodeURIComponent(hostName)}`
						);
						
						const etag = hostData.etag;
						const ifMatchHeader = etag ? `"${etag}"` : '"*"';

						const body: IDataObject = {
							nodes: nodes,
						};

						const response = await checkmkApiRequest.call(
							this,
							'PUT',
							`/objects/host_config/${encodeURIComponent(hostName)}/properties/nodes`,
							body,
							{}, 
							{ 'If-Match': ifMatchHeader } 
						);
						
						returnData.push(response);
					}

					if (operation === 'get') { //CMK_GETHOSTS
						const hostName = this.getNodeParameter('hostName', i) as string;

						// Additional Fields for this operation
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

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

					if (operation === 'update') { //CMK_UPDATEHOSTS
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
								throw new NodeOperationError(this.getNode(), `Invalid JSON in attributes field: ${error}`);
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
								throw new NodeOperationError(this.getNode(), `Invalid JSON in update_attributes field: ${error}`);
							}
						} else if (additionalFields.remove_attributes) {
							const removeAttrsString = additionalFields.remove_attributes as string;
							if (removeAttrsString.trim() !== '') {
								body.remove_attributes = removeAttrsString.split(',').map(a => a.trim());
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

					if (operation === 'delete') { //CMK_DELETEHOSTS
						const hostName = this.getNodeParameter('hostName', i) as string;
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/host_config/${encodeURIComponent(hostName)}`,
						);
						returnData.push({ success: true, hostName });
					}
					if (operation === 'bulk_delete') { //CMK_BULKDELETEHOSTS
						const hostNamesInput = this.getNodeParameter('hostNames', i) as string;
						
						const entries = hostNamesInput
							.split(',')
							.map((h) => h.trim())
							.filter((h) => h !== '');

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'Please provide at least one hostname.');
						}

						const body: IDataObject = {
							entries: entries,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_config/actions/bulk-delete/invoke',
							body,
						);

						if (response === undefined || (typeof response === 'object' && Object.keys(response).length === 0)) {
							returnData.push({ 
								success: true, 
								message: 'Hosts deleted successfully',
								deleted_hosts: entries 
							});
						} else {
							returnData.push(response);
						}
					}
					if (operation === 'move') { //CMK_MOVEHOSTSTOANOTHERFOLDER
						const hostName = this.getNodeParameter('hostName', i) as string;
						const folder = this.getNodeParameter('folder', i) as string;

						const body: IDataObject = {
							target_folder: normalizeFolderId(folder),
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'POST',
							`/objects/host_config/${encodeURIComponent(hostName)}/actions/move/invoke`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'rename') { //CMK_RENAMEHOSTS
						const hostName = this.getNodeParameter('hostName', i) as string;
						const newName = this.getNodeParameter('newName', i) as string;

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
					//CMK_GetAllHosts
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

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
							const limit = this.getNodeParameter('limit', i, 50) as number;
							
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

				}


				// ==================== HOST GROUP OPERATIONS ====================
				if (resource === 'hostGroup') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') { //CMK_CreateHostGroup
						const alias = this.getNodeParameter('alias', i, '') as string;
						const customer = this.getNodeParameter('customer', i, '') as string;

						const body: IDataObject = {
							name: name,
							alias: alias,
							customer: customer,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_group_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'bulk_update') { //CMK_BulkUpdateHostGroups
						const mode = this.getNodeParameter('hostGroupUpdateMode', i) as string;
						let entries: IDataObject[] = [];

						if (mode === 'ui') {
							const uiData = this.getNodeParameter('hostGroupUpdateEntries', i) as IDataObject;
							const uiEntries = (uiData.entry as IDataObject[]) || [];

							for (const entry of uiEntries) {
								const name = entry.name as string;
								const attributes: IDataObject = {};

								if (entry.alias && (entry.alias as string).trim() !== '') {
									attributes.alias = entry.alias;
								}
								if (entry.customer && (entry.customer as string).trim() !== '') {
									attributes.customer = entry.customer;
								}

								if (Object.keys(attributes).length > 0) {
									entries.push({
										name: name,
										attributes: attributes
									});
								}
							}
						} else {
							// Modo JSON
							const jsonInput = this.getNodeParameter('hostGroupUpdateEntriesJson', i);
							if (typeof jsonInput === 'string') {
								try {
									entries = JSON.parse(jsonInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Entries JSON field');
								}
							} else if (Array.isArray(jsonInput)) {
								entries = jsonInput as IDataObject[];
							}
						}

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'No valid entries provided for bulk update');
						}

						const body = {
							entries: entries
						};

						const response = await checkmkApiRequest.call(
							this,
							'PUT', 
							'/domain-types/host_group_config/actions/bulk-update/invoke',
							body
						);
						returnData.push(response);
					}

					if (operation === 'bulk_delete') { //CMK_BulkDeleteHostGroups
						const namesInput = this.getNodeParameter('hostGroupNames', i) as string;

						const entries = namesInput
							.split(',')
							.map((n) => n.trim())
							.filter((n) => n !== '');

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'Please provide at least one host group name.');
						}

						const body: IDataObject = {
							entries: entries,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_group_config/actions/bulk-delete/invoke',
							body,
						);
						
						if (response === undefined || (typeof response === 'object' && Object.keys(response).length === 0)) {
							returnData.push({ 
								success: true, 
								message: 'Host groups deleted successfully',
								deleted_groups: entries 
							});
						} else {
							returnData.push(response);
						}
					}

					if (operation === 'bulk_create') { //CMK_BulkCreateHostGroups
						const mode = this.getNodeParameter('hostGroupCreateMode', i) as string;
						let entries: IDataObject[] = [];

						if (mode === 'ui') {
							const uiData = this.getNodeParameter('hostGroupEntries', i) as IDataObject;
							if (uiData.entry) {
								entries = uiData.entry as IDataObject[];
							}
						} else {
							// Modo JSON
							const jsonInput = this.getNodeParameter('hostGroupEntriesJson', i);
							if (typeof jsonInput === 'string') {
								try {
									entries = JSON.parse(jsonInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Entries JSON field');
								}
							} else if (Array.isArray(jsonInput)) {
								entries = jsonInput as IDataObject[];
							}
						}

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'No entries provided for bulk creation');
						}

						const body = {
							entries: entries
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_group_config/actions/bulk-create/invoke',
							body
						);
						returnData.push(response);
					}

					if (operation === 'get') { //CMK_GetHostGroup
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/host_group_config/${encodeURIComponent(name)}`, 
						);
						returnData.push(response);
					}

					if (operation === 'getMany') { //CMK_GetManyHostGroups
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						
						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/host_group_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i, 50) as number;
							
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/host_group_config/collections/all',
							);
							
							const groups = response.value || [];
							returnData.push(...groups.slice(0, limit));
						}
					}

					if (operation === 'update') { //CMK_UpdateHostGroup
						const alias = this.getNodeParameter('alias', i, '') as string;
						const customer = this.getNodeParameter('customer', i, '') as string;

						const body: IDataObject = {
							alias: alias,
							customer: customer,
						};
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/host_group_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteHostGroup
						
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
		

					// CMK_CreateServiceGroup
					if (operation === 'create') {

						const name 		= this.getNodeParameter('name', i, '') as string;
						const alias		= this.getNodeParameter('alias', i, '') as string;
						const customer 	= this.getNodeParameter('customer', i, '') as string;

						const body: IDataObject = {
							name: name,
							alias: alias,
							customer: customer
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/service_group_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					// CMK_BulkCreateServiceGroup
					if (operation === 'bulk_create') {
						const createMode = this.getNodeParameter('createMode', i) as string;
						let apiEntries: IDataObject[] = [];

						if (createMode === 'ui') {
							const entriesInput = this.getNodeParameter('entries', i) as IDataObject;
							const entriesList = (entriesInput.entry as IDataObject[]) || [];

							if (entriesList.length === 0) continue;

							for (const entry of entriesList) {
								const apiEntry: IDataObject = {
									name: entry.name as string,
									alias: entry.alias as string,
									customer: entry.customer as string,
								};

								apiEntries.push(apiEntry);
							}

						} else {
							const rawJson = this.getNodeParameter('entriesJson', i);
							if (typeof rawJson === 'string') {
								try {
									apiEntries = JSON.parse(rawJson);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Entries JSON field.');
								}
							} else if (Array.isArray(rawJson)) {
								apiEntries = rawJson as IDataObject[];
							} else {
								throw new NodeOperationError(this.getNode(), 'Entries JSON must be an array of objects.');
							}

							if (apiEntries.some(e => !e.name || !e.alias || !e.customer)) {
								throw new NodeOperationError(this.getNode(), 'All entries in JSON mode must contain the "name", "alias", and "customer" properties.');
							}
						}

						if (apiEntries.length > 0) {
							const body = { entries: apiEntries };
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/service_group_config/actions/bulk-create/invoke',
								body,
							);
							returnData.push(response);
						}
					}

					// CMK_GetServiceGroup
					if (operation === 'get') {

						const name 	= this.getNodeParameter('name', i, '') as string;
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/service_group_config/${name}`,
						);
						returnData.push(response);
					}

					// CMK_GetManyServiceGroup
					if (operation === 'getMany') {

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/service_group_config/collections/all'
						)
						returnData.push(response);

					}
					
					// CMK_UpdateServiceGroup
					if (operation === 'update') {
						const alias 	= this.getNodeParameter('alias', i, '') as string;
						const name 		= this.getNodeParameter('name', i, '') as string;
						const customer	= this.getNodeParameter('customer', i, '') as string;

						const body: IDataObject = {
							alias: alias,
							customer: customer
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/service_group_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					// CMK_DeleteServiceGroup
					if (operation === 'delete') {
						const name 	= this.getNodeParameter('name', i, '') as string;
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/service_group_config/${encodeURIComponent(name)}`,
						);
						returnData.push({ success: true, name });
					}

					// CMK_BulkUpdateServiceGroup
					if (operation === 'bulk_update') {
						const createMode = this.getNodeParameter('createMode', i) as string;
						let apiEntries: IDataObject[] = [];

						if (createMode === 'ui') {
							const entriesInput = this.getNodeParameter('updateEntries', i) as IDataObject;
							const entriesList = (entriesInput.entry as IDataObject[]) || [];

							if (entriesList.length === 0) continue;

							for (const entry of entriesList) {
								const apiEntry: IDataObject = {
									name: entry.name as string,
									attributes: {},
								};

								// Add attributes that are provided
								if (entry.alias) {
									(apiEntry.attributes as IDataObject).alias = entry.alias;
								}
								if (entry.customer) {
									(apiEntry.attributes as IDataObject).customer = entry.customer;
								}

								apiEntries.push(apiEntry);
							}

						} else {
							const rawJson = this.getNodeParameter('updateEntriesJson', i);
							if (typeof rawJson === 'string') {
								try {
									apiEntries = JSON.parse(rawJson);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Update Entries JSON field.');
								}
							} else if (Array.isArray(rawJson)) {
								apiEntries = rawJson as IDataObject[];
							} else {
								throw new NodeOperationError(this.getNode(), 'Update Entries JSON must be an array of objects.');
							}

							if (apiEntries.some(e => !e.name || !e.attributes)) {
								throw new NodeOperationError(this.getNode(), 'All entries in JSON mode must contain the "name" and "attributes" properties.');
							}
						}

						if (apiEntries.length > 0) {
							const body = { entries: apiEntries };
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/service_group_config/actions/bulk-update/invoke',
								body,
							);
							returnData.push(response);
						}
					}

					// CMK_BulkDeleteServiceGroup
					if (operation === 'bulk_delete') {
						const createMode = this.getNodeParameter('createMode', i) as string;
						let entries: string[] = [];

						if (createMode === 'ui') {
							const entriesInput = this.getNodeParameter('deleteEntries', i) as IDataObject;
							const entriesList = (entriesInput.entry as IDataObject[]) || [];

							if (entriesList.length === 0) continue;

							for (const entry of entriesList) {
								entries.push(entry.name as string);
							}

						} else {
							const rawJson = this.getNodeParameter('deleteEntriesJson', i);
							if (typeof rawJson === 'string') {
								try {
									entries = JSON.parse(rawJson);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Delete Entries JSON field.');
								}
							} else if (Array.isArray(rawJson)) {
								entries = rawJson as string[];
							} else {
								throw new NodeOperationError(this.getNode(), 'Delete Entries JSON must be an array of strings.');
							}

							if (!entries.every(e => typeof e === 'string')) {
								throw new NodeOperationError(this.getNode(), 'All entries in JSON mode must be strings (service group names).');
							}
						}

						if (entries.length > 0) {
							const body = { entries: entries };
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/service_group_config/actions/bulk-delete/invoke',
								body,
							);
							returnData.push(response);
						}
					}
				}

				// ==================== FOLDER OPERATIONS ==================== AQUIN
				if (resource === 'folder') {
					// Using shared normalizeFolderId and folderIdToPath from GenericFunctions
					// CMK_CreateFolder
					if (operation === 'create') {

						const title = this.getNodeParameter('title', i) as string;
						const parentLocator = this.getNodeParameter('parent', i) as any;
						const attributes = this.getNodeParameter(
							'attributes',
							i,
							{},
						) as IDataObject;

						// Extract parent folder ID from resource locator
						const parentFolderId = await extractFolderIdFromLocator.call(this, parentLocator);

						// Build the body with required fields
						// Checkmk will automatically generate the unique ID based on title
						const body: IDataObject = {
							title: title,
							parent: parentFolderId,
						};

						// Add additional attributes if provided
						if (attributes) {
							let parsedAttributes: IDataObject = {};
							try {
								if (typeof attributes === 'string') {
									parsedAttributes = JSON.parse(attributes);
								} else {
									parsedAttributes = attributes as IDataObject;
								}
								// Add attributes as a nested object (as per Checkmk API specification)
								if (Object.keys(parsedAttributes).length > 0) {
									body.attributes = parsedAttributes;
								}
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `Invalid JSON in attributes field: ${error}`);
							}
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/folder_config/collections/all',
							body,
						);
						const enhanced = { ...(response as IDataObject) } as IDataObject;
						if (enhanced.id) {
							enhanced.path = folderIdToPath(String(enhanced.id));
							enhanced.locator = `${enhanced.path} (${enhanced.id})`;
						}
						returnData.push(enhanced);
					}


					// CMK_GetFolder
					if (operation === 'get') {
						const folderLocator = this.getNodeParameter('folder', i) as any;
						const folderId = await extractFolderIdFromLocator.call(this, folderLocator);
						const qs: IDataObject = {};
						const show_hosts = this.getNodeParameter('show_hosts', i, false) as boolean;

						if (show_hosts) {
							qs.show_hosts = show_hosts;
						}
						
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/folder_config/${encodeURIComponent(folderId)}`,
							{},
							qs
						);
						const res = { ...(response as IDataObject) } as IDataObject;
						if (res.id) {
							res.path = folderIdToPath(String(res.id));
							res.locator = `${res.path} (${res.id})`;
						}
						returnData.push(res);
					}

					//CMK_HostsInFolder
					if (operation === 'getHosts') {
						const folderLocator = this.getNodeParameter('folder', i) as any;
						const folderId = await extractFolderIdFromLocator.call(this, folderLocator);
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

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
						if (additionalFields.site) {
							qs.site = additionalFields.site;
						}
						// Use the already extracted folderId from resource locator
						const endpoint = `/objects/folder_config/${encodeURIComponent(folderId)}/collections/hosts`;

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								endpoint,
								{},
								qs,
							);
							// Push only new hosts (dedupe by id)
							if (Array.isArray(response)) {
								for (const h of response) {
									const id = h.id || h.name || h.title || JSON.stringify(h);
									if (!seenHostIds.has(id)) {
										seenHostIds.add(id);
										returnData.push(h as IDataObject);
									}
								}
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								endpoint,
								{},
								qs,
							);
							const hosts = response.value || [];
							for (const h of hosts.slice(0, limit)) {
								const id = h.id || h.name || h.title || JSON.stringify(h);
								if (!seenHostIds.has(id)) {
									seenHostIds.add(id);
									returnData.push(h as IDataObject);
								}
							}
						}
					}

					// CMK_GetManyFolders
					if (operation === 'getMany') {
						
						const parentLocator = this.getNodeParameter('parent', i) as any; 
						const parent = await extractFolderIdFromLocator.call(this, parentLocator);
						const recursive = this.getNodeParameter('recursive', i, false) as boolean;
						const show_hosts = this.getNodeParameter('show_hosts', i, false) as boolean;
						
						const qs: IDataObject = {};
						if (parent) qs.parent = parent;
						if (recursive) qs.recursive = recursive;
						if (show_hosts) qs.show_hosts = show_hosts;

	
						const response = await checkmkApiRequestAllItems.call(
							this,
							'GET',
							'/domain-types/folder_config/collections/all',
							{},  
							qs   
						);
						const enhanced = Array.isArray(response)
							? response.map((r: any) => (r && r.id ? { ...r, path: folderIdToPath(String(r.id)), locator: `${folderIdToPath(String(r.id))} (${r.id})` } : r))
							: response;
						returnData.push(...enhanced);

					}
					// CMK_UpdateFolder
					if (operation === 'update') {
						const folderLocator = this.getNodeParameter('folder', i) as any;
						const folderId = await extractFolderIdFromLocator.call(this, folderLocator);
						
						const title = this.getNodeParameter('title', i, '') as string;
						const attributeChoice = this.getNodeParameter('attributeChoice', i) as string;
						const body: IDataObject = {};

						// Add title if provided
						if (title.trim() !== '') {
							body.title = title;
						}

						// Handle attributes based on attributeChoice
						if (attributeChoice) {
							try {
								if (attributeChoice === 'attributes') {
									// Replace all attributes with the given ones
									const attributesInput = this.getNodeParameter('attributes', i, '{}') as string | IDataObject;
									let parsedAttributes: IDataObject = {};
									if (typeof attributesInput === 'string') {
										parsedAttributes = JSON.parse(attributesInput);
									} else {
										parsedAttributes = attributesInput as IDataObject;
									}
									if (Object.keys(parsedAttributes).length > 0) {
										body.attributes = parsedAttributes;
									}
								} else if (attributeChoice === 'update_attributes') {
									// Update existing attributes with the given ones
									const updateAttributesInput = this.getNodeParameter('update_attributes', i, '{}') as string | IDataObject;
									let parsedUpdateAttributes: IDataObject = {};
									if (typeof updateAttributesInput === 'string') {
										parsedUpdateAttributes = JSON.parse(updateAttributesInput);
									} else {
										parsedUpdateAttributes = updateAttributesInput as IDataObject;
									}
									if (Object.keys(parsedUpdateAttributes).length > 0) {
										body.update_attributes = parsedUpdateAttributes;
									}
								} else if (attributeChoice === 'remove_attributes') {
									// Remove specified attributes (comma-separated string)
									const removeAttributesInput = this.getNodeParameter('remove_attributes', i, '') as string;
									if (removeAttributesInput.trim() !== '') {
										body.remove_attributes = removeAttributesInput.split(',').map(attr => attr.trim());
									}
								}
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `Invalid attributes format for ${attributeChoice}: ${error}`);
							}
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/folder_config/${encodeURIComponent(folderId)}`,
							body,
						);
						const res = { ...(response as IDataObject) } as IDataObject;
						if (res.id) {
							res.path = folderIdToPath(String(res.id));
							res.locator = `${res.path} (${res.id})`;
						}
						returnData.push(res);
					}
					// CMK_DeleteFolder
					if (operation === 'delete') {
						const folderLocator = this.getNodeParameter('folder', i) as any;
						const folderId = await extractFolderIdFromLocator.call(this, folderLocator);
						const deleteMode = this.getNodeParameter('delete_mode', i) as string;

						const qs: IDataObject = {};
						if (deleteMode) {
							qs.delete_mode = deleteMode;
						}

						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/folder_config/${encodeURIComponent(folderId)}`,
							{},
							qs,
						);
						const folderPath = folderIdToPath(folderId);
						returnData.push({ success: true, folderId, path: folderPath, locator: `${folderPath} (${folderId})` });
					}

					if (operation === 'move') { // CMK_MoveFolder
						const folderLocator = this.getNodeParameter('folder', i) as any;
						const folderId = await extractFolderIdFromLocator.call(this, folderLocator);
						const destinationLocator = this.getNodeParameter('destination', i) as any;
						const destinationId = await extractFolderIdFromLocator.call(this, destinationLocator);

						const body: IDataObject = {
							destination: destinationId,
						};

						
						await checkmkApiRequestWithIfMatch.call(
							this,
							'POST',
							`/objects/folder_config/${encodeURIComponent(folderId)}/actions/move/invoke`,
							body
						);
						const folderPath = folderIdToPath(folderId);
						returnData.push({ success: true, folderId, path: folderPath, locator: `${folderPath} (${folderId})` });
					}

					// CMK_UpdateFolder (Bulk)
					if (operation === 'bulk_update') {
						const updateMode = this.getNodeParameter('updateMode', i) as string;
						let apiEntries: IDataObject[] = [];

						if (updateMode === 'ui') {
							// ================= MODO UI =================
							const entriesInput = this.getNodeParameter('entries', i) as IDataObject;
							const entriesList = (entriesInput.entry as IDataObject[]) || [];
							
							if (entriesList.length === 0) continue;

							for (const entry of entriesList) {
								// No modo UI, usamos o helper para extrair o ID corretamente
								const folderLocator = entry.folder as IDataObject;
								const folderId = await extractFolderIdFromLocator.call(this, folderLocator);

								const apiEntry: IDataObject = {
									folder: folderId,
								};

								if (entry.title && (entry.title as string).trim() !== '') {
									apiEntry.title = entry.title as string;
								}

								const choice = entry.attributeChoice as string;

								if (choice === 'attributes' || choice === 'update_attributes') {
									const jsonInput = entry.attributes_json as string | object;
									let parsedAttrs: IDataObject = {};
									if (typeof jsonInput === 'string') {
										try {
											parsedAttrs = JSON.parse(jsonInput);
										} catch (e) {
											throw new NodeOperationError(this.getNode(), `Invalid JSON in attributes for folder ${folderId}`);
										}
									} else {
										parsedAttrs = jsonInput as IDataObject;
									}
									if (Object.keys(parsedAttrs).length > 0) {
										apiEntry[choice] = parsedAttrs;
									}
								} else if (choice === 'remove_attributes') {
									const removeStr = entry.remove_attributes_list as string;
									if (removeStr && removeStr.trim() !== '') {
										apiEntry.remove_attributes = removeStr.split(',').map(s => s.trim());
									}
								}
								apiEntries.push(apiEntry);
							}

						} else {
							// ================= MODO JSON =================
							const rawJson = this.getNodeParameter('entriesJson', i);
							
							if (typeof rawJson === 'string') {
								try {
									apiEntries = JSON.parse(rawJson);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Entries JSON field.');
								}
							} else if (Array.isArray(rawJson)) {
								apiEntries = rawJson as IDataObject[];
							} else {
								throw new NodeOperationError(this.getNode(), 'Entries JSON must be an array of objects.');
							}

							// Validação básica do JSON para garantir que tem o campo folder
							// O usuário é responsável por passar o ID correto (ex: ~folder_id) neste modo
							if (apiEntries.some(e => !e.folder)) {
								throw new NodeOperationError(this.getNode(), 'All entries in JSON mode must contain the "folder" property.');
							}
						}

						// Envia para a API se tivermos entradas
						if (apiEntries.length > 0) {
							const body = {
								entries: apiEntries
							};

							const response = await checkmkApiRequest.call(
								this,
								'PUT',
								'/domain-types/folder_config/actions/bulk-update/invoke',
								body
							);
							returnData.push(response);
						}
					}
				}// Common fields used across multiple resources

				// ==================== USER OPERATIONS ====================
				if (resource === 'user') {
					const name = this.getNodeParameter('username', i, '') as string;

					if (operation === 'create') { //CMK_CreateUser
						const fullname = this.getNodeParameter('fullname', i, '') as string;
						const customer = this.getNodeParameter('customer', i, '') as string;
						const authType = this.getNodeParameter('authType', i, '') as string;

						const roles = this.getNodeParameter('roles', i, ['user']) as string[];
						const authorizedSites = this.getNodeParameter('authorizedSites', i, 'all') as string;

						// DEBUG 1: Ver o que o n8n está a ler dos inputs
						// @ts-ignore
						//console.log('--- INPUTS LIDOS ---');
						// @ts-ignore
						//console.log('Roles selecionadas:', roles);
						// @ts-ignore
						//console.log('Sites autorizados:', authorizedSites);

						const body: IDataObject = {
							username: name,
							fullname: fullname,
							disable_login: false,
							roles: roles,
							authorized_sites: authorizedSites.split(',').map(s => s.trim()),
						};
						if (customer && customer.trim() !== '') {
							body.customer = customer.trim();
						}
						if (authType === 'password') {
							const password = this.getNodeParameter('password', i, '') as string;
							if (password && password.trim() !== '') {
								body.auth_option = {
									auth_type: 'password',
									password: password.trim(),
								};
							} else {
								throw new NodeOperationError(this.getNode(), 'Password must be provided');
							}
						} else if (authType === 'automation') {
							const secret = this.getNodeParameter('automation', i, '') as string;
							if (secret && secret.trim() !== '') {
								body.auth_option = {
									auth_type: 'automation',
									secret: secret.trim(),
								};
							} else {
								throw new NodeOperationError(this.getNode(), 'Secret must be provided');
							}
						}

						// DEBUG 2: Ver o JSON final
						// @ts-ignore
						//console.log('--- JSON PAYLOAD FINAL ---');
						// @ts-ignore
						//console.log(JSON.stringify(body, null, 2));
						// @ts-ignore
						//console.log('--------------------------');

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/user_config/collections/all',
							body,
						);
						returnData.push(response);
					}
					
					if (operation === 'getMany') { //CMK_GetAllUsers
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

					if (operation === 'update') { //CMK_EditUser
						const fullname = this.getNodeParameter('fullname', i, '') as string;
						const customer = this.getNodeParameter('customer', i, '') as string;
						const authorizedSites = this.getNodeParameter('authorizedSites', i, '') as string;
						const roles = this.getNodeParameter('roles', i, []) as string[];
						const authType = this.getNodeParameter('authType', i, '') as string;

						const body: IDataObject = {};

						if (fullname) body.fullname = fullname;
						if (customer) body.customer = customer;
						
						if (roles.length > 0) body.roles = roles;
						if (authorizedSites) {
							body.authorized_sites = authorizedSites.split(',').map(s => s.trim());
						}

						if (authType === 'password') {
							const password = this.getNodeParameter('password', i, '') as string;
							if (password && password.trim() !== '') {
								body.auth_option = {
									auth_type: 'password',
									password: password.trim(),
								};
							}
						} else if (authType === 'automation') {
							const secret = this.getNodeParameter('automation', i, '') as string;
							if (secret && secret.trim() !== '') {
								body.auth_option = {
									auth_type: 'automation',
									secret: secret.trim(),
								};
							}
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/user_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteUser
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

					if (operation === 'create') { //CMK_CreateContactGroup
						const alias = this.getNodeParameter('alias', i, '') as string;
						const invType = this.getNodeParameter('inventoryPathsType', i, 'allow_all') as string;

						const body: IDataObject = {
							name: name,
							alias: alias,
						};

						const inventoryPathsObj: IDataObject = {
							type: invType,
						};

						
						if (invType === 'specific_paths') {
							const specificPaths = this.getNodeParameter('specificPaths', i, '') as string;
							inventoryPathsObj.paths = specificPaths
								.split(',')
								.map((p) => p.trim())
								.filter((p) => p !== '');
						}

						body.inventory_paths = inventoryPathsObj;
						// Debug Log
						// @ts-ignore
						//console.log('DEBUG:', JSON.stringify(body, null, 2));
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/contact_group_config/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') { //CMK_GetContactGroup
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/contact_group_config/${encodeURIComponent(name)}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') { //CMK_GetManyContactGroups
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'GET',
								'/domain-types/contact_group_config/collections/all',
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i, 50) as number;
							
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/contact_group_config/collections/all',
							);
							
							const groups = response.value || [];
							returnData.push(...groups.slice(0, limit));
						}
					}

					if (operation === 'update') { //CMK_UpdateContactGroup
						const alias = this.getNodeParameter('alias', i, '') as string;
						const invType = this.getNodeParameter('inventoryPathsType', i, '') as string;

						const body: IDataObject = {
							alias: alias,
						};

						// Apenas constrói e envia se o utilizador escolheu mudar o policy
						if (invType) {
							const inventoryPathsObj: IDataObject = {
								type: invType,
							};

							// Lógica para montar a estrutura complexa quando escolhem "Specific Paths"
							if (invType === 'specific_paths') {
								const pathsUi = this.getNodeParameter('specificPathsUi', i, {}) as IDataObject;
								const pathEntries = (pathsUi?.pathEntry as IDataObject[]) || [];
								const pathsArray: IDataObject[] = [];

								for (const p of pathEntries) {
									const pathObj: IDataObject = { 
										path: p.path as string 
									};

									// Função para estruturar os restritores conforme o schema exigido pelo Checkmk
									const buildRestriction = (type: string, valuesStr?: string) => {
										const res: IDataObject = { type: type };
										if (type === 'restrict_values' && valuesStr) {
											res.values = valuesStr.split(',').map(v => v.trim()).filter(v => v !== '');
										}
										return res;
									};

									pathObj.attributes = buildRestriction(p.attributesType as string, p.attributesValues as string);
									pathObj.columns = buildRestriction(p.columnsType as string, p.columnsValues as string);
									pathObj.nodes = buildRestriction(p.nodesType as string, p.nodesValues as string);

									pathsArray.push(pathObj);
								}
								inventoryPathsObj.paths = pathsArray;
							}

							body.inventory_paths = inventoryPathsObj;
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/contact_group_config/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}
					if (operation === 'delete') { //CMK_DeleteContactGroup
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/contact_group_config/${encodeURIComponent(name)}`,
						);
						
						// Retorna uma confirmação de sucesso
						returnData.push({ success: true, name });
					}

					if (operation === 'bulk_create') { //CMK_BulkCreateContactGroups
						const mode = this.getNodeParameter('contactGroupCreateMode', i) as string;
						let entries: IDataObject[] = [];

						if (mode === 'ui') {
							const uiData = this.getNodeParameter('contactGroupEntries', i) as IDataObject;
							if (uiData.entry) {
								entries = uiData.entry as IDataObject[];
							}
						} else {
							const jsonInput = this.getNodeParameter('contactGroupEntriesJson', i);
							if (typeof jsonInput === 'string') {
								try {
									entries = JSON.parse(jsonInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Entries JSON field');
								}
							} else if (Array.isArray(jsonInput)) {
								entries = jsonInput as IDataObject[];
							}
						}

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'No entries provided for bulk creation');
						}

						const body = {
							entries: entries
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/contact_group_config/actions/bulk-create/invoke',
							body
						);
						returnData.push(response);
					}

					if (operation === 'bulk_delete') { //CMK_BulkDeleteContactGroups
						const namesInput = this.getNodeParameter('contactGroupNames', i) as string;
						
						const entries = namesInput
							.split(',')
							.map((n) => n.trim())
							.filter((n) => n !== '');

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'Please provide at least one contact group name.');
						}

						const body = {
							entries: entries
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST', 
							'/domain-types/contact_group_config/actions/bulk-delete/invoke',
							body,
						);
						
						if (response === undefined || (typeof response === 'object' && Object.keys(response).length === 0)) {
							returnData.push({ 
								success: true, 
								message: 'Contact groups deleted successfully',
								deleted_groups: entries 
							});
						} else {
							returnData.push(response);
						}
					}

					if (operation === 'bulk_update') { // CMK_BulkUpdateContactGroups
						const mode = this.getNodeParameter('contactGroupUpdateMode', i) as string;
						let entries: IDataObject[] = [];

						if (mode === 'ui') {
							const uiData = this.getNodeParameter('contactGroupUpdateEntries', i) as IDataObject;
							const uiEntries = (uiData.entry as IDataObject[]) || [];

							for (const entry of uiEntries) {
								const name = entry.name as string;
								const attributes: IDataObject = {};

								if (entry.alias && (entry.alias as string).trim() !== '') {
									attributes.alias = entry.alias;
								}

								if (entry.customer && (entry.customer as string).trim() !== '') {
									attributes.customer = entry.customer;
								}

								// Tratar Inventory Paths
								const invType = entry.inventoryPathsType as string;
								if (invType && invType !== '') {
									const inventoryPathsObj: IDataObject = {
										type: invType,
									};

									// WORKAROUND: Enviar paths vazios para satisfazer o validador estrito do Checkmk
									if (invType === 'allow_all' || invType === 'forbid_all') {
										inventoryPathsObj.paths = [];
									}

									// LÓGICA CORRIGIDA AQUI:
									// Se for specific_paths, construímos o array de objetos complexos a partir da UI
									if (invType === 'specific_paths') {
										// Acede ao specificPathsUi DENTRO da entry atual
										const pathsUi = entry.specificPathsUi as IDataObject;
										const pathEntries = (pathsUi?.pathEntry as IDataObject[]) || [];
										const pathsArray: IDataObject[] = [];

										for (const p of pathEntries) {
											const pathObj: IDataObject = { 
												path: p.path as string 
											};

											// Função auxiliar para construir as restrições (Attributes, Columns, Nodes)
											const buildRestriction = (type: string, valuesStr?: string) => {
												const res: IDataObject = { type: type };
												if (type === 'restrict_values' && valuesStr) {
													res.values = valuesStr.split(',').map(v => v.trim()).filter(v => v !== '');
												}
												return res;
											};

											pathObj.attributes = buildRestriction(p.attributesType as string, p.attributesValues as string);
											pathObj.columns = buildRestriction(p.columnsType as string, p.columnsValues as string);
											pathObj.nodes = buildRestriction(p.nodesType as string, p.nodesValues as string);

											pathsArray.push(pathObj);
										}
										inventoryPathsObj.paths = pathsArray;
									}

									attributes.inventory_paths = inventoryPathsObj;
								}

								// Adicionar entry se houver pelo menos um atributo para alterar
								if (Object.keys(attributes).length > 0) {
									entries.push({
										name: name,
										attributes: attributes
									});
								}
							}
						} else {
							// Modo JSON (Não sofre alterações)
							const jsonInput = this.getNodeParameter('contactGroupUpdateEntriesJson', i);
							if (typeof jsonInput === 'string') {
								try {
									entries = JSON.parse(jsonInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Entries JSON field');
								}
							} else if (Array.isArray(jsonInput)) {
								entries = jsonInput as IDataObject[];
							}
						}

						if (entries.length === 0) {
							throw new NodeOperationError(this.getNode(), 'No valid entries provided for bulk update');
						}

						const body = {
							entries: entries
						};

						// Debug Log para validar o Body enviado
						// @ts-ignore
						//console.log('DEBUG Bulk Update:', JSON.stringify(body, null, 2));

						const response = await checkmkApiRequest.call(
							this,
							'PUT',
							'/domain-types/contact_group_config/actions/bulk-update/invoke',
							body
						);
						returnData.push(response);
					}
				}

				// ==================== TIME PERIOD OPERATIONS ====================
				if (resource === 'timePeriod') {
					const name = this.getNodeParameter('name', i, '') as string;

					if (operation === 'create') { //CMK_CreateTimePeriod
						const alias = this.getNodeParameter('alias', i, '') as string;
						
						const activeTimeRangesUi = this.getNodeParameter('activeTimeRangesUi', i, {}) as IDataObject;
						const activeTimeRanges: IDataObject[] = [];

						if (activeTimeRangesUi.timeRange) {
							const rangesByDay: { [key: string]: IDataObject[] } = {};
							
							for (const item of (activeTimeRangesUi.timeRange as IDataObject[])) {
								const d = item.day as string;
								const r = { 
									start: item.start || '00:00:00', 
									end: item.end || '24:00:00' 
								};
								
								if (!rangesByDay[d]) rangesByDay[d] = [];
								rangesByDay[d].push(r);
							}

							for (const [day, ranges] of Object.entries(rangesByDay)) {
								activeTimeRanges.push({
									day: day,
									time_ranges: ranges
								});
							}
						}

						const exceptionsUi = this.getNodeParameter('exceptionsUi', i, {}) as IDataObject;
						const exceptions: IDataObject[] = [];

						if (exceptionsUi.exception) {
							const rangesByDate: { [key: string]: IDataObject[] } = {};
							
							for (const item of (exceptionsUi.exception as IDataObject[])) {
								const d = item.date as string;
								const r = { 
									start: item.start || '00:00:00', 
									end: item.end || '24:00:00' 
								};
								
								if (!rangesByDate[d]) rangesByDate[d] = [];
								rangesByDate[d].push(r);
							}

							for (const [date, ranges] of Object.entries(rangesByDate)) {
								exceptions.push({
									date: date,
									time_ranges: ranges
								});
							}
						}

						const excludeStr = this.getNodeParameter('exclude', i, '') as string;
						const exclude = excludeStr 
							? excludeStr.split(',').map(s => s.trim()).filter(s => s !== '') 
							: [];

						const body: IDataObject = {
							name: name,
							alias: alias,
							active_time_ranges: activeTimeRanges,
						};

						if (exceptions.length > 0) {
							body.exceptions = exceptions;
						}
						if (exclude.length > 0) {
							body.exclude = exclude;
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/time_period/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') { //CMK_ShowTimePeriod
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/time_period/${name}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') { //CMK_ShowAllTimePeriods
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

					if (operation === 'update') { //CMK_UpdatetTimePeriod
						const alias = this.getNodeParameter('alias', i, '') as string;
						
						const body: IDataObject = {};

						if (alias !== '') {
							body.alias = alias;
						}

						const activeTimeRangesUi = this.getNodeParameter('activeTimeRangesUi', i, {}) as IDataObject;
						if (activeTimeRangesUi.timeRange) {
							const activeTimeRanges: IDataObject[] = [];
							const rangesByDay: { [key: string]: IDataObject[] } = {};
							
							for (const item of (activeTimeRangesUi.timeRange as IDataObject[])) {
								const d = item.day as string;
								const r = { 
									start: item.start || '00:00:00', 
									end: item.end || '24:00:00' 
								};
								if (!rangesByDay[d]) rangesByDay[d] = [];
								rangesByDay[d].push(r);
							}

							for (const [day, ranges] of Object.entries(rangesByDay)) {
								activeTimeRanges.push({
									day: day,
									time_ranges: ranges
								});
							}
							body.active_time_ranges = activeTimeRanges;
						}

						const exceptionsUi = this.getNodeParameter('exceptionsUi', i, {}) as IDataObject;
						if (exceptionsUi.exception) {
							const exceptions: IDataObject[] = [];
							const rangesByDate: { [key: string]: IDataObject[] } = {};
							
							for (const item of (exceptionsUi.exception as IDataObject[])) {
								const d = item.date as string;
								const r = { 
									start: item.start || '00:00:00', 
									end: item.end || '24:00:00' 
								};
								if (!rangesByDate[d]) rangesByDate[d] = [];
								rangesByDate[d].push(r);
							}

							for (const [date, ranges] of Object.entries(rangesByDate)) {
								exceptions.push({
									date: date,
									time_ranges: ranges
								});
							}
							body.exceptions = exceptions;
						}

						const excludeStr = this.getNodeParameter('exclude', i, '') as string;
						if (excludeStr) {
							body.exclude = excludeStr
								.split(',')
								.map(s => s.trim())
								.filter(s => s !== '');
						}

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/time_period/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteTimePeriod
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

					// CMK_CreateRule
					if (operation === 'create') {
						const ruleset = this.getNodeParameter('ruleset', i) as string;
						const folderLocator = this.getNodeParameter('folder', i) as any;
						const folderID = await extractFolderIdFromLocator.call(this, folderLocator);
						const value_raw = this.getNodeParameter('value_raw', i) as string;
						let properties = this.getNodeParameter('properties', i) as IDataObject | string;
						let conditions = this.getNodeParameter('conditions', i) as IDataObject | string;

						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

					

						if (typeof properties === 'string') {
							if (properties.trim() === '') {
								properties = {};
							} else {
								try {
									properties = JSON.parse(properties);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), `Invalid JSON in properties field: ${error}`);
								}
							}
						}

						if (additionalFields.description && !(properties as IDataObject).description) {
							(properties as IDataObject).description = additionalFields.description;
						}
						if (additionalFields.comment && !(properties as IDataObject).comment) {
							(properties as IDataObject).comment = additionalFields.comment;
						}
						if (additionalFields.documentationUrl && !(properties as IDataObject).documentation_url) {
							(properties as IDataObject).documentation_url = additionalFields.documentationUrl;
						}
						if (additionalFields.disabled !== undefined && (properties as IDataObject).disabled === undefined) {
							(properties as IDataObject).disabled = additionalFields.disabled;
						}

						let parsedConditions: IDataObject | undefined;
						if (conditions && (typeof conditions === 'string' ? conditions.trim() !== '{}' : Object.keys(conditions).length > 0)) {
							if (typeof conditions === 'string') {
								try {
									parsedConditions = JSON.parse(conditions);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), `Invalid JSON in conditions field: ${error}`);
								}
							} else {
								parsedConditions = conditions;
							}
						}

						const body: IDataObject = {
							ruleset,
							folder: folderID,
							value_raw,
							properties,
						};

						if (parsedConditions) {
							body.conditions = parsedConditions;
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/rule/collections/all',
							body,
						);
						returnData.push(response);
					}

					// CMK_ShowRule
					if (operation === 'show') {

						const ruleId =  this.getNodeParameter('rule_id', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/rule/${ruleId}`
						);

						returnData.push(response);
					}


					// CMK_ListRules
					if (operation === 'list') {

							const ruleset = this.getNodeParameter('ruleset', i) as string;
							const qs : IDataObject = {
								ruleset_name : ruleset,
							};
							
							const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/rule/collections/all',
							{},
							qs
						);

						returnData.push(response);
					}

					// CMK_DeleteRule
					if (operation === 'delete') {

							const rule_id = this.getNodeParameter('rule_id', i) as string;
							
							const response = await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/rule/${rule_id}`,
						);

						returnData.push(response);
					}

					// CMK_ModifyRule
					if (operation === 'modify') {

						const rule_id = this.getNodeParameter('rule_id', i) as string;
						const value_raw = this.getNodeParameter('value_raw', i) as string;
						let properties = this.getNodeParameter('properties', i) as IDataObject | string;
						let conditions = this.getNodeParameter('conditions', i) as IDataObject | string;

						if (typeof properties === 'string') {
							if (properties.trim() === '') {
								properties = {};
							} else {
								try {
									properties = JSON.parse(properties);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), `Invalid JSON in properties field: ${error}`);
								}
							}
						}

						let parsedConditions: IDataObject | undefined;
						if (conditions && (typeof conditions === 'string' ? conditions.trim() !== '{}' : Object.keys(conditions).length > 0)) {
							if (typeof conditions === 'string') {
								try {
									parsedConditions = JSON.parse(conditions);
								} catch (error) {
									throw new NodeOperationError(this.getNode(), `Invalid JSON in conditions field: ${error}`);
								}
							} else {
								parsedConditions = conditions;
							}
						}

						const body: IDataObject = {
							value_raw: value_raw,
							properties: properties,
						};

						if (parsedConditions) {
							body.conditions = parsedConditions;
						}

						const response = await checkmkApiRequestWithIfMatch.call(
						this,
						'PUT',
						`/objects/rule/${rule_id}`,
						body
						);

						returnData.push(response);
					}

					// CMK_MoveRule
					if (operation === 'move') {
						const ruleId = this.getNodeParameter('rule_id', i) as string;
						const position = this.getNodeParameter('position', i) as string;

						// Inicia o body com a posição obrigatória
						const body: IDataObject = {
							position: position,
						};

						// Lógica Condicional: Se for folder, pega o ID da pasta. Se for regra, pega o ID da regra.
						if (position === 'top_of_folder' || position === 'bottom_of_folder') {
							const folderLocator = this.getNodeParameter('targetFolder', i) as any;
							const folderId = await extractFolderIdFromLocator.call(this, folderLocator);
							body.folder = folderId;
						} else if (position === 'before_specific_rule' || position === 'after_specific_rule') {
							const referenceRuleId = this.getNodeParameter('referenceRuleId', i) as string;
							// A API do Checkmk geralmente espera 'rule_id' ou 'reference_rule_id' dependendo da versão
							// Para o endpoint actions/move/invoke, o padrão costuma ser reference_rule_id
							body.rule_id = referenceRuleId;
						}

						// Nota: Como o endpoint é uma Action (invoke), usamos POST
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/rule/${ruleId}/actions/move/invoke`,
							body
						);

						returnData.push(response);
					}
				}

					// ==================== DISCOVERY OPERATIONS ====================
					if (resource === 'discovery') {


						// CMK_RunServiceDiscovery
						if (operation === 'run') {

							const hostName = this.getNodeParameter('hostName', i) as string;
							const mode = this.getNodeParameter('mode', i) as any;
							const body: IDataObject = {
								host_name: hostName,
								mode,
							};

							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/service_discovery_run/actions/start/invoke',
								body,
							);
							returnData.push(response);
						}

						// CMK_WaitServiceDiscovery
						if (operation === 'wait') {

							const hostName = this.getNodeParameter('hostName', i) as string;

							const response = await checkmkApiRequest.call(
								this,
								'GET',
								`/objects/service_discovery_run/${encodeURIComponent(hostName)}/actions/wait-for-completion/invoke`,
							);
							returnData.push(response);

						}

						// CMK_ShowDiscoveryResult
						if (operation === 'showResult') {

							const hostName = this.getNodeParameter('hostName', i) as string;

							const response = await checkmkApiRequest.call(
								this,
								'GET',
								`/objects/service_discovery/${encodeURIComponent(hostName)}`,
							);
							returnData.push(response);
						}

						// CMK_ShowLastDiscoveryResult
						if (operation === 'showLast') {

							const hostName = this.getNodeParameter('hostName', i) as string;

							const response = await checkmkApiRequest.call(
								this,
								'GET',
								`/objects/service_discovery_run/${encodeURIComponent(hostName)}`,
							);
							returnData.push(response);
						}

						// CMK_UpdateServicePhase
						if (operation === 'update') {

							const hostName = this.getNodeParameter('hostName', i) as string;
							const check_type = this.getNodeParameter('check_type', i) as string;
							const service_item = this.getNodeParameter('service_item', i) as string;
							const target_phase = this.getNodeParameter('target_phase', i) as any;

							const body: IDataObject = {
								check_type: check_type,
								service_item: service_item,
								target_phase: target_phase
							};


							const response = await checkmkApiRequest.call(
								this,
								'PUT',
								`/objects/host/${encodeURIComponent(hostName)}/actions/update_discovery_phase/invoke`,
								body
							);
							returnData.push(response);
						}

						// CMK_StartBulkDiscovery
						if (operation === 'bulkDiscovery') {
							const hostNamesInput = this.getNodeParameter('hostNames', i) as string;
							
							// Pega as collections separadas
							const discoveryOptsInput = this.getNodeParameter('discoveryOptions', i, {}) as IDataObject;
							const jobConfigInput = this.getNodeParameter('jobConfiguration', i, {}) as IDataObject;

							// 1. Processar Hostnames
							const hostnames = hostNamesInput
								.split(',')
								.map((h) => h.trim())
								.filter((h) => h !== '');

							if (hostnames.length === 0) {
								throw new NodeOperationError(this.getNode(), 'Please provide at least one hostname.');
							}

							// 2. Construir o objeto 'options' (nested)
							// Se o usuário não preencher nada na collection, enviamos os defaults false (ou o que a API esperar)
							const optionsObj = {
								monitor_undecided_services: discoveryOptsInput.monitor_undecided_services ?? false,
								remove_vanished_services: discoveryOptsInput.remove_vanished_services ?? false,
								update_service_labels: discoveryOptsInput.update_service_labels ?? false,
								update_service_parameters: discoveryOptsInput.update_service_parameters ?? false,
								update_host_labels: discoveryOptsInput.update_host_labels ?? false,
							};

							// 3. Construir o Body final (Root fields)
							const body: IDataObject = {
								hostnames: hostnames,
								options: optionsObj, // Objeto aninhado obrigatório
								// Campos opcionais na raiz (com defaults do schema)
								do_full_scan: jobConfigInput.do_full_scan ?? true,
								bulk_size: jobConfigInput.bulk_size ?? 10,
								ignore_errors: jobConfigInput.ignore_errors ?? true,
							};

							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/discovery_run/actions/bulk-discovery-start/invoke',
								body,
							);
							returnData.push(response);
						}

				}
				
				// ==================== ACKNOWLEDGE OPERATIONS ====================
				if (resource === 'acknowledge') {
					if (operation === 'remove') {//CMK_RemoveAcknowledge
						// ... (código existente da operação remove mantido igual) ...
						const type = this.getNodeParameter('acknowledge_type', i) as string;
						
						const body: IDataObject = {
							acknowledge_type: type,
						};

						if (type === 'host') {
							body.host_name = this.getNodeParameter('host_name', i) as string;
						} else if (type === 'service') {
							body.host_name = this.getNodeParameter('host_name', i) as string;
							body.service_description = this.getNodeParameter('service_description', i) as string;
						} else if (type === 'hostgroup') {
							body.hostgroup_name = this.getNodeParameter('hostgroup_name', i) as string;
						} else if (type === 'servicegroup') {
							body.servicegroup_name = this.getNodeParameter('servicegroup_name', i) as string;
						} else if (type === 'host_by_query' || type === 'service_by_query') {
							const queryInput = this.getNodeParameter('query', i);
							if (typeof queryInput === 'string') {
								try {
									body.query = JSON.parse(queryInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
								}
							} else {
								body.query = queryInput as IDataObject;
							}
						}
						
						// --- DEBUG CONSOLE ---
						//@ts-ignore
						//console.log('--- DEBUG ACKNOWLEDGE CREATE BODY ---');
						//@ts-ignore
						//console.log(JSON.stringify(body, null, 2));
						// ---------------------

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/acknowledge/actions/delete/invoke',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'create') { //CMK_SetHostAcknowledgement
						const type = this.getNodeParameter('acknowledge_type', i) as string;
						const comment = this.getNodeParameter('comment', i) as string;
						const sticky = this.getNodeParameter('sticky', i) as boolean;
						const notify = this.getNodeParameter('notify', i) as boolean;
						const persistent = this.getNodeParameter('persistent', i) as boolean;
						const expireOn = this.getNodeParameter('expire_on', i) as string;

						const body: IDataObject = {
							acknowledge_type: type,
							comment: comment,
							sticky: sticky,
							notify: notify,
							persistent: persistent,
						};

						if (expireOn) {
							// Formata data para Checkmk (sem ms): 2026-02-06T00:00:00Z
							body.expire_on = new Date(expireOn).toISOString().split('.')[0] + 'Z';
						}

						// Define o Endpoint correto baseando-se no tipo
						let endpoint = '/domain-types/acknowledge/collections/host';
						
						if (type === 'service' || type === 'service_by_query' || type === 'servicegroup') {
							endpoint = '/domain-types/acknowledge/collections/service';
						}

						// Preenche os campos específicos
						if (type === 'host') {
							body.host_name = this.getNodeParameter('host_name', i) as string;
						} else if (type === 'service') {
							body.host_name = this.getNodeParameter('host_name', i) as string;
							body.service_description = this.getNodeParameter('service_description', i) as string;
						} else if (type === 'hostgroup') {
							body.hostgroup_name = this.getNodeParameter('hostgroup_name', i) as string;
						} else if (type === 'servicegroup') {
							body.servicegroup_name = this.getNodeParameter('servicegroup_name', i) as string;
						} else if (type === 'host_by_query' || type === 'service_by_query') {
							const queryInput = this.getNodeParameter('query', i);
							if (typeof queryInput === 'string') {
								try {
									body.query = JSON.parse(queryInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
								}
							} else {
								body.query = queryInput as IDataObject;
							}
						}

						// --- DEBUG ---
						//@ts-ignore
						//console.log(`Sending to ${endpoint}:`, JSON.stringify(body, null, 2));
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							endpoint,
							body,
						);
						returnData.push(response);
					}
				
				}
				
				

				// ==================== ACTIVATE CHANGES OPERATIONS ====================
				if (resource === 'activateChanges') {
					if (operation === 'activate') { //CMK_ActivatePendingChanges
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
					if (operation === 'get') {
						const activationId = this.getNodeParameter('activationId', i) as string;
							const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/activation_run/${activationId}`,
						);
						returnData.push(response);
					}

					if (operation === 'waitForCompletion') { //CMK_WaitForActivationCompletion
						const activationId = this.getNodeParameter('activationId', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/activation_run/${activationId}/actions/wait-for-completion/invoke`,
						);
						returnData.push(response);
					}

					if (operation === 'getPending') { //CMK_GetPendingChanges
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/activation_run/collections/pending_changes',
						);
						returnData.push(response);
					}

					if (operation === 'getRunning') { //CMK_GetRunningActivations
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

					if (operation === 'create') {
						const site_config = this.getNodeParameter('site_config', i) as string;
						const body: IDataObject = {
							site_config: site_config
						}
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/domain-types/site_connection/collections/all`,
							body
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const siteId = this.getNodeParameter('siteId', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/site_connection/${siteId}/actions/delete/invoke`,
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const siteId = this.getNodeParameter('siteId', i) as string;
						const site_config = this.getNodeParameter('site_config', i) as string;
						const body: IDataObject = {
							site_config: site_config
						}
						const response = await checkmkApiRequest.call(
							this,
							'PUT',
							`/objects/site_connection/${siteId}`,
							body
						);
						returnData.push(response);
					}

					if (operation === 'show') {
						const siteId = this.getNodeParameter('siteId', i) as string;
						const response = await checkmkApiRequest.call(this, 'GET', `/objects/site_connection/${siteId}`);
						returnData.push(response);
					}

					if (operation === 'showAll') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/site_connection/collections/all',
						);
						returnData.push(...(response.value || []));
					}

					if (operation === 'login') {
						const siteId = this.getNodeParameter('siteId', i) as string;
						const username = this.getNodeParameter('username', i) as string;
						const password = this.getNodeParameter('password', i) as string;
						const body: IDataObject = {
							username: username,
							password: password
						};
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/site_connection/${siteId}/actions/login/invoke`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'logout') {
						const siteId = this.getNodeParameter('siteId', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/site_connection/${siteId}/actions/logout/invoke`,
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

					if (operation === 'create') { //CMK_ScheduleDowntime

						const downtimeType = this.getNodeParameter('downtimeType', i) as string;
						const rawStartTime = this.getNodeParameter('start_time', i) as string;
						const rawEndTime = this.getNodeParameter('end_time', i) as string;

						// 2. Convertemos para objeto Date e depois para String ISO (UTC)
						// Isso garante o formato: "2026-01-16T17:00:00.000Z" que o Checkmk aceita
						const startTime = new Date(rawStartTime).toISOString().split('.')[0] + 'Z';
                        const endTime = new Date(rawEndTime).toISOString().split('.')[0] + 'Z';
						const comment = this.getNodeParameter('comment', i) as string;

						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const body: IDataObject = {
							start_time: startTime,
							end_time: endTime,
							comment: comment,
							downtime_type: downtimeType,
						};

						if (downtimeType === 'host') {
							body.host_name = this.getNodeParameter('host_name', i) as string; 
						} else if (downtimeType === 'hostgroup') {
							body.hostgroup_name = this.getNodeParameter('hostgroup_name', i) as string;
						} else if (downtimeType === 'host_by_query') {
							const queryInput = this.getNodeParameter('query', i);
							if (typeof queryInput === 'string'){
								try {
									body.query = JSON.parse(queryInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
								}
							} else {
								body.query = queryInput;
							}
						}

						if (additionalFields.duration) body.duration = additionalFields.duration;
						if (additionalFields.recur) body.recur = additionalFields.recur;
						
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/downtime/collections/host',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const downtimeId = this.getNodeParameter('downtimeId', i) as string;
						const site = this.getNodeParameter('site', i) as string;
						const modifyType = this.getNodeParameter('modifyType', i) as string;
						
						const updateEndTime = this.getNodeParameter('updateEndTime', i) as boolean;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						// 1. Construir Body Raiz
						// Nota: Para este endpoint específico, downtime_id e site_id vão no BODY.
						const body: IDataObject = {
							modify_type: modifyType,
							downtime_id: downtimeId, 
							site_id: site,
						};

						// 2. Construir o objeto 'end_time' se o switch estiver ativo
						if (updateEndTime) {
							const mode = this.getNodeParameter('endTimeMode', i) as string;
							
							const endTimeObj: IDataObject = {
								modify_type: mode, // 'absolute' ou 'relative'
							};

							if (mode === 'absolute') {
								const dateVal = this.getNodeParameter('endTimeDate', i) as string;
								// Converte para formato UTC esperado: 2024-03-06T12:00:00Z
								endTimeObj.value = new Date(dateVal).toISOString().split('.')[0] + 'Z';
							} else {
								const durationVal = this.getNodeParameter('endTimeDuration', i) as number;
								endTimeObj.value = durationVal;
							}

							body.end_time = endTimeObj;
						}

						// 3. Adicionar Comentário
						if (additionalFields.comment) {
							body.comment = additionalFields.comment;
						}

						// 4. Enviar Request
						// MUDANÇA CRÍTICA: Endpoint de Action em vez de Object
						// Mantemos PUT conforme o teu YAML, mas se falhar, tenta POST.
						const response = await checkmkApiRequest.call(
							this,
							'PUT', 
							'/domain-types/downtime/actions/modify/invoke',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') { //CMK_GetDowntime
						const downtimeId = this.getNodeParameter('downtimeId', i) as string;
						const site = this.getNodeParameter('site', i) as string;
						const qs: IDataObject = {
							site_id: site,
						};

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/downtime/${downtimeId}`,
							{}, 
							qs,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') { //CMK_GetAllDowntimes
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

					if (operation === 'delete') { //CMK_DeleteDowntime
						const downtimeId = this.getNodeParameter('downtimeId', i) as string;
						const site = this.getNodeParameter('site', i) as string;
						const deleteType = this.getNodeParameter('deleteType', i, 'by_id') as string;

						const body: IDataObject = {
							delete_type: deleteType,
							downtime_id: downtimeId,
							site_id: site,
						};

						
						await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/downtime/actions/delete/invoke',
							body,
						);
						
						returnData.push({ success: true, downtimeId, site, deleteType });
					}
			}

				// ==================== PROBLEM OPERATIONS ====================
				if (resource === 'problem') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							const response = await checkmkApiRequestAllItems.call(
								this,
								'POST',
								'/domain-types/service/collections/all',
								{},
								{ state: 'warn,crit,unknown' },
							);
							returnData.push(...response);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const response = await checkmkApiRequest.call(
								this,
								'POST',
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
					if (operation === 'getState') { //CMK_GetBIAggregationState
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						
						const qs: IDataObject = {};

						if (additionalFields.filter_names) {
							qs.filter_names = additionalFields.filter_names as string[];
						}
						if (additionalFields.filter_groups) {
							qs.filter_groups = additionalFields.filter_groups as string[];
						}

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/bi_aggregation/actions/aggregation_state/invoke',
							{},
							qs,
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //	CMK_DeleteBIAggregation
						const aggregationId = this.getNodeParameter('aggregation_id', i) as string;

						// Faz a chamada HTTP DELETE para o endpoint correspondente
						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/bi_aggregation/${encodeURIComponent(aggregationId)}`,
						);
						
						// Retorna sucesso para o n8n
						returnData.push({ 
							success: true, 
							message: 'BI aggregation deleted successfully',
							aggregation_id: aggregationId 
						});
					}
					if (operation === 'create' || operation === 'update') { //CMK_CreateOrReplaceBIAggregation
						const aggregationId = this.getNodeParameter('aggregation_id', i) as string;
						const packId = this.getNodeParameter('pack_id', i) as string;
						
						const groupsUi = this.getNodeParameter('groupsUi', i, {}) as IDataObject;
						const nodeUi = this.getNodeParameter('nodeUi', i, {}) as IDataObject;
						const visualizationUi = this.getNodeParameter('visualizationUi', i, {}) as IDataObject;
						const computationUi = this.getNodeParameter('computationUi', i, {}) as IDataObject;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						// Tratamento de Arrays/JSON dos Groups
						const groupNames = (groupsUi.names as string[]) || [];
						let groupPaths: any[] = [];
						if (groupsUi.paths) {
							try {
								groupPaths = typeof groupsUi.paths === 'string' ? JSON.parse(groupsUi.paths) : groupsUi.paths;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Groups Paths');
							}
						}

						// Tratamento do Action Params JSON
						let actionParams: IDataObject = {};
						if (nodeUi.action_params) {
							try {
								actionParams = typeof nodeUi.action_params === 'string' ? JSON.parse(nodeUi.action_params) : nodeUi.action_params;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Action Params');
							}
						}

						// Construção do Payload (Exatamente igual para Create e Update)
						const body: IDataObject = {
							id: aggregationId,
							pack_id: packId,
							groups: {
								names: groupNames,
								paths: groupPaths,
							},
							node: {
								search: {
									type: nodeUi.search_type || 'empty',
								},
								action: {
									type: nodeUi.action_type || 'call_a_rule',
									...actionParams,
								}
							},
							aggregation_visualization: {
								ignore_rule_styles: visualizationUi.ignore_rule_styles ?? false,
								layout_id: visualizationUi.layout_id || 'builtin_default',
								line_style: visualizationUi.line_style || 'round',
							},
							computation_options: {
								disabled: computationUi.disabled ?? false,
								use_hard_states: computationUi.use_hard_states ?? false,
								escalate_downtimes_as_warn: computationUi.escalate_downtimes_as_warn ?? false,
								freeze_aggregations: computationUi.freeze_aggregations ?? false,
							}
						};

						if (additionalFields.comment) body.comment = additionalFields.comment;
						if (additionalFields.customer) body.customer = additionalFields.customer;

						// Diferencia o método HTTP com base na operação
						if (operation === 'create') {
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								`/objects/bi_aggregation/${encodeURIComponent(aggregationId)}`,
								body,
							);
							returnData.push(response);
						} else {
							// Update utiliza PUT e requer If-Match (Etag)
							const response = await checkmkApiRequestWithIfMatch.call(
								this,
								'PUT',
								`/objects/bi_aggregation/${encodeURIComponent(aggregationId)}`,
								body,
							);
							returnData.push(response);
						}
					}
				}


				// ==================== BI PACK OPERATIONS ====================
				if (resource === 'biPack') {
					if (operation === 'create' || operation === 'update') { //CMK_CreateOrReplaceBIPack
						const packId = this.getNodeParameter('pack_id', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const contactGroups = this.getNodeParameter('contact_groups', i, []) as string[];
						const isPublic = this.getNodeParameter('public', i, false) as boolean;

						const body: IDataObject = {
							title: title,
							contact_groups: contactGroups,
							public: isPublic,
						};

						if (operation === 'create') {
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								`/objects/bi_pack/${encodeURIComponent(packId)}`, // <-- Endpoint revertido
								body,
							);
							returnData.push(response);
						} else {
							// Se testar o Update num Pack ID que não existe, VAI dar 404 (o que é correto!)
							const response = await checkmkApiRequestWithIfMatch.call(
								this,
								'PUT',
								`/objects/bi_pack/${encodeURIComponent(packId)}`, 
								body,
							);
							returnData.push(response);
						}
					}	
					if (operation === 'getMany') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/bi_pack/collections/all',
						);
						returnData.push(response);
					}
					if (operation === 'delete') { //CMK_DeleteBIPack
						const packId = this.getNodeParameter('pack_id', i) as string;

						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/bi_pack/${encodeURIComponent(packId)}`,
						);
						
						returnData.push({ 
							success: true, 
							message: 'BI pack deleted successfully',
							pack_id: packId 
						});
					}
					if (operation === 'get') { //CMK_ShowBIPack
						const packId = this.getNodeParameter('pack_id', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/bi_pack/${encodeURIComponent(packId)}`,
						);
						
						returnData.push(response);
					}

				}

				// ==================== BI RULE OPERATIONS ====================
				if (resource === 'biRule') {
					if (operation === 'getMany') { //CMK_GetAllBIRules
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/bi_rule/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteBIRule
						const ruleId = this.getNodeParameter('rule_id', i) as string;

						await checkmkApiRequest.call(
							this,
							'DELETE',
							`/objects/bi_rule/${encodeURIComponent(ruleId)}`,
						);
						
						returnData.push({ 
							success: true, 
							message: 'BI rule deleted successfully',
							rule_id: ruleId 
						});
					}

					if (operation === 'get') { //CMK_ShowBIRule
						const ruleId = this.getNodeParameter('rule_id', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/bi_rule/${encodeURIComponent(ruleId)}`,
						);
						
						returnData.push(response);
					}

					if (operation === 'create' || operation === 'update') { //CMK_CreateOrReplaceBIRule
						const ruleId = this.getNodeParameter('rule_id', i) as string;
						const packId = this.getNodeParameter('pack_id', i) as string;
						const argumentsList = this.getNodeParameter('rule_arguments', i, []) as string[];
						
						const aggregationFunctionUi = this.getNodeParameter('aggregationFunctionUi', i, {}) as IDataObject;
						const computationOptionsUi = this.getNodeParameter('computationOptionsUi', i, {}) as IDataObject;
						const nodeVisualizationUi = this.getNodeParameter('nodeVisualizationUi', i, {}) as IDataObject;
						const propertiesUi = this.getNodeParameter('propertiesUi', i, {}) as IDataObject;
						const nodesUi = this.getNodeParameter('nodesUi', i, {}) as IDataObject;

						const nodes: IDataObject[] = [];
						if (nodesUi.node) {
							for (const n of (nodesUi.node as IDataObject[])) {
								let actionParams: IDataObject = {};
								if (n.action_params) {
									try {
										actionParams = typeof n.action_params === 'string' ? JSON.parse(n.action_params) : n.action_params;
									} catch (e) {
										throw new NodeOperationError(this.getNode(), 'Invalid JSON in Node Action Params');
									}
								}
								
								nodes.push({
									search: {
										type: n.search_type || 'empty',
									},
									action: {
										type: n.action_type || 'call_a_rule',
										rule_id: n.rule_id || '',
										params: actionParams,
									}
								});
							}
						}

						let styleConfig: IDataObject = {};
						if (nodeVisualizationUi.style_config) {
							try {
								styleConfig = typeof nodeVisualizationUi.style_config === 'string' ? JSON.parse(nodeVisualizationUi.style_config) : nodeVisualizationUi.style_config;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Visualization Style Config');
							}
						}

						let stateMessages: IDataObject = {};
						if (propertiesUi.state_messages) {
							try {
								stateMessages = typeof propertiesUi.state_messages === 'string' ? JSON.parse(propertiesUi.state_messages) : propertiesUi.state_messages;
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Properties State Messages');
							}
						}

						const body: IDataObject = {
							id: ruleId,
							pack_id: packId,
							params: {
								arguments: argumentsList,
							},
							aggregation_function: {
								type: aggregationFunctionUi.type || 'best',
								count: aggregationFunctionUi.count !== undefined ? aggregationFunctionUi.count : 1,
								restrict_state: aggregationFunctionUi.restrict_state !== undefined ? aggregationFunctionUi.restrict_state : 2,
							},
							computation_options: {
								disabled: computationOptionsUi.disabled ?? false,
							},
							node_visualization: {
								type: nodeVisualizationUi.type || 'none',
								style_config: styleConfig,
							},
							properties: {
								title: propertiesUi.title || '',
								comment: propertiesUi.comment || '',
								docu_url: propertiesUi.docu_url || '',
								icon: propertiesUi.icon || '',
								state_messages: stateMessages,
							},
							nodes: nodes,
						};

						if (operation === 'create') {
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								`/objects/bi_rule/${encodeURIComponent(ruleId)}`,
								body,
							);
							returnData.push(response);
						} else {
							const response = await checkmkApiRequestWithIfMatch.call(
								this,
								'PUT',
								`/objects/bi_rule/${encodeURIComponent(ruleId)}`,
								body,
							);
							returnData.push(response);
						}
					}
				}

				// ==================== COMMENT OPERATIONS ====================
				if (resource === 'comment') {
					if (operation === 'create') { // CMK_AddComment
						const commentType = this.getNodeParameter('commentType', i) as string;
						const commentText = this.getNodeParameter('comment', i) as string;
						const persistent = this.getNodeParameter('persistent', i) as boolean;

						const body: IDataObject = {
							comment: commentText,
							comment_type: commentType, 
							persistent: persistent,
						};

						let endpoint = '/domain-types/comment/collections/host'; 

						if (commentType === 'host') {
							const hostName = this.getNodeParameter('host_name', i) as string;
							body.host_name = hostName;

						} else if (commentType === 'host_group') {
							const hostGroup = this.getNodeParameter('host_group_name', i) as string;
							body.host_group_name = hostGroup;

						} else if (commentType === 'host_by_query') {
							const queryInput = this.getNodeParameter('query', i);
							if (typeof queryInput === 'string') {
								try {
									body.query = JSON.parse(queryInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
								}
							} else {
								body.query = queryInput as IDataObject;
							}
						
						} else if (commentType === 'service') { // CMK_AddServiceComment
                            endpoint = '/domain-types/comment/collections/service';
							const hostName = this.getNodeParameter('host_name', i) as string;
							const serviceDesc = this.getNodeParameter('service_description', i) as string;
							
                            body.host_name = hostName;
                            body.service_description = serviceDesc;

						} else if (commentType === 'service_by_query') {
                            endpoint = '/domain-types/comment/collections/service';
							const queryInput = this.getNodeParameter('query', i);
							if (typeof queryInput === 'string') {
								try {
									body.query = JSON.parse(queryInput);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
								}
							} else {
								body.query = queryInput as IDataObject;
							}
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							endpoint,
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

					if (operation === 'delete') { // CMK_DeleteComment
						const commentIdStr = this.getNodeParameter('commentId', i) as string;
						const siteId = this.getNodeParameter('siteId', i) as string;

						const commentId = parseInt(commentIdStr, 10);

						if (isNaN(commentId)) {
							throw new NodeOperationError(this.getNode(), 'Comment ID must be a valid number.');
						}

						const body: IDataObject = {
							delete_type: 'by_id', 
							comment_id: commentId,
							site_id: siteId,
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/comment/actions/delete/invoke',
							body,
						);
						
						if (response === undefined || (typeof response === 'object' && Object.keys(response).length === 0)) {
							returnData.push({ 
								success: true, 
								message: 'Comment deleted successfully',
								comment_id: commentId 
							});
						} else {
							returnData.push(response);
						}
					}
					if (operation === 'get') { //CMK_ShowComment
						const commentId = this.getNodeParameter('commentId', i) as string;
						const siteId = this.getNodeParameter('siteId', i) as string;

						const qs: IDataObject = {
							site_id: siteId,
						};

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/comment/${commentId}`,
							{}, 
							qs 
						);
						returnData.push(response);
					}

				}

				// ==================== EVENT CONSOLE OPERATIONS ====================  FLAG EVENT
				if (resource === 'eventConsole') {

					if (operation === 'archive') {
						const filter_type = this.getNodeParameter('filter_type_archive', i) as string;
						const body: IDataObject = {};

						if (filter_type === 'by_id') {
							const event_id = this.getNodeParameter('event_id', i) as string;
							const site_id = this.getNodeParameter('site_id', i) as string;
							body.filter_type = filter_type
							body.site_id = site_id;
							body.event_id = event_id;
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								`/domain-types/event_console/actions/delete/invoke`,
								body
							);
							returnData.push(response);
						} else if (filter_type === 'query') {
							const query = this.getNodeParameter('query', i) as IDataObject;
							body.query = query;
							body.filter_type = filter_type
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/delete/invoke',
								body
							);
							returnData.push(response);
						} else if (filter_type === 'params') {
							const filters = this.getNodeParameter('filters', i) as IDataObject;
							body.filters = filters;
							body.filter_type = filter_type
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/delete/invoke',
								body
							);
							returnData.push(response);
						}
					}
					if (operation === 'changeState') {
						const event_id = this.getNodeParameter('event_id', i) as string;
						const site_id = this.getNodeParameter('site_id', i) as string;
						const new_state = this.getNodeParameter('new_state', i) as string;
						const body: IDataObject = {
							site_id: site_id,
							new_state: new_state
						}
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/event_console/${event_id}/actions/change_state/invoke`,
							body
						);
						returnData.push(response);
					}
					if (operation === 'changeMultipleStates') {
						const filter_type = this.getNodeParameter('filter_type_change', i) as string;
						const site_id = this.getNodeParameter('site_id', i) as string;
						const new_state = this.getNodeParameter('new_state', i) as string
						const body: IDataObject = {
							filter_type: filter_type,
							site_id: site_id,
							new_state: new_state
						};

						if (filter_type === 'query') {
							const query = this.getNodeParameter('query', i) as IDataObject;
							body.query = query;
							body.filter_type = filter_type
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/change_state/invoke',
								body
							);
							returnData.push(response);
						} else if (filter_type === 'params') {
							const filters = this.getNodeParameter('filters', i) as IDataObject;
							body.filters = filters;
							body.filter_type = filter_type
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/change_state/invoke',
								body
							);
							returnData.push(response);
						}
					}
					if (operation === 'show') {
						const event_id = this.getNodeParameter('event_id', i) as string;
						const site_id = this.getNodeParameter('site_id', i) as string;
						const qs: IDataObject = {
							site_id: site_id
						}
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/event_console/${event_id}`,
							{},
							qs
						);
						returnData.push(response);
					}
					if (operation === 'showEvents') {
						const site_id 		= this.getNodeParameter('site_id', i) as string;
						const host			= this.getNodeParameter('host', i) as string;
						const application 	= this.getNodeParameter('application', i) as string;
						const state			= this.getNodeParameter('state', i) as string;
						const phase 		= this.getNodeParameter('phase', i) as string;
						const queryInput	= this.getNodeParameter('query', i, {}) as IDataObject;
						const qs: IDataObject = {};
						// Apenas adicione se houver valor real
						if (site_id) qs.site_id = site_id;
						if (host) qs.host = host;
						if (application) qs.application = application;
						if (state) qs.state = state;
						if (phase) qs.phase = phase;

						let queryToSend = '';

						if (queryInput) {
							// 1. Se veio como string (ex: json digitado manualmente), fazemos parse para garantir que é objeto
							if (typeof queryInput === 'string') {
								try {
									const parsed = JSON.parse(queryInput);
									// 2. Serializamos de volta para remover espaços e \n (minificação)
									queryToSend = JSON.stringify(parsed);
								} catch (e) {
									// Se falhar o parse, enviamos como está (mas logamos erro se quiser)
									queryToSend = queryInput;
								}
							} else if (typeof queryInput === 'object' && Object.keys(queryInput).length > 0) {
								// 3. Se já é objeto (padrão do n8n json input), apenas serializamos
								queryToSend = JSON.stringify(queryInput);
							}
						}

						if (queryToSend) {
							qs.query = queryToSend;
						}

						// Objeto de Debug para visualização
						const debugInfo = {
							_debug_qs_enviada: qs,
							_endpoint: '/domain-types/event_console/collections/all'
						};

						try {
							const response = await checkmkApiRequest.call(
								this,
								'GET',
								'/domain-types/event_console/collections/all',
								{},
								qs
							);
							// Se der certo, retorna a resposta + info de debug
							returnData.push({ ...response, debug: debugInfo });
						} catch (error) {
							// SE DER ERRO 400, o código cai aqui.
							// Retornamos o erro como um JSON válido para você poder ler o _debug_qs_enviada no Output
							returnData.push({
								error_status: 'API falhou',
								error_message: (error as Error).message,
								...debugInfo // AQUI ESTÁ O QUE   VER
							});
						}
					}
					if (operation === 'updateEvent'){
						const event_id 			= this.getNodeParameter('event_id', i) as string;
						const site_id 			= this.getNodeParameter('site_id', i) as string;
						const change_contact	= this.getNodeParameter('change_contact', i) as string;
						const change_comment 	= this.getNodeParameter('change_comment', i) as string;
						const phase 			= this.getNodeParameter('phase', i) as string;

						const body: IDataObject = {
							site_id: site_id
						};

						if (phase) body.phase = phase;
						if (change_comment) body.change_comment = change_comment;
						if (change_contact) body.change_contact = change_contact;

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/event_console/${event_id}/actions/update_and_acknowledge/invoke`,
							body
						);
						returnData.push(response);
					}
					if (operation === 'updateEvents'){
						const site_id 				= this.getNodeParameter('site_id', i) as string;
						const change_contact		= this.getNodeParameter('change_contact', i) as string;
						const change_comment 		= this.getNodeParameter('change_comment', i) as string;
						const phase 				= this.getNodeParameter('phase', i) as string;
						const filter_type_update	= this.getNodeParameter('filter_type_update', i) as string;

						const body: IDataObject = {
							site_id: site_id
						};

						if (phase) body.phase = phase;
						if (change_comment) body.change_comment = change_comment;
						if (change_contact) body.change_contact = change_contact;



						if (filter_type_update === 'query') {
							const query = this.getNodeParameter('query', i) as IDataObject;
							body.query = query;
							body.filter_type = filter_type_update
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/update_and_acknowledge/invoke',
								body
							);
							returnData.push(response);
						} else if (filter_type_update === 'params') {
							let params = this.getNodeParameter('params', i);
							
							// Parse if it's a string
							if (typeof params === 'string') {
								params = JSON.parse(params);
							}
							
							body.filters = params as IDataObject;
							body.filter_type = filter_type_update
							
							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/update_and_acknowledge/invoke',
								body
							);
							returnData.push(response);
						} else {
							body.filter_type = filter_type_update

							const response = await checkmkApiRequest.call(
								this,
								'POST',
								'/domain-types/event_console/actions/update_and_acknowledge/invoke',
								body
							);
							returnData.push(response);
						}
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

					if (operation === 'get') { //CMK_ShowHostStatus
						const hostName = this.getNodeParameter('hostName', i) as string;
						const columnsInput = this.getNodeParameter('columns', i) as string;

						const qs: IDataObject = {};

						// Se o utilizador especificou colunas, adiciona à query string
						if (columnsInput && columnsInput.trim() !== '') {
							qs.columns = columnsInput
								.split(',')
								.map((c) => c.trim())
								.filter((c) => c !== '');
						}

						// Nota: O endpoint aqui é /objects/host/ (sem o _config)
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/host/${encodeURIComponent(hostName)}`,
							{}, // Body vazio
							qs  // Query params (columns)
						);
						
						returnData.push(response);
					}
					if (operation === 'getMany') {
						const columnsInput = this.getNodeParameter('columns', i) as string;
						const sitesInput = this.getNodeParameter('sites', i) as string;
						const queryMode = this.getNodeParameter('queryMode', i) as string;

						const body: IDataObject = {};

						// 1. Tratar Colunas
						if (columnsInput && columnsInput.trim() !== '') {
							body.columns = columnsInput.split(',').map((c) => c.trim()).filter((c) => c !== '');
						} else {
							body.columns = ['name', 'state', 'last_check']; // Default útil
						}

						// 2. Tratar Sites
						if (sitesInput && sitesInput.trim() !== '') {
							body.sites = sitesInput.split(',').map((s) => s.trim()).filter((s) => s !== '');
						}

						// 3. Construir a Query
						let finalQueryString = '';

						if (queryMode === 'json') {
							// Modo Avançado (Raw JSON)
							const queryJson = this.getNodeParameter('queryJson', i);
							finalQueryString = typeof queryJson === 'object' ? JSON.stringify(queryJson) : (queryJson as string);
						} else {
							// Modo Visual (Builder)
							const globalOp = this.getNodeParameter('globalOperator', i) as string;
							const conditionsUi = this.getNodeParameter('conditionsUi', i) as IDataObject;
							
							const expressions: IDataObject[] = [];

							if (conditionsUi && conditionsUi.rules) {
								const rules = conditionsUi.rules as IDataObject[];
								for (const rule of rules) {
									expressions.push({
										op: rule.op,
										left: rule.left,
										right: rule.right,
									});
								}
							}

							// Montar estrutura { op: "and", expr: [...] }
							const queryObject = {
								op: globalOp,
								expr: expressions,
							};
							
							finalQueryString = JSON.stringify(queryObject);
						}

						body.query = finalQueryString;

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host/collections/all',
							body,
						);
						
						returnData.push(response);
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
					if (operation === 'getCustomGraph') { //CMK_GetCustomGraph
						const customGraphId = this.getNodeParameter('custom_graph_id', i) as string;
						const startTime = this.getNodeParameter('start_time', i) as string;
						const endTime = this.getNodeParameter('end_time', i) as string;
						const reduce = this.getNodeParameter('reduce', i) as string;

						const body: IDataObject = {
							custom_graph_id: customGraphId,
							reduce: reduce,
							time_range: {
								// Ensure dates are in ISO format for the API
								start: new Date(startTime).toISOString(),
								end: new Date(endTime).toISOString(),
							},
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/metric/actions/get_custom_graph/invoke',
							body,
						);
						// Debug Log
						// @ts-ignore
						//console.log('DEBUG get_custom_graph:', JSON.stringify(body, null, 2));
						returnData.push(response);
					}
					if (operation === 'getMetrics') { //CMK_GetMetrics
						const hostName = this.getNodeParameter('hostName', i) as string;
						const serviceDescription = this.getNodeParameter('service_description', i) as string;
						const metricType = this.getNodeParameter('metric_type', i) as string;
						const startTime = this.getNodeParameter('start_time', i) as string;
						const endTime = this.getNodeParameter('end_time', i) as string;
						const reduce = this.getNodeParameter('reduce', i) as string;
						const site = this.getNodeParameter('site', i) as string;

						const body: IDataObject = {
							host_name: hostName,
							service_description: serviceDescription,
							type: metricType,
							reduce: reduce,
							time_range: {
								start: new Date(startTime).toISOString().replace('T', ' ').replace('Z', ''),
								end: new Date(endTime).toISOString().replace('T', ' ').replace('Z', ''),
							},
						};
						// Add optional site if provided
						if (site && site.trim() !== '') {
							body.site = site;
						}

						// Add ID based on selected type
						if (metricType === 'single_metric') {
							body.metric_id = this.getNodeParameter('metric_id', i) as string;
						} else {
							body.graph_id = this.getNodeParameter('graph_id', i) as string;
						}

						// Debug Log
						// @ts-ignore
						//console.log('DEBUG get metrics:', JSON.stringify(body, null, 2));

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/metric/actions/get/invoke',
							body,
						);
						returnData.push(response);
					}
					
				}

				// ==================== SERVICE STATUS OPERATIONS ====================
				if (resource === 'serviceStatus') {
 
                    // CMK_ShowAllServices
                    if (operation === 'showAll') {
                        const hostName = this.getNodeParameter('host_name', i) as string;
                        const sitesStr = this.getNodeParameter('sites', i) as string;
                        const columnsStr = this.getNodeParameter('columns', i) as string;
                        const queryInput = this.getNodeParameter('query', i);
 
                        const body: IDataObject = {};
 
                        // 1. Host Name (String)
                        if (hostName && hostName.trim() !== '') {
                            body.host_name = hostName;
                        }
 
                        // 2. Sites (String -> Array of Strings)
                        if (sitesStr && sitesStr.trim() !== '') {
                            body.sites = sitesStr.split(',').map((s) => s.trim());
                        }
 
                        // 3. Columns (String -> Array of Strings)
                        if (columnsStr && columnsStr.trim() !== '') {
                            body.columns = columnsStr.split(',').map((c) => c.trim());
                        }
 
                        // 4. Query (JSON Object)
                        if (queryInput) {
                            if (typeof queryInput === 'string') {
                                try {
                                    // Se o usuário passar JSON como string (comum em expressions)
                                    const parsedQuery = JSON.parse(queryInput);
                                    if (Object.keys(parsedQuery).length > 0) {
                                        body.query = parsedQuery;
                                    }
                                } catch (error) {
                                    throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
                                }
                            } else if (typeof queryInput === 'object' && Object.keys(queryInput).length > 0) {
                                body.query = queryInput as IDataObject;
                            }
                        }
 
                        // Nota: O endpoint para listar com filtro complexo (POST) costuma ser o mesmo
                        // da coleção base, mas usando o verbo POST.
                        const response = await checkmkApiRequest.call(
                            this,
                            'POST',
                            '/domain-types/service/collections/all',
                            body
                        );
                        returnData.push(response);
                    }
 
                    // CMK_ShowAllServicesFromHost
                    if (operation === 'showHost') {
 
                        const host_name = this.getNodeParameter('host_name', i) as string;
                        const sitesStr = this.getNodeParameter('sites', i) as string;
                        const columnsStr = this.getNodeParameter('columns', i) as string;
                        const queryInput = this.getNodeParameter('query', i);
 
                        const body: IDataObject = {};
 
                        // 2. Sites (String -> Array of Strings)
                        if (sitesStr && sitesStr.trim() !== '') {
                            body.sites = sitesStr.split(',').map((s) => s.trim());
                        }
 
                        // 3. Columns (String -> Array of Strings)
                        if (columnsStr && columnsStr.trim() !== '') {
                            body.columns = columnsStr.split(',').map((c) => c.trim());
                        }
 
                        // 4. Query (JSON Object)
                        if (queryInput) {
                            if (typeof queryInput === 'string') {
                                try {
                                    // Se o usuário passar JSON como string (comum em expressions)
                                    const parsedQuery = JSON.parse(queryInput);
                                    if (Object.keys(parsedQuery).length > 0) {
                                        body.query = parsedQuery;
                                    }
                                } catch (error) {
                                    throw new NodeOperationError(this.getNode(), 'Invalid JSON in Query field');
                                }
                            } else if (typeof queryInput === 'object' && Object.keys(queryInput).length > 0) {
                                body.query = queryInput as IDataObject;
                            }
                        }
 
                        const response = await checkmkApiRequest.call(
                            this,
                            'POST',
                            `/objects/host/${host_name}/collections/services`,
                            body
                        );
                        returnData.push(response);
 
                    }
 
                    // CMK_ShowServiceFromHost
                    if (operation === 'show') {
 
                        const host_name = this.getNodeParameter('host_name', i) as string;
                        const columnsStr = this.getNodeParameter('columns', i) as string;
                        const service_description = this.getNodeParameter('service_description', i) as string;
 
                        const qp: IDataObject = {};
 
                        if (columnsStr && columnsStr.trim() !== '') {
                            qp.columns = columnsStr.split(',').map((c) => c.trim());
                        }
 
                        qp.service_description = service_description;
 
 
                        const response = await checkmkApiRequest.call(
                            this,
                            'GET',
                            `/objects/host/${host_name}/actions/show_service/invoke`,
                            {},
                            qp
                        );
                        returnData.push(response);
 
                    }
                }

				// ==================== SLA OPERATIONS ====================
				if (resource === 'sla') {
					if (operation === 'compute') { //	CMK_ComputeSLA
						const inputMode = this.getNodeParameter('slaInputMode', i, 'ui') as string;
						let computeTargets: IDataObject[] = [];

						if (inputMode === 'ui') {
							const slaIds = this.getNodeParameter('sla_ids', i, []) as string[];
							
							const servicesUi = this.getNodeParameter('sla_services_ui', i, {}) as IDataObject;
							const services: IDataObject[] = [];
							if (servicesUi.service) {
								for (const s of (servicesUi.service as IDataObject[])) {
									services.push({
										host_name: s.host_name,
										service_description: s.service_description,
									});
								}
							}

							const timeRangesUi = this.getNodeParameter('sla_time_ranges_ui', i, {}) as IDataObject;
							const timeRanges: IDataObject[] = [];
							if (timeRangesUi.time_range) {
								for (const tr of (timeRangesUi.time_range as IDataObject[])) {
									if (tr.range_type === 'pre_defined') {
										timeRanges.push({
											range_type: 'pre_defined',
											range: tr.range,
										});
									} else if (tr.range_type === 'custom') {
										let customConfig: IDataObject = {};
										if (tr.custom_config) {
											try {
												customConfig = typeof tr.custom_config === 'string' ? JSON.parse(tr.custom_config) : tr.custom_config;
											} catch (e) {
												throw new NodeOperationError(this.getNode(), 'Invalid JSON in Custom Range Configuration');
											}
										}
										timeRanges.push({
											range_type: 'custom',
											...customConfig,
										});
									}
								}
							}

							if (services.length === 0 || timeRanges.length === 0 || slaIds.length === 0) {
								throw new NodeOperationError(this.getNode(), 'You must provide at least one SLA ID, one Service, and one Time Range.');
							}

							computeTargets.push({
								sla_ids: slaIds,
								services: services,
								time_ranges: timeRanges,
							});

						} else {
							const rawJson = this.getNodeParameter('slaComputeTargetsJson', i);
							if (typeof rawJson === 'string') {
								try {
									computeTargets = JSON.parse(rawJson);
								} catch (e) {
									throw new NodeOperationError(this.getNode(), 'Invalid JSON in SLA Compute Targets field');
								}
							} else if (Array.isArray(rawJson)) {
								computeTargets = rawJson as IDataObject[];
							}
						}

						const body: IDataObject = {
							sla_compute_targets: computeTargets,
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
					if (operation === 'getMany') { // CMK_GetAllAuditLogEntries
						const returnAll = this.getNodeParameter('returnAll', i);
						const dateStr = this.getNodeParameter('date', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const formattedDate = dateStr.split('T')[0];
						const qs: IDataObject = {
							date: formattedDate,
						};

						if (additionalFields.object_type) qs.object_type = additionalFields.object_type;
						if (additionalFields.object_id) qs.object_id = additionalFields.object_id;
						if (additionalFields.user_id) qs.user_id = additionalFields.user_id;
						if (additionalFields.regexp) qs.regexp = additionalFields.regexp;
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
					
					if (operation === 'archive') { // CMK_ArchiveAuditLog
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/audit_log/actions/archive/invoke',
						);
						
						if (response === undefined || (typeof response === 'object' && Object.keys(response).length === 0)) {
							returnData.push({ 
								success: true, 
								message: 'Audit log entries moved to archive successfully' 
							});
						} else {
							returnData.push(response);
						}
					}

				}

				// ==================== AUX TAG OPERATIONS ====================
				if (resource === 'auxTag') {
					if (operation === 'create') { //CMK_CreateAuxTag
						const tagId = this.getNodeParameter('tagId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						const help = this.getNodeParameter('help', i) as string;

						const body: IDataObject = {
							aux_tag_id: tagId, 
							title: title,
							topic: topic,
						};

						if (help && help.trim() !== '') {
							body.help = help;
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/aux_tag/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'get') { // CMK_ShowAuxTag
						const tagId = this.getNodeParameter('tagId', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/aux_tag/${encodeURIComponent(tagId)}`,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') { //CMK_ShowAllAuxTag
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/aux_tag/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'update') {//CMK_UpdateAuxTag
						const tagId = this.getNodeParameter('tagId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						const help = this.getNodeParameter('help', i) as string;

						const body: IDataObject = {
							title: title,
							topic: topic,
							help: help || '',
						};

						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/aux_tag/${encodeURIComponent(tagId)}`,
							body,
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteAuxTag
						const tagId = this.getNodeParameter('tagId', i) as string;

						await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/aux_tag/${encodeURIComponent(tagId)}/actions/delete/invoke`,
						);

						returnData.push({ 
							success: true, 
							message: 'Aux tag deleted successfully',
							tag_id: tagId 
						});
					}
				}

				// ==================== HOST TAG GROUP OPERATIONS ====================
				if (resource === 'hostTagGroup') {
					
					// Helper para processar tags (usado tanto no create quanto no update)
					const getProcessedTags = (inputs: any): IDataObject[] => {
						let apiTags: IDataObject[] = [];
						// O n8n retorna fixedCollection como: { manual: [ {...}, {...} ], json: [ {...} ] }
						// Precisamos iterar sobre o objeto 'tags' recebido
						
						// Tags manuais
						if (inputs.manual) {
							for (const entry of (inputs.manual as IDataObject[])) {
								if (!entry.title) continue; // Title é obrigatório

								const tagObj: IDataObject = {
									title: entry.title as string,
								};

								if (entry.id) {
									tagObj.id = (entry.id as string).trim();
								}

								if (entry.aux_tags && typeof entry.aux_tags === 'string') {
									const aux = entry.aux_tags.trim();
									if (aux !== '') {
										tagObj.aux_tags = aux.split(',').map(t => t.trim());
									}
								}
								apiTags.push(tagObj);
							}
						}

						// Tags via JSON
						if (inputs.json) {
							for (const entry of (inputs.json as IDataObject[])) {
								const rawInfo = entry.tagsJson;
								if (rawInfo) {
									let parsed: any;
									if (typeof rawInfo === 'string') {
										try {
											parsed = JSON.parse(rawInfo);
										} catch (e) {
											throw new NodeOperationError(this.getNode(), `Invalid JSON in tags: ${rawInfo}`);
										}
									} else {
										parsed = rawInfo;
									}

									if (Array.isArray(parsed)) {
										apiTags = apiTags.concat(parsed);
									} else if (typeof parsed === 'object') {
										apiTags.push(parsed);
									}
								}
							}
						}
						return apiTags;
					};

					// CMK_CreateHostTagGroup
					if (operation === 'create') {
						const id = this.getNodeParameter('tagGroupId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						const help = this.getNodeParameter('help', i) as string;
						const tagsInput = this.getNodeParameter('tags', i, {}) as IDataObject;

						const tags = getProcessedTags(tagsInput);

						if (tags.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one tag is required to create a Host Tag Group.');
						}

						const body: IDataObject = {
							id: id,
							title: title,
							tags: tags,
						};

						if (topic) body.topic = topic;
						if (help) body.help = help;

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/host_tag_group/collections/all',
							body,
						);
						returnData.push(response);
					}

					// CMK_GetAllHostTagGroups
					if (operation === 'showAll') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/host_tag_group/collections/all',
						);
						returnData.push(response);
					}

					// CMK_GetASingleHostTagGroup
					if (operation === 'show') {
						
						const name = this.getNodeParameter('name', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/host_tag_group/${name}`,
						);
						returnData.push(response);
					}

					// CMK_UpdateHostTagGroup
					if (operation === 'update') {

						const name = this.getNodeParameter('name', i) as string;
						
						// Campos opcionais no update
						const title = this.getNodeParameter('title', i, '') as string;
						const topic = this.getNodeParameter('topic', i, '') as string;
						const help = this.getNodeParameter('help', i, '') as string;
						const repair = this.getNodeParameter('repair', i, false) as boolean;
						const tagsInput = this.getNodeParameter('tags', i, {}) as IDataObject;

						const body: IDataObject = {};

						if (title) body.title = title;
						if (topic) body.topic = topic;
						if (help) body.help = help;
						if (repair) body.repair = repair;

						const tags = getProcessedTags(tagsInput);
						if (tags.length > 0) {
							body.tags = tags;
						}

						// Update no Checkmk geralmente exige If-Match
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/host_tag_group/${encodeURIComponent(name)}`,
							body,
						);
						returnData.push(response);
					}

					// CMK_DeleteHostTagGroup
					if (operation === 'delete') {

						const name = this.getNodeParameter('name', i) as string;
						const deleteMode = this.getNodeParameter('deleteMode', i);
						const repair = this.getNodeParameter('repair', i) as boolean;

						const qs: IDataObject = {
							repair: repair
						};

						// Só adiciona 'mode' na query se o usuário escolheu algo diferente do padrão vazio
						if (deleteMode && deleteMode !== '') {
							qs.mode = deleteMode;
						}

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/host_tag_group/${encodeURIComponent(name)}`,
							{},
							qs
						);
						returnData.push({
							success: true,
							message: 'Host tag group deleted',
							id: name,
							mode: deleteMode || 'default'
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

					if (operation === 'getMany') { //CMK_ShowAllLDAPConnections
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

					if (operation === 'get') { //CMK_GetASingleLDAPConnection
						const ldapConnectionId = this.getNodeParameter('ldapConnectionId', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/ldap_connection/${encodeURIComponent(ldapConnectionId)}`,
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteLDAPConnection
						const ldapConnectionId = this.getNodeParameter('ldapConnectionId', i) as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/ldap_connection/${encodeURIComponent(ldapConnectionId)}`,
						);
						returnData.push({
							success: true,
							message: `LDAP connection ${ldapConnectionId} deleted successfully`,
							id: ldapConnectionId,
						});
					}
				}

				// ==================== NOTIFICATION RULE OPERATIONS ====================
				if (resource === 'notificationRule') {

					if (operation === 'showAll') {
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/notification_rule/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'delete') {
						const rule_id = this.getNodeParameter('rule_id', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'POST',
							`/objects/notification_rule/${rule_id}/actions/delete/invoke`,
						);
						returnData.push(response);
					}

					if (operation === 'create') {
						// Pega o valor bruto
						const ruleConfigInput = this.getNodeParameter('rule_config', i);
						let ruleConfig: IDataObject;

						// Garante que é um objeto, mesmo que venha como string
						if (typeof ruleConfigInput === 'string') {
							try {
								ruleConfig = JSON.parse(ruleConfigInput);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Rule Config');
							}
						} else {
							ruleConfig = ruleConfigInput as IDataObject;
						}

						const body: IDataObject = {
							rule_config: ruleConfig
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/notification_rule/collections/all',
							body
						);
						returnData.push(response);
					}

					if (operation === 'update') {
						const rule_id = this.getNodeParameter('rule_id', i) as string;
						
						// Mesma lógica de tratamento do JSON para o update
						const ruleConfigInput = this.getNodeParameter('rule_config', i);
						let ruleConfig: IDataObject;

						if (typeof ruleConfigInput === 'string') {
							try {
								ruleConfig = JSON.parse(ruleConfigInput);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in Rule Config');
							}
						} else {
							ruleConfig = ruleConfigInput as IDataObject;
						}

						const body: IDataObject = {
							rule_config: ruleConfig
						};

						const response = await checkmkApiRequest.call(
							this,
							'PUT',
							`/objects/notification_rule/${rule_id}`,
							body
						);
						returnData.push(response);
					}

					if (operation === 'show') {
						const rule_id = this.getNodeParameter('rule_id', i) as string;
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/notification_rule/${rule_id}`,
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
				// ==================== MISCELLANEOUS OPERATIONS ====================
				if (resource === 'miscellaneous') {
					if (operation === 'version') { //CMK_GetCheckmkVersion
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/version',
						);
						returnData.push(response);
					}
				}

				// ==================== PARENT SCAN OPERATIONS ====================
				if (resource === 'parentScan') {
					if (operation === 'start') { // CMK_StartParentScan
						const hostNamesStr = this.getNodeParameter('hostNames', i) as string;
						const gatewayOption = this.getNodeParameter('gatewayOption', i) as string;
						const scanConfig = this.getNodeParameter('scanConfig', i, {}) as IDataObject;

						const hostNames = hostNamesStr.split(',').map(h => h.trim()).filter(h => h !== '');
						
						if (hostNames.length === 0) {
							throw new NodeOperationError(this.getNode(), 'Please provide at least one hostname.');
						}

						// Constroi o body complexo conforme schema
						const body: IDataObject = {
							host_names: hostNames,
							gateway_hosts: {
								option: gatewayOption,
							},
							configuration: {
								force_explicit_parents: scanConfig.force_explicit_parents ?? false,
							},
							performance: {
								responses_timeout: scanConfig.responses_timeout ?? 8,
								hop_probes: scanConfig.hop_probes ?? 2,
								max_gateway_distance: scanConfig.max_gateway_distance ?? 10,
								ping_probes: scanConfig.ping_probes ?? 5,
							},
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/parent_scan/actions/start/invoke',
							body,
						);
						returnData.push(response);
					}
				}

				// ==================== PASSWORD OPERATIONS ====================
				if (resource === 'password') {
					if (operation === 'getMany') { //	CMK_GetAllPasswords
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/password/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'create') { // CMK_CreatePassword
						const ident = this.getNodeParameter('ident', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const password = this.getNodeParameter('password', i) as string;
						const customer = this.getNodeParameter('customer', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const body: IDataObject = {
							ident: ident,
							title: title,
							password: password,
							customer: customer,
						};

						if (additionalFields.comment) body.comment = additionalFields.comment;
						if (additionalFields.documentation_url) body.documentation_url = additionalFields.documentation_url;
						if (additionalFields.editable_by) body.editable_by = additionalFields.editable_by;
						
						if (additionalFields.shared) {
							body.shared = (additionalFields.shared as string).split(',').map(s => s.trim());
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/password/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'update') { // CMK_UpdatePassword
						const ident = this.getNodeParameter('ident', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						const body: IDataObject = {};

						if (updateFields.title) body.title = updateFields.title;
						if (updateFields.password) body.password = updateFields.password;
						if (updateFields.customer) body.customer = updateFields.customer;
						if (updateFields.comment) body.comment = updateFields.comment;
						if (updateFields.documentation_url) body.documentation_url = updateFields.documentation_url;
						if (updateFields.editable_by) body.editable_by = updateFields.editable_by;

						if (updateFields.shared) {
							body.shared = (updateFields.shared as string).split(',').map(s => s.trim());
						}

						// Usa If-Match (ETag) automaticamente para garantir integridade
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/password/${encodeURIComponent(ident)}`,
							body,
						);
						returnData.push(response);
					}
					if (operation === 'delete') { // CMK_DeletePassword
						const ident = this.getNodeParameter('ident', i) as string;
						
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/password/${encodeURIComponent(ident)}`,
						);
						returnData.push({ success: true, ident });
					}

					if (operation === 'get') { // CMK_GetASinglePassword
						const ident = this.getNodeParameter('ident', i) as string;
						
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/password/${encodeURIComponent(ident)}`,
						);
						returnData.push(response);
					}
				}

				// ==================== RULESET OPERATIONS ====================
				if (resource === 'ruleset') {

					//CMK_ShowRuleset
					if (operation === 'get') {
						const rulesetName = this.getNodeParameter('rulesetName', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/ruleset/${encodeURIComponent(rulesetName)}`,
						);
						returnData.push(response);
					}
					
					//CMK_SearchRulesets
					if (operation === 'search') {
						const fulltext = this.getNodeParameter('fulltext', i) as string;
						const folder = this.getNodeParameter('folder', i) as string;
						const deprecated = this.getNodeParameter('deprecated', i) as boolean;
						const used = this.getNodeParameter('used', i) as boolean;
						const name = this.getNodeParameter('name', i) as string;

						const qs: IDataObject = {};

						if (fulltext) qs.fulltext = fulltext;
						if (folder) qs.folder = folder;
						if (deprecated !== undefined) qs.deprecated = deprecated;
						if (used !== undefined) qs.used = used;
						if (name) qs.name = name;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/ruleset/collections/all',
							{},
							qs,
						);
						returnData.push(response);
					}
				}

				// ==================== SAML CONNECTION OPERATIONS ====================
				if (resource === 'samlConnection') {
					if (operation === 'create') { //CMK_CreateSAMLConnection
						const samlId = this.getNodeParameter('connectionId', i) as string;
						const samlName = this.getNodeParameter('samlName', i) as string;
						const serverUrl = this.getNodeParameter('serverUrl', i) as string;
						const metadataType = this.getNodeParameter('metadataType', i) as string;
						const signingType = this.getNodeParameter('signingType', i) as string;
						const cgType = this.getNodeParameter('cgType', i) as string;

						const body: IDataObject = {
						general_properties: {
							id: samlId,
							name: samlName,
							rule_activation: 'activated',
						},
						connection_config: {
							checkmk_server_url: serverUrl,
							identity_provider_metadata: {
								type: metadataType,
								[metadataType]: this.getNodeParameter(metadataType === 'url' ? 'metadataUrl' : 'metadataXml', i),
							},
						},
						security: {
							signing_certificate: {
								type: signingType,
							},
							decrypt_auth_certificate: {
								type: 'builtin',
							},
						},
						users: {
							id_attribute: 'uid',
							contact_groups: {
								type: cgType,
								attribute: 'contact_groups',
							},
							roles: {
								type: 'map',
								attribute: 'roles',
								roles: { admin: ['admin'], user: ['user'], guest: ['guest'] },
							},
						},
					};

					// CORREÇÃO DO ERRO TS(2339):
					if (signingType === 'custom') {
						// Forçamos o TypeScript a tratar 'security' e 'signing_certificate' como objetos
						const security = body.security as IDataObject;
						const signingCert = security.signing_certificate as IDataObject;
						
						signingCert.private_key = this.getNodeParameter('signingKey', i);
						signingCert.certificate = this.getNodeParameter('signingCert', i);
					}

					// Lógica de Contact Groups (também prevenida contra erros de tipo)
					if (cgType === 'map') {
						const mappingData = this.getNodeParameter('cgMappingUi', i) as IDataObject;
						if (mappingData.mapping) {
							const users = body.users as IDataObject;
							const cg = users.contact_groups as IDataObject;
							
							cg.mapping = (mappingData.mapping as IDataObject[]).map((m) => ({
								attribute_value: m.value,
								contact_groups: (m.groups as string).split(',').map((g) => g.trim()),
							}));
						}
					}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/saml_connection/collections/all',
							body,
						);
						returnData.push(response);
					}

					if (operation === 'getMany') { //CMK_GetAllSAMLConnections
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/saml_connection/collections/all',
						);
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteSAMLConnection
						const connectionId = this.getNodeParameter('connectionId', i) as string;

						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/saml_connection/${encodeURIComponent(connectionId)}`,
						);

						returnData.push({ 
							success: true, 
							message: `SAML connection ${connectionId} deleted successfully`,
							id: connectionId 
						});
					}

					if (operation === 'get') { //CMK_GetASingleSAMLConnection
						const connectionId = this.getNodeParameter('connectionId', i) as string;

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/saml_connection/${encodeURIComponent(connectionId)}`,
						);
						returnData.push(response);
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

					if (operation === 'getMany') { //CMK_GetAllUserRoles
						const response = await checkmkApiRequest.call(
							this,
							'GET',
							'/domain-types/user_role/collections/all',
						);
						returnData.push(response);
					}
					if (operation === 'get') { //CMK_GetUserRole
						const roleIdRaw = this.getNodeParameter('roleId', i) as string;
						// Sanitização para garantir que o ID é válido (minúsculas)
						const roleId = roleIdRaw.trim().toLowerCase();

						const response = await checkmkApiRequest.call(
							this,
							'GET',
							`/objects/user_role/${encodeURIComponent(roleId)}`,
						);
						returnData.push(response);
					}

					if (operation === 'update') { //CMK_UpdateUserRole
						const roleIdRaw = this.getNodeParameter('roleId', i) as string;
						const roleId = roleIdRaw.trim().toLowerCase();

						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						
						const body: IDataObject = {};

						if (updateFields.new_role_id) body.new_role_id = updateFields.new_role_id;
						if (updateFields.new_alias) body.new_alias = updateFields.new_alias;
						if (updateFields.new_basedon) body.new_basedon = updateFields.new_basedon;

						if (updateFields.new_permissions_ui) {
							const permissionsUi = updateFields.new_permissions_ui as IDataObject;
							const permissionsList = permissionsUi.permissionsValues as IDataObject[];
							
							const permissionsObj: IDataObject = {};
							
							for (const perm of permissionsList) {
								if (perm.name) {
									permissionsObj[perm.name as string] = perm.state;
								}
							}
							
							body.new_permissions = permissionsObj;
						}
						const response = await checkmkApiRequestWithIfMatch.call(
							this,
							'PUT',
							`/objects/user_role/${encodeURIComponent(roleId)}`,
							body,
						);
						
						returnData.push(response);
					}

					if (operation === 'delete') { //CMK_DeleteUserRole
						const roleId = this.getNodeParameter('roleId', i) as string;

						// Usamos WithIfMatch para garantir que temos o ETag necessário para apagar objetos
						await checkmkApiRequestWithIfMatch.call(
							this,
							'DELETE',
							`/objects/user_role/${encodeURIComponent(roleId)}`,
						);
						
						returnData.push({ success: true, roleId, message: 'Role deleted successfully' });
					}
					if (operation === 'clone') { //CMK_CloneCreateUserRole
						const sourceRoleId = this.getNodeParameter('roleId', i) as string;
						const newRoleId = this.getNodeParameter('newRoleId', i) as string;
						const newAlias = this.getNodeParameter('newAlias', i) as string;

						const body: IDataObject = {
							role_id: sourceRoleId,    
							new_role_id: newRoleId,   
							new_alias: newAlias,      
						};

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/user_role/collections/all',
							body,
						);
						returnData.push(response);
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

					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const dcdId = this.getNodeParameter('dcd_id', i) as string;
						const site = this.getNodeParameter('site', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const connectorUi = this.getNodeParameter('connectorUi', i, {}) as IDataObject;

						// 1. Processar Restrict Source Hosts (String -> Array)
						let restrictHosts: string[] = [];
						if (connectorUi.restrict_source_hosts) {
							restrictHosts = (connectorUi.restrict_source_hosts as string)
								.split(',')
								.map((s) => s.trim())
								.filter((s) => s !== '');
						}

						// 2. Processar Creation Rules (Fixed Collection -> Array of Objects)
						const creationRulesUi = this.getNodeParameter('creation_rules_ui', i, {}) as IDataObject;
						const creationRules: IDataObject[] = [];

						if (creationRulesUi.rule) {
							for (const rule of (creationRulesUi.rule as IDataObject[])) {
								
								// 2a. Processar Matching Hosts (String -> Array)
								let matchingHosts: string[] = [];
								if (rule.matching_hosts && (rule.matching_hosts as string).trim() !== '') {
									matchingHosts = (rule.matching_hosts as string)
										.split(',')
										.map((s) => s.trim())
										.filter((s) => s !== '');
								}

								// 2b. Processar Host Attributes (JSON String -> Object)
								let hostAttributes: IDataObject = {};
								if (rule.host_attributes) {
									if (typeof rule.host_attributes === 'string') {
										try {
											hostAttributes = JSON.parse(rule.host_attributes);
										} catch (e) {
											throw new NodeOperationError(this.getNode(), `Invalid JSON in Host Attributes for rule with folder path: ${rule.folder_path}`);
										}
									} else {
										hostAttributes = rule.host_attributes as IDataObject;
									}
								}

								// 2c. Montar o objeto da regra
								const ruleObj: IDataObject = {
									folder_path: rule.folder_path,
									delete_hosts: rule.delete_hosts || false, // Default false se undefined
									host_attributes: hostAttributes,
								};

								// A API só aceita matching_hosts se o array tiver items
								if (matchingHosts.length > 0) {
									ruleObj.matching_hosts = matchingHosts;
								}

								creationRules.push(ruleObj);
							}
						}

						// 3. Montar o Payload Final
						const body: IDataObject = {
							title,
							dcd_id: dcdId,
							site,
							disabled: additionalFields.disabled ?? false,
							comment: additionalFields.comment ?? '',
							documentation_url: additionalFields.documentation_url ?? '',
							connector: {
								connector_type: connectorUi.connector_type || 'piggyback',
								interval: connectorUi.interval ?? 60,
								discover_on_creation: connectorUi.discover_on_creation ?? true,
								restrict_source_hosts: restrictHosts,
								creation_rules: creationRules,
							},
						};
						
						// Campos opcionais do conector que têm defaults na API
						if (connectorUi.max_cache_age !== undefined) {
							(body.connector as IDataObject).max_cache_age = connectorUi.max_cache_age;
						}
						if (connectorUi.validity_period !== undefined) {
							(body.connector as IDataObject).validity_period = connectorUi.validity_period;
						}
						if (connectorUi.no_deletion_time_after_init !== undefined) {
							(body.connector as IDataObject).no_deletion_time_after_init = connectorUi.no_deletion_time_after_init;
						}

						const response = await checkmkApiRequest.call(
							this,
							'POST',
							'/domain-types/dcd/collections/all',
							body,
						);
						returnData.push(response);
					}

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