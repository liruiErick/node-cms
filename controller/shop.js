'use strict';
const ShopModel = require("../models").Shop;
const { siteFunc } = require('../utils');
const validator = require('validator')

function checkFormData(req, res, fields) {
    let errMsg = '';
    if (fields._id && !siteFunc.checkCurrentId(fields._id)) {
        errMsg = res.__("validate_error_params");
    }
    if (!validator.isLength(fields.name, 2, 15)) {
        errMsg = res.__("validate_rangelength", { min: 2, max: 15, label: res.__("label_ads_name") });
    }
    if (!validator.isLength(fields.comments, 5, 30)) {
        errMsg = res.__("validate_rangelength", { min: 5, max: 30, label: res.__("label_comments") });
    }
    if (errMsg) {
        throw new siteFunc.UserException(errMsg);
    }
}

class Shop {
    constructor() {
    }
    //获取餐馆列表
    async getRestaurants(req, res, next){
        try {
            let current = req.query.current || 1;
            let pageSize = req.query.pageSize || 10;
            const restuants = await ShopModel.find().sort({ id: -1 }).skip(Number(pageSize) * (Number(current) - 1)).limit(Number(pageSize)).exec();
            const totalItems = await ShopModel.count();
            let restuantsData = {
                docs: restuants,
                pageInfo: {
                    totalItems,
                    current: Number(current) || 1,
                    pageSize: Number(pageSize) || 10
                }
            };
            let renderData = siteFunc.renderApiData(res, 200, 'ads', restuantsData, 'getlist')
            res.send(renderData);
        } catch (err) {
            res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))
        }
    }
}
module.exports = new Shop()
