let db = require('../database');
let getVoteData = require('../common/GetVoteData');

module.exports = function (req, res) {
  let maxId = parseInt(req.query.maxId) || 9999999;
  db.query('select * from fly_vote where is_public=1 and id<=? order by id desc limit 20', [maxId], (err, results) => {
    let list = [];
    for(let r of results) {
      let voteData = JSON.parse(r.vote_data);
      voteData.id = r.id;
      voteData.is_expired = r.deadline.getTime() < Date.now();
      list.push(voteData);
    }
    res.send({list});
  });
}