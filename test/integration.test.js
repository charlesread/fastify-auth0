'use strict'

const tap = require('tap')
const test = tap.test
const request = require('request')

test('should complain with no session provider', function (t) {
  const fastify = require('fastify')()
  fastify
    .register(require('../plugin'))
    .listen(0, function (err) {
      t.ok(err)
      t.end()
    })
})

test('should not complain with session provider, but should complain that no required options are passed', function (t) {
  const fastify = require('fastify')()
  fastify
    .decorateRequest('session', {})
    .register(require('../plugin'))
    .listen(0, function (err) {
      t.ok(err)
      t.end()
    })
})

test('should not complain with session provider and required values', function (t) {
  const fastify = require('fastify')()
  fastify
    .decorateRequest('session', {})
    .register(require('../plugin'), {domain: 'asdf', client_id: 'asdf', client_secret: 'asdf'})
    .listen(3000, function (err) {
      if (err) throw err
      fastify.close(t.end)
    })
})

// fastify
//   .register(require('fastify-cookie'))
//   .register(require('fastify-caching'))
//   .register(require('fastify-server-session'), {
//     secretKey: 'some-secret-password-at-least-32-characters-long',
//     sessionMaxAge: 1000 * 60 * 15, // 15 minutes
//     cookie: {
//       domain: 'localhost',
//       path: '/',
//       expires: 1000 * 60 * 15,
//       sameSite: 'Lax' // important because of the nature of OAuth 2, with all the redirects
//     }
//   })
//   .register(require('../plugin'), {
//     domain: '',
//     client_id: '',
//     client_secret: '',
//     // optional
//     transformer: async function (credentials) {
//       credentials.log_in_date = new Date()
//       credentials.foo = 'bar'
//       // credentials.id = await someFunctionThatLooksUpId(credentials)
//       return credentials
//     },
//     // optional
//     success: async function (credentials) {
//       console.log(`${credentials.given_name} logged in at ${credentials.log_in_date}`)
//     }
//   })
//
// fastify.get('/', async function (request, reply) {
//   // the credentials returned from Auth0 will be available in routes as request.session.credentials
//   return reply.send({credentials: request.session.credentials})
// })
//
// fastify.listen(3000)
//   .then(function () {
//     console.log('listening on %s', fastify.server.address().port)
//   })
//   .catch(function (err) {
//     console.error(err.stack)
//   })


// test('registration should not throw when all 3 required params are present', function (t) {
//   try {
//     fastify.register(
//       require('../plugin'),
//       {
//         domain: 'example.auth0.com',
//         client_id: 'abc',
//         client_secret: '123'
//       }
//     )
//     t.end()
//   } catch (e) {
//     throw e
//   }
// })

// test('registration should throw when all 3 required params are not present', function (t) {
//   t.plan(1)
//     console.log(1)
//     fastify.register(
//       require('../plugin'),
//       {
//         domain: 'example.auth0.com',
//         client_id: 'abc'
//       }
//     )
//     fastify.listen(function (e) {
//       t.isNot(e)
//     })
//     console.log(2)
// })

// fastify.register(
//   require('../plugin'),
//   {
//     domain: 'example.auth0.com',
//     client_id: 'abc',
//     client_secret: '123'
//   }
// )
//
// fastify.get('/', function (request, reply) {
//   return reply.send('/')
// })
//
// fastify.listen(0, function (err) {
//   if (err) tap.error(err)
//   fastify.server.unref()
//
//   const reqOpts = {
//     method: 'GET',
//     baseUrl: 'http://localhost:' + fastify.server.address().port
//   }
//   const req = request.defaults(reqOpts)
//
//   test('route should throw when no session provider is present', function (t) {
//     t.plan(5)
//     req({uri: '/'}, function (err, response, body) {
//       t.error(err)
//       t.strictEqual(response.statusCode, 500)
//       t.strictEqual(JSON.parse(body).message, 'fastify-auth0 requires a session provider')
//
//       // "register a session provider"
//       fastify.decorateRequest('session', {})
//
//       req({uri: '/', followRedirect: false}, function (err, response) {
//         t.error(err)
//         t.strictEqual(response.statusCode, 302)
//       })
//
//     })
//   })
//
// })