// 添加投票

let db = require('../database');
let checkUser = require('../common/CheckUser');
let _ = require('underscore');
let uuidV4 = require('uuid/v4');

module.exports = (req, res) => {
  let data = req.body;
  checkUser(req.cookies.vote_user_uid).then(user => {
    try {
      if(!_.isString(data.title) || !_.isString(data.description) || !_.isArray(data.options)) throw '非法请求';
      if(_.isEmpty(data.title) || _.isEmpty(data.options)) throw '非法请求';
      if(data.title.length > 60) throw '投票标题太长';
      if(data.description.length > 300) throw '投票描述太长';
      let options = [...new Set(data.options)];
      if(options.length < 2) throw '选项不能少于2个';
      if(options.length > 26) throw '选项不能多于26个';
      for(let o of options) {
        if(o === '') throw '选项不能为空';
        if(o.length > 40) throw '选项不能超过40字符';
      }
      if(data.maxSelectedCount == 0) data.maxSelectedCount = options.length;
      if(data.multiSelect && data.maxSelectedCount > options.length) {
        data.maxSelectedCount = options.length;
      }else if(!data.multiSelect || data.multiSelect === 'false') {
        data.maxSelectedCount = 1;
      }
      let deadlineTime = '2099-12-31 23:59:59';
      let date = new Date(deadlineTime);
      if(data.deadline > 0) { // 经过多少时间（秒）结束
        // 限制最长过期时间为100年
        if(data.deadline > 100 * 365.2422 * 24 * 60 * 60) {
          data.deadline = 100 * 365.2422 * 24 * 60 * 60;
        }
        date = new Date(Date.now() + data.deadline * 1000);
      }else if(data.deadline < 0) { // 指定时间结束
        deadlineTime = `${data.deadlineDate} ${data.deadlineTime}`;
        date = new Date(deadlineTime);
        if(date.getTime() < Date.now() + 60 * 60 * 1000) {
          throw '截止时间应大于1个小时';
        }
      }
      // 构建数据结构
      let voteData = {
        version: 0.1,
        vote_group: false,
        title: data.title,
        description: data.description,
        author: user.name,
        author_code: user.code,
        deadline: date.getTime(),
        votes: [
          {
            title: '', // 和上面title一样时，留空
            description: '', // 同上
            max_selected_count: data.maxSelectedCount,
            options: options.map(o => ({value: o, guid: uuidV4()}))
          }
        ]
      };
      // 加入数据库
      db.query('insert into fly_vote (title, description, vote_data, author, author_code, deadline) values (?,?,?,?,?,?)', 
        [data.title, data.description, JSON.stringify(voteData), user.name, user.code, date.toFormattedString()],
        (err, results) => {
          if(err) throw err;
          res.send({msg: '添加投票成功！'});
        });
    }catch(e) {
      if(_.isString(e)) res.status(400).send({msg: e});
      else res.status(400).send({msg: '非法请求'});
    }
  }, () => {
    res.status(401).send({msg: '请先登录'});
  })
};