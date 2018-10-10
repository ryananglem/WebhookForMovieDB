'use strict'

import express from 'express'
import v1 from './v1'
import v2 from './v2'

const routes = express.Router()

routes.use('/v1/', v1)
// routes.use('/v2/', v2)

export default routes
