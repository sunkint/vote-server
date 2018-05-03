let db = require('../database');
let getVoteData = require('../common/GetVoteData');

function getViewTime (d) {
  let b0 = n => n < 10 ? '0' + n : n.toString();
  let today = new Date();
  let isToday = t => t.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).getTime();
  if(isToday(d)) {
    return `${d.getHours()}:${b0(d.getMinutes())}`;
  }else {
    return `${d.getMonth() + 1}-${d.getDate()}`;
  }
}

module.exports = function (req, res) {
  const maxId = parseInt(req.query.maxId) || 9999999;
  const count = 15;

  db.query('select * from fly_vote where is_public=1 and id<? order by id desc limit ?', [maxId, count + 1], (err, results) => {
    let list = [];
    for(let r of results) {
      let voteData = JSON.parse(r.vote_data);
      voteData.id = r.id;
      voteData.is_expired = r.deadline.getTime() < Date.now();
      voteData.create_time = getViewTime(r.create_time);
      list.push(voteData);
    }
    let isComplete = true;
    if(list[count] !== undefined) {
      isComplete = false;
      list.splice(count, 1);
    }
    res.send({list, complete: isComplete});
  });

}