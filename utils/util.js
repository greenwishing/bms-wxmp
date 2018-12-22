
const BASE_URL = 'https://greenwishing.cn';
// const BASE_URL = 'http://localhost:8086';
const URI_PREFIX = '/api/weixin/weapp/';

const DATE_MAP = {
  milliseconds: { get: 'getMilliseconds', set: 'setMilliseconds' },
  seconds: { get: 'getSeconds', set: 'setSeconds' },
  minutes: { get: 'getMinutes', set: 'setMinutes' },
  hours: { get: 'getHours', set: 'setHours' },
  days: { get: 'getDate', set: 'setDate' },
  weeks: { get: 'getDate', set: 'setDate', times: 7 },
  months: { get: 'getMonth', set: 'setMonth' },
  years: { get: 'getFullYear', set: 'setFullYear' }
};

Date.prototype.clone = function () {
  return new Date(this.getTime());
};

Date.prototype.format = function (format) { 
  var o = {
    "M+": this.getMonth() + 1, 
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return format;  
};

Date.prototype.add = function (value, type) {
  if (value === 0) return this;
  var method = DATE_MAP[type];
  if (method.times) value = value * method.times;
  return this.set(type, this[method['get']]() + value);
};

Date.prototype.set = function (type, value) {
  var method = DATE_MAP[type];
  this[method['set']](value);
  return this;
};

Date.prototype.get = function (type) {
  var method = DATE_MAP[type];
  return this[method['get']]();
};

Date.prototype.startOf = function (type) {
  switch (type) {
    case 'years':
      this.set('months', 0);
    case 'months':
      this.set('days', 1);
    case 'weeks':
    case 'days':
      this.set('hours', 0);
    case 'hours':
      this.set('minutes', 0);
    case 'minutes':
      this.set('seconds', 0);
    case 'seconds':
      this.set('milliseconds', 0);
  }
  return this;
};

Date.prototype.endOf = function (type) {
  var end = this.add(1, type).startOf(type).add(-1, 'milliseconds');
  return end;
};

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function isEmpty(value) {
  return value === undefined || value === null || value === '' || value.length === 0
}

function showTopTips(page, options) {
  if (typeof options === 'string') {
    options = {text: options};
  }
  page.setData({ topTipsText: options.text || '', showTopTips: true });
  var instance = setTimeout(function () {
    page.setData({ topTipsText: '', showTopTips: false });
    clearTimeout(instance);
  }, options.duration || 1500);
}

function ajax(options, context) {
  let loading = false;
  if (options.loadingText) {
    loading = true;
    wx.showLoading({
      title: options.loadingText || '请稍后',
    });
  }
  var originUrl = options.url || '';
  options.url = originUrl.indexOf('http') === 0 ? originUrl : (BASE_URL + (originUrl.indexOf('/') === 0 ? '' : URI_PREFIX) + options.url);
  var originSuccess = options.success;
  var success = function (res) {
    if (loading) {
      wx.hideLoading();
    }
    var msg = res.errMsg;
    if (msg && 'request:ok' === msg.trim()) {
      if (res.statusCode === 200) {
        let result = res.data;
        if (result.success) {
          if (typeof originSuccess === 'function') {
            originSuccess.apply(context || this, [result]);
          }
        } else {
          alert(result.message);
        }
      } else {
        alert(res.statusCode);
      }
    } else {
      alert(msg);
    }
  };
  options.success = success;
  options.fail = function (res) {
    if (loading) {
      wx.hideLoading();
    }
    var msg = res.errMsg;
    if (msg) {
      alert('request:fail' === msg.trim() ? '请求失败，请检查您的网络' : msg);
    } else {
      alert(res.statusCode);
    }
  };
  options.complete = function (res) {
    if (loading) {
      wx.hideLoading();
    }
  };
  wx.request(options);
}

function alert(text) {
  var content = typeof text === 'string' ? text : '' + text;
  wx.showModal({
    title: '',
    content: content,
    showCancel: false
  });
}

function confirm(text, ok) {
  var content = typeof text === 'string' ? text : '' + text;
  wx.showModal({
    title: '',
    content: content,
    success: function(res) {
      if (res.confirm) {
        if (typeof ok === 'function') {
          ok.apply(null, []);
        }
      }
    }
  });
}

function min(value1, value2) {
  return value1 < value2 ? value1: value2;
}

function max(value1, value2) {
  return value1 > value2 ? value1 : value2;
}

module.exports = {
  ajax: ajax,
  isEmpty: isEmpty,
  showTopTips: showTopTips,
  alert: alert,
  confirm, confirm,
  min: min,
  max: max
}
