// 使用 ES6 Promise 封装数据库查询，方便进行多重查询
let db = require('../database');

module.exports = function (sql, d = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, d, (err, results) => {
      if(err) reject(err); else resolve(results);
    });
  });
}