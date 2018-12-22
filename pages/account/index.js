// pages/help/index.js
var app = getApp();
var _ = app.util;
Page({
  data: {
    account: '未设置'
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    var account = app.userAccount;
    if (account && account.indexOf(app.openidPrefix) === -1) {
      this.setData({account: account});
    }
  },
  modifyAccount: function(e){
    wx.navigateTo({
      url: '/pages/account/modify',
    })
  },
  comingSoon: function() {
    _.alert('此功能请设置平台帐号后在 greenwishing.cn 进行设置')
  },
  copyUrl: function(){
    wx.setClipboardData({
      data: 'https://greenwishing.cn/system/index'
    })
  },
  cleanCache: function(){
    wx.clearStorageSync();
    app.loged = false;
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }
})