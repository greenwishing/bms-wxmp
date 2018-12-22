// pages/billing/list.js
var app = getApp();
var _ = app.util;
Page({
  data: {
    searchbarShowed: false,
    searchText: "",
    paging: null
  },
  onReady: function () {
    this.queryBilling();
  },
  queryBilling: function(data){
    if (!data) data = { currentPage: 1 };
    data.userGuid = app.userGuid;
    _.ajax({
      url: 'billingdata',
      data: data,
      success: function (result) {
        this.renderPaging(result.paging);
      },
      loadingText: '加载中'
    }, this);
  },
  renderPaging: function(paging) {
    this.searchText = paging.key;
    this.setData({
      paging: paging
    });
  },
  showSearchInput: function () {
    this.setData({
      searchbarShowed: true
    });
  },
  hideSearchInput: function () {
    this.setData({
      searchText: "",
      searchbarShowed: false
    });
    this.queryBilling();
  },
  clearSearchText: function () {
    this.setData({
      searchText: ""
    });
  },
  doSearch: function(e) {
    this.queryBilling({ key: e.detail.value });
  },
  previousPage: function() {
    var paging = this.data.paging;
    if (paging.hasPreviousPage) {
      var data = { currentPage: paging.currentPage - 1 };
      var key = this.data.searchText;
      if (key && key.length) {
        data.key = key;
      }
      this.queryBilling(data);
    }
  },
  nextPage: function () {
    var paging = this.data.paging;
    if (paging.hasNextPage) {
      var data = { currentPage: paging.currentPage + 1 };
      var key = this.data.searchText;
      if (key && key.length) {
        data.key = key;
      }
      this.queryBilling(data);
    }
  }
})