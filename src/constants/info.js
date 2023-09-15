const _ = require('lodash');

const newLine = '\r\n';
let info = 'Jeoparty!';
info += newLine;
info += newLine;
info += 'Programming and design by Isaac Redlon (isaacredlon@gmail.com), AI categories by Colin Chartier (colin.n.chartier@gmail.com)';
info += newLine;
info += newLine;
info += 'You can find the codebase for "AI Jeoparty!" at github.com/colinchartier';
info += newLine;
info += newLine;
info += 'Special thanks to Matt Morningstar, Max Thomsen, Matt Baldwin, Pranit Nanda, and Attic Stein Beats';

let legalInfo = _.clone(info);
legalInfo += newLine;
legalInfo += newLine;
legalInfo += 'The Jeopardy! game show and all elements thereof, including but not limited to copyright and trademark thereto, are the property of Jeopardy Productions, Inc. and are protected under law. This website is not affiliated with, sponsored by, or operated by Jeopardy Productions, Inc.';
legalInfo += newLine;
legalInfo += newLine;
legalInfo += 'Jeoparty! is not and never will be for profit; there are NO advertisements, and there is NO price to pay. If this game is distributed elsewhere with either of those costs, it is without my knowledge, and without my consent';

exports.info = info;
exports.legalInfo = legalInfo;