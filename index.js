module.exports = {
	nodes: [
		require('./dist/nodes/Checkmk/Checkmk.node.js'),
	],
	credentials: [
		require('./dist/credentials/CheckmkApi.credentials.js'),
	],
};
