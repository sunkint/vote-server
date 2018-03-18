/*
  砾风小投票 服务端
  入口文件
*/

// 加载应用框架
let express = require('express');
let app = express();

// 加载中间件
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const IS_PRODUCTION = require('./common/CheckIfProd');

// 配置跨域
let crossDomain = (req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': IS_PRODUCTION ? 'http://vote.ybusad.com' : 'http://dev.vote.me:8999',
    'Access-Control-Allow-Headers': 'Content-type',
    'Access-Control-Max-Age': '300',
    'Access-Control-Allow-Credentials': 'true',
  });
  if(req.method !== 'OPTIONS') next();
};
app.use(crossDomain);

// 拓展行为
Date.prototype.toFormattedString = function () {
  return `${this.getFullYear()}-${this.getMonth() + 1}-${this.getDate()} ` +
   `${this.getHours()}:${this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes()}:${this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds()}`;
};

app.all('/', (req, res) => {
  res.send('Hello World! Are You OK?');
});

// 加载路由
let routes = require('./routes');
for(let path in routes) {
  let info = routes[path];
  if(typeof info === 'function') {
    app.all(path, info);
  }else if(typeof info === 'object' && info !== null) {
    if(typeof info.handler !== 'function') return;
    let method = info.method || 'all';
    app[method](path, info.handler);
  }else{
    console.log(info);
  }
}

// 启动服务
let server = app.listen(IS_PRODUCTION ? 80 : 3000, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log(`Server is listening at http://${host}:${port} ${IS_PRODUCTION ? '(production)' : '(development)'}`);
});