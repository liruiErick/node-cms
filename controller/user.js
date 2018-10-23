const UserModel = require("../models").User;
const formidable = require('formidable');
const {service, validatorUtil, siteFunc} = require('../utils');
const settings = require('../config/default');
const _ = require('lodash')
const svgCaptcha = require('svg-captcha')

class User {
  constructor() {
  }

  async getImgCode(req, res) {
    const captcha = svgCaptcha.create()
    req.session.imageCode = captcha.text
    res.send(captcha);
  }

  async loginAction(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      try {
        let newPsd = service.encrypt(fields.password, settings.encrypt_key);
        let errMsg = '';
        if (!validatorUtil.checkEmail(fields.email)) {
          errMsg = res.__("validate_inputCorrect", {label: res.__("label_user_email")})
        } else if (!validatorUtil.checkPwd(fields.password)) {
          errMsg = res.__("validate_inputCorrect", {label: res.__("label_user_password")})
        }
        if (errMsg) {
          throw new siteFunc.UserException(errMsg);
        }
      } catch (err) {
        console.log(err.message, err);
        res.send(siteFunc.renderApiErr(req, res, 500, err, 'checkform'));
      }
      const userObj = {
        email: fields.email,
        password: service.encrypt(fields.password, settings.encrypt_key),
      }
      try {
        let user = await UserModel.findOne(userObj);
        if (user) {
          if (!user.enable) {
            res.send(siteFunc.renderApiErr(req, res, 500, res.__("validate_user_forbiden")))
          }
          // 将cookie存入缓存
          let auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
          res.cookie(settings.session.name, auth_token,
            {path: '/', maxAge: 1000 * 60 * 60 * 24 * 30, signed: true, httpOnly: true}); //cookie 有效期30天
          let renderUser = JSON.parse(JSON.stringify(user));
          delete renderUser.password;
          let reSendData = siteFunc.renderApiData(res, 200, res.__("validate_user_loginOk"), renderUser);
          res.send(reSendData);
        } else {

          res.send(siteFunc.renderApiErr(req, res, 500, res.__("validate_login_notSuccess")))
        }
      } catch (err) {
        res.send(siteFunc.renderApiErr(req, res, 500, err));
      }

    })
  }

  async logOut(req, res, next) {
    req.session.destroy();
    res.clearCookie(settings.session.name, {path: '/'});
    res.send(siteFunc.renderApiData(res, 200, res.__("validate_user_logoutOk")));
  }

}

module.exports = new User();