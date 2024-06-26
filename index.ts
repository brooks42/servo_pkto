require('dotenv').config()

import express from 'express'

import Servo from './lib/bot'

const app = express()
const port = 8080

if (!process.env.DISCORD_TOKEN) {
    console.log('Error: Specify DISCORD_TOKEN in environment')
    process.exit(1)
}

const servo = new Servo(process.env.DISCORD_TOKEN)

// express just to pass health check
app.get('*', (req, res) => {
    console.log('refreshing PKTO cache')
    servo.resetCachePktoCache()
    res.send(
        `<html><body>Hello World! <p>${req.path}</p> <p>${JSON.stringify(
            req.query
        )}</p></body></html>`
    )
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
