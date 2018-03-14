let getVoteData = require('../common/GetVoteData');
let checkUser = require('../common/CheckUser');

module.exports = function (req, res) {
  let id = parseInt(req.query.id);
  if(isNaN(id) || id <= 0) return res.status(400).send({msg: '请求错误'});
  checkUser(req.cookies.vote_user_uid).then(user => {

    getVoteData(id, user.code).then(list => {
      let voted = false;
      for(let guid in list) {
        if(list[guid].voted) { voted = true; break; }
      }
      res.send({ exists: true, login: true, voted: voted, data: list });
    }, () => {
      res.send({ exists: false, login: true, voted: false, data: {} });
    });

  }, () => {
    
    getVoteData(id).then(list => {
      let voted = false;
      for(let guid in list) {
        if(list[guid].voted) {
          voted = true;
          break;
        }
      }
      res.send({ exists: true, login: false, voted: voted, data: list });
    }, () => {
      res.send({ exists: false, login: false, voted: false, data: {} });
    });

  });
}