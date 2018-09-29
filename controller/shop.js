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

    //添加餐馆
    async addRestaurant(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'reqError'))
                return
            }
            const {name, address, addressTotal, description, phone, category, image_path} = fields;
            try {
                if (!name) {
                    throw new Error('餐馆名称不能为空');
                } else if (!address) {
                    throw new Error('餐馆详细地址不能为空');
                } else if (!addressTotal) {
                    throw new Error('餐馆地址不能为空');
                } else if (!description) {
                    throw new Error('餐馆描述不能为空');
                } else if (!phone) {
                    throw new Error('餐馆联系电话不能为空');
                } else if (!category) {
                    throw new Error('餐馆分类不能为空');
                } else if (!image_path) {
                    throw new Error('餐馆图片地址不能为空');
                }
            } catch (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'checkform'))
            }
            const exists = await ShopModel.findOne({name: name});
            if (exists) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'exists'))
                return
            }
            const newShop = {
                name: fields.name,
                address: fields.address,
                id: (new Date()).getTime(),
                description: fields.description || '',
                phone: fields.phone,
                rating: (4 + Math.random()).toFixed(1),
                recent_order_num: Math.ceil(Math.random() * 1000),
                image_path: fields.image_path,
                category: fields.category,
                addressTotal: fields.addressTotal
            }
            try {
                //保存数据，并增加对应食品种类的数量
                const shop = new ShopModel(newShop);
                await shop.save();
                res.send(siteFunc.renderApiData(res, 200, 'restaurant', {id: shop._id}, 'save'))
            } catch (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'save'));
            }
        })
    }

    //更新餐馆
    async updateRestaurant(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'reqError'))
                return
            }
            const {name, address, addressTotal, description, phone, category, id, image_path} = fields;
            try {
                if (!name) {
                    throw new Error('餐馆名称不能为空');
                } else if (!address) {
                    throw new Error('餐馆详细地址不能为空');
                } else if (!addressTotal) {
                    throw new Error('餐馆地址不能为空');
                } else if (!description) {
                    throw new Error('餐馆描述不能为空');
                } else if (!phone) {
                    throw new Error('餐馆联系电话不能为空');
                } else if (!category) {
                    throw new Error('餐馆分类不能为空');
                } else if (!id || !Number(id)) {
                    throw new Error('餐馆ID不能为空');
                } else if (!image_path) {
                    throw new Error('餐馆图片地址不能为空');
                }
                let newData = {name, address, addressTotal, description, phone, category, image_path}
                const restuantsData = await ShopModel.findOneAndUpdate({id}, {$set: newData});
                let renderData = siteFunc.renderApiData(res, 200, 'ads', restuantsData, 'getlist')
                res.send(renderData);
            } catch (err) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'save'));
            }
        })
    }

    //删除餐馆
    async delRestaurant(req, res, next){
        try {
            let errMsg = '';
            if (!siteFunc.checkCurrentId(req.query.ids)) {
                errMsg = res.__("validate_error_params");
            }
            if (errMsg) {
                throw new siteFunc.UserException(errMsg);
            }
            await ShopModel.remove({
                _id: req.query.ids
            });
            console.log('aaaaaaaaaaaaaaaaaaa')
            res.send(siteFunc.renderApiData(res, 200, 'restaurant', {}, 'delete'))
        } catch (err) {
            res.send(siteFunc.renderApiErr(req, res, 500, err, 'delete'));
        }
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
}

module.exports = new Shop()
