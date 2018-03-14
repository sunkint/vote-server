// 路由配置文件
let GetAuthFromXzw = require('./handlers/GetAuthFromXzw');
let AddVote = require('./handlers/AddVote');
let GetVoteList = require('./handlers/GetVoteList');
let GetStatData = require('./handlers/GetStatData');
let VoteAction = require('./handlers/Vote');

module.exports = {
  '/getAuth/xzwhome': GetAuthFromXzw,
  '/addVote': {handler: AddVote, method: 'post'},
  '/getVoteList': {handler: GetVoteList, method: 'get'},
  '/getStatData': {handler: GetStatData, method: 'get'},
  '/vote': {handler: VoteAction, method: 'post'},
}