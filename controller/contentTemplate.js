const ContentTemplateModel = require("../models").ContentTemplate;
const TemplateItemsModel = require("../models").TemplateItems;
const formidable = require('formidable');


class ContentTemplate {
    constructor() {
    }

    async getMyTemplateList(req, res, next) {
        try {
            let temps = await ContentTemplateModel.find({}).populate('items').exec();
            res.send(renderData);
        } catch (err) {
            res.send({
                name: 'ERROR_DATA',
                message: '获取数据失败',
            });
        }
    }

    async getCurrentTempInfo(req, res, next) {
        try {
            let defaultTemp = await getDefaultTempInfo();
            res.send(defaultTemp);
        } catch (err) {
            res.send({
                name: 'ERROR_DATA',
                message: '获取数据失败',
            });
        }
    }


    async getContentDefaultTemplate(req, res, next) {
        try {
            let defaultTemp = await ContentTemplateModel.findOne({ 'using': true }).populate('items').exec();
            res.send({ docs: defaultTemp.alias });
        } catch (err) {
            res.send({
                name: 'ERROR_DATA',
                message: '获取数据失败',
            });
        }
    }

    async getFileInfo(req, res, next) {
        let filePath = req.query.filePath;
        res.send({ path: filePath });
    }

    async updateFileInfo(req, res, next) {
        res.send({
            name: 'SUCCESS_DATA',
            message: '操作成功'
        });
    }

    async getTempItemForderList(req, res, next) {
        let defaultTemp = await getDefaultTempInfo();
        res.send(defaultTemp.alias);
    }

    async addTemplateItem(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            const tempItemObj = {
                name: fields.name,
                forder: fields.forder,
                isDefault: fields.isDefault,
                comments: fields.comments
            }

            const newContentTemplateItems = new TemplateItemsModel(tempItemObj);
            try {
                await newContentTemplateItems.save();
                let defaultTemp = await getDefaultTempInfo();
                await ContentTemplateModel.findOneAndUpdate({ _id: defaultTemp._id }, { '$push': { items: newContentTemplateItems._id } });
                res.send({
                    name: 'SUCCESS_DATA',
                    message: '操作成功'
                });
            } catch (err) {
                res.send({
                    name: 'ERROR_DATA',
                    message: '获取数据失败',
                });
            }
        })
    }

    async delTemplateItem(req, res, next) {
        try {
            let defaultTemp = await getDefaultTempInfo();
            await ContentTemplateModel.findOneAndUpdate({ _id: defaultTemp._id }, { '$pull': { items: req.query.ids } });
            await TemplateItemsModel.remove({ _id: req.query.ids });
            res.send({
                name: 'SUCCESS_DATA',
                message: '操作成功'
            });
        } catch (err) {
            res.send({
                name: 'ERROR_DATA',
                message: '获取数据失败',
            });
        }
    }

    async getTempsFromShop(req, res, next) {
        let current = req.query.current || 1;
        let pageSize = req.query.limit || 10;
        let linkParams = `?limit=${pageSize}&currentPage=${current}`;
        res.send(linkParams.data);
    }

    async installTemp(req, res, next) {
        res.send({
            name: 'SUCCESS_DATA',
            message: '操作成功'
        });
    }

    async enableTemp(req, res, next) {
        var tempId = req.query.tempId;
        res.send({
            name: 'SUCCESS_DATA',
            message: '操作成功'
        });
    }

    async uninstallTemp(req, res, next) {
        res.send({
            name: 'SUCCESS_DATA',
            message: '操作成功'
        });
    }
}

module.exports = new ContentTemplate();