// app.js
var _ = require('utils/util.js');
App({
  version: '1.0.0',
  loged: false,
  util: _,
  openid: null,
  userInfo: null,
  userGuid: null,
  billingTypes: [],
  billingAccounts: [],
  articleCategories: [],

  onLaunch: function () {
    console.log('app launch');
  },
  register: function (data, callback, context) {
    _.ajax({
      url: 'register',
      data: data,
      success: function (result) {
        this.loged = true;
        this.openid = result.openid;
        this.userGuid = result.userGuid;
        this.userAccount = result.openid;
        wx.setStorageSync('openid', this.openid);
        this.initAppData(callback, context);
      },
      loadingText: '正在验证身份'
    }, this);
  },
  login: function (callback, context) {
    var openid = wx.getStorageSync('openid');
    if (_.isEmpty(openid)) {
      wx.redirectTo({
        url: '/pages/index/init',
      });
      return;
    }
    _.ajax({
      url: 'login',
      data: { openid: openid },
      success: function (result) {
        if (result.success) {
          this.loged = true;
          this.openid = openid;
          this.userGuid = result.userGuid;
          this.userAccount = result.userAccount;
          this.initAppData(callback, context);
        } else {
          _.alert(result.message);
          wx.removeStorageSync('openid');
        }
      },
      loadingText: '正在验证身份'
    }, this);
  },
  initAppData: function (callback, context) {
    this.checkUpdate(function (result) {
      if (result.update) {
        this.syncAppData(callback, context);
      } else {
        callback.apply(context || this, arguments);
      }
    }, this);
  },
  checkUpdate: function(callback, context) {
    _.ajax({
      url: 'checkupdate',
      data: { version: '1.0.0' },
      success: function (result) {
        if (typeof callback === 'function') {
          callback.apply(context || this, arguments);
        }
      }
    }, this);
  },
  syncAppData: function (callback, context) {
    _.ajax({
      url: 'data',
      data: { userGuid: this.userGuid },
      success: function (result) {
        this.billingTypes = result.billingTypes;
        this.billingAccounts = result.billingAccounts;
        this.articleCategories = result.articleCategories;
        callback.apply(context || this, arguments);
      },
      loadingText: '正在同步数据'
    }, this);
  },
  openidPrefix: 'oTzMa0'
})