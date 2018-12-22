// pages/billing/add.js
var app = getApp();
var _ = app.util;
Page({
  data: {
    pageReady:true,
    showTypePicker: false,
    type: {
      data: null,
      list: [],
      index: 0
    },
    category: {
      data: null,
      list: [],
      index: 0
    },
    subcategory: {
      data: null,
      list: [],
      index: 0
    },
    typeIndex: [0, 0, 0],
    src: {
      data: null,
      list: [],
      index: [0, 0]
    },
    target: {
      data: null,
      list: [],
      index: [0, 0]
    },
    date: null,
    time: null,

    // animation
    maskAnimation: null,
    pickerAnimation: null
  },
  onReady: function() {
    this.pageInit();
    this.setData({ pageReady: true})
  },
  onShow: function () {
    this.maskAnimation = wx.createAnimation({
      timingFunction: 'ease-in-out',
      duration: 300
    });
    this.pickerAnimation = wx.createAnimation({
      timingFunction: 'linear',
      duration: 200
    });
  },
  pageInit: function() {
    this.initPickerValue([0, 0, 0]);
    this.initAccount('src');
    this.initAccount('target');
    var date = new Date();
    this.setData({
      name: null,
      amount: null,
      remark: null,
      date: date.format('yyyy-MM-dd'),
      time: date.format('hh:mm')
    });
  },
  showTypeChooser: function (e) {
    this.setData({
      showTypePicker: true
    });
    this.maskAnimation.opacity(1).step();
    this.pickerAnimation.bottom(0).step();
    this.setData({
      maskAnimation: this.maskAnimation.export(),
      pickerAnimation: this.pickerAnimation.export()
    });
  },
  hideTypeChooser: function (e) {
    this.pickerAnimation.bottom(-260).step();
    this.maskAnimation.opacity(0).step();
    this.setData({
      pickerAnimation: this.pickerAnimation.export(),
      maskAnimation: this.maskAnimation.export()
    });
    var self = this;
    setTimeout(function(){
      self.setData({
        showTypePicker: false
      });
    }, 500);
  },
  onTypeChange: function(e) {
    this.initPickerValue(e.detail.value);
  },
  initPickerValue: function(index) {
    var typeIndex = index[0] || 0, categoryIndex = index[1] || 0, subcategoryIndex = index[2] || 0;
    var types = app.billingTypes;
    var type = types[typeIndex];
    var categories = this.children(type);
    var category = categories[_.min(categoryIndex, categories.length - 1)];
    var subcategories = this.children(category);
    var subcategory = subcategories[_.min(subcategoryIndex, subcategories.length - 1)];
    this.setData({
      type: {
        data: type,
        list: this.convert(types),
        index: typeIndex
      },
      category: {
        data: category,
        list: this.convert(categories),
        index: categoryIndex
      },
      subcategory: {
        data: subcategory,
        list: this.convert(subcategories),
        index: subcategoryIndex
      },
      typeIndex: index
    });
  },
  children: function(node){
    var children = node.children;
    if (children && children.length) {
      return children;
    }
    return [{ value: '', label: '无' }];
  },
  convert: function(nodes){
    var results = [];
    if (nodes) {
      for (var i in nodes) {
        var node = nodes[i];
        results.push({ value: node.value, label: node.label })
      }
    }
    return results;
  },
  initAccount: function (goal, detail) {
    var data = {};
    data[goal] = this.data[goal] || {};
    if (!detail) {
      detail = { column: 0, index: 0};
    }
    console.log(goal, JSON.stringify(detail))
    if (detail.column === 0) {
      var accountTypes = app.billingAccounts;
      var types = [], accounts = [], loan = this.data.type.data[goal].loan;
      for (var i in accountTypes) {
        if (accountTypes[i].loan === loan) {
          types.push(accountTypes[i]);
        }
      }
      var accountType = types[detail.index];
      accounts = accounts.concat(accountType.children);
      data[goal].index[1] = 0;
      data[goal].list = [types, accounts];
      data[goal].data = accounts[0];
    }
    data[goal].index[detail.column] = detail.index;
    this.setData(data);
    var accountIndex = data[goal].index[1];
    data[goal].data = this.data[goal].list[1][accountIndex];
  },
  onSrcAccountColumnChange: function (e) {
    this.initAccount('src', { column: e.detail.column, index: e.detail.value });
  },
  onTargetAccountColumnChange: function (e) {
    this.initAccount('target', { column: e.detail.column, index: e.detail.value });
  },
  onDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },
  onTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
  },
  submitBilling: function(e){
    var data = this.data, form = e.detail.value;
    var params = {
      userGuid: app.userGuid,
      name: form.name,
      amount: form.amount,
      description: form.remark
    };
    var type = data.type.data || { value: '' };
    var category = data.category.data || { value: '' };
    var subcategory = data.subcategory.data || { value: '' };
    params.type = type.value;
    params.categoryGuid = category.value;
    params.subcategoryGuid = subcategory.value;
    if (type.src.enabled) {
      var srcAccount = data.src.data;
      params.srcAccountGuid = srcAccount.value;
    }
    if (type.target.enabled) {
      var targetAccount = data.target.data || { value: '' };
      params.targetAccountGuid = targetAccount.value;
    }
    params.occurredTime = data.date + ' ' + data.time;
    var self = this;
    _.ajax({
      url: 'addbilling',
      data: params,
      success: function(result) {
        wx.showToast({
          title: '保存成功！',
          success: function(){
            self.pageInit();
          }
        })
      },
      loadingText: '保存中...'
    }, this);
  }
});