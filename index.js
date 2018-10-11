'use strict'

import express from 'express'
import bodyParser from 'body-parser'

import routes from './routes'

const server = express()
server.use(bodyParser.urlencoded({
    extended: true
}))

server.use(bodyParser.json())

server.use(routes)

const port = 8000
server.listen((process.env.PORT || port), () => {
    console.log("Server is up and running on port " + port)
})