# Setup

All you need to do is run `npm install`, create a `.env` file with `DISCORD_TOKEN` set to your bot token, and it should work!

# Pokédex

Pokédex is a Discord bot that will post the Oracle text or image of a _Magic: the Gathering_ card to your text channels when a card name is referenced.

## Usage

You must have the _Manage Server_ permission to add Servo to your Discord server.

The bot will appear as a user and join your text channels. If your Discord server restricts users from chatting by default, you will also need to grant the bot a role that allows it to speak.

[![Install Servo](docs/button-servo.png)](https://discordapp.com/oauth2/authorize?client_id=268547439714238465&scope=bot)

## Features

While chatting, surround a Magic card names with brackets (`[[` and `]]`) and prepend with an optional token. Servo will print out the text of that card or its image:

| Command               | Function                                       |
| --------------------- | ---------------------------------------------- |
| `[[Joven's Ferrets]]` | Show a text representation of Joven's Ferrets. |
| `[[!Goblin Game]]`    | Show a picture of Goblin Game.                 |

![Example usage](docs/screenshot.png)

Servo will also handle misspellings and partial card names, as long as there is a clear match:

![Examples with misspelling](docs/misspell.png)
