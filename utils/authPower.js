const _ = require('lodash');
const AdminResourceModel = require("../models").AdminResource;
module.exports = (req, res, next) => {
    AdminResourceModel.find({type: '1'}, "_id api").sort({sortId: 1}).then((resouce) => {
        let hasPower = false;
        for (let i = 0; i < resouce.length; i++) {
            let resourceObj = resouce[i];
            let targetApi = (req.originalUrl).replace('/manage/', '').split("?")[0];
            if (!_.isEmpty(req.session.adminUserInfo)) {
                let adminPower = req.session.adminPower;
                if (resourceObj.api === targetApi && adminPower && adminPower.indexOf(resourceObj._id) > -1) {
                    hasPower = true;
                    break;
                }
            } else {
                break;
            }
        }
        if (!hasPower) {
            res.send({
                status: 500,
                message: res.__('label_systemnotice_nopower'),
                type:false
            });
        } else {
            return next();
        }
    })

}