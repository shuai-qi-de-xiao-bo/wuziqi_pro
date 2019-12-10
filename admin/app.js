let user = []; // 初始化当前用户集合
let wsArr = []; // 初始化当前用户ws集合
let chatWsArr = []; // 初始化聊天ws集合
let arr = []; // 初始化棋盘
let chatArr = []; // 初始化聊天记录
let next = "黑方"; // 初始化当前该谁下
let position = []; // 当前落子的位置
let battleResult = null; // 下棋结果
for (let i = 0; i < 18; i++) { // 初始化棋盘
  let childArr = [];
  for (let j = 0; j < 18; j++) {
    childArr.push(j);
  }
  arr.push(childArr);
}
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nodeCmd = require('node-cmd'); // 执行cmd命令


// var indexRouter = require('./routes/index');

var app = express();
const expressWs = require('express-ws');
expressWs(app);

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var fs = require('fs');

// app.use('/', indexRouter);
app.get('/', function (req, res, next) {
  if (!(user.find(item => item.ip === getClientIP(req)))) user.push({
    ip: getClientIP(req),
  }); // 根据ip判断是否是同一用户
  res.render('index', {
    title: '五子棋',
    arr: arr, // 棋盘，包含下棋信息
  });
});
app.get('/uploads/:name', function (req, res, next) {
  //建议使用绝对路径查找图片
  try {
    const rs = fs.createReadStream('./uploads/' + req.params.name);
    rs.pipe(res);
  } catch (err) {
    console.log(err);
  }
});
app.all("*", function (req, res, next) {
  res.status(200).send();
  // 设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.send(200);  //让options尝试请求快速结束
  else
    next();
})
// 图片上传接口
const multer = require('multer');
const upload = multer({ dest: './uploads/' }) // 文件储存路径
// app.post('/upload', upload.single('img'), function(req, res, next) {
//   console.log(file);
//   var file = req.file;
//   res.status(200).json({
//     msg : '图片上传成功啦!',
//     imgs_url : `http://10.10.16.92:3000/uploads/${file.filename}`, //返回图片URL
//   });
// });
app.post('/uploadWang', upload.single('img'), function (req, res, next) {
  console.log("收到post请求!", file);
  var file = req.file;
  res.status(200).json({
    msg: '图片上传成功啦!',
    imgs_url: `http://10.10.16.92:3000/uploads/${file.filename}`, //返回图片URL
  });
});

app.post('/', function (req, res, next) {
  let cmd = req.body.cmd;
  res.status(200).json({ msg: '你请求成功啦' });
  // nodeCmd.get(
  //     cmd,
  //     function(err, data, stderr){
  //         console.log(data);
  //     }
  // );
});
app.post('/restart', function (req, res, next) {
  for (let i = 0; i < wsArr.length; i++) {
    wsArr[i].send(JSON.stringify({
      isAgain: true,
      msg: `${req.body.ID}请求再来一局`,
      ID: req.body.ID,
    }));
  } // 给对战者用户发送请求再来一局的提示信息
  res.status(200).json({ msg: '操作成功!' });
});
app.post('/isAgree', function (req, res, next) {
  for (let i = 0; i < wsArr.length; i++) {
    wsArr[i].send(JSON.stringify({
      isAgree: true,
      msg: `${req.body.yourID}${req.body.isAgree ? '同意' : '不同意'}`,
      ID: req.body.ID,
    }));
  } // 给提出再来一局的人员反馈对手是否同意再来一局的反馈结果
  if (req.body.isAgree) { // 如果同意就初始化游戏数据
    arr = []; // 初始化棋盘
    next = "黑方"; // 初始化当前该谁下
    position = []; // 当前落子的位置
    battleResult = null; // 下棋结果
    for (let i = 0; i < 18; i++) { // 初始化棋盘
      let childArr = [];
      for (let j = 0; j < 18; j++) {
        childArr.push(j);
      }
      arr.push(childArr);
    }
    for (let i = 0; i < wsArr.length; i++) {
      wsArr[i].send(JSON.stringify({
        title: next,
        userOnline: user.length,
        arr: arr,
        position: position,
        battleResult: battleResult,
      }));
    } // 给每一位用户发送websoket信息
  }
  res.status(200).json({ msg: '操作成功!' });
})
// 聊天websocket接口
app.ws('/chat', function (ws, req) {
  console.log('收到ws聊天连接');
  if (!(chatWsArr.find(item => item === ws))) {
    chatWsArr.push(ws); // 存储所有的websocket连接
  }
  ws.send(JSON.stringify({
    chatArr: chatArr,
  }));
  ws.on('message', function (req) {
    let data = JSON.parse(req);
    chatArr.push(data);
    for (let i = 0; i < chatWsArr.length; i++) {
      chatWsArr[i].send(JSON.stringify({
        chatArr: chatArr,
      }));
    } // 给每一位用户发送websoket信息
  })
  ws.on('close', function (req) {
    console.log('clear chat');
    for (let i = 0; i < chatWsArr.length; i++) {
      if (chatWsArr[i] === ws) {
        chatWsArr.splice(i, 1);
        break;
      }
    }
  })
})
// 对战websocket接口
app.ws('/battle', function (ws, req) {
  console.log(`收到ip:${getClientIP(req)}:${req.connection.remotePort}的ws对战连接`);
  if (!(user.find(item => item.ip === getClientIP(req)))) user.push({
    ip: getClientIP(req),
  }); // 根据ip判断是否是同一用户
  if (!(wsArr.find(item => item === ws))) {
    wsArr.push(ws); // 存储所有的websocket连接
  }
  let item = user.find(item => item.ip === getClientIP(req));
  if (!item.user) {
    switch (user.length) {
      case 1:
        item.user = '黑方';
        ws.send(JSON.stringify({
          title: next,
          name: '黑方',
          userOnline: user.length,
          arr: arr,
          position: position,
          battleResult: battleResult,
        })); // 返回当前在线人数);
        break;
      case 2:
        item.user = '白方';
        ws.send(JSON.stringify({
          title: next,
          name: '白方',
          userOnline: user.length,
          arr: arr,
          position: position,
          battleResult: battleResult,
        })); // 返回当前在线人数);
        break;
      default:
        item.user = '观战者';
        ws.send(JSON.stringify({
          title: next,
          name: '观战者',
          userOnline: user.length,
          arr: arr,
          position: position,
          battleResult: battleResult,
        })); // 返回当前在线人数);
        break;
    }
  } else {
    ws.send(JSON.stringify({
      title: next,
      name: item.user,
      userOnline: user.length,
      arr: arr,
      position: position,
      battleResult: battleResult,
    })); // 返回当前在线人数);
  }
  for (let i = 0; i < wsArr.length; i++) {
    wsArr[i].send(JSON.stringify({
      title: next,
      userOnline: user.length,
      arr: arr,
      position: position,
      battleResult: battleResult,
    }));
  } // 给每一位用户发送websoket信息

  ws.on('message', function (req) {
    let data = JSON.parse(req);
    next = next === '黑方' ? "白方" : "黑方";
    arr[data.position[0]][data.position[1]] = data.next === '黑方' ? "白方" : "黑方";
    position = data.position;
    if (judgeWinOrFail(data.position[0], data.position[1])) {
      battleResult = `${data.ID}胜!`;
    }
    for (let i = 0; i < wsArr.length; i++) {
      wsArr[i].send(JSON.stringify({
        title: data.next,
        userOnline: user.length,
        arr: arr,
        position: position,
        battleResult: battleResult,
      }));
    } // 给每一位用户发送websoket信息
  })

  ws.on('close', function (req) {
    console.log('clear battle');
    for (let i = 0; i < wsArr.length; i++) {
      if (wsArr[i] === ws) {
        wsArr.splice(i, 1);
        break;
      }
    }
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port = 3000, '0.0.0.0', () => {
  const os = require('os');
  const netInfo = os.networkInterfaces(); //网络信息
  let ip = netInfo['以太网'][1].address;
  let d = new Date();
  let dateTime = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  console.log(`启动时间:${dateTime}`, `%chttp://${ip}:${port}`, 'color:red;', `服务已经启动成功！`);
})

module.exports = app;
function getClientIP(req) {
  /**
   * @getClientIP
   * @desc 获取用户 ip 地址
   * @param {Object} req - 请求
   **/
  return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
    req.connection.remoteAddress // 判断 connection 的远程 IP
};
// 判断输赢
function judgeWinOrFail(i, j) {
  let a = arr[i], // 水平列
      b = [], // 垂直列
      c = [], // 西北-东南列
      d = []; // 东北-西南列
  for (let k = 0; k < arr.length; k++) {
    for (let m = 0; m < arr[k].length; m++) {
      if (m === j) {
        b.push(arr[k][m]);
      }
      if (((k <= i && m <= j) || (k > i && m > j)) && i - k === j - m) {
        c.push(arr[k][m]);
      }
      if (((k >= i && m <= j) || (k < i && m > j)) && i - k === m - j) {
        d.push(arr[k][m]);
      }
    }
  }
  if (algorithmOfGame(a) || algorithmOfGame(b)
  || algorithmOfGame(c) || algorithmOfGame(d)) {
    return true;
  } else {
    return false;
  }
}
// 判断输赢的算法
function algorithmOfGame(arr) {
  let newArr = [];
  let result = false;
  for (let i = 0; i < arr.length; i++) {
    if (i === 0) {
      newArr.push(arr[i]);
    } else if (arr[i] === arr[i - 1] && (arr[i] === '黑方' || arr[i] === '白方')) {
      newArr.push(arr[i]);
    } else {
      newArr = [arr[i]];
    }
    if (newArr.length === 5) {
      result = true;
      break;
    }
  }
  return result;
}
