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
    this.source.end() // we will never send something to the server
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
    const next = (err, data) => {
      if (err) throw err
      const res = parseFloat(data.toString(), 10)
      console.log('Result is %s', res)
      return read(true, () => {}) // close connection afterwards
    }
    read(null, next)
  }
}

factory('./client.json', ['/ip4/127.0.0.1/tcp/3846'], (err, swarm) => {
  if (err) throw err
  factory.id('./server.json', ['/ip4/127.0.0.1/tcp/3845'], (err, id) => {
    swarm.dialProtocol(id, '/some/proto/1.0.0', (err, conn) => {
      if (err) throw err
      const rpc = new RPC()
      rpc.setup(conn)
    })
  })
})
