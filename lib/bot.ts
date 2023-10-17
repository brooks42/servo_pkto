import PktoUtils from './pokecube_cards'
import { Client, ClientOptions, GatewayIntentBits, Message } from 'discord.js'
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

    resetCachePktoCache() {
        this.cardList = new PktoUtils()
    }

    makeClient(token: string): Client {
        console.log(`Client created...`)
        const clientOptions: ClientOptions = {
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
            ],
        }

        const client = new Client(clientOptions)
        client.on('ready', async () => {
            if (!client.user || !client.application) {
                console.log('client user or client app not set')
                return
            }

            console.log(`${client.user.username} is online`)
        })
        client.on('messageCreate', (msg: Message<boolean>) => {
            new Messenger(client, msg, this.cardList)
        })
        client.login(token)
        return client
    }
}
