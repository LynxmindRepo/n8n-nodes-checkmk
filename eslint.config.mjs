import communityNodesPlugin from '@n8n/eslint-plugin-community-nodes';
import tseslint from 'typescript-eslint';

export default tseslint.config(...tseslint.configs.recommended, {
	files: ['**/*.ts'],
	plugins: {
		'@n8n/community-nodes': communityNodesPlugin,
	},
	rules: {
		...communityNodesPlugin.configs.recommended.rules,
	},
});
