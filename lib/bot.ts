import PktoUtils from './pokecube_cards'
import { Client, ClientOptions } from 'discord.js'
import { Messenger } from './messenger'

export default class Servo {
    token: string
    client: Client
    cardList: PktoUtils

    constructor(token: string) {
        console.log('pokédex client init')
        this.token = token
        this.client = this.makeClient(token)
        this.cardList = new PktoUtils()
    }

    makeClient(token: string): Client {
        const clientOptions: ClientOptions = { intents: [] }

        const client = new Client(clientOptions)
        client.on('message', (msg) => {
            new Messenger(client, msg, this.cardList)
        })
        client.login(token)
        return client
    }
}
