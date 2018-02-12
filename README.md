
# fastify-auth0

*fastify-auth0* adds Auth0 authentication to [Fastify][fastify]-based apps.  This plugin assumes that you know a bit about OAuth 2, and Auth0.

[fastify]: https://fastify.io/

## Example
```bash
npm install --save fastify-auth0
```
```javascript
'use strict'

const fastify = require('fastify')()

const plugin = require('fastify-auth0')

;(async function () {
  await fastify
    .register(require('fastify-cookie'))
    .register(require('fastify-caching'))
    .register(require('fastify-server-session'), {
      secretKey: 'some-secret-password-at-least-32-characters-long',
      sessionMaxAge: 1000 * 60 * 15, // 15 minutes
      cookie: {
        domain: 'localhost',
        path: '/',
        expires: 1000 * 60 * 15,
        sameSite: 'Lax' // important because of the nature of OAuth 2, with all the redirects
      }
    })
    .register(plugin, {
      domain: 'yourdomain.auth0.com',
      client_id: 'yourClientId',
      client_secret: 'yourClientSecret',
      // optional
      transformer: async function (credentials) {
        credentials.log_in_date = new Date()
        credentials.foo = 'bar'
        // credentials.id = await someFunctionThatLooksUpId(credentials)
        return credentials
      },
      // optional
      success: async function (credentials) {
        console.log(`${credentials.given_name} logged in at ${credentials.log_in_date}`)
      }
    })

  fastify.get('/', async function (request, reply) {
    // the credentials returned from Auth0 will be available in routes as request.session.credentials
    return reply.send({credentials: request.session.credentials})
  })

  await fastify.listen(3000)
  console.log('listening on %s', fastify.server.address().port)
}())
  .catch(function (err) {
    console.error(err.stack)
  })
```
## Session, Cache, and Cookie

This plugin requires a session provider to be accessible via `request.session`.  *fastify-auth0* works well out-of-the-box with [*fastify-server-session*](https://www.npmjs.com/package/fastify-server-session), a simple configuration is shown above.  

## Usage and Options

*fastify-auth0* is a very typical *fastify* plugin, in that it is registered in the following fashion:

```javascript
fastify.register(require('fastify-auth0'), options)
```

### Options

<strong>TL;DR</strong>

At _minimum_ you need a `domain`, `client_id`, and `client_secret`.  You'll get back, from Auth0 upon successful auth, the things requested in `scope`, all of that stuff will become `request.session.credentials` in routes.  After successful auth with Auth0 you'll be redirected to `handlerPath`, which does important stuff, it's the "callback URL" referenced a lot in documentation, which you need to [whitelist with Auth0](https://imgur.com/QEOIFUK) (which here is really just `appUrl + handlerPath`, this goes to Auth0 as the `redirect_uri` query string parameter during redirection to Auth0 for authentication).

`options` itself is a simple object that allows the following keys:

| Key | |  Type/[default] | Notes |
| --- | --- | --- | --- |
| domain | *required* | `string` |  This is your Auth0 domain, like *example.auth0.com* |
| client_id | *required* | `string` | The id of your Auth0 client | 
| client_secret | *required* | `string` | Your client's secret |
| scope |   | `string`/"profile openid email" | The scope of information about a user that you'd like back from Auth0 upon successful authentication |
| appUrl |   | "http://localhost:3000" |   |
| handlerPath |  | "/callback" |   |
| success |   | `[async] function (credentials, request)` | A function that should be called when a user is successfully authenticated, this is for your purposes and has no effect on the plugin.  `credentials` is that which Auth0 returns. |
| transformer |   | `[async] function (credentials, request)` | Very similar to `[async] function success(credentials, request)`, except that this function _can_ affect stuff.  In particular that which this function returns will become `request.session.credentials` in your routes. |