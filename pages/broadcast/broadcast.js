// pages/scenes/scensepost.js
const app = getApp()

var uploadutil = require('uploadimages.js');
const config = require('../../config.js');
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',//用户昵称
    avatarUrl: '',//用户头像
    //success_count: 0,//上传成功数量
    //fail_count:0,//上传失败数量
    //imgIndex:0,//操作数量
    hasUserInfo: false,
    customLocationAddress: '',//所选位置
    systemLocationAddress:'',//所处位置
    latitude: '', //纬度，浮点数
    longitude: '',//经度，浮点数
    // 相册列表数据
    albumList: [],
    // 图片布局列表（二维数组，由`albumList`计算而得）
    layoutList: [],
    // 布局列数
    layoutColumnSize: 3,
    // 触发了长按
    triggerLongTap: false,
    // 是否显示toast
    showToast: false,
    // 提示消息
    toastMessage: '',
    // 是否显示动作命令
    showActionsSheet: false,
    // 当前操作的图片
    imageInAction: '',
    // 图片预览模式
    previewMode: false,
    // 当前预览索引
    previewIndex: 0,
    upload_btn_disabled:false,
    getAddr_btn_disabled:false,
    custompoint:null
  },

  // 隐藏toast消息
  hideToast() {
    this.setData({
      showToast: false,
      toastMessage: '',
    });
  },

  // 隐藏动作列表
  hideActionSheet() {
    this.setData({
      showActionsSheet: false,
      imageInAction: '',
    });
  },
  // 渲染相册列表
  renderAlbumList() {
    let layoutColumnSize = this.data.layoutColumnSize;
    let layoutList = [];

    if (this.data.albumList.length) {
      layoutList = util.listToMatrix([0].concat(this.data.albumList), layoutColumnSize);

      let lastRow = layoutList[layoutList.length - 1];
      if (lastRow.length < layoutColumnSize) {
        let supplement = Array(layoutColumnSize - lastRow.length).fill(0);
        lastRow.push(...supplement);
      }
    }

    this.setData({ layoutList });
  },
  chooseImage: function () {
    var that = this;
    /**
     * 选择图片
     */
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: [ 'camera'],
      success:  (res) => {
        var imgpath = res.tempFilePaths;
        that.setData({
          albumList: imgpath
        });
        this.renderAlbumList();
      },
      fail: function () {

      },
      complete: function () {

      }
    })
  },
  // 显示可操作命令
  showActions(event) {
    this.data.triggerLongTap = true;
    setTimeout(() => {
      this.data.triggerLongTap = false;
    }, 1000);

    this.setData({
      showActionsSheet: true,
      imageInAction: event.target.dataset.src,
    });

    var that = this;
    wx.showActionSheet({
      itemList: ['删除', '取消'],
      success: function (res) {
        if (res.tapIndex == 0) {
          let imageUrl = that.data.imageInAction;
          console.info("delete imageUrl:" + imageUrl);

          that.setData({
            showActionsSheet: false,
            imageInAction: '',
          });

          // 从图片列表中移除
          let index = that.data.albumList.indexOf(imageUrl);
          if (~index) {
            let albumList = that.data.albumList;
            albumList.splice(index, 1);

            that.setData({ albumList });
            that.renderAlbumList();
          }

          that.setData({
            showToast: true,
            toastMessage: '图片删除成功',
          });
        }
        if (res.tapIndex == 1) {
          console.log('取消')
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });
  },
  // 进入预览模式
  enterPreviewMode(event) {
    if (this.data.triggerLongTap) {
      return;
    }

    let imageUrl = event.target.dataset.src;
    let previewIndex = this.data.albumList.indexOf(imageUrl);

    this.setData({
      previewMode: true,
      previewIndex: previewIndex,
    });
  },

  // 退出预览模式
  exitPreviewMode() {
    this.setData({
      previewMode: false,
      previewIndex: 0,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      upload_btn_disabled: false,
      getAddr_btn_disabled:false
    });
    // 页面初始化 options为页面跳转所带来的参数
    this.renderAlbumList();
    var that = this
    var user = app.globalData.userInfo;
    if (user != null && typeof (user) !='undefined') {
      that.setData({
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      });
    } else {
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
  //选择位置
  getAddr: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        var point = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        that.setData({
          customLocationAddress: res.address || res.name,
          custompoint: point
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

  share: function () {
    if (this.data.customLocationAddress == null || this.data.customLocationAddress==''){
      this.setData({
        showToast: true,
        toastMessage: '请选择所在位置',
      });
      return;
    }
    if (this.data.albumList == null || this.data.albumList.length==0) {
      this.setData({
        showToast: true,
        toastMessage: '您不能发布空白场景,请先拍照',
      });
      return;
    }
    this.setData({
      upload_btn_disabled:true
    });
    var pics = this.data.albumList;
    var cosUrl = config.coshost + config.APP_ID + config.BUCKET_NAME + config.DIR_NAME;
    var cosAuth = '';
    var nickName = this.data.nickName;
    var avatarUrl = this.data.avatarUrl;
    var customLocationAddress = this.data.customLocationAddress;
    var customLocationPoint = this.data.custompoint;
    //获取位置
    wx.getLocation({
      type: config.MAP_TYPE,
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.request({
          url: config.WITNESS_SERVER_HOST + "/scene/measureDist", //仅为示例，并非真实的接口地址
          data: { 'latitude': latitude, 'longitude': longitude, 'customLocation': customLocationPoint },
          dataType: "json",
          method: "POST",
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log(res.data);
            if (res.data == '1') {
              wx.showModal({
                content: '您选择的位置离您实际位置太远了...',
                confirmText: '好的',
                showCancel: false
              })
            }else if(res.data=='0'){
              //填写自己的鉴权服务器地址
              var cosSignatureUrl = 'https://www.iwitness.top/tencentauth/cossign/get/1/0'
              if (cosAuth == '') {
                wx.request({
                  url: cosSignatureUrl,
                  success: function (cosRes) {
                    cosAuth = cosRes.data;
                    //获取位置
                    wx.getLocation({
                      type: config.MAP_TYPE,
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
                          uploadedResourcearr: [],
                          coordinate: coordinate,
                          nickName: nickName,
                          avatarUrl: avatarUrl,
                          customLocationAddress: customLocationAddress,
                          broadcasturl: config.BROADCAST_URL,
                          customLocation: customLocationPoint
                        })
                      }
                    })
                  }
                })
              }
            }
          }
        })
        }
      })


  }
})