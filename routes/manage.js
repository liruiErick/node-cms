const express = require('express')
const router = express.Router()
router.caseSensitive = true
router.strict = true
const {
    AdminUser,
    AdminGroup,
    AdminResource,
    ContentCategory,
    Content,
    ContentTag,
    User,
    Message,
    SystemConfig,
    DataOptionLog,
    SystemOptionLog,
    UserNotify,
    Notify,
    Shop,
    Category
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

router.post('/adminUser/addOne', authToken, authPower, AdminUser.addAdminUser)

router.post('/adminUser/updateOne', authToken, authPower, AdminUser.updateAdminUser)

router.get('/adminUser/deleteUser', authToken, authPower, AdminUser.delAdminUser)

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
 * 系统配置
 * 此api名称尽量不要改
 */
router.get('/systemConfig/getConfig', SystemConfig.getSystemConfigs)

router.post('/systemConfig/updateConfig', SystemConfig.updateSystemConfig)

/**
 * 文档类别管理
 *
 */
router.get('/contentCategory/getList', ContentCategory.getContentCategories)

router.post('/contentCategory/addOne', ContentCategory.addContentCategory)

router.post('/contentCategory/updateOne', ContentCategory.updateContentCategory)

router.get('/contentCategory/deleteCategory', ContentCategory.delContentCategory)

/**
 * 文档管理
 *
 */

router.get('/content/getList', Content.getContents)

router.get('/content/getContent', Content.getOneContent)

router.post('/content/addOne', Content.addContent)

router.post('/content/updateOne', Content.updateContent)

router.get('/content/deleteContent', Content.delContent)

/**
 * tag管理
 */
router.get('/contentTag/getList', ContentTag.getContentTags)

router.post('/contentTag/addOne', ContentTag.addContentTag)

router.post('/contentTag/updateOne', ContentTag.updateContentTag)

router.get('/contentTag/deleteTag', ContentTag.delContentTag)

/**
 * 留言管理
 */
router.get('/contentMessage/getList', Message.getMessages)

router.post('/contentMessage/addOne', Message.postMessages)

router.get('/contentMessage/deleteMessage', Message.delMessage)

/**
 * 注册用户管理
 */
router.get('/regUser/getList', User.getUsers)

router.post('/regUser/updateOne', User.updateUser)

router.get('/regUser/deleteUser', User.delUser)


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


/**
 * 系统消息
 */

router.get('/systemNotify/getList', (req, res, next) => {
    req.query.systemUser = req.session.adminUserInfo._id;
    next()
}, UserNotify.getUserNotifys);

//删除操作日志
router.get('/systemNotify/deleteNotifyItem', UserNotify.delUserNotify);

// 设为已读消息
router.get('/systemNotify/setHasRead', (req, res, next) => {
    req.query.systemUser = req.session.adminUserInfo._id;
    next()
}, UserNotify.setMessageHasRead);

/**
 * 系统公告
 */

router.get('/systemAnnounce/getList', (req, res, next) => {
    req.query.type = '1';
    next()
}, Notify.getNotifys);

// 删除公告
router.get('/systemAnnounce/deleteItem', Notify.delNotify);

//发布系统公告
router.post('/systemAnnounce/addOne', Notify.addOneSysNotify);

//获取餐馆列表
router.get('/shopping/restaurants', Shop.getRestaurants);

router.post('/shopping/updateRestaurant', Shop.updateRestaurant);

router.post('/shopping/addRestaurant', Shop.addRestaurant);

router.get('/shopping/delRestaurant', Shop.delRestaurant);
//获取餐馆种类
router.get('/shopping/getCategories', Category.getCategories);

module.exports = router