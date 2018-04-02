let _ = require('underscore');
let db = require('../../database');
let checkUser = require('../../common/CheckUser');

module.exports = function (req, res) {
  let uid = req.get('user_uid');

  checkUser(uid).then(user => {
    db.query('select * from fly_vote where author_code=? order by id desc limit 50', [user.code], (err, results) => {
      let list = [];

      for(let r of results) {
        list.push({
          id: r.id,
          title: r.title,
          description: r.description,
          vote_group: !!r.is_group,
          create_time: r.create_time,
          deadline: r.deadline,
          is_public: !!r.is_public,
        });
      }
      
      res.send({list});
    });
  }, () => {
    res.status(401).send({msg: '未登录'});
  })
};