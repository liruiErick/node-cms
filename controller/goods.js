'use strict';

import {Food as FoodModel, Menu as MenuModel} from '../models/Goods'
const {siteFunc} = require('../utils');

class Goods {
    constructor() {
    }

    //获取商品列表
    async getGoods(req, res, next) {
        try {
            let current = req.query.current || 1;
            let pageSize = req.query.pageSize || 10;
            const goods = await FoodModel.find().sort({id: -1}).skip(Number(pageSize) * (Number(current) - 1)).limit(Number(pageSize)).exec();
            const totalItems = await FoodModel.count();
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
}

module.exports = new Goods()