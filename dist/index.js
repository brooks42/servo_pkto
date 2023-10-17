"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const bot_1 = __importDefault(require("./lib/bot"));
const app = (0, express_1.default)();
const port = 8080;
if (!process.env.DISCORD_TOKEN) {
    console.log('Error: Specify DISCORD_TOKEN in environment');
    process.exit(1);
}
const servo = new bot_1.default(process.env.DISCORD_TOKEN);
// express just to pass health check
app.get('*', (req, res) => {
    console.log('refreshing PKTO cache');
    servo.resetCachePktoCache();
    res.send(`<html><body>Hello World! <p>${req.path}</p> <p>${JSON.stringify(req.query)}</p></body></html>`);
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=index.js.map