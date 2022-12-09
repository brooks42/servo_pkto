let Discord = require('discord.js')
let Messenger = require('./messenger')
let PktoUtils = require('./pokecube_cards')

class Servo {
    constructor(token) {
        console.log('pokédex client init')
        this.token = token
        this.client = this.makeClient(token)

        this.cardList = new PktoUtils()
    }

    makeClient(token) {
        const client = new Discord.Client()
        client.on('message', (msg) => {
            new Messenger(client, msg, this.cardList)
        })
        client.login(token)
        return client
    }
}

module.exports = Servo
