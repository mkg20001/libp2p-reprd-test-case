'use strict'

const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const MPLEX = require('libp2p-mplex')
const SPDY = require('libp2p-spdy')
const SECIO = require('libp2p-secio')

const Id = require('peer-id')
const Peer = require('peer-info')

module.exports = (id, addrs, cb) => {
  Id.createFromJSON(require(id), (err, id) => {
    if (err) return cb(err)
    const peer = new Peer(id)
    addrs.forEach(a => peer.multiaddrs.add(a))

    const swarm = new Libp2p({
      transport: [
        new TCP()
      ],
      connection: {
        muxer: [
          MPLEX,
          SPDY
        ],
        crypto: [SECIO]
      }
    }, peer, null, {
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: false
        }
      }
    })

    swarm.start(err => {
      if (err) return cb(err)
      cb(null, swarm)
    })
  })
}

module.exports.id = (id, addrs, cb) => {
  Id.createFromJSON(require(id), (err, id) => {
    if (err) return cb(err)
    const peer = new Peer(id)
    addrs.forEach(a => peer.multiaddrs.add(a))
    cb(null, peer)
  })
}
