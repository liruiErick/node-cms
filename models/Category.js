'use strict';

import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const categorySchema = new Schema({
	count: Number,
	id: Number,
	ids: [],
	image_url: String,
	level: Number,
	name: String,
	sub_categories: [
		{
			count: Number,
			id: Number,
			image_url: String,
			level: Number,
			name: String
		},
	]
});
const Category = mongoose.model('Category', categorySchema)
module.exports = Category