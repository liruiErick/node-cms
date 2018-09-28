'use strict';
const CategoryModel = require("../models").Category;
const { siteFunc } = require('../utils');
class Category {
	constructor(){
	}
	//获取所有餐馆分类和数量
	async getCategories(req, res, next){
		try{
			const categories = await CategoryModel.find().exec();
            let renderData = siteFunc.renderApiData(res, 200, 'ads', categories, 'getlist')
            res.send(renderData);
		} catch (err) {
            res.send(siteFunc.renderApiErr(req, res, 500, err, 'getlist'))
        }
	}
}

module.exports = new Category()