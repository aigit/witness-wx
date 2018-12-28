// pages/scenes/scensepost.js
const app = getApp()

var uploadutil = require('uploadimages.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',//用户昵称
    avatarUrl:'',//用户头像
    //success_count: 0,//上传成功数量
    //fail_count:0,//上传失败数量
    //imgIndex:0,//操作数量
    pics:[],
    hasUserInfo: false,
    customLocationAddress:'',//所处位置
    latitude: '', //纬度，浮点数
    longitude: ''//经度，浮点数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    //设置页面标题
    wx.setNavigationBarTitle({
      title: '亲眼目堵'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    //this.mapCtx = wx.createMapContext('myMap')
    //开始订阅消息
    wx.connectSocket({
      url: 'http://www.iwitness.top:8011/scene/broadcast',
      data: {
        
      },
      header: {
        'content-type': 'application/json'
      },
      protocols: ['protocol1'],
      method: "GET"
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    var user = app.globalData.userInfo;
    if(app.globalData.userinfo){
      that.setData({
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      });
    }else{
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
          hasUserInfo: true
        })
      }
    }    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //事件处理函数
  rediLeadTap: function () {
    wx.navigateTo({
      url: '../lead/lead'
    })
  },
  
  choose:function(){
    var that = this;
    /**
     * 选择图片
     */
    wx.chooseImage({
      count: 5,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var imgpath = res.tempFilePaths;
        that.setData({
          pics:imgpath
        });
      },
      fail:function(){

      },
      complete:function(){

      }
    })
  },
  //选择位置
  getAddr: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        var point = {
          customLatitude: res.latitude,
          customLongitude: res.longitude
        };
        that.setData({
          customLocationAddress: res.address || res.name
        });
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },

  previewImage:function(e){
    var current = e.target.dataset.src;
    console.log(current);
    wx.previewImage({
      current:current,
      urls: this.data.pics
    })
  },
  uploadImgBatch:function(){
    var pics = this.data.pics;
    var BUCKET_NAME = '/witness1';
    var DIR_NAME = '/w1';
    var APP_ID ='/1255425548';
    var cosUrl = "https://sh.file.myqcloud.com/files/v2" + APP_ID+ BUCKET_NAME + DIR_NAME;
    var cosAuth='';
    var nickName = this.data.nickName;
    var avatarUrl = this.data.avatarUrl;
    var customLocationAddress = this.data.customLocationAddress;

    //填写自己的鉴权服务器地址
    var cosSignatureUrl = 'http://www.iwitness.top:8011/tencentauth/cossign/get/1/0'

    if (cosAuth == '') {
      wx.request({
        url: cosSignatureUrl,
        success: function (cosRes) {
          cosAuth=cosRes.data;
          //获取位置
          wx.getLocation({
            type: 'wgs84',
            success: function (res) {
              var latitude = res.latitude
              var longitude = res.longitude
              var speed = res.speed
              var accuracy = res.accuracy
              console.log('W:' + latitude + '----J:' + longitude);
              console.log('位置精确度:' + accuracy);
              var coordinate = new Array();
              coordinate[0] = latitude;
              coordinate[1] = longitude;
              //调用上传
              uploadutil.uploadimg({
                url: cosUrl,
                filePaths: pics,
                cosCerAuth: cosAuth,
                imgIndex: 0,
                uploadedResourcearr:[],
                coordinate: coordinate,
                nickName: nickName,
                avatarUrl: avatarUrl,
                customLocationAddress:customLocationAddress
              })
            }
          })
          
        }
      })
    }
  }
  
})