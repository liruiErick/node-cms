'use strict';

import Food from '../models/Goods'
const {siteFunc} = require('../utils');

class Goods {
    constructor() {
    }

    //获取商品列表
    async getGoods(req, res, next) {
        try {
            let current = req.query.current || 1;
            let pageSize = req.query.pageSize || 10;
            const goods = await Food.find().sort({id: -1}).skip(Number(pageSize) * (Number(current) - 1)).populate('shop').limit(Number(pageSize)).exec();
            const totalItems = await Food.count();
            let goodsData = {
                docs: goods,
                pageInfo: {
                    totalItems,
                    current: Number(current) || 1,
                    pageSize: Number(pageSize) || 10
                }
            };
            let renderData = siteFunc.renderApiData(res, 200, 'ads', goodsData, 'getlist')
            res.send(renderData);
        } catch (err) {
            res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))
        }
    }
    //添加商品
    // async addFood(req, res, next){
    //     const form = new formidable.IncomingForm();
    //     form.parse(req, async (err, fields, files) => {
    //         try{
    //             if (!fields.name) {
    //                 throw new Error('必须填写食品名称');
    //             }else if(!fields.image_path){
    //                 throw new Error('必须上传食品图片');
    //             }else if(!fields.specs.length){
    //                 throw new Error('至少填写一种规格');
    //             }
    //         }catch(err){
    //             res.send(siteFunc.renderApiErr(req, res, 500, err, 'checkform'))
    //         }
    //         let restaurant;
    //         try{
    //             restaurant = await Shop.findOne({id: fields.restaurant_id});
    //         }catch(err){
    //             res.send(siteFunc.renderApiErr(req, res, 500, err, 'checkform'))
    //         }
    //         let item_id = (new Date()).getTime();
    //         const rating_count = Math.ceil(Math.random()*1000);
    //         const month_sales = Math.ceil(Math.random()*1000);
    //         const tips = rating_count + "评价 月售" + month_sales + "份";
    //         const newFood = {
    //             name: fields.name,
    //             description: fields.description,
    //             image_path: fields.image_path,
    //             activity: null,
    //             attributes: [],
    //             restaurant_id: fields.restaurant_id,
    //             category_id: fields.category_id,
    //             satisfy_rate: Math.ceil(Math.random()*100),
    //             satisfy_count: Math.ceil(Math.random()*1000),
    //             item_id,
    //             rating: (4 + Math.random()).toFixed(1),
    //             rating_count,
    //             month_sales,
    //             tips,
    //             specfoods: [],
    //             specifications: [],
    //         }
    //         if (fields.activity) {
    //             newFood.activity = {
    //                 image_text_color: 'f1884f',
    //                 icon_color: 'f07373',
    //                 image_text: fields.activity,
    //             }
    //         }
    //         if (fields.attributes.length) {
    //             fields.attributes.forEach(item => {
    //                 let attr;
    //                 switch(item){
    //                     case '新':
    //                         attr = {
    //                             icon_color: '5ec452',
    //                             icon_name: '新'
    //                         }
    //                         break;
    //                     case '招牌':
    //                         attr = {
    //                             icon_color: 'f07373',
    //                             icon_name: '招牌'
    //                         }
    //                         break;
    //                 }
    //                 newFood.attributes.push(attr);
    //             })
    //         }
    //         try{
    //             const [specfoods, specifications] = await this.getSpecfoods(fields, item_id);
    //             newFood.specfoods = specfoods;
    //             newFood.specifications = specifications;
    //         }catch(err){
    //         }
    //         try{
    //             const foodEntity = await Food.create(newFood);
    //         }catch(err){
    //         }
    //     })
    // }
}

module.exports = new Goods()