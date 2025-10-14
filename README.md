# n8n-nodes-checkmk

This is an n8n community node. It lets you use Checkmk in your n8n workflows.

Checkmk is an IT monitoring platform for hybrid infrastructure, providing observability for servers, networks, cloud services, and applications from a single dashboard.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Manage configuration objects such as hosts, services, folders, host groups, contact groups, passwords, and rulesets.
- Trigger monitoring workflows including discovery, activation of changes, parent scans, and service checks.
- Retrieve monitoring data like host and service status, problems, metrics, SLAs, event console incidents, and audit logs.

## Credentials

This node uses the Checkmk REST API. To authenticate you need an automation user with REST API access in your Checkmk site.

1. In Checkmk, create or reuse an automation user and note the username and password/secret.
2. Locate your Checkmk base URL and site name (for example, `https://monitoring.example.com` and `mysite`).
3. In n8n, create new credentials for **Checkmk API** and enter the host URL, site, username, and password. The node sends requests using Bearer authentication as required by the Checkmk REST API.

## Compatibility

Tested with n8n v1.27.3. Requires n8n v1.0.0 or later and a Checkmk version that provides the REST API endpoints used by the node (Checkmk 2.1+ recommended).

## Usage

Many Checkmk resources expose extensive optional parameters. Start with minimal input (for example, host name or service ID) and add fields as required by your Checkmk configuration. Consult the Checkmk REST API documentation to map node parameters to API payloads, especially for discovery and ruleset operations.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Checkmk REST API documentation](https://docs.checkmk.com/latest/en/rest_api.html)

## Version history

- 0.1.0: Initial community release.
