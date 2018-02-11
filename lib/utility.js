'use strict'

const path = require('path')
const request = require('request')
const debug = require('debug')('fastify-auth0:utility')
const AuthenticationClient = require('auth0').AuthenticationClient

const options = require(path.join(__dirname, 'options.js'))

module.exports = {

  getUserAccessToken: function (code) {
    debug('getUserAccessToken called')
    debug('code: %s', code)
    debug('url: %s', options().auth0.graphUrl + '/oauth/token')
    debug('redirect_uri: %s', `${options().appUrl}${options().handlerPath}`)
    return new Promise((resolve, reject) => {
      request({
        url: options().auth0.graphUrl + '/oauth/token',
        method: 'post',
        form: {
          grant_type: 'authorization_code',
          client_id: options().client_id,
          client_secret: options().client_secret,
          code,
          redirect_uri: `${options().appUrl}`
        }
      }, function (err, response, body) {
        if (err) {
          return reject(err)
        }
        debug('body: %j', body)
        body = JSON.parse(body)
        resolve(body.access_token)
      })
    })
  },

  getUserInfo: async function (access_token) {
    const auth0 = new AuthenticationClient({
      domain: options().domain,
      clientId: options().client_id
    })
    return await auth0.users.getInfo(access_token)
  }
}
