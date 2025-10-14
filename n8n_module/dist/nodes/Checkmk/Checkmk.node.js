"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkmk = void 0;
const GenericFunctions_1 = require("./GenericFunctions");
class Checkmk {
    constructor() {
        this.description = {
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
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'BI Aggregation',
                            value: 'biAggregation',
                        },
                        {
                            name: 'BI Pack',
                            value: 'biPack',
                        },
                        {
                            name: 'BI Rule',
                            value: 'biRule',
                        },
                        {
                            name: 'Comment',
                            value: 'comment',
                        },
                        {
                            name: 'Downtime',
                            value: 'downtime',
                        },
                        {
                            name: 'Event Console',
                            value: 'eventConsole',
                        },
                        {
                            name: 'Host Status',
                            value: 'hostStatus',
                        },
                        {
                            name: 'Metric',
                            value: 'metric',
                        },
                        {
                            name: 'Problem',
                            value: 'problem',
                        },
                        {
                            name: 'Service Status',
                            value: 'serviceStatus',
                        },
                        {
                            name: 'SLA',
                            value: 'sla',
                        },
                        {
                            name: 'Activate Changes',
                            value: 'activateChanges',
                        },
                        {
                            name: 'Agent',
                            value: 'agent',
                        },
                        {
                            name: 'Audit Log',
                            value: 'auditLog',
                        },
                        {
                            name: 'Aux Tag',
                            value: 'auxTag',
                        },
                        {
                            name: 'Contact Group',
                            value: 'contactGroup',
                        },
                        {
                            name: 'Discovery',
                            value: 'discovery',
                        },
                        {
                            name: 'Folder',
                            value: 'folder',
                        },
                        {
                            name: 'Host',
                            value: 'host',
                        },
                        {
                            name: 'Host Group',
                            value: 'hostGroup',
                        },
                        {
                            name: 'Host Tag Group',
                            value: 'hostTagGroup',
                        },
                        {
                            name: 'LDAP Connection',
                            value: 'ldapConnection',
                        },
                        {
                            name: 'Notification Rule',
                            value: 'notificationRule',
                        },
                        {
                            name: 'OpenTelemetry',
                            value: 'openTelemetry',
                        },
                        {
                            name: 'Parent Scan',
                            value: 'parentScan',
                        },
                        {
                            name: 'Password',
                            value: 'password',
                        },
                        {
                            name: 'Rule',
                            value: 'rule',
                        },
                        {
                            name: 'Ruleset',
                            value: 'ruleset',
                        },
                        {
                            name: 'SAML Connection',
                            value: 'samlConnection',
                        },
                        {
                            name: 'Service',
                            value: 'service',
                        },
                        {
                            name: 'Service Group',
                            value: 'serviceGroup',
                        },
                        {
                            name: 'Site',
                            value: 'site',
                        },
                        {
                            name: 'Time Period',
                            value: 'timePeriod',
                        },
                        {
                            name: 'User',
                            value: 'user',
                        },
                        {
                            name: 'User Role',
                            value: 'userRole',
                        },
                        {
                            name: 'Background Job',
                            value: 'backgroundJob',
                        },
                        {
                            name: 'Broker Connection',
                            value: 'brokerConnection',
                        },
                        {
                            name: 'Certificate',
                            value: 'certificate',
                        },
                        {
                            name: 'Configuration Entity',
                            value: 'configurationEntity',
                        },
                        {
                            name: 'DCD',
                            value: 'dcd',
                        },
                        {
                            name: 'License Usage',
                            value: 'licenseUsage',
                        },
                        {
                            name: 'Quick Setup',
                            value: 'quickSetup',
                        },
                    ],
                    default: 'host',
                },
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
                            action: 'Create an OpenTelemetry collector',
                        },
                        {
                            name: 'Get Many',
                            value: 'getMany',
                            description: 'Get many OpenTelemetry collectors',
                            action: 'Get many OpenTelemetry collectors',
                        },
                        {
                            name: 'Update',
                            value: 'update',
                            description: 'Update an OpenTelemetry collector',
                            action: 'Update an OpenTelemetry collector',
                        },
                        {
                            name: 'Delete',
                            value: 'delete',
                            description: 'Delete an OpenTelemetry collector',
                            action: 'Delete an OpenTelemetry collector',
                        },
                    ],
                    default: 'getMany',
                },
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
                            operation: ['create', 'get', 'update', 'delete', 'move', 'rename', 'acknowledge'],
                        },
                    },
                    default: '',
                    description: 'Name of the host',
                },
                {
                    displayName: 'Host Name',
                    name: 'hostName',
                    type: 'string',
                    required: false,
                    displayOptions: {
                        show: {
                            resource: ['host', 'service'],
                            operation: ['getMany'],
                        },
                    },
                    default: '',
                    description: 'Name of the host (optional for getMany)',
                },
                {
                    displayName: 'Folder',
                    name: 'folder',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['host', 'folder'],
                            operation: ['create', 'get', 'update', 'delete', 'move'],
                        },
                    },
                    default: '/',
                    description: 'Folder path',
                },
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
                        maxValue: 500,
                    },
                    default: 50,
                    description: 'Max number of results to return',
                },
                {
                    displayName: 'Service Description',
                    name: 'serviceDescription',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['service'],
                            operation: ['get', 'acknowledge'],
                        },
                    },
                    default: '',
                    description: 'Name of the service',
                },
                {
                    displayName: 'Downtime Type',
                    name: 'downtimeType',
                    type: 'options',
                    options: [
                        { name: 'Host', value: 'host' },
                        { name: 'Service', value: 'service' },
                        { name: 'Host Group', value: 'hostgroup' },
                        { name: 'Service Group', value: 'servicegroup' },
                    ],
                    displayOptions: {
                        show: {
                            resource: ['downtime'],
                            operation: ['create'],
                        },
                    },
                    default: 'host',
                    description: 'Type of downtime',
                },
                {
                    displayName: 'Start Time',
                    name: 'startTime',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            resource: ['downtime'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'Start time of the downtime',
                },
                {
                    displayName: 'End Time',
                    name: 'endTime',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            resource: ['downtime'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'End time of the downtime',
                },
                {
                    displayName: 'Comment',
                    name: 'comment',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['downtime'],
                            operation: ['create'],
                        },
                    },
                    default: 'Scheduled downtime via n8n',
                    description: 'Comment for the downtime',
                },
                {
                    displayName: 'Downtime ID',
                    name: 'downtimeId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['downtime'],
                            operation: ['get', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the downtime',
                },
                {
                    displayName: 'Tag ID',
                    name: 'tagId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['auxTag'],
                            operation: ['create', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the auxiliary tag',
                },
                {
                    displayName: 'Title',
                    name: 'title',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['auxTag', 'hostTagGroup'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Title of the tag',
                },
                {
                    displayName: 'Topic',
                    name: 'topic',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['auxTag', 'hostTagGroup'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Topic/category of the tag',
                },
                {
                    displayName: 'Help Text',
                    name: 'help',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['auxTag', 'hostTagGroup'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Help text for the tag',
                },
                {
                    displayName: 'Tag Group ID',
                    name: 'tagGroupId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['hostTagGroup'],
                            operation: ['create', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the host tag group',
                },
                {
                    displayName: 'Connection ID',
                    name: 'connectionId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['ldapConnection'],
                            operation: ['create', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the LDAP connection',
                },
                {
                    displayName: 'Server URL',
                    name: 'serverUrl',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['ldapConnection'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    placeholder: 'ldap://ldap.example.com',
                    description: 'LDAP server URL',
                },
                {
                    displayName: 'Bind DN',
                    name: 'bindDn',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['ldapConnection'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    placeholder: 'cn=admin,dc=example,dc=com',
                    description: 'Bind Distinguished Name',
                },
                {
                    displayName: 'Bind Password',
                    name: 'bindPassword',
                    type: 'string',
                    typeOptions: {
                        password: true,
                    },
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['ldapConnection'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Bind password',
                },
                {
                    displayName: 'Connection ID',
                    name: 'samlConnectionId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['samlConnection'],
                            operation: ['create', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the SAML connection',
                },
                {
                    displayName: 'Identity Provider Metadata',
                    name: 'identityProviderMetadata',
                    type: 'string',
                    typeOptions: {
                        rows: 5,
                    },
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['samlConnection'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Identity provider metadata XML',
                },
                {
                    displayName: 'Collector ID',
                    name: 'collectorId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['openTelemetry'],
                            operation: ['create', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the OpenTelemetry collector',
                },
                {
                    displayName: 'Collector Name',
                    name: 'collectorName',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['openTelemetry'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Name of the collector',
                },
                {
                    displayName: 'Port',
                    name: 'port',
                    type: 'number',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['openTelemetry'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: 4317,
                    description: 'Port number for the collector',
                },
                {
                    displayName: 'Role ID',
                    name: 'roleId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['userRole'],
                            operation: ['create', 'update', 'delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the user role',
                },
                {
                    displayName: 'Role Alias',
                    name: 'roleAlias',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['userRole'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    description: 'Display name of the role',
                },
                {
                    displayName: 'Permissions',
                    name: 'permissions',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['userRole'],
                            operation: ['create', 'update'],
                        },
                    },
                    default: '',
                    placeholder: 'general.use,general.see_all',
                    description: 'Comma-separated list of permissions',
                },
                {
                    displayName: 'Comment Text',
                    name: 'commentText',
                    type: 'string',
                    typeOptions: {
                        rows: 3,
                    },
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['comment'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'The comment text',
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
                    description: 'Whether the comment is persistent',
                },
                {
                    displayName: 'Comment ID',
                    name: 'commentId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['comment'],
                            operation: ['delete'],
                        },
                    },
                    default: '',
                    description: 'ID of the comment to delete',
                },
                {
                    displayName: 'SLA Configuration',
                    name: 'slaConfiguration',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['sla'],
                            operation: ['compute'],
                        },
                    },
                    default: '',
                    description: 'SLA configuration identifier',
                },
                {
                    displayName: 'Time Range',
                    name: 'timeRange',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['sla'],
                            operation: ['compute'],
                        },
                    },
                    default: '',
                    placeholder: 'd0',
                    description: 'Time range for SLA computation (e.g., d0 for today, d7 for last 7 days)',
                },
                {
                    displayName: 'Scan Host Name',
                    name: 'scanHostName',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['parentScan'],
                            operation: ['run'],
                        },
                    },
                    default: '',
                    description: 'Name of the host to scan for parents',
                },
                {
                    displayName: 'Filter Names',
                    name: 'filterNames',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['biAggregation'],
                            operation: ['getState'],
                        },
                    },
                    default: '',
                    placeholder: 'agg1,agg2',
                    description: 'Comma-separated list of aggregation names to filter',
                },
                {
                    displayName: 'Filter Groups',
                    name: 'filterGroups',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['biAggregation'],
                            operation: ['getState'],
                        },
                    },
                    default: '',
                    placeholder: 'group1,group2',
                    description: 'Comma-separated list of groups to filter',
                },
                {
                    displayName: 'Rule ID',
                    name: 'ruleId',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['rule'],
                            operation: ['get'],
                        },
                    },
                    default: '',
                    description: 'ID of the rule',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    options: [
                        {
                            displayName: 'IP Address',
                            name: 'ipaddress',
                            type: 'string',
                            default: '',
                            description: 'IP address',
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
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'host') {
                    if (operation === 'create') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const folder = this.getNodeParameter('folder', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            host_name: hostName,
                            folder: folder,
                            attributes: additionalFields,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/host_config/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/host_config/${hostName}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/host_config/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/host_config/collections/all');
                            const hosts = response.value || [];
                            returnData.push(...hosts.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            attributes: additionalFields,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/host_config/${hostName}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const hostName = this.getNodeParameter('hostName', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/host_config/${hostName}`);
                        returnData.push({ success: true, hostName });
                    }
                    if (operation === 'move') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const folder = this.getNodeParameter('folder', i);
                        const body = {
                            target_folder: folder,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', `/objects/host_config/${hostName}/actions/move/invoke`, body);
                        returnData.push(response);
                    }
                    if (operation === 'rename') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const newName = additionalFields.newName;
                        const body = {
                            new_name: newName,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/host_config/${hostName}/actions/rename/invoke`, body);
                        returnData.push(response);
                    }
                }
                if (resource === 'hostGroup') {
                    const name = this.getNodeParameter('name', i, '');
                    if (operation === 'create') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const body = {
                            name: name,
                            alias: alias,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/host_group_config/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/host_group_config/${name}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/host_group_config/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/host_group_config/collections/all');
                            const groups = response.value || [];
                            returnData.push(...groups.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const body = {
                            alias: alias,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/host_group_config/${name}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/host_group_config/${name}`);
                        returnData.push({ success: true, name });
                    }
                }
                if (resource === 'serviceGroup') {
                    const name = this.getNodeParameter('name', i, '');
                    if (operation === 'create') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const body = {
                            name: name,
                            alias: alias,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/service_group_config/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/service_group_config/${name}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/service_group_config/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/service_group_config/collections/all');
                            const groups = response.value || [];
                            returnData.push(...groups.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const body = {
                            alias: alias,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/service_group_config/${name}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/service_group_config/${name}`);
                        returnData.push({ success: true, name });
                    }
                }
                if (resource === 'folder') {
                    const folder = this.getNodeParameter('folder', i, '/');
                    if (operation === 'create') {
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            name: folder.split('/').pop(),
                            parent: folder.split('/').slice(0, -1).join('/') || '/',
                            ...additionalFields,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/folder_config/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/folder_config/${folder}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/folder_config/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/folder_config/collections/all');
                            const folders = response.value || [];
                            returnData.push(...folders.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/folder_config/${folder}`, additionalFields);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/folder_config/${folder}`);
                        returnData.push({ success: true, folder });
                    }
                }
                if (resource === 'user') {
                    const name = this.getNodeParameter('name', i, '');
                    if (operation === 'create') {
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            username: name,
                            ...additionalFields,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/user_config/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/user_config/${name}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/user_config/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/user_config/collections/all');
                            const users = response.value || [];
                            returnData.push(...users.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/user_config/${name}`, additionalFields);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/user_config/${name}`);
                        returnData.push({ success: true, name });
                    }
                }
                if (resource === 'contactGroup') {
                    const name = this.getNodeParameter('name', i, '');
                    if (operation === 'create') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const body = {
                            name: name,
                            alias: alias,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/contact_group_config/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/contact_group_config/${name}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/contact_group_config/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/contact_group_config/collections/all');
                            const groups = response.value || [];
                            returnData.push(...groups.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const body = {
                            alias: alias,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/contact_group_config/${name}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/contact_group_config/${name}`);
                        returnData.push({ success: true, name });
                    }
                }
                if (resource === 'timePeriod') {
                    const name = this.getNodeParameter('name', i, '');
                    if (operation === 'create') {
                        const alias = this.getNodeParameter('alias', i, '');
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            name: name,
                            alias: alias,
                            ...additionalFields,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/time_period/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/time_period/${name}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/time_period/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/time_period/collections/all');
                            const periods = response.value || [];
                            returnData.push(...periods.slice(0, limit));
                        }
                    }
                    if (operation === 'update') {
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/time_period/${name}`, additionalFields);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/time_period/${name}`);
                        returnData.push({ success: true, name });
                    }
                }
                if (resource === 'rule') {
                    if (operation === 'get') {
                        const ruleId = this.getNodeParameter('ruleId', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/rule/${ruleId}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/rule/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/rule/collections/all');
                            const rules = response.value || [];
                            returnData.push(...rules.slice(0, limit));
                        }
                    }
                }
                if (resource === 'discovery') {
                    const hostName = this.getNodeParameter('hostName', i);
                    if (operation === 'run') {
                        const body = {
                            host_name: hostName,
                            mode: 'new',
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', `/objects/host/${hostName}/actions/discover_services/invoke`, body);
                        returnData.push(response);
                    }
                    if (operation === 'getStatus') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/host/${hostName}/collections/services`);
                        returnData.push(response);
                    }
                }
                if (resource === 'activateChanges') {
                    if (operation === 'activate') {
                        const sites = this.getNodeParameter('activateOnSites', i, '');
                        const forceForeignChanges = this.getNodeParameter('forceForeignChanges', i, false);
                        const body = {
                            sites: sites ? sites.split(',').map(s => s.trim()) : [],
                            force_foreign_changes: forceForeignChanges,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/activation_run/actions/activate-changes/invoke', body);
                        returnData.push(response);
                    }
                    if (operation === 'getPending') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/activation_run/collections/pending_changes');
                        returnData.push(response);
                    }
                    if (operation === 'getStatus') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/activation_run/collections/running');
                        returnData.push(response);
                    }
                }
                if (resource === 'site') {
                    if (operation === 'get') {
                        const siteName = this.getNodeParameter('siteName', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/site/${siteName}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/site/collections/all');
                        returnData.push(...(response.value || []));
                    }
                    if (operation === 'login') {
                        const siteName = this.getNodeParameter('siteName', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', `/objects/site/${siteName}/actions/login/invoke`, {});
                        returnData.push(response);
                    }
                    if (operation === 'logout') {
                        const siteName = this.getNodeParameter('siteName', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', `/objects/site/${siteName}/actions/logout/invoke`, {});
                        returnData.push(response);
                    }
                }
                if (resource === 'service') {
                    if (operation === 'get') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const serviceDescription = this.getNodeParameter('serviceDescription', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/host/${hostName}/actions/show_service/invoke`, {}, { service_description: serviceDescription });
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const hostName = this.getNodeParameter('hostName', i, '');
                        const qs = {};
                        if (hostName) {
                            qs.host_name = hostName;
                        }
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/service/collections/all', {}, qs);
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/service/collections/all', {}, qs);
                            const services = response.value || [];
                            returnData.push(...services.slice(0, limit));
                        }
                    }
                    if (operation === 'acknowledge') {
                        const hostName = this.getNodeParameter('hostName', i);
                        const serviceDescription = this.getNodeParameter('serviceDescription', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const comment = additionalFields.comment || 'Acknowledged via n8n';
                        const body = {
                            acknowledge_type: 'service',
                            host_name: hostName,
                            service_description: serviceDescription,
                            comment: comment,
                            sticky: true,
                            notify: false,
                            persistent: false,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/acknowledge/collections/service', body);
                        returnData.push(response);
                    }
                }
                if (resource === 'downtime') {
                    if (operation === 'create') {
                        const downtimeType = this.getNodeParameter('downtimeType', i);
                        const startTime = this.getNodeParameter('startTime', i, '');
                        const endTime = this.getNodeParameter('endTime', i, '');
                        const comment = this.getNodeParameter('comment', i, 'Scheduled downtime via n8n');
                        const hostName = this.getNodeParameter('hostName', i, '');
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            downtime_type: downtimeType,
                            start_time: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
                            end_time: endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 3600000).toISOString(),
                            comment: comment,
                        };
                        if (hostName) {
                            body.host_name = hostName;
                        }
                        if (additionalFields.serviceDescription) {
                            body.service_description = additionalFields.serviceDescription;
                        }
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/downtime/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'get') {
                        const downtimeId = this.getNodeParameter('downtimeId', i);
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', `/objects/downtime/${downtimeId}`);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/downtime/collections/all');
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/downtime/collections/all');
                            const downtimes = response.value || [];
                            returnData.push(...downtimes.slice(0, limit));
                        }
                    }
                    if (operation === 'delete') {
                        const downtimeId = this.getNodeParameter('downtimeId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/downtime/${downtimeId}`);
                        returnData.push({ success: true, downtimeId });
                    }
                }
                if (resource === 'problem') {
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/service/collections/all', {}, { state: 'warn,crit,unknown' });
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/service/collections/all', {}, { state: 'warn,crit,unknown' });
                            const problems = response.value || [];
                            returnData.push(...problems.slice(0, limit));
                        }
                    }
                }
                if (resource === 'biAggregation') {
                    if (operation === 'getState') {
                        const filterNames = this.getNodeParameter('filterNames', i, '');
                        const filterGroups = this.getNodeParameter('filterGroups', i, '');
                        const qs = {};
                        if (filterNames)
                            qs.filter_names = filterNames;
                        if (filterGroups)
                            qs.filter_groups = filterGroups;
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/bi_aggregation/actions/aggregation_state/invoke', {}, qs);
                        returnData.push(response);
                    }
                }
                if (resource === 'biPack') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/bi_pack/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'biRule') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/bi_rule/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'comment') {
                    if (operation === 'create') {
                        const hostName = this.getNodeParameter('hostName', i, '');
                        const commentText = this.getNodeParameter('commentText', i);
                        const persistent = this.getNodeParameter('persistent', i, false);
                        const body = {
                            comment: commentText,
                            persistent,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', `/objects/host/${hostName}/actions/add_comment/invoke`, body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/comment/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const commentId = this.getNodeParameter('commentId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/comment/${commentId}`);
                        returnData.push({ success: true, message: 'Comment deleted' });
                    }
                }
                if (resource === 'eventConsole') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/event_console/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'hostStatus') {
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const hostName = additionalFields.hostName;
                        const qs = {};
                        if (hostName)
                            qs.host_name = hostName;
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/host/collections/all', {}, qs);
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/host/collections/all', {}, qs);
                            const hosts = response.value || [];
                            returnData.push(...hosts.slice(0, limit));
                        }
                    }
                }
                if (resource === 'metric') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/metric/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'serviceStatus') {
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const hostName = additionalFields.hostName;
                        const qs = {};
                        if (hostName)
                            qs.host_name = hostName;
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/service/collections/all', {}, qs);
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/service/collections/all', {}, qs);
                            const services = response.value || [];
                            returnData.push(...services.slice(0, limit));
                        }
                    }
                }
                if (resource === 'sla') {
                    if (operation === 'compute') {
                        const slaConfiguration = this.getNodeParameter('slaConfiguration', i);
                        const timeRange = this.getNodeParameter('timeRange', i);
                        const body = {
                            sla_configuration: slaConfiguration,
                            time_range: timeRange,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/sla/actions/compute/invoke', body);
                        returnData.push(response);
                    }
                }
                if (resource === 'agent') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/agent/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'auditLog') {
                    if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const userId = additionalFields.userId;
                        const objectType = additionalFields.objectType;
                        const qs = {};
                        if (userId)
                            qs.user_id = userId;
                        if (objectType)
                            qs.object_type = objectType;
                        if (returnAll) {
                            const response = await GenericFunctions_1.checkmkApiRequestAllItems.call(this, 'GET', '/domain-types/audit_log/collections/all', {}, qs);
                            returnData.push(...response);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/audit_log/collections/all', {}, qs);
                            const logs = response.value || [];
                            returnData.push(...logs.slice(0, limit));
                        }
                    }
                }
                if (resource === 'auxTag') {
                    if (operation === 'create') {
                        const tagId = this.getNodeParameter('tagId', i);
                        const title = this.getNodeParameter('title', i);
                        const topic = this.getNodeParameter('topic', i, '');
                        const help = this.getNodeParameter('help', i, '');
                        const body = {
                            tag_id: tagId,
                            title,
                            topic,
                            help,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/aux_tag/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/aux_tag/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'update') {
                        const tagId = this.getNodeParameter('tagId', i);
                        const title = this.getNodeParameter('title', i);
                        const topic = this.getNodeParameter('topic', i, '');
                        const help = this.getNodeParameter('help', i, '');
                        const body = {
                            title,
                            topic,
                            help,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/aux_tag/${tagId}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const tagId = this.getNodeParameter('tagId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/aux_tag/${tagId}`);
                        returnData.push({ success: true, message: 'Aux tag deleted' });
                    }
                }
                if (resource === 'hostTagGroup') {
                    if (operation === 'create') {
                        const tagGroupId = this.getNodeParameter('tagGroupId', i);
                        const title = this.getNodeParameter('title', i);
                        const topic = this.getNodeParameter('topic', i, '');
                        const help = this.getNodeParameter('help', i, '');
                        const body = {
                            tag_group_id: tagGroupId,
                            title,
                            topic,
                            help,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/host_tag_group/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/host_tag_group/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'update') {
                        const tagGroupId = this.getNodeParameter('tagGroupId', i);
                        const title = this.getNodeParameter('title', i);
                        const topic = this.getNodeParameter('topic', i, '');
                        const help = this.getNodeParameter('help', i, '');
                        const body = {
                            title,
                            topic,
                            help,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/host_tag_group/${tagGroupId}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const tagGroupId = this.getNodeParameter('tagGroupId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/host_tag_group/${tagGroupId}`);
                        returnData.push({ success: true, message: 'Host tag group deleted' });
                    }
                }
                if (resource === 'ldapConnection') {
                    if (operation === 'create') {
                        const connectionId = this.getNodeParameter('connectionId', i);
                        const serverUrl = this.getNodeParameter('serverUrl', i);
                        const bindDn = this.getNodeParameter('bindDn', i);
                        const bindPassword = this.getNodeParameter('bindPassword', i);
                        const body = {
                            connection_id: connectionId,
                            server_url: serverUrl,
                            bind_dn: bindDn,
                            bind_password: bindPassword,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/ldap_connection/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/ldap_connection/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'update') {
                        const connectionId = this.getNodeParameter('connectionId', i);
                        const serverUrl = this.getNodeParameter('serverUrl', i);
                        const bindDn = this.getNodeParameter('bindDn', i);
                        const bindPassword = this.getNodeParameter('bindPassword', i);
                        const body = {
                            server_url: serverUrl,
                            bind_dn: bindDn,
                            bind_password: bindPassword,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/ldap_connection/${connectionId}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const connectionId = this.getNodeParameter('connectionId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/ldap_connection/${connectionId}`);
                        returnData.push({ success: true, message: 'LDAP connection deleted' });
                    }
                }
                if (resource === 'notificationRule') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/notification_rule/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'openTelemetry') {
                    if (operation === 'create') {
                        const collectorId = this.getNodeParameter('collectorId', i);
                        const collectorName = this.getNodeParameter('collectorName', i);
                        const port = this.getNodeParameter('port', i);
                        const body = {
                            collector_id: collectorId,
                            name: collectorName,
                            port,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/open_telemetry_collector/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/open_telemetry_collector/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'update') {
                        const collectorId = this.getNodeParameter('collectorId', i);
                        const collectorName = this.getNodeParameter('collectorName', i);
                        const port = this.getNodeParameter('port', i);
                        const body = {
                            name: collectorName,
                            port,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/open_telemetry_collector/${collectorId}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const collectorId = this.getNodeParameter('collectorId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/open_telemetry_collector/${collectorId}`);
                        returnData.push({ success: true, message: 'OpenTelemetry collector deleted' });
                    }
                }
                if (resource === 'parentScan') {
                    if (operation === 'run') {
                        const scanHostName = this.getNodeParameter('scanHostName', i);
                        const body = {
                            host_name: scanHostName,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/parent_scan/actions/run/invoke', body);
                        returnData.push(response);
                    }
                }
                if (resource === 'password') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/password/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'ruleset') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/ruleset/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'samlConnection') {
                    if (operation === 'create') {
                        const samlConnectionId = this.getNodeParameter('samlConnectionId', i);
                        const identityProviderMetadata = this.getNodeParameter('identityProviderMetadata', i);
                        const body = {
                            connection_id: samlConnectionId,
                            identity_provider_metadata: identityProviderMetadata,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/saml_connection/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/saml_connection/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'update') {
                        const samlConnectionId = this.getNodeParameter('samlConnectionId', i);
                        const identityProviderMetadata = this.getNodeParameter('identityProviderMetadata', i);
                        const body = {
                            identity_provider_metadata: identityProviderMetadata,
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/saml_connection/${samlConnectionId}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const samlConnectionId = this.getNodeParameter('samlConnectionId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/saml_connection/${samlConnectionId}`);
                        returnData.push({ success: true, message: 'SAML connection deleted' });
                    }
                }
                if (resource === 'userRole') {
                    if (operation === 'create') {
                        const roleId = this.getNodeParameter('roleId', i);
                        const roleAlias = this.getNodeParameter('roleAlias', i);
                        const permissions = this.getNodeParameter('permissions', i, '');
                        const body = {
                            role_id: roleId,
                            alias: roleAlias,
                            permissions: permissions ? permissions.split(',').map(p => p.trim()) : [],
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'POST', '/domain-types/user_role/collections/all', body);
                        returnData.push(response);
                    }
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/user_role/collections/all');
                        returnData.push(response);
                    }
                    if (operation === 'update') {
                        const roleId = this.getNodeParameter('roleId', i);
                        const roleAlias = this.getNodeParameter('roleAlias', i);
                        const permissions = this.getNodeParameter('permissions', i, '');
                        const body = {
                            alias: roleAlias,
                            permissions: permissions ? permissions.split(',').map(p => p.trim()) : [],
                        };
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'PUT', `/objects/user_role/${roleId}`, body);
                        returnData.push(response);
                    }
                    if (operation === 'delete') {
                        const roleId = this.getNodeParameter('roleId', i);
                        await GenericFunctions_1.checkmkApiRequest.call(this, 'DELETE', `/objects/user_role/${roleId}`);
                        returnData.push({ success: true, message: 'User role deleted' });
                    }
                }
                if (resource === 'backgroundJob') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/background_job/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'brokerConnection') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/broker_connection/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'certificate') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/certificate/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'configurationEntity') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/configuration_entity/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'dcd') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/dcd/collections/all');
                        returnData.push(response);
                    }
                }
                if (resource === 'licenseUsage') {
                    if (operation === 'get') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/license_usage/actions/usage/invoke');
                        returnData.push(response);
                    }
                }
                if (resource === 'quickSetup') {
                    if (operation === 'getMany') {
                        const response = await GenericFunctions_1.checkmkApiRequest.call(this, 'GET', '/domain-types/quick_setup/collections/all');
                        returnData.push(response);
                    }
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ error: error.message });
                    continue;
                }
                throw error;
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}
exports.Checkmk = Checkmk;
