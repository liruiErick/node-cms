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
    /*async addRestaurant(req, res, next) {
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
    }*/

    //添加商铺
    async addRestaurant(req, res, next){
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            try{
                if (!fields.name) {
                    throw new Error('必须填写商店名称');
                }else if(!fields.address){
                    throw new Error('必须填写商店地址');
                }else if(!fields.phone){
                    throw new Error('必须填写联系电话');
                }else if(!fields.image_path){
                    throw new Error('必须上传商铺图片');
                }else if(!fields.category){
                    throw new Error('必须上传食品种类');
                }
            }catch(err){
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'checkform'))
            }
            const exists = await ShopModel.findOne({name: fields.name});
            if (exists) {
                res.send(siteFunc.renderApiErr(req, res, 500, err, 'exists'))
                return
            }
            const opening_hours = fields.startTime&&fields.endTime? fields.startTime + '/' + fields.endTime : "8:30/20:30";
            const newShop = {
                name: fields.name,
                address: fields.address,
                addressTotal: fields.addressTotal,
                description: fields.description || '',
                float_delivery_fee: fields.float_delivery_fee || 0,
                float_minimum_order_amount: fields.float_minimum_order_amount || 0,
                id: (new Date()).getTime(),
                is_premium: fields.is_premium || false,
                is_new: fields.new || false,
                latitude: '',
                longitude: '',
                location: [],
                opening_hours: [opening_hours],
                phone: fields.phone,
                promotion_info: fields.promotion_info || "欢迎光临，用餐高峰请提前下单，谢谢",
                rating: (4 + Math.random()).toFixed(1),
                rating_count: Math.ceil(Math.random()*1000),
                recent_order_num: Math.ceil(Math.random()*1000),
                status: Math.round(Math.random()),
                image_path: fields.image_path,
                category: fields.category,
                piecewise_agent_fee: {
                    tips: "配送费约¥" + (fields.float_delivery_fee || 0),
                },
                activities: [],
                supports: [],
                license: {
                    business_license_image: fields.business_license_image || [],
                    catering_service_license_image: fields.catering_service_license_image || [],
                },
                identification: {
                    company_name: "",
                    identificate_agency: "",
                    identificate_date: "",
                    legal_person: "",
                    licenses_date: "",
                    licenses_number: "",
                    licenses_scope: "",
                    operation_period: "",
                    registered_address: "",
                    registered_number: "",
                }
            }
            //配送方式
            if (fields.delivery_mode) {
                Object.assign(newShop, {delivery_mode: {
                    color: "57A9FF",
                    id: 1,
                    is_solid: true,
                    text: "蜂鸟专送"
                }})
            }
            //商店支持的活动
            fields.activities.forEach((item, index) => {
                switch(item.icon_name){
                    case '减':
                        item.icon_color = 'f07373';
                        item.id = index + 1;
                        break;
                    case '特':
                        item.icon_color = 'EDC123';
                        item.id = index + 1;
                        break;
                    case '新':
                        item.icon_color = '70bc46';
                        item.id = index + 1;
                        break;
                    case '领':
                        item.icon_color = 'E3EE0D';
                        item.id = index + 1;
                        break;
                }
                newShop.activities.push(item);
            })
            if (fields.bao) {
                newShop.supports.push({
                    description: "已加入“外卖保”计划，食品安全有保障",
                    icon_color: "999999",
                    icon_name: "保",
                    id: 7,
                    name: "外卖保"
                })
            }
            if (fields.zhun) {
                newShop.supports.push({
                    description: "准时必达，超时秒赔",
                    icon_color: "57A9FF",
                    icon_name: "准",
                    id: 9,
                    name: "准时达"
                })
            }
            if (fields.piao) {
                newShop.supports.push({
                    description: "该商家支持开发票，请在下单时填写好发票抬头",
                    icon_color: "999999",
                    icon_name: "票",
                    id: 4,
                    name: "开发票"
                })
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
            const {name, address, addressTotals, description, phone, id, image_path} = fields;
            let addressTotal = Array.isArray(fields.addressTotal)?fields.addressTotal.join('/'):fields.addressTotal;
            let category = Array.isArray(fields.category)?fields.category.join('/'):fields.category;
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
                let newData = {name, address, addressTotal, addressTotals, description, phone, category, image_path}
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
