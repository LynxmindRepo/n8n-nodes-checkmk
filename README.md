# n8n-nodes-checkmk

This is an n8n community node. It lets you use Checkmk in your n8n workflows.

Checkmk is an IT monitoring platform for hybrid infrastructure, providing observability for servers, networks, cloud services, and applications from a single dashboard.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources & Operations Reference](#resources--operations-reference)  
[Best Practices](#best-practices)  
[Troubleshooting](#troubleshooting)  
[Resources](#resources)  
[Documentation](#documentation)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node provides complete coverage of the Checkmk REST API v1.0 with **38 resources** and **100+ operations**:

### Configuration Management
- **Hosts**: Create, read, update, delete, rename, and move hosts
- **Services**: Retrieve service information and acknowledge problems
- **Folders**: Manage folder structure for organizing hosts
- **Groups**: Host groups, service groups, and contact groups
- **Users & Roles**: User management and role configuration
- **Tags**: Host tag groups and auxiliary tags
- **Rules & Rulesets**: Configuration rules and ruleset management
- **Time Periods**: Define time periods for notifications and checks
- **Passwords**: Manage stored passwords
- **Connections**: LDAP, SAML, and broker connections

### Monitoring Operations
- **Discovery**: Run service discovery on hosts
- **Activate Changes**: Activate pending configuration changes
- **Parent Scan**: Execute parent host scans
- **Background Jobs**: Monitor and manage background jobs

### Data Retrieval
- **Status**: Host and service status information
- **Problems**: List and manage monitoring problems
- **Metrics**: Retrieve performance metrics
- **SLAs**: Service level agreement data
- **Downtimes**: Schedule and manage maintenance windows
- **Comments**: Add and manage comments on hosts/services
- **Event Console**: Access event console data
- **Audit Log**: Review audit log entries

### Infrastructure
- **Sites**: Site management and login/logout
- **Agents**: Agent information and management
- **Certificates**: Certificate management
- **DCD**: Distributed Checkmk Daemon information
- **License Usage**: License usage statistics
- **OpenTelemetry**: OpenTelemetry collector configuration

### Business Intelligence
- **BI Aggregations**: Business intelligence aggregation data
- **BI Packs**: BI pack management
- **BI Rules**: BI rule configuration

## Credentials

This node uses the Checkmk REST API. To authenticate you need an automation user with REST API access in your Checkmk site.

1. In Checkmk, create or reuse an automation user and note the username and password/secret.
2. Locate your Checkmk base URL and site name (for example, `https://monitoring.example.com` and `mysite`).
3. In n8n, create new credentials for **Checkmk API** and enter the host URL, site, username, and password. The node sends requests using Bearer authentication as required by the Checkmk REST API.

## Compatibility

Tested with n8n v1.27.3. Requires n8n v1.0.0 or later and a Checkmk version that provides the REST API endpoints used by the node (Checkmk 2.1+ recommended).

## Usage

### Basic Example: Create a Host

```json
{
  "resource": "host",
  "operation": "create",
  "hostName": "web-server-01",
  "folder": "/",
  "attributes": {
    "ipaddress": "192.168.1.100",
    "alias": "Web Server 01",
    "tag_agent": "cmk-agent"
  }
}
```

### API Endpoint Mapping

The node maps to Checkmk REST API v1.0 endpoints. All endpoints follow the pattern:

```
{host}/{site}/check_mk/api/1.0{endpoint}
```

#### Complete Endpoint Reference

| Resource | Operation | HTTP Method | API Endpoint |
|----------|-----------|-------------|--------------|
| **Host** | `create` | POST | `/domain-types/host_config/collections/all` |
| **Host** | `get` | GET | `/objects/host_config/{host_name}` |
| **Host** | `getMany` | GET | `/domain-types/host_config/collections/all` |
| **Host** | `update` | PUT | `/objects/host_config/{host_name}` |
| **Host** | `delete` | DELETE | `/objects/host_config/{host_name}` |
| **Host** | `move` | POST | `/objects/host_config/{host_name}/actions/move/invoke` |
| **Host** | `rename` | POST | `/objects/host_config/{host_name}/actions/rename/invoke` |
| **Service** | `get` | GET | `/objects/service/{host_name}/{service_name}` |
| **Service** | `getMany` | GET | `/domain-types/service/collections/all` |
| **Service** | `acknowledgeProblem` | POST | `/objects/service/{host_name}/{service_name}/actions/acknowledge/invoke` |
| **Folder** | `create` | POST | `/domain-types/folder_config/collections/all` |
| **Folder** | `get` | GET | `/objects/folder_config/{folder_id}` |
| **Folder** | `getMany` | GET | `/domain-types/folder_config/collections/all` |
| **Folder** | `update` | PUT | `/objects/folder_config/{folder_id}` |
| **Folder** | `delete` | DELETE | `/objects/folder_config/{folder_id}` |
| **Host Group** | `create` | POST | `/domain-types/host_group_config/collections/all` |
| **Host Group** | `get` | GET | `/objects/host_group_config/{name}` |
| **Host Group** | `getMany` | GET | `/domain-types/host_group_config/collections/all` |
| **Host Group** | `update` | PUT | `/objects/host_group_config/{name}` |
| **Host Group** | `delete` | DELETE | `/objects/host_group_config/{name}` |
| **Service Group** | `create` | POST | `/domain-types/service_group_config/collections/all` |
| **Service Group** | `get` | GET | `/objects/service_group_config/{name}` |
| **Service Group** | `getMany` | GET | `/domain-types/service_group_config/collections/all` |
| **Service Group** | `update` | PUT | `/objects/service_group_config/{name}` |
| **Service Group** | `delete` | DELETE | `/objects/service_group_config/{name}` |
| **Contact Group** | `create` | POST | `/domain-types/contact_group_config/collections/all` |
| **Contact Group** | `get` | GET | `/objects/contact_group_config/{name}` |
| **Contact Group** | `getMany` | GET | `/domain-types/contact_group_config/collections/all` |
| **Contact Group** | `update` | PUT | `/objects/contact_group_config/{name}` |
| **Contact Group** | `delete` | DELETE | `/objects/contact_group_config/{name}` |
| **User** | `create` | POST | `/domain-types/user_config/collections/all` |
| **User** | `get` | GET | `/objects/user_config/{username}` |
| **User** | `getMany` | GET | `/domain-types/user_config/collections/all` |
| **User** | `update` | PUT | `/objects/user_config/{username}` |
| **User** | `delete` | DELETE | `/objects/user_config/{username}` |
| **User Role** | `get` | GET | `/objects/role_config/{role_id}` |
| **User Role** | `getMany` | GET | `/domain-types/role_config/collections/all` |
| **Time Period** | `create` | POST | `/domain-types/time_period/collections/all` |
| **Time Period** | `get` | GET | `/objects/time_period/{name}` |
| **Time Period** | `getMany` | GET | `/domain-types/time_period/collections/all` |
| **Time Period** | `update` | PUT | `/objects/time_period/{name}` |
| **Time Period** | `delete` | DELETE | `/objects/time_period/{name}` |
| **Host Tag Group** | `create` | POST | `/domain-types/host_tag_group/collections/all` |
| **Host Tag Group** | `get` | GET | `/objects/host_tag_group/{id}` |
| **Host Tag Group** | `getMany` | GET | `/domain-types/host_tag_group/collections/all` |
| **Host Tag Group** | `update` | PUT | `/objects/host_tag_group/{id}` |
| **Host Tag Group** | `delete` | DELETE | `/objects/host_tag_group/{id}` |
| **Aux Tag** | `create` | POST | `/domain-types/aux_tag/collections/all` |
| **Aux Tag** | `get` | GET | `/objects/aux_tag/{aux_tag_id}` |
| **Aux Tag** | `getMany` | GET | `/domain-types/aux_tag/collections/all` |
| **Aux Tag** | `update` | PUT | `/objects/aux_tag/{aux_tag_id}` |
| **Aux Tag** | `delete` | DELETE | `/objects/aux_tag/{aux_tag_id}` |
| **Rule** | `get` | GET | `/objects/rule/{rule_id}` |
| **Rule** | `getMany` | GET | `/domain-types/rule/collections/all` |
| **Ruleset** | `get` | GET | `/objects/ruleset/{ruleset_id}` |
| **Ruleset** | `getMany` | GET | `/domain-types/ruleset/collections/all` |
| **Ruleset** | `update` | PUT | `/objects/ruleset/{ruleset_id}` |
| **Notification Rule** | `getMany` | GET | `/domain-types/notification_rule/collections/all` |
| **Password** | `getMany` | GET | `/domain-types/password/collections/all` |
| **Discovery** | `run` | POST | `/domain-types/service_discovery_run/actions/start/invoke` |
| **Discovery** | `getStatus` | GET | `/objects/service_discovery_run/{host_name}` |
| **Activate Change** | `activate` | POST | `/domain-types/activation_run/actions/activate-changes/invoke` |
| **Activate Change** | `getPending` | GET | `/domain-types/activation_run/collections/pending_changes` |
| **Activate Change** | `getStatus` | GET | `/objects/activation_run/{activation_id}` |
| **Parent Scan** | `run` | POST | `/domain-types/parent_scan/actions/start/invoke` |
| **Site** | `get` | GET | `/objects/site/{site_id}` |
| **Site** | `getMany` | GET | `/domain-types/site/collections/all` |
| **Site** | `login` | POST | `/objects/site/{site_id}/actions/login/invoke` |
| **Site** | `logout` | POST | `/objects/site/{site_id}/actions/logout/invoke` |
| **Downtime** | `create` | POST | `/domain-types/downtime/collections/all` |
| **Downtime** | `get` | GET | `/objects/downtime/{downtime_id}` |
| **Downtime** | `getMany` | GET | `/domain-types/downtime/collections/all` |
| **Downtime** | `delete` | DELETE | `/objects/downtime/{downtime_id}` |
| **Problem** | `get` | GET | `/objects/problem/{problem_id}` |
| **Problem** | `getMany` | GET | `/domain-types/problem/collections/all` |
| **Problem** | `acknowledge` | POST | `/objects/problem/{problem_id}/actions/acknowledge/invoke` |
| **Problem** | `delete` | DELETE | `/objects/problem/{problem_id}` |
| **Host Status** | `get` | GET | `/objects/host/{host_name}` |
| **Host Status** | `getMany` | GET | `/domain-types/host/collections/all` |
| **Service Status** | `get` | GET | `/objects/service/{host_name}/{service_name}` |
| **Service Status** | `getMany` | GET | `/domain-types/service/collections/all` |
| **Comment** | `create` | POST | `/domain-types/comment/collections/all` |
| **Comment** | `get` | GET | `/objects/comment/{comment_id}` |
| **Comment** | `getMany` | GET | `/domain-types/comment/collections/all` |
| **Comment** | `delete` | DELETE | `/objects/comment/{comment_id}` |
| **Metric** | `get` | GET | `/objects/metric/{metric_name}` |
| **Metric** | `getMany` | GET | `/domain-types/metric/collections/all` |
| **SLA** | `compute` | POST | `/domain-types/sla/actions/compute/invoke` |
| **Event Console** | `get` | GET | `/objects/event/{event_id}` |
| **Event Console** | `getMany` | GET | `/domain-types/event/collections/all` |
| **Audit Log** | `getMany` | GET | `/domain-types/audit_log/collections/all` |
| **Background Job** | `get` | GET | `/objects/background_job/{job_id}` |
| **Background Job** | `getMany` | GET | `/domain-types/background_job/collections/all` |
| **Agent** | `getMany` | GET | `/domain-types/agent/collections/all` |
| **Broker Connection** | `getMany` | GET | `/domain-types/broker_connection/collections/all` |
| **LDAP Connection** | `create` | POST | `/domain-types/ldap_connection/collections/all` |
| **LDAP Connection** | `getMany` | GET | `/domain-types/ldap_connection/collections/all` |
| **LDAP Connection** | `update` | PUT | `/objects/ldap_connection/{connection_id}` |
| **LDAP Connection** | `delete` | DELETE | `/objects/ldap_connection/{connection_id}` |
| **SAML Connection** | `create` | POST | `/domain-types/saml_connection/collections/all` |
| **SAML Connection** | `getMany` | GET | `/domain-types/saml_connection/collections/all` |
| **SAML Connection** | `update` | PUT | `/objects/saml_connection/{connection_id}` |
| **SAML Connection** | `delete` | DELETE | `/objects/saml_connection/{connection_id}` |
| **Certificate** | `getMany` | GET | `/domain-types/certificate/collections/all` |
| **DCD** | `getMany` | GET | `/domain-types/dcd/collections/all` |
| **License Usage** | `get` | GET | `/domain-types/license_usage/collections/all` |
| **OpenTelemetry** | `create` | POST | `/domain-types/open_telemetry_connector/collections/all` |
| **OpenTelemetry** | `getMany` | GET | `/domain-types/open_telemetry_connector/collections/all` |
| **OpenTelemetry** | `update` | PUT | `/objects/open_telemetry_connector/{connector_id}` |
| **OpenTelemetry** | `delete` | DELETE | `/objects/open_telemetry_connector/{connector_id}` |
| **BI Aggregation** | `getState` | GET | `/objects/bi_aggregation/{aggregation_id}` |
| **BI Pack** | `getMany` | GET | `/domain-types/bi_pack/collections/all` |
| **BI Rule** | `getMany` | GET | `/domain-types/bi_rule/collections/all` |
| **Configuration Entity** | `getMany` | GET | `/domain-types/configuration_entity/collections/all` |
| **Quick Setup** | `getMany` | GET | `/domain-types/quick_setup/collections/all` |

### Authentication

The node uses Bearer token authentication as required by Checkmk REST API:

```
Authorization: Bearer {username} {password}
```

The base URL format is:
```
{host}/{site}/check_mk/api/1.0{endpoint}
```

### Folder ID Format

Checkmk uses a special format for folder IDs:
- Root folder: `~`
- Subfolder: `~folder1~folder2` (not `/folder1/folder2`)

The node automatically normalizes folder IDs, but understanding the format helps when troubleshooting.

### ETag Support

Operations that modify resources (PUT/DELETE) require ETags for concurrency control. The node automatically:
1. Retrieves the current ETag via GET request
2. Includes it in the `If-Match` header
3. Retries with a fresh ETag if a 412 (Precondition Failed) error occurs

### Pagination

For "Get Many" operations, you can:
- Use `returnAll: true` to fetch all items (handles pagination automatically)
- Use `limit` to restrict the number of results
- The node automatically follows pagination links when `returnAll` is enabled

### Query Parameters and Filtering

Many "Get Many" operations support query parameters for filtering and pagination:

#### Common Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `effective_attributes` | boolean | Include effective attributes in response | `true` |
| `include_links` | boolean | Include hypermedia links in response | `false` |
| `fields` | string | Comma-separated list of fields to return | `"title,alias"` |
| `hostnames` | array | Filter by specific host names | `["host1", "host2"]` |
| `site` | string | Filter by site name | `"mysite"` |
| `filter_names` | array | Filter by names (for problems) | `["problem1"]` |
| `filter_groups` | array | Filter by groups (for problems) | `["group1"]` |

#### Pagination Parameters

- `returnAll`: When `true`, automatically fetches all pages
- `limit`: Maximum number of items to return (when `returnAll` is `false`)

The node automatically handles pagination by following `links.next` in the response when `returnAll` is enabled.

### Request and Response Formats

#### Request Format

All requests use JSON payloads with `Content-Type: application/json`. Example for creating a host:

```json
{
  "host_name": "web-server-01",
  "folder": "~",
  "attributes": {
    "ipaddress": "192.168.1.100",
    "alias": "Web Server 01",
    "tag_agent": "cmk-agent",
    "tag_criticality": "prod"
  }
}
```

#### Response Format

Responses follow the Checkmk REST API v1.0 format:

```json
{
  "id": "web-server-01",
  "title": "Web Server 01",
  "extensions": {
    "folder": "/",
    "attributes": {
      "ipaddress": "192.168.1.100",
      "alias": "Web Server 01"
    }
  },
  "links": [
    {
      "rel": "self",
      "href": "/check_mk/api/1.0/objects/host_config/web-server-01",
      "method": "GET"
    }
  ]
}
```

For collection endpoints, responses include a `value` array:

```json
{
  "value": [
    { "id": "host1", "title": "Host 1" },
    { "id": "host2", "title": "Host 2" }
  ],
  "links": [
    {
      "rel": "next",
      "href": "/check_mk/api/1.0/domain-types/host_config/collections/all?page=2"
    }
  ]
}
```

### Parameter Mapping

Many Checkmk resources expose extensive optional parameters. The node accepts:

- **Direct fields**: Common parameters as node fields (e.g., `hostName`, `folder`, `alias`)
- **Additional Fields**: JSON objects for complex parameters (e.g., query parameters, options)
- **Attributes**: Host/service attributes as JSON objects (e.g., `ipaddress`, `tag_agent`)

#### Host Attributes Reference

Common host attributes include:

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `ipaddress` | string | IP address of the host | `"192.168.1.100"` |
| `alias` | string | Human-readable alias | `"Web Server 01"` |
| `tag_agent` | string | Agent type tag | `"cmk-agent"`, `"no-agent"`, `"special-agents"` |
| `tag_criticality` | string | Criticality tag | `"prod"`, `"test"`, `"dev"` |
| `tag_networking` | string | Networking tag | `"lan"`, `"wan"`, `"dmz"` |
| `tag_address_family` | string | Address family tag | `"ip-v4"`, `"ip-v6"`, `"ip-v4v6"` |
| `tag_site` | string | Site tag | Site identifier |
| `labels` | object | Custom labels as key-value pairs | `{"environment": "production", "team": "ops"}` |
| `snmp_community` | string | SNMP community string | `"public"` |
| `contactgroups` | array | List of contact group names | `["oncall", "admins"]` |
| `parents` | array | Parent host names | `["gateway-01"]` |
| `explicit_snmp_community` | string | Explicit SNMP community | `"private"` |
| `management_snmp_community` | string | Management SNMP community | `"mgmt"` |
| `management_address` | string | Management IP address | `"10.0.0.1"` |
| `management_protocol` | string | Management protocol | `"snmp"`, `"ipmi"` |

#### Service Attributes Reference

Service-related attributes and parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `service_name` | string | Service name/description | `"CPU utilization"` |
| `host_name` | string | Host name | `"server-01"` |
| `acknowledge` | boolean | Acknowledge service problem | `true` |
| `sticky` | boolean | Sticky acknowledgment | `true` |
| `notify` | boolean | Send notification | `false` |
| `persistent` | boolean | Persistent comment | `true` |
| `comment` | string | Comment text | `"Investigating issue"` |

#### Discovery Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `host_name` | string | Host name to run discovery on | `"server-01"` |
| `mode` | string | Discovery mode | `"new"`, `"remove"`, `"fixall"`, `"refresh"`, `"only_host_labels"` |
| `do_scan` | boolean | Perform scan | `true` |
| `do_full_scan` | boolean | Perform full scan | `false` |
| `update_host_labels` | boolean | Update host labels | `true` |

#### Downtime Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `downtime_type` | string | Type of downtime | `"host"`, `"service"` |
| `host_name` | string | Host name (required for host downtime) | `"server-01"` |
| `service_description` | string | Service description (required for service downtime) | `"CPU utilization"` |
| `start_time` | string | Start time (ISO 8601 format) | `"2024-01-15T10:00:00Z"` |
| `end_time` | string | End time (ISO 8601 format) | `"2024-01-15T12:00:00Z"` |
| `comment` | string | Downtime comment | `"Scheduled maintenance"` |

#### Activate Changes Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `sites` | array | List of site IDs to activate | `["mysite"]` |
| `redirect` | boolean | Redirect to activation page | `false` |
| `force_foreign_changes` | boolean | Force foreign changes | `false` |

#### Problem Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `problem_id` | string | Problem identifier | `"problem-123"` |
| `sticky` | boolean | Sticky acknowledgment | `true` |
| `notify` | boolean | Send notification | `true` |
| `persistent` | boolean | Persistent comment | `false` |
| `comment` | string | Comment text | `"Working on fix"` |
| `filter_names` | array | Filter by problem names | `["critical", "warning"]` |
| `filter_groups` | array | Filter by groups | `["network", "database"]` |

For a complete list of available attributes and parameters, refer to the [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html).

### Error Handling

The node handles various error scenarios:

#### HTTP Status Codes

| Status Code | Meaning | Node Behavior |
|-------------|---------|---------------|
| `200` | Success | Returns response data |
| `201` | Created | Returns created resource |
| `204` | No Content | Returns success indicator |
| `400` | Bad Request | Throws error with validation details |
| `401` | Unauthorized | Throws authentication error |
| `403` | Forbidden | Throws permission error |
| `404` | Not Found | Throws resource not found error |
| `412` | Precondition Failed | Automatically retries with fresh ETag |
| `422` | Unprocessable Entity | Throws validation error |
| `500` | Internal Server Error | Throws server error |

#### ETag Retry Logic

For operations requiring ETags (PUT/DELETE), the node:
1. Retrieves the current ETag via GET request
2. Includes it in the `If-Match` header
3. If a 412 (Precondition Failed) error occurs, automatically:
   - Retrieves a fresh ETag
   - Retries the operation once
   - Throws error if retry also fails

#### Error Response Format

Errors follow the Checkmk API error format:

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation error message",
  "fields": {
    "host_name": ["This field is required"]
  }
}
```

The node converts these to n8n `NodeApiError` exceptions with descriptive messages.

## Resources & Operations Reference

### Complete Resource List

| Resource | Operations Available |
|----------|---------------------|
| **Host** | Create, Get, Get Many, Update, Delete, Rename, Move |
| **Service** | Get, Get Many, Acknowledge Problem |
| **Folder** | Create, Get, Get Many, Update, Delete |
| **Host Group** | Create, Get, Get Many, Update, Delete |
| **Service Group** | Create, Get, Get Many, Update, Delete |
| **Contact Group** | Create, Get, Get Many, Update, Delete |
| **User** | Create, Get, Get Many, Update, Delete |
| **User Role** | Get, Get Many |
| **Time Period** | Create, Get, Get Many, Update, Delete |
| **Host Tag Group** | Create, Get, Get Many, Update, Delete |
| **Aux Tag** | Create, Get, Get Many, Update, Delete |
| **Rule** | Get, Get Many |
| **Ruleset** | Get, Get Many, Update |
| **Notification Rule** | Get Many |
| **Password** | Get Many |
| **Discovery** | Run, Get Status |
| **Activate Change** | Activate, Get Pending, Get Status |
| **Parent Scan** | Run |
| **Site** | Get, Get Many, Login, Logout |
| **Downtime** | Create, Get, Get Many, Delete |
| **Problem** | Get, Get Many, Acknowledge, Delete |
| **Host Status** | Get, Get Many |
| **Service Status** | Get, Get Many |
| **Comment** | Create, Get, Get Many, Delete |
| **Metric** | Get, Get Many |
| **SLA** | Compute |
| **Event Console** | Get, Get Many |
| **Audit Log** | Get Many |
| **Background Job** | Get, Get Many |
| **Agent** | Get Many |
| **Broker Connection** | Get Many |
| **LDAP Connection** | Create, Get Many, Update, Delete |
| **SAML Connection** | Create, Get Many, Update, Delete |
| **Certificate** | Get Many |
| **DCD** | Get Many |
| **License Usage** | Get |
| **OpenTelemetry** | Create, Get Many, Update, Delete |
| **BI Aggregation** | Get State |
| **BI Pack** | Get Many |
| **BI Rule** | Get Many |
| **Configuration Entity** | Get Many |
| **Quick Setup** | Get Many |

### Common Operations Examples

#### Create Host with Attributes
```json
{
  "resource": "host",
  "operation": "create",
  "hostName": "server-01",
  "folder": "/",
  "attributes": {
    "ipaddress": "192.168.1.100",
    "alias": "Production Server",
    "tag_agent": "cmk-agent",
    "tag_criticality": "prod"
  }
}
```

#### Run Service Discovery
```json
{
  "resource": "discovery",
  "operation": "run",
  "hostName": "server-01",
  "mode": "refresh"
}
```

#### Activate Pending Changes
```json
{
  "resource": "activateChanges",
  "operation": "activate",
  "sites": ["mysite"]
}
```

#### Create Downtime
```json
{
  "resource": "downtime",
  "operation": "create",
  "downtimeType": "host",
  "hostName": "server-01",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "comment": "Scheduled maintenance"
}
```

#### Update Host with Attributes
```json
{
  "resource": "host",
  "operation": "update",
  "hostName": "server-01",
  "attributes": {
    "alias": "Updated Server Name",
    "tag_criticality": "prod"
  }
}
```

#### Get Many Hosts with Filtering
```json
{
  "resource": "host",
  "operation": "getMany",
  "returnAll": false,
  "limit": 50,
  "additionalFields": {
    "hostnames": "server-01,server-02",
    "effective_attributes": true,
    "site": "mysite"
  }
}
```

#### Create Folder
```json
{
  "resource": "folder",
  "operation": "create",
  "title": "Production Servers",
  "parent": "~",
  "name": "production"
}
```

#### Acknowledge Problem
```json
{
  "resource": "problem",
  "operation": "acknowledge",
  "problemId": "problem-123",
  "sticky": true,
  "notify": true,
  "comment": "Investigating issue"
}
```

#### Get Problems with Filters
```json
{
  "resource": "problem",
  "operation": "getMany",
  "returnAll": false,
  "limit": 100,
  "additionalFields": {
    "filterNames": ["critical", "warning"],
    "filterGroups": ["network"]
  }
}
```

#### Run Discovery with Options
```json
{
  "resource": "discovery",
  "operation": "run",
  "hostName": "server-01",
  "mode": "refresh",
  "doFullScan": true,
  "doScan": true
}
```

#### Create User
```json
{
  "resource": "user",
  "operation": "create",
  "username": "automation-user",
  "fullname": "Automation User",
  "customer": null,
  "authorizedSites": ["mysite"],
  "contactOptions": {
    "email": "user@example.com"
  }
}
```

#### Create Host Group
```json
{
  "resource": "hostGroup",
  "operation": "create",
  "name": "web-servers",
  "alias": "Web Servers"
}
```

#### Get Service Status
```json
{
  "resource": "serviceStatus",
  "operation": "get",
  "hostName": "server-01",
  "serviceName": "CPU utilization"
}
```

#### Move Host to Different Folder
```json
{
  "resource": "host",
  "operation": "move",
  "hostName": "server-01",
  "folder": "~production~servers"
}
```

#### Rename Host
```json
{
  "resource": "host",
  "operation": "rename",
  "hostName": "old-server-name",
  "additionalFields": {
    "newName": "new-server-name"
  }
}
```

#### Create Service Downtime
```json
{
  "resource": "downtime",
  "operation": "create",
  "additionalFields": {
    "downtimeType": "service",
    "hostName": "server-01",
    "serviceDescription": "CPU utilization",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T12:00:00Z",
    "comment": "Service maintenance"
  }
}
```

#### Get Pending Changes
```json
{
  "resource": "activateChanges",
  "operation": "getPending"
}
```

#### Get Activation Status
```json
{
  "resource": "activateChanges",
  "operation": "getStatus",
  "activationId": "activation-123"
}
```

#### Get Discovery Status
```json
{
  "resource": "discovery",
  "operation": "getStatus",
  "hostName": "server-01"
}
```

#### Create Comment
```json
{
  "resource": "comment",
  "operation": "create",
  "additionalFields": {
    "commentText": "This is a test comment",
    "hostName": "server-01",
    "serviceName": "CPU utilization",
    "persistent": true
  }
}
```

#### Get BI Aggregation State
```json
{
  "resource": "biAggregation",
  "operation": "getState",
  "aggregationId": "aggregation-123"
}
```

#### Compute SLA Data
```json
{
  "resource": "sla",
  "operation": "compute",
  "additionalFields": {
    "slaId": "sla-123",
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-31T23:59:59Z"
  }
}
```

#### Create Host with Labels
```json
{
  "resource": "host",
  "operation": "create",
  "hostName": "server-01",
  "folder": "~",
  "additionalFields": {
    "ipaddress": "192.168.1.100",
    "labels": "environment:production,team:ops,region:us-east"
  }
}
```

#### Update Host Attributes (Add/Remove)
```json
{
  "resource": "host",
  "operation": "update",
  "hostName": "server-01",
  "additionalFields": {
    "updateAttributes": "{\"tag_criticality\": \"prod\", \"alias\": \"Updated Server\"}",
    "removeAttributes": "old_tag,deprecated_tag"
  }
}
```

#### Get Host with Effective Attributes
```json
{
  "resource": "host",
  "operation": "get",
  "hostName": "server-01",
  "additionalFields": {
    "effective_attributes": true
  }
}
```

#### Acknowledge Service Problem
```json
{
  "resource": "service",
  "operation": "acknowledgeProblem",
  "hostName": "server-01",
  "serviceName": "CPU utilization",
  "additionalFields": {
    "sticky": true,
    "notify": true,
    "comment": "Acknowledged - investigating"
  }
}
```

#### Get Many Services with Filtering
```json
{
  "resource": "service",
  "operation": "getMany",
  "returnAll": false,
  "limit": 100,
  "additionalFields": {
    "hostName": "server-01",
    "effective_attributes": true
  }
}
```

#### Create Time Period
```json
{
  "resource": "timePeriod",
  "operation": "create",
  "name": "business-hours",
  "alias": "Business Hours",
  "additionalFields": {
    "activeTimeRanges": [
      {
        "day": "monday",
        "timeRanges": [{"start": "09:00", "end": "17:00"}]
      }
    ]
  }
}
```

#### Create Host Tag Group
```json
{
  "resource": "hostTagGroup",
  "operation": "create",
  "id": "environment",
  "title": "Environment",
  "topic": "Tags",
  "additionalFields": {
    "tags": [
      {"id": "prod", "title": "Production"},
      {"id": "test", "title": "Test"}
    ]
  }
}
```

#### Create Aux Tag
```json
{
  "resource": "auxTag",
  "operation": "create",
  "auxTagId": "custom-tag",
  "title": "Custom Tag",
  "topic": "Custom",
  "additionalFields": {
    "help": "This is a custom auxiliary tag"
  }
}
```

#### Get Ruleset
```json
{
  "resource": "ruleset",
  "operation": "get",
  "rulesetId": "host_groups"
}
```

#### Update Ruleset
```json
{
  "resource": "ruleset",
  "operation": "update",
  "rulesetId": "host_groups",
  "additionalFields": {
    "rules": [
      {
        "id": "rule-1",
        "value": {"groups": ["web-servers"]}
      }
    ]
  }
}
```

## Advanced Operations and Use Cases

### Workflow Patterns

#### Pattern 1: Host Provisioning Workflow
1. Create folder structure
2. Create host with attributes
3. Run service discovery
4. Activate changes
5. Create initial downtime (optional)

#### Pattern 2: Problem Response Workflow
1. Get problems with filters
2. Acknowledge critical problems
3. Create comments
4. Schedule downtime if needed
5. Notify team (via other n8n nodes)

#### Pattern 3: Maintenance Window Workflow
1. Get affected hosts/services
2. Create downtime for maintenance
3. Monitor during maintenance (get status)
4. Delete downtime when complete
5. Verify services are healthy

#### Pattern 4: Configuration Management Workflow
1. Get current configuration (hosts, groups, rules)
2. Update configurations via API
3. Validate changes
4. Activate changes
5. Monitor activation status

### Date and Time Formats

All date/time parameters use ISO 8601 format:

- **Format**: `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss+00:00`
- **Examples**:
  - `"2024-01-15T10:00:00Z"` (UTC)
  - `"2024-01-15T10:00:00+01:00"` (with timezone)
  - `"2024-01-15T10:00:00"` (local time, converted by Checkmk)

### Working with Folders

Folder hierarchy examples:

| Path | Checkmk Format | Usage |
|------|----------------|-------|
| Root | `~` or `/` | Root folder |
| Single level | `~production` | One level deep |
| Nested | `~production~servers` | Multiple levels |
| Deep nesting | `~prod~web~us-east` | Three levels |

**Important**: The node automatically normalizes folder paths, but for consistency, use the `~` format.

### Working with Tags

Tags are organized in tag groups. Common tag groups:

- **Agent**: `cmk-agent`, `no-agent`, `special-agents`
- **Criticality**: `prod`, `test`, `dev`, `qa`
- **Networking**: `lan`, `wan`, `dmz`
- **Address Family**: `ip-v4`, `ip-v6`, `ip-v4v6`

Tags can be combined and used for filtering and grouping hosts.

### Batch Operations

When working with multiple resources:

1. **Use n8n's batch processing**: Process items in batches
2. **Implement error handling**: Catch and log errors for individual items
3. **Use rate limiting**: Add delays between requests if needed
4. **Monitor progress**: Use n8n's logging to track batch progress

### Integration Examples

#### Integration with Slack
```json
{
  "nodes": [
    {
      "type": "checkmk",
      "parameters": {
        "resource": "problem",
        "operation": "getMany"
      }
    },
    {
      "type": "slack",
      "parameters": {
        "channel": "#alerts",
        "text": "{{$json.title}}"
      }
    }
  ]
}
```

#### Integration with Webhooks
Use Checkmk node to create/update hosts based on webhook triggers from infrastructure provisioning systems.

#### Integration with Databases
Store Checkmk configuration data in databases for backup, audit, or synchronization purposes.

## Best Practices

### Authentication

1. **Use Automation Users**: Always use dedicated automation users with REST API access, never use personal user accounts
2. **Secure Credentials**: Store credentials securely in n8n's credential system
3. **Minimal Permissions**: Grant only the minimum required permissions to automation users
4. **Rotate Secrets**: Regularly rotate automation user passwords/secrets

### Performance

1. **Pagination**: Use `returnAll: true` only when necessary. For large datasets, consider using `limit` with pagination
2. **Filtering**: Use query parameters (`hostnames`, `site`, `filterNames`) to reduce response sizes
3. **Batch Operations**: When creating multiple resources, use n8n's batch processing capabilities
4. **Rate Limiting**: Be aware of Checkmk API rate limits and implement appropriate delays if needed

### Error Handling

1. **ETag Handling**: The node automatically handles ETags, but be aware that concurrent modifications may cause retries
2. **Validation**: Validate input data before sending requests to avoid unnecessary API calls
3. **Error Messages**: Check error responses for detailed validation messages
4. **Retry Logic**: For transient errors, implement retry logic in your workflows

### Folder Management

1. **Folder IDs**: Remember that Checkmk uses `~` prefix for folder IDs (e.g., `~production~servers`)
2. **Root Folder**: Use `~` or `/` for the root folder (both are normalized)
3. **Nested Folders**: For nested folders, use the format `~parent~child` (not `/parent/child`)

### Workflow Design

1. **Idempotency**: Design workflows to be idempotent where possible (check if resource exists before creating)
2. **State Management**: Track workflow state to avoid duplicate operations
3. **Logging**: Use n8n's logging features to track API calls and responses
4. **Testing**: Test workflows with small datasets before running on production data

## Troubleshooting

### Common Issues

#### Authentication Errors

**Problem**: `401 Unauthorized` or authentication failures

**Solutions**:
- Verify credentials are correct in n8n credential settings
- Ensure the automation user has REST API access enabled
- Check that the username and password are entered correctly (no extra spaces)
- Verify the Checkmk site name is correct

#### Folder Not Found Errors

**Problem**: `404 Not Found` when accessing folders

**Solutions**:
- Verify folder ID format: use `~folder1~folder2` not `/folder1/folder2`
- Check that the folder exists in Checkmk
- Ensure folder path is URL-encoded correctly
- Use `~` for root folder, not `/` (though both are normalized)

#### ETag Errors

**Problem**: `412 Precondition Failed` errors

**Solutions**:
- The node automatically retries with fresh ETags, but if errors persist:
- Check for concurrent modifications to the same resource
- Ensure you're not modifying resources in parallel workflows
- Verify the resource exists before updating/deleting

#### Pagination Issues

**Problem**: Not getting all results or pagination not working

**Solutions**:
- Use `returnAll: true` to fetch all pages automatically
- Check that `limit` is set appropriately when `returnAll` is `false`
- Verify the API response includes `links.next` for pagination
- For very large datasets, consider using filters to reduce result sets

#### Invalid JSON Errors

**Problem**: `Invalid JSON` errors when using attributes or additional fields

**Solutions**:
- Ensure JSON is properly formatted (use a JSON validator)
- Escape special characters in JSON strings
- Use the n8n expression editor for complex JSON structures
- Check that attribute names match Checkmk's expected format

#### Host/Service Not Found

**Problem**: `404 Not Found` for hosts or services

**Solutions**:
- Verify the host name is correct (case-sensitive)
- Check that the host exists in the specified folder
- Ensure service names match exactly (including special characters)
- Use "Get Many" operations to list available resources first

### Debugging Tips

1. **Enable Verbose Logging**: Check n8n execution logs for detailed request/response information
2. **Test with GET First**: Use "Get" operations to verify resource existence before modifying
3. **Check API Documentation**: Refer to [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html) for endpoint details
4. **Use Postman/curl**: Test API calls directly to isolate node-specific issues
5. **Verify Permissions**: Ensure the automation user has necessary permissions for the operation

### Getting Help

1. **Check Logs**: Review n8n execution logs and Checkmk audit logs
2. **API Documentation**: Consult the [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html)
3. **OpenAPI Spec**: Use the [Checkmk API Reference](https://checkmk.com/api/1.0/domain-types/) for detailed endpoint information
4. **Community Support**: Reach out to the n8n community or Checkmk community forums

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html)
- [Checkmk API Reference](https://checkmk.com/api/1.0/domain-types/)
- [Checkmk Official Documentation](https://docs.checkmk.com/)

## Documentation

This README provides comprehensive technical documentation and API reference for the Checkmk node. For additional examples and detailed parameter descriptions, refer to the [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html).

### API Compatibility

This node is built against the Checkmk REST API v1.0 specification. All endpoints follow the pattern:

```
{host}/{site}/check_mk/api/1.0{endpoint}
```

The node handles:
- ✅ Bearer token authentication
- ✅ ETag-based concurrency control
- ✅ Automatic pagination
- ✅ Folder ID normalization
- ✅ Error handling and retries

### Contributing

When adding new resources or operations, refer to the [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html) to ensure proper endpoint mapping and parameter handling.

## Version history

- 0.2.0: Complete API coverage with 38 resources and 100+ operations
- 0.1.0: Initial community release.
