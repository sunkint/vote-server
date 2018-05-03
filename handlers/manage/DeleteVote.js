let db = require('../../database');
let checkUser = require('../../common/CheckUser');

module.exports = function (req, res) {
  checkUser(req.cookies.vote_user_uid || req.get('user_uid')).then(user => {
    if(user.code !== 'admin') {
      res.status(401).send({msg: '权限不足'});
      return;
    }

    db.query('delete from fly_vote where id=?', [req.body.id], (err, results) => {
      if(err) {
        res.status(500).send({msg: '删除失败'});
      }else {
        db.query('delete from fly_data where vote_id=?', [req.body.id], (err, results) => {
          res.status(200).send({msg: '删除成功'});
        });
      }
    });
  }).catch(err => {
    res.status(401).send({msg: '权限不足'});
  });
};