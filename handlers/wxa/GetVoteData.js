let db = require('../../database');
let _ = require('underscore');
let getVoteData = require('../../common/GetVoteData');
let checkUser = require('../../common/CheckUser');

module.exports = function (req, res) {
  let id = parseInt(req.query.id);
  if(_.isNaN(id) || id <= 0) {
    res.status(400).send({msg: '参数错误'});
    return;
  }

  db.query('select * from fly_vote where id=?', [id], (err, results) => {
    if(err || results.length === 0) {
      res.status(404).send({msg: '未找到投票'});
      return;
    }

    let result = results[0];
    let voteData = JSON.parse(result.vote_data);
    voteData.id = result.id;
    let isExpired = result.deadline.getTime() < Date.now();
    let isPublic = !!result.is_public;

    checkUser(req.get('user_uid')).then(user => {
      getVoteData(id, user.code).then(list => {
        let voted = false;
        for(let guid in list) {
          if(list[guid].voted) {
            voted = true;
            break;
          }
        }
        res.send({voted, data: voteData, state: list, expired: isExpired, pub: isPublic});
      }, () => {
        res.status(500).send({msg: '加载数据失败'});
      });

    }, () => {
      getVoteData(id).then(list => {
        res.send({voted: false, data: voteData, state: list, expired: isExpired, pub: isPublic});
      }, () => {
        res.status(500).send({msg: '加载数据失败'});
      });
      
    });

  });
}