// pages/index/init.js
var app = getApp();
var _ = app.util;
Page({
  data: {

  },
  onReady: function () {
  },
  getUserInfo: function (e) {
    var data = e.detail;
    if ('getUserInfo:ok' === data.errMsg) {
      var userInfo = data.userInfo;
      wx.login({
        success: function (res) {
          userInfo.code = res.code;
          app.register(userInfo, function () {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, app);
        }
      });
    } else {
      _.alert('获取信息失败:' + data.errMsg);
    }
  }
})