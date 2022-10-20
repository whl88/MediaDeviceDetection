import Event from './event'
const defaultList = [
  {
    "label": "4K(UHD)",
    "width": 3840,
    "height": 2160,
    "ratio": "16:9"
  },
  {
    "label": "4K(UHD)",
    "width": 2160,
    "height": 3840,
    "ratio": "9:16"
  },
  {
    "label": "2K",
    "width": 2560,
    "height": 1440,
    "ratio": "16:9"
  },
  {
    "label": "2K",
    "width": 1440,
    "height": 2560,
    "ratio": "9:16"
  },
  {
    "label": "1080p(FHD)",
    "width": 1920,
    "height": 1080,
    "ratio": "16:9"
  },
  {
    "label": "1080p(FHD)",
    "width": 1080,
    "height": 1920,
    "ratio": "9:16"
  },
  {
    "label": "UXGA",
    "width": 1600,
    "height": 1200,
    "ratio": "4:3"
  },
  {
    "label": "UXGA",
    "width": 1200,
    "height": 1600,
    "ratio": "3:4"
  },
  {
    "label": "720p(HD)",
    "width": 1280,
    "height": 720,
    "ratio": "16:9"
  },
  {
    "label": "720p(HD)",
    "width": 720,
    "height": 1280,
    "ratio": "9:16"
  },
  {
    "label": "SVGA",
    "width": 800,
    "height": 600,
    "ratio": "4:3"
  },
  {
    "label": "SVGA",
    "width": 600,
    "height": 800,
    "ratio": "3:4"
  },
  {
    "label": "VGA",
    "width": 640,
    "height": 480,
    "ratio": "4:3"
  },
  {
    "label": "360p(nHD)",
    "width": 640,
    "height": 360,
    "ratio": "16:9"
  },
  {
    "label": "CIF",
    "width": 352,
    "height": 288,
    "ratio": "4:3"
  },
  {
    "label": "QVGA",
    "width": 320,
    "height": 240,
    "ratio": "4:3"
  },
  {
    "label": "QCIF",
    "width": 176,
    "height": 144,
    "ratio": "4:3"
  },
  {
    "label": "QQVGA",
    "width": 160,
    "height": 120,
    "ratio": "4:3"
  }
]

export default class DeviceDetection extends Event{
  constructor(){
    super()

    this.audioContext = null
    this.scriptProcessor = null
  }

  /**
   * 获取摄像头列表
   * @returns 
   */
  getCameraList() {
    return new Promise((resolve) => {
      navigator.mediaDevices.enumerateDevices().then(async (devices) => {
        let deviceArr = devices.filter((device) => {
          if(device.kind === "videoinput") return device
        })
        let arr = deviceArr.map((item)=>{
          return new Promise((resolve, reject)=>{
            navigator.mediaDevices.getUserMedia({
              video: {deviceId:item.deviceId },
            }).then((stream) => {
              const vt = stream.getTracks().find((t) => {
                return t.kind === "video"
              })
              let capabilities = vt.getCapabilities()
              capabilities.InputDeviceInfo = item
              stream.getTracks().forEach((t) => {
                t.stop()
              })
              resolve(capabilities)
            }).catch((e)=>{
              console.error('getDeviceList error', {deviceId:item.deviceId }, e)
              reject(e)
            })
          })
        })
  
        let successfulPromises = await Promise.allSettled(arr)
        successfulPromises = successfulPromises.filter(p => p.status === 'fulfilled')
        const cameras = successfulPromises.map((p)=>{
          return p.value
        })
        
        // 排序
        let device = cameras.sort((item,item2)=>{
          return item2.width.max - item.width.max
        })
        resolve(device)
      })
    }).catch(error => {
      console.error( "getDeviceList", error )
    })
  }

  /**
   * 获取摄像头支持的分辨率
   * @param {*} device 
   * @returns 
   */
  getResolution(device){
    return defaultList.filter((resolution) => {
      if (resolution.width <= device.width.max &&  resolution.height <= device.height.max) {
        return resolution
      }
    })
  }

  /**
   * 获取麦克风列表
   * @returns 
   */
  getMicList(){
    return navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      return devices.filter((device) => {
        if(device.kind === "audioinput") return device
      })
    })
  }

  /**
   * 测试麦克风。将触发 volume-change 事件，带出音量值 [0-100]
   * @param {string} deviceId 
   */
  testMic(deviceId) {
    if(!this.audioContext){
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()

      // 创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
      this.scriptProcessor = this.audioContext.createScriptProcessor(
        4096,
        1,
        1
      )
      this.scriptProcessor.connect(this.audioContext.destination)

      // 开始处理音频
      this.scriptProcessor.addEventListener('audioprocess', this._onAudioprocess.bind(this))
    }else{
      this._closeCurrMic()
    }
    
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId },
      })
      .then((stream) => {
        this.micStream = stream
        // 将麦克风的声音输入这个对象
        this.micStreamSource =
          this.audioContext.createMediaStreamSource(this.micStream)
        // 将该分析对象与麦克风音频进行连接
        this.micStreamSource.connect(this.scriptProcessor)
      })
  }

  _onAudioprocess(e){
    // 获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
    let buffer = e.inputBuffer.getChannelData(0)
    // 获取缓冲区中最大的音量值
    let maxVal = Math.max.apply(Math, buffer)
    // 显示音量值
    this.emit('volume-change', Math.round(maxVal * 100))
  }

  _closeCurrMic(){
    this.micStreamSource.disconnect(this.scriptProcessor)
    this.micStream.getAudioTracks().forEach( t => {
      t.stop()
    })
  }
  
  /**
   * 解除麦克风的占用
   */
  releaseMic(){
    this._closeCurrMic()
    this.scriptProcessor.disconnect(this.audioContext.destination)
    this.scriptProcessor.removeEventListener('audioprocess', this._onAudioprocess)
    this.audioContext = null
  }

}
