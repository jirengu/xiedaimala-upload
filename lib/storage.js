var storage = require('node-persist')
var path = require('path')
storage.initSync({ dir: path.resolve(__dirname, '../storage')})

module.exports = storage