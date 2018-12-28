//index.js
//获取应用实例
//var api = require('../../utils/api.js')
const app = getApp()
const config = require('../../config.js');
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    systemInfo: {},
    _api: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    nickName: '',//用户昵称
    avatarUrl: '',//用户头像
    hasNews: false,
    scene: { 
      locationAddress:'',
      avatarUrl:'',
      publisher:''
      },
    //success_count: 0,//上传成功数量
    //fail_count:0,//上传失败数量
    //imgIndex:0,//操作数量
    pics: [],
    selftalk: ["憋尿中...", "和蜗牛赛跑", "和乌龟赛跑", "紧踩离合", "按喇叭", "憋尿中...", "和蜗牛赛跑", "和乌龟赛跑", "紧踩离合", "按喇叭", "和乌龟赛跑"],
    customLocationAddress: '',//所处位置
    latitude: '', //纬度，浮点数
    longitude: '',//经度，浮点数
    detalpics: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    hideSeneDetail:true
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var user = app.globalData.userInfo;
    if (user) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onHide:function(){
   
  },
  onShow:function(){
    var that = this;
    //获取位置
    wx.getLocation({
      type: config.MAP_TYPE,
      success: function (res) {
        var speed = res.speed
        var accuracy = res.accuracy
        console.log('W:' + res.latitude + '----J:' + res.longitude);
        console.log('位置精确度:' + accuracy);
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        // 连接ws服务
        wx.connectSocket({
          url: 'wss://www.iwitness.top/wss?23=' + that.data.longitude + ',' + that.data.latitude,
          header: {
            'content-type': 'application/json'
          }
        })
        wx.onSocketOpen(function (res) {
          console.log('WebSocket连接已打开！'+res)
        })

        wx.onSocketMessage(res => {
          var nsene = JSON.parse(res.data)
          //console.info('图片路径:' + nsene.imagedesclist[0].split('\/'))
          var desclist = nsene.imagedesclist;
          var descarr = [];
          desclist.forEach(function (v, i) {//v==value　为arr项，i==index　为arr索引
            descarr.push(config.COS_DOWNLOAD_HOST + '/' + v.split('\/')[3] + '/' + v.split('\/')[4]);
          })

          console.info("descarr...:" + descarr);
          var talkindex = Math.floor(Math.random() * 10);
          var talktip = that.data.selftalk[talkindex]
          that.setData({
            hasNews: true,
            "scene.publisher": nsene.publisher,
            "scene.avatarUrl": nsene.avatarUrl,
            "scene.locationAddress": nsene.locationAddress + ' ' + talktip,
            detalpics: descarr
          });
          console.info("scene:" + that.data.scene.publisher);
        })

        wx.onSocketClose(function (res) {
          console.log('WebSocket 已关闭！' + res.data)
        })

      }
    })
    
  },
  showSwiper: function () {
    this.setData({ hideSeneDetail: false })
  },
  //消失

  hideSwiper: function () {
    this.setData({ hideSeneDetail: true })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
