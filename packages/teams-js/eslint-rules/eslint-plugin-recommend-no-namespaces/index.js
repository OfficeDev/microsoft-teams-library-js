const recommendNoNamespacesRule = require('./recommendNoNamespaces.js');

const plugin = { rules: { 'recommend-no-namespaces': recommendNoNamespacesRule } };
module.exports = plugin;
