// 投票

let _ = require('underscore');
let db = require('../database');
let checkUser = require('../common/CheckUser');
let getVoteData = require('../common/GetVoteData');

module.exports = function (req, res) {
  let params = req.body;

  checkUser(req.cookies.vote_user_uid).then(user => {
    let id = parseInt(params.id), options = params.options;
    let sendError = (msg, code = 400) => {res.status(code).send({msg})};
    if(_.isNaN(id) || !_.isArray(options) || options.length === 0) {
      return sendError('非法请求');
    }
    
    // 检查id的情况
    db.query('select * from fly_vote where id=? limit 1', [id], (err, results) => {
      if(err || results.length === 0) {
        return sendError("投票不存在");
      }

      let vote = results[0];
      if(Date.now() > vote.deadline.getTime()) {
        return sendError("投票已过期");
      }

      // 检查选项的情况
      for(let v of options) {
        if(_.isArray(v)) v = [...new Set(v)]; // 去重
        if(_.isString(v) && v.trim().length === 0) return sendError('投票数据错误');
        if(_.isArray(v) && (v.length === 0 || v.length > 26)) return sendError('投票数据错误');

        // 规范单选的表示形式
        if(_.isString(v)) v = [v];
      }

      let voteData = JSON.parse(vote.vote_data);
      if(options.length !== voteData.votes.length) {
        return sendError('投票数据不全或超限');
      }
      for(let i in options) {
        if(_.isString(options[i])) options[i] = [options[i]]; // 统一成数组
        if(_.isUndefined(voteData.votes[i]) || options[i].length > voteData.votes[i].max_selected_count) {
          return sendError('投票数据超限');
        }
      }

      // 检查是否投过票了
      db.query('select count(*) count from fly_data where user_code=? and vote_id=?', [user.code, id], (err, results) => {
        if(err || results[0].count > 0) return sendError('您已参加过该投票！');

        // 进入投票校验环节
        for(let i in voteData.votes) {
          let voteItem = voteData.votes[i];
          let optionGuids = voteItem.options.map(v => v.guid);
          for(let o of options[i]) {
            if(optionGuids.indexOf(o) < 0) {
              return sendError('投票数据错误');
            }
          }
        }

        // 拼接SQL
        let sql = 'insert into fly_data (user_name, user_code, option_guid, vote_id) values ';
        let ds = [];
        for(let os of options) {
          for(let o of os) {
            ds.push(`(${db.escape(user.name)}, ${db.escape(user.code)}, ${db.escape(o)}, ${db.escape(id)})`);
          }
        }
        sql += ds.join(',');

        console.log(sql);

        // 添加投票数据
        db.query(sql, err => {
          if(err) return sendError('投票失败，请检查', 500);

          // 获取新的投票数据返回
          getVoteData(id, user.code).then(data => {
            res.send({msg: '投票成功！', data});
          }).catch(err => {
            console.error(err);
            sendError('内部错误，请稍后重试', 500);
          })
        });
      });
    });
  }).catch(err => {
    if(err === undefined) {
      res.status(401).send({msg: '请先登录'});
    }else if(_.isString(err)) {
      res.status(400).send({msg: err});
    }else {
      res.status(400).send({msg: '投票失败，请检查'});
    }
  });
}