const { defineConfig } = require(''eslint/config'');
const expoConfig = require(''eslint-config-expo/flat'');
module.exports = defineConfig([
  expoConfig,
  { ignores: [''dist/*'', ''.expo/*'', ''relay/*'', ''backend/*''],
    rules: { ''react/no-unescaped-entities'': ''off'', ''react-hooks/refs'': ''off'', ''react-hooks/set-state-in-effect'': ''off'' } },
]);
