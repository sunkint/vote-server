// 添加投票

let _ = require('underscore');
let db = require('../database');
let uuidV4 = require('uuid/v4');
let checkUser = require('../common/CheckUser');

module.exports = (req, res) => {
  let q = req.body;
  let E = (msg, code = 400) => {res.status(code).send({msg})};

  checkUser(req.cookies.vote_user_uid).then(user => {
    
    let isVaildRequest = _.isString(q.title)
      && _.isString(q.description)
      && _.isArray(q.subVotes)
      && !_.isEmpty(q.title)
      && !_.isEmpty(q.subVotes);

    if(!isVaildRequest) {
      return E('非法请求');
    }

    if(q.title.length > 60) {
      return E('投票标题太长');
    }

    if(q.description.length > 300) {
      return E('投票描述太长');
    }

    let isGroup = q.subVotes.length > 1;
    let subVoteTitles = new Set();

    for(let subVote of q.subVotes) {
      isVaildRequest = _.isArray(subVote.options)
        && subVote.options.length > 2
        && subVote.options.length < 26
        && _.isString(subVote.title)
        && (!isGroup || !_.isEmpty(subVote.title));
      
      if(!isVaildRequest) {
        return E('投票不符合格式');
      }

      if(subVote.title.length > 60) {
        return E('子投票标题过长');
      }

      if(subVote.description.length > 120) {
        return E('子投票描述过长');
      }

      let options = [...new Set(subVote.options)];
      for(let o of options) {
        if(o === '') return E('选项不能为空');
        if(o.length > 40) return E('选项不能超过40字符');
      }

      subVote.options = options;

      // 处理最大选择个数
      subVote.maxSelectedCount = parseInt(subVote.maxSelectedCount);
      if(_.isNaN(subVote.maxSelectedCount)) subVote.maxSelectedCount = 0;

      if(subVote.maxSelectedCount < 0) subVote.maxSelectedCount = 0;
      if(subVote.maxSelectedCount === 0 || subVote.maxSelectedCount > options.length) {
        subVote.maxSelectedCount = options.length;
      }

      // 组织起所有的子投票标题
      subVoteTitles.add(subVote.title);
    }

    if(subVoteTitles.size !== q.subVotes.length) {
      return E('存在重复的子投票标题');
    }

    let deadlineTime = '2099-12-31 23:59:59'
      , date = new Date(deadlineTime);

    if(q.deadline > 0) { // 经过多少时间（秒）结束
      // 限制最长过期时间为100年
      if(q.deadline > 100 * 365.2422 * 24 * 60 * 60) {
        q.deadline = 100 * 365.2422 * 24 * 60 * 60;
      }

      date = new Date(Date.now() + q.deadline * 1000);
    }else if(q.deadline < 0) { // 指定时间结束
      deadlineTime = `${q.deadlineDate} ${q.deadlineTime}`;
      date = new Date(deadlineTime);

      if(date.getTime() < Date.now() + 60 * 60 * 1000) {
        return E('截止时间应大于1个小时');
      }
    }

    // 构建数据结构
    let voteData = {
      version: 0.1,
      vote_group: isGroup,
      title: q.title,
      description: q.description,
      author: user.name,
      author_code: user.code,
      deadline: date.getTime(),
      votes: q.subVotes.map(subVote => {
        return {
          title: subVote.title,
          description: subVote.description,
          max_selected_count: subVote.maxSelectedCount,
          options: subVote.options.map(o => ({value: o, guid: uuidV4()}))
        }
      }),
    };

    console.log(voteData);

    // 加入数据库
    db.query('insert into fly_vote (title, description, vote_data, author, author_code, deadline) values (?,?,?,?,?,?)', 
      [q.title, q.description, JSON.stringify(voteData), user.name, user.code, date.toFormattedString()],
      (err, results) => {
        if(err) throw err;
        res.send({msg: '添加投票成功！'});
      });

  }, () => {
    res.status(401).send({msg: '请先登录'});
  })
};