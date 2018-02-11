'use strict'

const path = require('path')
const deepExtend = require('deep-extend')
const randomize = require('randomatic')

let _options

module.exports = function (fastify, options) {
  if (_options) {
    return _options
  }
  if (!(options.domain && options.client_id && options.client_secret)) {
    throw new Error('fastify-auth0 requires the "domain", "client_id", and "client_secret" options to be set.')
  }
  let defaultOptions
  defaultOptions = {
    domain: '',
    client_id: '',
    client_secret: '',
    scope: 'profile openid email',
    handlerPath: '/callback',
    loginPath: '/login',
    credentialsName: randomize('Aa', 10),
    appUrl: 'http://localhost:3000',
    getSession: async function (request) {
      return request.session
    }
  }

  _options = deepExtend({}, defaultOptions, options)
  _options.redirect_uri = _options.redirect_uri || (_options.appUrl + _options.handlerPath)
  _options.auth0 = {
    graphUrl: `https://${_options.domain}`,
    dialogUrl: `https://${_options.domain}/login?response_type=code&scope=${_options.scope}&client=${_options.client_id}&redirect_uri=${_options.redirect_uri}`
  }
  return _options
}