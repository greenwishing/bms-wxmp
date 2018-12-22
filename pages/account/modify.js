// pages/account/modify.js
var app = getApp();
var _ = app.util;
Page({

  data: {
    account: ''
  },
  onLoad: function (options) {

  },
  onReady: function () {
    var account = app.userAccount;
    if (account && account.indexOf(app.openidPrefix) === -1) {
      this.setData({ account: account });
    }
  },
  doModifyAccount: function (e) {
    var data = this.data, form = e.detail.value;
    var params = {
      userGuid: app.userGuid,
      account: form.account,
      password: form.password
    };
    _.ajax({
      url: 'account',
      data: params,
      success: function (result) {
        wx.showToast({
          title: '修改成功！',
          success: function () {
            wx.navigateBack();
          }
        })
      },
      loadingText: '请稍后'
    }, this);
  }
})