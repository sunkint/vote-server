let uploadQiniu = require('../../common/qiniu/UploadQiniu');
let db = require('../../database.js');
let request = require('request');
let uuidV4 = require('uuid/v4');
let _ = require('underscore');
let fs = require('fs');

let secretID = '';

try {
  secretID = fs.readFileSync(__dirname + '/../../config/secret.mp.config', {encoding: 'utf8'});
} catch(e) {
  throw '小程序配置读取失败';
}

module.exports = function (req, res) {
  let code = req.body.code;
  let uname = req.body.uname;
  let avatarUrl = req.body.avatar;

  if(!_.isString(code) || _.isEmpty(code) || code.length > 64) {
    res.status(400).send({msg: '非法请求'});
    return;
  }

  if(!_.isString(uname) || _.isEmpty(uname) || uname.length > 32) {
    res.status(400).send({msg: '非法请求'});
    return;
  }
  
  const AppID = 'wxe7594524b0c10178';
  let url = 'https://api.weixin.qq.com/sns/jscode2session?'
    + `appid=${AppID}&secret=${secretID}&js_code=${code}&grant_type=authorization_code`;

  request.get(url, (err, _res, body) => {
    console.log('微信服务器回调：');
    console.log(body);
    
    if(err) {
      res.status(502).send({msg: '验证失败请重试'});
      return;
    }
    let result = JSON.parse(body);
    if(result.errmsg) {
      res.status(401).send({msg: '验证超时请重试'});
      return;
    }

    let ucode = result.openid;
    db.query('select count(*) c, avatar, avatar_key from fly_user where user_code=? group by avatar, avatar_key limit 1', [ucode], (err, results) => {
      const isUserExists = !_.isUndefined(results) && results.length > 0 && results[0].c > 0;
      const uid = uuidV4();
  
      let handler = key => {
        if(isUserExists) {
          db.query('update fly_user set user_name=?, avatar_key=?, uid=?, avatar=? where user_code=?', [uname, key, uid, avatarUrl, ucode], (err, results) => {
            if(err) {
              res.status(401).send({msg: '用户非法'});
              return;
            }
            res.send({msg: 'ok', uid, ucode});
          });
        }else {
          db.query('insert into fly_user (user_name, user_code, user_type, avatar, avatar_key, uid) values (?,?,?,?,?,?)', 
          [uname, ucode, 1, avatarUrl, key, uid], (err, results) => {
            if(err) {
              res.status(401).send({msg: '用户非法'});
              return;
            }
            res.send({msg: 'ok', uid, ucode});
          })
        }
      };

      let errHandler = err => {
        res.status(404).send({msg: '头像转存失败！'});
      };

      if(isUserExists) {
        let oldAvatar = results[0].avatar;
        if(oldAvatar !== avatarUrl) {
          uploadQiniu(avatarUrl).then(handler).catch(errHandler);
        }else {
          handler(results[0].avatar_key);
        }
      }else {
        uploadQiniu(avatarUrl).then(handler).catch(errHandler);
      }
      
    });
  });
}