// 根据启动参数判断本地/远程
const args = process.argv.slice(2);
const IS_PRODUCTION = args[0] === 'prod' || args[1] === 'prod';

module.exports = IS_PRODUCTION;