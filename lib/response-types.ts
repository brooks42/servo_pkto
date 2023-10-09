const request = require('request-promise-native')
const Url = require('urijs')

import manamoji from './middleware/manamoji'
const utm = require('./middleware/utm')

import { Client, EmbedBuilder } from 'discord.js'

export class TextResponse {
    client: Client
    cardName: string
    middleware = [utm]
    url = 'https://api.scryfall.com/cards/named'

    constructor(client, cardName) {
        this.client = client
        this.cardName = cardName
    }

    makeQuerystring() {
        return {
            fuzzy: this.cardName,
            format: 'text',
        }
    }

    makeUrl() {
        return Url(this.url).query(this.makeQuerystring()).toString()
    }

    makeRequest() {
        return new Promise((resolve, reject) => {
            request({
                method: 'GET',
                resolveWithFullResponse: true,
                uri: this.makeUrl(),
            })
                .then((response) => {
                    resolve(response)
                })
                .catch((err) => {
                    resolve(err.response)
                })
        })
    }

    makeEmbed(response): EmbedBuilder {
        let parts = response.body.split('\n')
        const embedTitle = parts.shift()
        console.log(`embedding TextResponse ${parts}`)

        let embed = new EmbedBuilder()
        embed.setTitle(manamoji(this.client, embedTitle))
        embed.setDescription(manamoji(this.client, parts.join('\n')))
        embed.setURL(response.headers['x-scryfall-card'])
        embed.setThumbnail(response.headers['x-scryfall-card-image'])

        return embed
    }

    embed() {
        return new Promise((resolve, reject) => {
            this.makeRequest().then((response) => {
                let embed = this.makeEmbed(response)
                this.middleware.length > 0 &&
                    this.middleware.forEach((mw) => {
                        embed = mw(this.client, embed)
                    })
                resolve(embed)
            })
        })
    }
}

export class ImageResponse extends TextResponse {
    makeEmbed(response): EmbedBuilder {
        let parts = response.body.split('\n')

        let embed = new EmbedBuilder()
        embed.setTitle(
            manamoji(this.client, parts[0].match(/^([^{]+)/)[0].trim())
        )
        embed.setDescription('')
        embed.setURL(response.headers['x-scryfall-card'])
        embed.setThumbnail(response.headers['x-scryfall-card-image'])
        embed.setImage(response.headers['x-scryfall-card-image'])

        return embed
    }
}

export interface CardEmbedInfo {
    title: string
    description: string
    url: string
    thumbnail: string
}

export class PokemonResponse extends TextResponse {
    cardInfo: CardEmbedInfo

    constructor(client: Client, cardName: string, cardInfo: CardEmbedInfo) {
        super(client, cardName)
        this.cardInfo = cardInfo
    }

    /*{Expectation:
  title: 'Murder {1}{B}{B}',
  description: 'Instant\nDestroy target creature.',
  url: 'https://scryfall.com/card/clb/134/murder?utm_source=api',
  thumbnail: {
    url: 'https://cards.scryfall.io/large/front/b/d/bdef7fea-2bd0-42a2-96f6-6def18bd7f0c.jpg?1660725345'
  }
}*/

    embed() {
        return new Promise((resolve, reject) => {
            this.makeRequest().then((response) => {
                let embed = this.makeEmbed(this.cardInfo)
                this.middleware.length > 0 &&
                    this.middleware.forEach((mw) => {
                        embed = mw(this.client, embed)
                    })
                resolve(embed)
            })
        })
    }

    makeEmbed(cardInfo): EmbedBuilder {
        console.log(`embedding PokemonResponse ${JSON.stringify(cardInfo)}`)

        let embed = new EmbedBuilder()
        embed.setTitle(manamoji(this.client, cardInfo.title))
        embed.setDescription(manamoji(this.client, cardInfo.description))
        embed.setURL(cardInfo.url)
        embed.setThumbnail(cardInfo.thumbnail)

        return embed
    }
}
