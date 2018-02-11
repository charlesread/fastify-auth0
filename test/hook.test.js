'use strict'

const test = require('tap').test

test('something', function (t) {
  t.plan(2)
  t.ok(true)
  t.notOk(false)
})