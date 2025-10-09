"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckmkApi = void 0;
class CheckmkApi {
    constructor() {
        this.name = 'checkmkApi';
        this.displayName = 'Checkmk API';
        this.documentationUrl = 'https://docs.checkmk.com/latest/en/rest_api.html';
        this.properties = [
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
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.username}} {{$credentials.password}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.host}}/{{$credentials.site}}/check_mk/api/1.0',
                url: '/version',
                method: 'GET',
            },
        };
    }
}
exports.CheckmkApi = CheckmkApi;
