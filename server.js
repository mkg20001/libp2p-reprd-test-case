'use strict'

const factory = require('./factory')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')

function someAsyncThing (data, cb) {
  setTimeout(() => { // 90s intel CPU emulator :D
    cb(null, data + 1)
  }, 1000)
}

class RPC {
  constructor () {
    this.source = Pushable()
    this.sink = this.sink.bind(this) // fix for 'this'
  }
  setup (conn) {
    pull(
      conn,
      this,
      conn
    )
  }
  sink (read) {
    const cb = (err, data) => {
      if (err) {
        this.source.end()
      } else {
        this.source.push(Buffer.from(data.toString()))
      }
      read(true, () => {}) // close connection to client AFTER sending response
    }
    someAsyncThing(Math.random(), cb)
  }
}

factory('./server.json', ['/ip4/127.0.0.1/tcp/3845'], (err, swarm) => {
  if (err) throw err
  swarm.handle('/some/proto/1.0.0', (proto, conn) => {
    const rpc = new RPC()
    rpc.setup(conn)
  })
})
