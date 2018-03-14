/*
  从骁之屋拿登录凭证
*/

let request = require('request');
let db = require('../database');
let registerUser = (user, callback) => {
  db.query('select count(*) c from fly_user where user_code=?', [user.code], (err, results, fields) => {
    if(results[0].c > 0) {
      db.query('update fly_user set uid=?, avatar=? where user_code=?', [user.uid, user.avatar, user.code], (err, results) => {
        callback(err, results);
      });
    }else {
      db.query('insert into fly_user (user_name, user_code, user_type, avatar, uid) values (?, ?, ?, ?, ?)', [user.name, user.code, 0, user.avatar, user.uid], (err, results) => {
        callback(err, results);
      });
    }
  });
};

const IS_PRODUCTION = require('../common/CheckIfProd');

module.exports = function (req, res) {
  let token = req.body.token || req.query.token;
  if(token == undefined || token == '') {
    res.status(400).send({msg: 'token为空'});
    return;
  }
  request.post({
    url: `${IS_PRODUCTION ? 'https://www.ybusad.com' : 'http://home.me'}/user/authorize/getVoteAuth.php`,
    form: {token}
  }, (err, _res, body) => {
    if(_res.statusCode == 200) {
      let user = JSON.parse(body);
      registerUser(user, err => {
        if(err) res.status(400).send({msg: '登录失败，数据错误！'});
        else res.send({msg: '登录成功！', name: user.name, code: user.code, uid: user.uid, avatar: user.avatar});
      });
    }else {
      res.status(501).send({msg: '登录失败'});
    }
  });
}