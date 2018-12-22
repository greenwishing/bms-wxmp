// pages/index/index.js
var app = getApp();
var _ = app.util;
var Chart = require('../../utils/chart.js');
Page({
  data: {
    pageReady: false,
    showNearest: false,
    showStatistics: false,
    statisticsTitle: '',
    dateType: {
      list: [
        { label: '按天', value: 'days' },
        { label: '按周', value: 'weeks' },
        { label: '按月', value: 'months' },
        { label: '按年', value: 'years' }
      ],
      index: 2
    },
    nearestType: {
      list: [{ label: '请选择', value: '' }],
      index: 0
    },
    statisticsType: {
      list: [{ label: '请选择', value: '' }],
      index: 0
    },
    pieChartStyle: '',
    pieChartText: ''
  },
  onReady: function () {
    console.log('index ready')
    if (!app.loged) {
      app.login(function () {
        this.prepareData();
      }, this);
    } else {
      this.prepareData();
    }
  },
  onShow: function () {
    if (!app.loged) return;
    this.initPage();
  },
  prepareData: function(){
    console.log('index init')
    this.setData({
      userInfo: app.userInfo,
      nearestType: {
        list: app.billingTypes,
        index: 0
      },
      statisticsType: {
        list: app.billingTypes,
        index: 0
      }
    });
    this.initPage();
  },
  initPage: function () {
    this.width = wx.getSystemInfoSync().windowWidth - 30;
    this.userGuid = app.userGuid;
    this.offset = 0;
    this.loadBillingNearest();
    this.loadBillingStatistics();
  },
  onDateTypeChange: function (e) {
    this.data.dateType.index = e.detail.value;
    this.setData(this.data);
    this.offset = 0;
    this.loadBillingStatistics();
  },
  onNearestTypeChange: function (e) {
    this.data.nearestType.index = e.detail.value;
    this.setData(this.data);
    this.loadBillingNearest();
  },
  onStatisticsTypeChange: function (e) {
    this.data.statisticsType.index = e.detail.value;
    this.setData(this.data);
    this.loadBillingStatistics();
  },
  loadBillingNearest: function () {
    var typeData = this.data.nearestType;
    var typeValue = typeData.list[typeData.index].value;
    _.ajax({
      type: 'post',
      url: 'nearest',
      data: { userGuid: this.userGuid, size: 6, type: typeValue },
      success: function (result) {
        this.renderBillingNearest(result.series[0]);
      }
    }, this);
  },
  renderBillingNearest: function (series) {
    var data = series.data;
    if (data.length === 0) {
      this.setData({ showNearest: false });
      return;
    }
    this.setData({ showNearest: true });
    var categories = [], list = []
    for (var i in data) {
      var item = data[i];
      categories.push(item.name);
      list.push(item.y);
    }
    var chartData = {
      categories: categories,
      series: [{
        name: '金额',
        data: list
      }]
    };
    if (this.nearestChart) {
      this.nearestChart.updateData(chartData)
    } else {
      chartData.width = this.width;
      this.nearestChart = new Chart({
        canvasId: 'nearest',
        type: 'line',
        width: this.width,
        height: 230,
        extra: {
          lineStyle: 'curve'
        },
        categories: categories,
        series: [{
          name: '金额',
          data: list
        }],
        yAxis: {
          name: '金额',
          min: 0,
          format: function (value) {
            return value > 1000 ? (value / 1000.0) + 'k' : value;
          }
        }
      });
    }
  }, 
  onBillingNearestTouch: function(e) {
    this.nearestChart.showToolTip(e);
  },
  loadBillingStatistics: function () {
    var typeData = this.data.statisticsType;
    var typeValue = typeData.list[typeData.index].value;
    var today = new Date(), dateType = this.data.dateType, dateTypeValue = dateType.list[dateType.index].value;
    var dateFrom = today.clone().add(this.offset, dateTypeValue).startOf(dateTypeValue).format('yyyy-MM-dd');
    var dateTo = today.clone().add(this.offset, dateTypeValue).endOf(dateTypeValue).format('yyyy-MM-dd');
    this.setData({ statisticsTitle: dateFrom + '~' + dateTo });
    _.ajax({
      type: 'post',
      url: 'statistics',
      data: { userGuid: this.userGuid, type: typeValue, from: dateFrom, to: dateTo },
      success: function (result) {
        this.renderBillingStatistics(result.data);
      }
    }, this);
  },
  renderBillingStatistics: function (data) {
    if (data.length === 0) {
      this.setData({ showStatistics: false });
      return;
    }
    this.setData({ showStatistics: true });
    var list = {};
    for (var i in data) {
      var item = data[i], name = item.category;
      list[name] = (list[name] || 0) + item.amount;
    }
    var series = [];
    for (var category in list) {
      series.push({
        name: category,
        data: list[category]
      });
    }
    series.sort(function (a, b) {
      return b.data - a.data;
    });
    if (this.statisticsChart) {
      this.statisticsChart.updateData({ series: series });
    } else {
      var self = this;
      this.statisticsChart = new Chart({
        canvasId: 'billing-statistics',
        type: 'pie',
        width: this.width,
        height: 260,
        series: series,
        dataLabel: true,
        legend: false,
        onPieTouch: function (series){
          self.setData({
             pieChartText: series.name + ' ' + series.data + '元', 
             pieChartStyle: 'color: ' + series.color
          });
        }
      });
    }
  },
  onBillingStatisticsTouch: function (e) {
    this.statisticsChart.showToolTip(e);
  },
  decrementOffset: function () {
    this.offset -= 1;
    this.loadBillingStatistics();

  },
  incrementOffset: function () {
    if (this.offset === 0) {
      return;
    }
    this.offset += 1;
    this.loadBillingStatistics();
  }
})
