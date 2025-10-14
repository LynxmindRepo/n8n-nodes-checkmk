"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkmkApiRequest = checkmkApiRequest;
exports.checkmkApiRequestAllItems = checkmkApiRequestAllItems;
const n8n_workflow_1 = require("n8n-workflow");
async function checkmkApiRequest(method, endpoint, body = {}, qs = {}) {
    const credentials = await this.getCredentials('checkmkApi');
    const options = {
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
    };
    try {
        return await this.helpers.request(options);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function checkmkApiRequestAllItems(method, endpoint, body = {}, qs = {}) {
    const returnData = [];
    let responseData;
    do {
        responseData = await checkmkApiRequest.call(this, method, endpoint, body, qs);
        if (responseData.value) {
            returnData.push(...responseData.value);
        }
        else if (Array.isArray(responseData)) {
            returnData.push(...responseData);
        }
        else {
            returnData.push(responseData);
        }
        if (responseData.links && responseData.links.next) {
            endpoint = responseData.links.next;
        }
        else {
            break;
        }
    } while (true);
    return returnData;
}
