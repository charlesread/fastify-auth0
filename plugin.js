'use strict'

const path = require('path')
const {URL} = require('url')

const fp = require('fastify-plugin')
const debug = require('debug')('fastify-auth0:plugin')
const debugHook = require('debug')('fastify-auth0:plugin-hook')
const debugCallback = require('debug')('fastify-auth0:plugin-callback')

const utility = require(path.join(__dirname, 'lib', 'utility.js'))

const hookFactory = function (fastify, options) {

  debugHook('creating hook')
  return async function (request, reply) {
    const requestUrl = new URL(request.raw.url, 'http://dummydomain.com')
    debugHook('received request at %s (from preHandler hook)', request.raw.url)
    debugHook('request.session: %j', request.session)
    if (requestUrl.pathname === options.handlerPath) {
      return debugHook('hook does not apply to %s', requestUrl.pathname)
    }
    const session = await options.getSession(request)
    if (!session) {
      throw new Error('fastify-auth0 requires a session provider')
    }
    if (!session.credentials) {
      debugHook('credentials is not set, redirecting to auth0')
      session.requestPath = requestUrl.pathname
      reply.redirect(options.auth0.dialogUrl).res.end()
    }
    else {
      debugHook('credentials is set')
    }
  }

}

async function plugin(fastify, opts) {
  debug('registering plugin')
  if (!(opts.domain && opts.client_id && opts.client_secret)) {
    debug('not all required options are present')
    throw new Error('domain, client_id, and client_secret are all required options')
  }
  let options = require(path.join(__dirname, 'lib', 'options'))(fastify, opts)
  fastify.route({
    method: 'GET',
    path: options.handlerPath,
    handler: async function (request, reply) {
      debugCallback('received request at callback handler')
      const session = await options.getSession(request)
      debugCallback('request.session: %j', request.session)
      debugCallback('request.query: %j', request.query)

      // error function
      if (request.query.error && request.query['error_description']) {
        const err = new Error(request.query.error + ': ' + request.query['error_description'])
        debugCallback('error encountered in callback URL: ', err.message)
        if (options.error && typeof options.error === 'function') {
          debugCallback('error is not null and is a function, invoking')
          const results = options.error(err, request, reply)
          return results.then ? await results : results
        }
      }

      const userAccessToken = await utility.getUserAccessToken(request.query.code)
      debugCallback('userAccessToken: %s', userAccessToken)
      let userInfo = await utility.getUserInfo(userAccessToken)
      debugCallback('userInfo:')
      debugCallback(userInfo)
      if (!userInfo) {
        throw new Error('No user information returned')
      }

      // transformer
      if (options.transformer && typeof options.transformer === 'function') {
        debugCallback('transformer is not null and is a function, invoking')
        const transformerResults = options.transformer(userInfo, request)
        userInfo = transformerResults.then ? await transformerResults : transformerResults
        debugCallback('[transformed] userInfo: %j', userInfo)
      }

      // success function
      if (options.success && typeof options.success === 'function') {
        debugCallback('success is not null and is a function, invoking')
        const successResults = options.success(userInfo, request)
        if (successResults.then) {
          debugCallback('success results are thenable')
          await successResults
          debugCallback('success function returned')
        }
      }
      session.credentials = userInfo
      session.requestPath = undefined
      debugCallback('session: %j', session)
      return reply.redirect(options.loginSuccessRedirectPath || session.requestPath || '/')
    }
  })
  const hook = hookFactory(fastify, options)
  fastify.addHook('preHandler', hook)
}

module.exports = fp(plugin,
  {
    fastify: '>=1.0.0',
    decorators: {
      request: ['session']
    }
  }
)