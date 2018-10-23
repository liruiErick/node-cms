const express = require('express')
const router = express.Router()
router.caseSensitive = true
router.strict = true
const {
    AdminUser,
    AdminGroup,
    AdminResource,
    DataOptionLog,
    SystemOptionLog,
    Shop,
    Category,
    Goods
} = require('../controller');
const {
    authSession,
    authToken,
    authPower
} = require('../utils');


// 管理员退出
router.get('/logout', (req, res) => {
    req.session.adminlogined = false;
    req.session.adminPower = '';
    req.session.adminUserInfo = '';
    res.send({
        status: 200
    });
});

// 获取管理员信息
router.get('/getUserSession', AdminUser.getUserSession)


// 获取后台基础信息
router.get('/getSitBasicInfo', AdminUser.getBasicSiteInfo)

/**
 * 管理员管理
 */
router.get('/adminUser/getList', authToken, authPower, AdminUser.getAdminUsers)

/**
 * 角色管理
 */
router.get('/adminGroup/getList', authToken, authPower, AdminGroup.getAdminGroups)

router.post('/adminGroup/addOne', authToken, authPower, AdminGroup.addAdminGroup)

router.post('/adminGroup/updateOne', authToken, authPower, AdminGroup.updateAdminGroup)

router.get('/adminGroup/deleteGroup', authToken, authPower, AdminGroup.delAdminGroup)

/**
 * 资源管理
 *
 */
//获取菜单
router.get('/adminResource/getList', authToken, authPower, AdminResource.getAdminResources)

router.get('/adminResource/getAllResource', AdminResource.getAllResource)

router.post('/adminResource/addOne', authToken, authPower, AdminResource.addAdminResource)

router.post('/adminResource/updateOne', authToken, authPower, AdminResource.updateAdminResource)

router.get('/adminResource/deleteResource', authToken, authPower, AdminResource.delAdminResource)

/**
 * 数据备份
 */

//获取备份数据列表
router.get('/backupDataManage/getBakList', DataOptionLog.getDataBakList);

//备份数据库执行
router.post('/backupDataManage/backUp', DataOptionLog.backUpData);

//删除备份数据
router.get('/backupDataManage/deleteDataItem', DataOptionLog.delDataItem);

/**
 * 系统操作日志
 */

router.get('/systemOptionLog/getList', SystemOptionLog.getSystemOptionLogs);

//删除操作日志
router.get('/systemOptionLog/deleteLogItem', SystemOptionLog.delSystemOptionLogs);

// 清空日志
router.get('/systemOptionLog/deleteAllLogItem', (req, res, next) => {
    req.query.ids = 'all';
    next()
}, SystemOptionLog.delSystemOptionLogs);

//获取餐馆列表
router.get('/shopping/restaurants', Shop.getRestaurants);

router.post('/shopping/updateRestaurant', Shop.updateRestaurant);

router.post('/shopping/addRestaurant', Shop.addRestaurant);

router.get('/shopping/delRestaurant', Shop.delRestaurant);
//获取餐馆种类
router.get('/shopping/getCategories', Category.getCategories);

//获取商品列表
router.get('/goods/goods', Goods.getGoods);

module.exports = router