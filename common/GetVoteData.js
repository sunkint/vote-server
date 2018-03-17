// 拿取、计算单个投票的数据
let db = require('../database');
let _ = require('underscore');
let query = require('./query');

let calculate = function (data, ucode, vote_id, resolve) {
  let list = {};
  for(let d of data) {
    list[d[0].guid] = {count: d[0].count, percent: 0, voted: false}; // 百分比计算交给前端，因为前端更好分组
  }
  
  if(ucode != '') {
    query('select option_guid guid from fly_data where vote_id=? and user_code=?', [vote_id, ucode]).then(results => {
      let voted = [];
      for(let r of results) {
        voted.push(r.guid);
      }
      for(let guid in list) {
        if(voted.indexOf(guid) >= 0) {
          list[guid].voted = true;
        }
      }
      resolve(list);
    }).catch(err => {
      console.error(err);
      resolve(list);
    });
  }else {
    resolve(list);
  }
}

module.exports = function (id, ucode = '') {
  return new Promise((resolve, reject) => {
    db.query('select * from fly_vote where id=? limit 1', [id], (err, results) => {
      if(err) return reject(err);
      if(results.length === 0) return reject("未找到投票");
      let vote = results[0], voteData = JSON.parse(vote.vote_data);
      let promises = [];

      for(let voteItem of voteData.votes) {
        for(let o of voteItem.options) {
          promises.push(query(`select count(*) count, '${o.guid}' guid from fly_data where option_guid=?`, [o.guid]));
        }
      }

      Promise.all(promises).then(data => {
        calculate(data, ucode, id, resolve);
      }).catch(err => {
        reject(err);
      });
      
    })
  });
}