var Discord = require("discord.js")
const Servo = require('./lib/bot')
require('dotenv').config()

const express = require('express')
const app = express()
const port = 3000

if (!process.env.DISCORD_TOKEN) {
  console.log('Error: Specify DISCORD_TOKEN in environment')
  process.exit(1)
}

new Servo(process.env.DISCORD_TOKEN)

// express just to pass health check
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
