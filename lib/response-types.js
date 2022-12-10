const request = require('request-promise-native')
const Discord = require('discord.js')
const Url = require('urijs')

const manamoji = require('./middleware/manamoji')
const utm = require('./middleware/utm')

class TextResponse {
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

    makeEmbed(response) {
        let parts = response.body.split('\n')
        const embedTitle = parts.shift()
        console.log(`embedding ${parts}`)

        let finish = {
            title: `${embedTitle}`,
            description: parts.join('\n'),
            url: response.headers['x-scryfall-card'],
            thumbnail: {
                url: response.headers['x-scryfall-card-image'],
            },
        }
        console.log(`completed post is ${JSON.stringify(finish)}`)

        return finish
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

TextResponse.prototype.middleware = [manamoji, utm]
TextResponse.prototype.url = 'https://api.scryfall.com/cards/named'

class ImageResponse extends TextResponse {
    makeEmbed(response) {
        let parts = response.body.split('\n')
        return {
            title: parts[0].match(/^([^{]+)/)[0].trim(),
            url: response.headers['x-scryfall-card'],
            image: {
                url: response.headers['x-scryfall-card-image'],
            },
        }
    }
}

class PokemonResponse extends TextResponse {
    constructor(client, cardName, cardInfo) {
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

    makeEmbed(response) {
        console.log(`embedding ${JSON.stringify(response)}`)

        let finish = {
            title: response.title,
            description: response.description,
            url: response.url,
            thumbnail: response.thumbnail,
        }
        console.log(`completed post is ${JSON.stringify(finish)}`)

        return finish
    }
}

PokemonResponse.prototype.middleware = [manamoji, utm]

module.exports = { TextResponse, ImageResponse, PokemonResponse }
