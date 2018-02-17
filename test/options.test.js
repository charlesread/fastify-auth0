'use strict'

const options = require('../lib/options')

const tap = require('tap')
const test = tap.test

test('options should throw without required options', function (t) {
  t.plan(1)
  try {
    const fastify = require('fastify')()
    const _options = options(fastify, {})
  } catch (e) {
    t.is(e.message, 'fastify-auth0 requires the "domain", "client_id", and "client_secret" options to be set.')
  }
})

test('options should throw without required options', function (t) {
  t.plan(1)
  t.doesNotThrow(function () {
    const fastify = require('fastify')()
    const _options = options(fastify, {domain: 'asdf', client_id: 'asdf', client_secret: 'asdf'})
  })
})

test('options should be a "singleton"', function (t) {
  t.plan(1)
  const fastify = require('fastify')()
  const _options = options(fastify, {domain: 'asdf', client_id: 'asdf', client_secret: 'asdf'})
  const _someOtherOptions = options()
  t.ok(_options === _someOtherOptions)
})

test('getSession', function (t) {
  t.plan(1)
  const fastify = require('fastify')()
  const _options = options(fastify, {domain: 'asdf', client_id: 'asdf', client_secret: 'asdf'})
  _options.getSession({session: {name: 'foo'}})
    .then(function (session) {
      t.same(session, {name: 'foo'})
    })
})