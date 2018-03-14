// 检查当前登录信息
let db = require('../database');

module.exports = (uid) => {
  return new Promise((resolve, reject) => {
    db.query('select * from fly_user where uid=? limit 1', [uid], (err, results) => {
      if(err) reject(err);
      if(results.length > 0){
        resolve({
          name: results[0].user_name,
          code: results[0].user_code,
          type: results[0].user_type,
          avatar: results[0].avatar,
        });
      }else {
        reject();
      }
    });
  });
}