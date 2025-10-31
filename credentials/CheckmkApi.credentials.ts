import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CheckmkApi implements ICredentialType {
	name = 'checkmkApi';
	displayName = 'Checkmk API';
	documentationUrl = 'https://docs.checkmk.com/latest/en/rest_api.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Host URL',
			name: 'host',
			type: 'string',
			default: '',
			placeholder: 'https://monitoring.example.com',
			description: 'The URL of your Checkmk server (without trailing slash)',
			required: true,
		},
		{
			displayName: 'Site Name',
			name: 'site',
			type: 'string',
			default: '',
			placeholder: 'mysite',
			description: 'The name of your Checkmk site',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'The automation user username',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The automation user password/secret',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.username}} {{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}/{{$credentials.site}}/check_mk/api/1.0',
			url: '/version',
			method: 'GET',
		},
	};
}

