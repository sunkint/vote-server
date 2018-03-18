let qiniu = require('node-qiniu');
let request = require('request');
let uuidV4 = require('uuid/v4');
let fs = require('fs');

let secret_key = '';

try {
  secret_key = fs.readFileSync(__dirname + '/../../config/secret.qn.config', {encoding: 'utf8'});
}catch (ex) {
  throw '七牛云配置读取失败';
}

qiniu.config({
  access_key: '-VMw1PKN98rO7UGAOFLa1j3JvsiDePQyfHc_G2WC',
  secret_key: secret_key,
});

// 转存图片等文件的实现
module.exports = function (fileUrl, options = {}) {
  return new Promise((resolve, reject) => {
    // 检查临时目录
    if(!fs.existsSync(__dirname + '/temp')) fs.mkdirSync(__dirname + '/temp');
    // 生成临时文件名
    let tempFilePath = __dirname + '/temp/' + uuidV4() + '.tmp';

    // 下载文件
    request
      .get(fileUrl)
      .on('error', err => {
        reject(404);
      })
      .on('response', res => {
        if(res.statusCode === 200) {
          if(!fs.existsSync(tempFilePath)) {
            console.log('又错了');
            return reject();
          }
          // 生成七牛云key
          let key = uuidV4().replace(/\-/g, '');
          let bucket = qiniu.bucket('flyvote');
          bucket.putFile(key, tempFilePath, (err, reply) => {
            if(err) return reject(err);
            fs.unlink(tempFilePath);
            resolve(key);
          });
        }else {
          reject(res.statusCode);
        }
      })
      .pipe(fs.createWriteStream(tempFilePath));
  });
}