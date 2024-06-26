"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let substitutions = {
    CHAOS: 'manachaos',
    '{∞}': 'manainfinity',
    '{½}': 'manahalf',
    '{hr}': 'manahr',
};
let COLORS = ['W', 'U', 'B', 'R', 'G'];
let NUMBERS = [...Array(21).keys()];
let ADDTL = ['C', 'E', 'HR', 'HW', 'T', 'Q', 'S', 'X', 'Y', 'Z'];
function _(before, after) {
    if (typeof after === 'undefined') {
        after = before;
    }
    substitutions[`{${before}}`] = `mana${after.toString().toLowerCase()}`;
}
ADDTL.forEach((a) => {
    _(a, undefined);
});
COLORS.forEach((c) => {
    _(c, undefined);
});
COLORS.forEach((c) => {
    _(`2/${c}`, `2${c}`);
});
COLORS.forEach((c) => {
    _(`${c}/P`, `${c}p`);
});
COLORS.forEach((c) => {
    COLORS.forEach((d) => {
        if (c != d)
            _(`${c}/${d}`, `${c}${d}`);
    });
});
NUMBERS.forEach((n) => {
    _(n, undefined);
});
function manamoji(client, str) {
    const re = new RegExp(Object.keys(substitutions)
        .map((v) => {
        return v.replace('{', '\\{').replace('}', '\\}');
    })
        .join('|'), 'gi');
    let manafied = str.replace(re, (matched) => {
        const emoji = client.emojis.cache.find((emoji) => emoji.name === checkSub(matched));
        return emoji ? emoji.toString() : matched;
    });
    return manafied;
}
exports.default = manamoji;
function checkSub(matched) {
    return substitutions[matched];
}
//# sourceMappingURL=manamoji.js.map