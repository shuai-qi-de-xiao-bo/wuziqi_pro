var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  ip.push(getClientIP(req));
  let arr = [];
  for (let i = 0; i < 18; i++) {
    let childArr = [];
    for (let j = 0; j < 18; j++) {
      childArr.push(j);
    }
    arr.push(childArr);
  }
  res.render('index', { 
    title: '五子棋',
    arr: arr,
  });
});
function getClientIP(req) {
  /**
   * @getClientIP
   * @desc 获取用户 ip 地址
   * @param {Object} req - 请求
   */
  return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress;
};

module.exports = router;
