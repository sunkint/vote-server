// 路由配置文件
let GetAuthFromXzw = require('./handlers/GetAuthFromXzw');
let AddVote = require('./handlers/AddVote');
let GetVoteList = require('./handlers/GetVoteList');
let GetStatData = require('./handlers/GetStatData');
let VoteAction = require('./handlers/Vote');
let GetAuthFromWxa = require('./handlers/wxa/GetAuth');

let GetVoteListForWxa = require('./handlers/wxa/GetVoteList');
let AddVoteForWxa = require('./handlers/wxa/AddVote');
let GetVoteDataForWxa = require('./handlers/wxa/GetVoteData');
let VoteForWxa = require('./handlers/wxa/Vote');
let GetCreatedForWxa = require('./handlers/wxa/GetCreated');
let GetVotedForWxa = require('./handlers/wxa/GetVoted');

module.exports = {
  '/getAuth/xzwhome': GetAuthFromXzw,
  '/getAuth/wxa': {handler: GetAuthFromWxa, method: 'post'},
  '/addVote': {handler: AddVote, method: 'post'},
  '/getVoteList': {handler: GetVoteList, method: 'get'},
  '/getStatData': {handler: GetStatData, method: 'get'},
  '/vote': {handler: VoteAction, method: 'post'},

  '/wxa/getVoteList': {handler: GetVoteListForWxa, method: 'get'},
  '/wxa/addVote': {handler: AddVoteForWxa, method: 'post'},
  '/wxa/getVoteData': {handler: GetVoteDataForWxa, method: 'get'},
  '/wxa/vote': {handler: VoteForWxa, method: 'post'},
  '/wxa/getCreated': GetCreatedForWxa,
  '/wxa/getVoted': GetVotedForWxa,
}