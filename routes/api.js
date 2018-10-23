/**
 * api
 */
const express = require('express')
const router = express.Router()
router.caseSensitive = true
router.strict = true

const {AdminUser, User} = require('../controller');
const _ = require('lodash');

router.get('/getImgCode', User.getImgCode);

// 管理员登录
router.post('/admin/doLogin', AdminUser.loginAction);

module.exports = router