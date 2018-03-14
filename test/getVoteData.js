let getVoteData = require('../common/GetVoteData');

getVoteData(5, 'admin').then(list => {
  console.log(list);
});