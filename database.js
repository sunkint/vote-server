const IS_PRODUCTION = require('./common/CheckIfProd');

// 获取数据库
let mysql = require('mysql');
let pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: IS_PRODUCTION ? 'flyvote8888' : 'qwer1234',
  database: 'flyvote',
});

module.exports = pool;