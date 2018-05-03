var api = require('./webpackapi')

api.js('main', 'boot.js')
api.js('hello', 'hello.js')
api.js('vue', 'vue')

// api.extract(['vue'], 'vuevendor')
// api.extract(['./library.js'], 'library')

module.exports = api.generate()