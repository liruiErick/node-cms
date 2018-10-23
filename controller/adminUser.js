const AdminUserModel = require("../models").AdminUser;
const AdminResourceModel = require("../models").AdminResource;
const UserModel = require("../models").User;
const ContentModel = require("../models").Content;
const SystemConfigModel = require("../models").SystemConfig;
const SystemOptionLogModel = require("../models").SystemOptionLog;
const UserNotifyModel = require("../models").UserNotify;
const MessageModel = require("../models").Message;
const formidable = require('formidable');
const _ = require('lodash')
const { validatorUtil, siteFunc } = require('../utils');

const settings = require('../config/default');
const axios = require('axios');
const pkgInfo = require('../package.json')

class AdminUser {
    constructor() {
    }

    async getUserSession(req, res, next) {
        try {
            let noticeCounts = await UserNotifyModel.count({ 'systemUser': req.session.adminUserInfo._id, 'isRead': false });
            let renderData = {
                noticeCounts,
                loginState: req.session.adminlogined,
                userInfo: req.session.adminUserInfo
            };
            res.send(siteFunc.renderApiData(res, 200, 'adminUser', renderData, 'getlist'))

        } catch (err) {

            res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))

        }
    }

    async getBasicSiteInfo(req, res, next) {
        try {
            let adminUserCount = await AdminUserModel.count();
            let regUserCount = await UserModel.count();
            let regUsers = await UserModel.find({}, { password: 0, email: 0 }).limit(20).sort({ date: -1 });
            let contentCount = await ContentModel.count();
            let messageCount = await MessageModel.count();
            let logQuery = { type: 'login' };
            let reKey = new RegExp(req.session.adminUserInfo.userName, 'i')
            logQuery.logs = { $regex: reKey }
            let loginLogs = await SystemOptionLogModel.find(logQuery).sort({ date: -1 }).skip(1).limit(1);
            let messages = await MessageModel.find().limit(10).sort({ date: -1 }).populate([{
                path: 'contentId',
                select: 'stitle _id'
            }, {
                path: 'author',
                select: 'userName _id enable date logo'
            }, {
                path: 'replyAuthor',
                select: 'userName _id enable date logo'
            }, {
                path: 'adminAuthor',
                select: 'userName _id enable date logo'
            }, {
                path: 'adminReplyAuthor',
                select: 'userName _id enable date logo'
            }]).exec();
            // 权限标记
            let fullResources = await AdminResourceModel.find();
            let newResources = [];
            for (let i = 0; i < fullResources.length; i++) {
                let resourceObj = JSON.parse(JSON.stringify(fullResources[i]));
                if (resourceObj.type == '1' && !_.isEmpty(req.session.adminUserInfo)) {
                    let adminPower = req.session.adminUserInfo.group.power;
                    if (adminPower && adminPower.indexOf(resourceObj._id) > -1) {
                        resourceObj.hasPower = true;
                    } else {
                        resourceObj.hasPower = false;
                    }
                    newResources.push(resourceObj);
                } else {
                    newResources.push(resourceObj);
                }
            }
            let renderBasicInfo = {
                adminUserCount,
                regUserCount,
                regUsers,
                contentCount,
                messageCount,
                messages,
                loginLogs,
                resources: newResources
            }

            res.send(siteFunc.renderApiData(res, 200, 'adminUser', renderBasicInfo, 'getlist'))

        } catch (error) {

            res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))
        }
    }

    async getAdminUsers(req, res, next) {
        try {
            let current = req.query.current || 1;
            let pageSize = req.query.pageSize || 10;
            const adminUsers = await AdminUserModel.find().sort({
                date: -1
            }).skip(Number(pageSize) * (Number(current) - 1)).limit(Number(pageSize)).populate({
                path: 'group',
                select: "name _id"
            }).exec();
            const totalItems = await AdminUserModel.count();
            let renderData = {
                docs: adminUsers,
                pageInfo: {
                    totalItems,
                    current: Number(current) || 1,
                    pageSize: Number(pageSize) || 10
                }
            };

            res.send(siteFunc.renderApiData(res, 200, 'adminUser', renderData, 'getlist'))

        } catch (err) {

            res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))

        }
    }

    async loginAction(req, res, next) {
        const systemConfigs = await SystemConfigModel.find({});
        const { siteName, siteEmail, siteDomain, showImgCode } = systemConfigs[0];
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            let {
                userName,
                password
            } = fields;

            try {
                let errMsg = '';
                if (!validatorUtil.checkUserName(fields.userName)) {
                    errMsg = res.__("validate_inputCorrect", { label: res.__("label_user_userName") })
                }

                if (showImgCode && (!fields.code || fields.code != req.session.imageCode)) {
                    errMsg = res.__("validate_inputCorrect", { label: res.__("label_user_imageCode") })
                }

                if (errMsg) {
                    throw new siteFunc.UserException(errMsg);
                }
            } catch (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'checkform'));
            }

            const userObj = {
                userName: fields.userName,
                password: fields.password
            }
            try {
                let user = await AdminUserModel.findOne(userObj).populate([{
                    path: 'group',
                    select: 'power _id enable name'
                }]).exec();
                if (user) {
                    if (!user.enable) {
                        throw new siteFunc.UserException(res.__("validate_user_forbiden"));
                    }
                    req.session.adminPower = user.group.power;
                    req.session.adminlogined = true;
                    req.session.adminUserInfo = user;

                    // 记录登录日志
                    let clientIp = req.headers['x-forwarded-for'] ||
                        req.connection.remoteAddress ||
                        req.socket.remoteAddress ||
                        req.connection.socket.remoteAddress;
                    let loginLog = new SystemOptionLogModel();
                    loginLog.type = 'login';
                    loginLog.logs = req.session.adminUserInfo.userName + ' 登录，IP:' + clientIp;
                    await loginLog.save();

                    // 站点认证
                    if (validatorUtil.checkUrl(req.headers.host) && !req.session.adminUserInfo.auth) {

                        let authParams = {
                            domain: req.headers.host,
                            ipAddress: clientIp,
                            version: pkgInfo.version,
                            siteName,
                            siteEmail,
                            siteDomain
                        };
                        try {
                            let writeState = await axios.post(settings.DORACMSAPI + '/system/checkSystemInfo', authParams);
                            if (writeState.status == 200 && writeState.data == 'success') {
                                await AdminUserModel.update({ '_id': req.session.adminUserInfo._id }, { $set: { auth: true } })
                            }
                        } catch (authError) {

                            res.send(siteFunc.renderApiData(res, 200, 'adminUser', { adminPower: req.session.adminPower }, 'getlist'))

                        }
                    }

                    res.send(siteFunc.renderApiData(res, 200, 'adminUser', { adminPower: req.session.adminPower }, 'getlist'))

                } else {


                    res.send(siteFunc.renderApiErr(req, res, 500, res.__("validate_login_notSuccess"), 'save'));
                }

            } catch (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err));
            }
        })
    }

}

module.exports = new AdminUser();