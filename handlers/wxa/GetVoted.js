let _ = require('underscore');
let db = require('../../database');
let checkUser = require('../../common/CheckUser');

module.exports = function (req, res) {
  let uid = req.get('user_uid');

  checkUser(uid).then(user => {
    db.query('select distinct vote_id, create_time from fly_data where user_code=? order by create_time desc limit 50', [user.code], (err, results) => {
      let idList = [], timeList = [];
      for(let r of results) {
        idList.push(r.vote_id);
        timeList.push(new Date(r.create_time).getTime());
      }

      db.query('select * from fly_vote where id in (?)', [idList], (err, results) => {
        let list = [];
        for(let i in results) {
          let r = results[i];

          list.push({
            id: r.id,
            title: r.title,
            description: r.description,
            vote_group: !!r.is_group,
            create_time: r.create_time,
            deadline: r.deadline,
            is_public: !!r.is_public,
            vote_time: timeList[i],
          });
        }

        list.sort((a, b) => {
          if(a.vote_time > b.vote_time) {
            return -1;
          }else if(a.vote_time === b.vote_time) {
            return 0;
          }else {
            return 1;
          }
        });

        for(let r of list) {
          r.vote_time = new Date(r.vote_time);
        }

        res.send({list});
        
      });
    });
  }, () => {
    res.status(401).send({msg: '未登录'});
  })
};