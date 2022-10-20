import DeviceDetection from './DeviceDetection'
const deviceDetection = new DeviceDetection()
deviceDetection.on('volume-change', function(e){
    document.querySelector('.volume-show').style.width = e + '%'
})

deviceDetection.getCameraList().then(list=>{
    console.log('Camera list', list)
    list.forEach(d => {
        const li = document.createElement('li')
        li.onclick=detectionResolution.bind(this, d)
        li.append(d.InputDeviceInfo.label)
        document.querySelector('.camare-list')
        .append(li)
    })
})

deviceDetection.getMicList().then(list=>{
    console.log('Mic list', list)
    list.forEach( d => {
        const li = document.createElement('li')
        li.onclick = deviceDetection.testMic.bind(deviceDetection, d.deviceId)
        li.append(d.label)
        document.querySelector('.mic-list')
        .append(li)
    })
})

function detectionResolution(camera){
    document.querySelector('.resolution-list').innerHTML = ''
    
    const resolutionList = deviceDetection.getResolution(camera)
    console.log('resolutionList', resolutionList)
    
    resolutionList.forEach(d=>{
        const li = document.createElement('li')
        li.onclick = showVideo.bind(this, camera.deviceId, d.width, d.height)
        li.append(`${d.label}(${d.width}x${d.height})`)
        document.querySelector('.resolution-list')
        .append(li)
    })
}

function showVideo(deviceId, width, height){
    navigator.mediaDevices.getUserMedia({
        audio:false,
        video: {
            deviceId,
            width,
            height,
        }
    }).then((stream)=>{
        document.querySelector('.video').srcObject = stream
    }).catch(e=>{
        reject(e)
    })
}

document.querySelector('.releaseMic').addEventListener('click', function(){
    deviceDetection.releaseMic()
})