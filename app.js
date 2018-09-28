import express from 'express';
import config from 'config-lite';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import session from 'express-session';
import connectMongo from 'connect-mongo';
import winston from 'winston';
import expressWinston from 'express-winston';
import history from 'connect-history-api-fallback';
import db from './mongodb/db.js';
import chalk from 'chalk';//颜色插件
const i18n = require('i18n');
const app = express();
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.Origin || req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true); //可以带cookies
    res.header("X-Powered-By", '3.2.1')
    if (req.method ==='OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
const MongoStore = connectMongo(session);//连接数据库
app.use(cookieParser());
app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: config.session.cookie,
    store: new MongoStore({
        url: config.url
    })
}))
// 定义setLocale中间件
let languages = config.languages;
function setLocale(req, res, next) {
    var locale;
    //配置i18n
    i18n.configure({
        locales: languages,  //声明包含的语言
        register: res,
        directory: __dirname + '/locales',  //翻译json文件的路径
        defaultLocale: config.lang,   //默认的语言，即为上述标准4
        indent: "\t"
    });
    //客户端可以通过修改cookie进行语言切换控制
    if (req.cookies['locale']) {
        locale = req.cookies['locale'];
    }
    else if (req.acceptsLanguages()) {
        locale = req.acceptsLanguages()[0];
    }
    if (!~languages.indexOf(locale)) {
        locale = 'zh-CN';
    }
    // 强制设置语言
    locale = 'zh-CN';
    // 设置i18n对这个请求所使用的语言
    res.setLocale(locale);
    next();
}
app.use(setLocale);
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));
router(app);
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));
app.use(history());
app.use(express.static('./public'));
app.listen(config.port, () => {
    console.log(
        chalk.green(`成功监听端口：${config.port}`)
    )
});