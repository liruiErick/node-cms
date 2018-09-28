/**
 * api
 */
const express = require('express')
const router = express.Router()
router.caseSensitive = true
router.strict = true

const { AdminUser, ContentCategory, Content, ContentTag, User, SystemConfig } = require('../controller');
const _ = require('lodash');

function checkUserSession(req, res, next) {
  if (!_.isEmpty(req.session.user)) {
    next()
  } else {
    res.redirect("/");
  }
}

router.get('/getImgCode', User.getImgCode);

// 查询文档列表
router.get('/content/getList', (req, res, next) => { req.query.state = true; next() }, Content.getContents);

// 查询简单的文档列表
router.get('/content/getSimpleListByParams', (req, res, next) => { req.query.state = true; next() }, Content.getContents)

// 查询文档详情
router.get('/content/getContent', (req, res, next) => { req.query.state = true; next() }, Content.getOneContent)

// 更新喜欢文档
router.get('/content/updateLikeNum', checkUserSession, Content.updateLikeNum)

// 添加或更新文章
router.post('/content/addOne', checkUserSession, (req, res, next) => {
  req.query.role = 'user';

  next();
}, Content.addContent)

router.post('/content/updateOne', checkUserSession, (req, res, next) => {
  req.query.role = 'user';
  next();
}, Content.updateContent)

// 管理员登录
router.post('/admin/doLogin', AdminUser.loginAction);

// 获取类别列表
router.get('/contentCategory/getList', (req, res, next) => { req.query.enable = true; next() }, ContentCategory.getContentCategories)

// 获取标签列表
router.get('/contentTag/getList', (req, res, next) => { next() }, ContentTag.getContentTags)

// 获取系统配置信息
router.get('/systemConfig/getConfig', (req, res, next) => { req.query.model = 'simple'; next() }, SystemConfig.getSystemConfigs)

module.exports = router