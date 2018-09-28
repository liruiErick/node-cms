'use strict';
const ShopModel = require("../models").Shop;
const {siteFunc} = require('../utils');
const validator = require('validator')
const formidable = require('formidable');

function checkFormData(req, res, fields) {
    let errMsg = '';
    if (fields._id && !siteFunc.checkCurrentId(fields._id)) {
        errMsg = res.__("validate_error_params");
    }
    if (!validator.isLength(fields.name, 2, 15)) {
        errMsg = res.__("validate_rangelength", {min: 2, max: 15, label: res.__("label_ads_name")});
    }
    if (!validator.isLength(fields.comments, 5, 30)) {
        errMsg = res.__("validate_rangelength", {min: 5, max: 30, label: res.__("label_comments")});
    }
    if (errMsg) {
        throw new siteFunc.UserException(errMsg);
    }
}

class Shop {
    constructor() {
    }

    //获取餐馆列表
    async getRestaurants(req, res, next) {
        try {
            let current = req.query.current || 1;
            let pageSize = req.query.pageSize || 10;
            const restuants = await ShopModel.find().sort({id: -1}).skip(Number(pageSize) * (Number(current) - 1)).limit(Number(pageSize)).exec();
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

    //更新餐馆信息
    async updateRestaurant(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))
                return
            }
            const {name, address, addressTotal, description = "", phone, category, id, image_path} = fields;
            console.log(fields)
            try {
                if (!name) {
                    throw new Error('餐馆名称不能为空');
                } else if (!address) {
                    throw new Error('餐馆详细地址不能为空');
                } else if (!addressTotal) {
                    throw new Error('餐馆地址不能为空');
                } else if (!phone) {
                    throw new Error('餐馆联系电话不能为空');
                } else if (!category) {
                    throw new Error('餐馆分类不能为空');
                } else if (!id || !Number(id)) {
                    throw new Error('餐馆ID不能为空');
                } else if (!image_path) {
                    throw new Error('餐馆图片地址不能为空');
                }
                let newData = {name, address, description, phone, category, image_path}
                 const restuantsData = await ShopModel.findOneAndUpdate({id}, {$set: newData});
                let renderData = siteFunc.renderApiData(res, 200, 'ads', restuantsData, 'getlist')
                res.send(renderData);
            } catch (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))
            }
        })
    }
}

module.exports = new Shop()
