
function uploadimg(data){
  var that = this, i = data.imgIndex ? data.imgIndex : 0;
  // 获取文件名
  console.info('filepath:' + data.filePaths[i]);
  //var fileName = data.filePaths[i].match(/wxfile:\/\/tmp_(.*)/);
  //fileName = fileName[1]
  var fileName = data.filePaths[i].match(/(http:\/\/)(.+)/);
  fileName = fileName[2]
  console.info('after filepath:' + fileName)
  var uploadedResourcearr = data.uploadedResourcearr ? data.uploadedResourcearr:new Array();
  // 头部带上签名，上传文件至COS
  wx.uploadFile({
    url: data.url + '/' + fileName,
    filePath: data.filePaths[i],
    header: {
      'Authorization': data.cosCerAuth
    },
    name: 'filecontent',
    formData: {
      op: 'upload'
    },
    success: function (uploadRes) {
      if(uploadRes.data!=null && uploadRes.data!=''){
        var uploadresult = uploadRes.data;
        var upresultObj = JSON.parse(uploadresult);
        uploadedResourcearr.push(upresultObj.data.resource_path);
      }
      console.log('succ:' + i + "succ:" + uploadRes.data);
    },
    fail: function (e) {
      console.log('fail:' + i + "fail:" + e.errMsg);
    },
    complete: function (r) {
      console.log('执行完毕' + r.errMsg);
      data.imgIndex++;
      if (data.imgIndex == data.filePaths.length) {
        console.log('全部上传完毕：' + data.imgIndex);
        //同步到服务器
        wx.request({
          url: 'http://www.iwitness.top:8011/scene/broadcast', //仅为示例，并非真实的接口地址
          data: { 'publisher': data.nickName, 'avatarUrl': data.avatarUrl, 'latitude': data.coordinate[0], 'longitude': data.coordinate[1], 'locationAddress': data.customLocationAddress, 'imagedesclist': uploadedResourcearr },
          dataType:"json",
          method:"POST",
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log(res.data);
            wx.showToast({
              title:  res.data,
              icon: 'success',
              duration: 2000
            })
          }
        })
      } else {
        //data.imgIndex = i;
        that.uploadimg(data);
      }

    }
  })
}

module.exports.uploadimg = uploadimg;