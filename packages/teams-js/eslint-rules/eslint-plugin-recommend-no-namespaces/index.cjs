const recommendNoNamespacesRule = require('./recommend-no-namespaces.cjs');

const plugin = { rules: { 'recommend-no-namespaces': recommendNoNamespacesRule } };
module.exports = plugin;
