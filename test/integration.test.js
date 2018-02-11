'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')()
const request = require('request')

fastify.register(
  require('../plugin'),
  {
    domain: 'example.auth0.com',
    client_id: 'abc',
    client_secret: '123'
  },
  function (err) {
    if (err) throw err
  }
)

fastify.get('/', function (request, reply) {
  return reply.send('/')
})

fastify.listen(0, function (err) {
  if (err) tap.error(err)
  fastify.server.unref()

  const reqOpts = {
    method: 'GET',
    baseUrl: 'http://localhost:' + fastify.server.address().port
  }
  const req = request.defaults(reqOpts)

  test('route should throw when no session provider is present', function (t) {
    t.plan(5)
    req({uri: '/'}, function (err, response, body) {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(JSON.parse(body).message, 'fastify-auth0 requires a session provider')

      // "register a session provider"
      fastify.decorateRequest('session', {})

      req({uri: '/', followRedirect: false}, function (err, response) {
        t.error(err)
        t.strictEqual(response.statusCode, 302)
      })

    })
  })

})
