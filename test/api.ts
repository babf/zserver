const logs:{pathname:string,args:any,time:string}[] = [];

const mockdata:any = {
    "name": "教室地址全名", //教室地址全名  string, 可选参数
    "serialNumber": "", //串行号 string, 可选参数
    "data": {
      "system": {
        "system1": { //中控   只有1个
          "switch": true, //中控开关
          "status": 0 //中控运行状态，number类型，不同值分代表，0"未知", 1"关机完成", 2"开机完成					",// 3"正在关机",  4"正在开机", 5"故障"
        }
      },
      "computer": {
        "computer1": { //电脑1 computer1为第一个，如果有多个，接着添加computer2...
          "switch": true //电脑开关
        }
      },
      "largeScreen": {
        "largeScreen1": { //一体机1 largeScreen1为第一个，如果有多个，接着添加largeScreen2...
          "switch": true //一体机1开关
        },
        "largeScreen2": { //一体机2
          "switch": true //一体机2开关
        },
        "largeScreen3": { //一体机3
          "switch": true //一体机3开关
        }
      },
      "audio": {
        "audio1": { //音响1 audio1为第一个，如果有多个，接着添加audio2...
          "switch": true, //音响开关
          "value": 0 //音量大小，number类型
        }
      },
      "matrix": {
        "matrix1": { //矩阵1matrix1为第一个，如果有多个，接着添加matrix2...
          "switch": true, //矩阵总控开关
          //输入端口
          "in1": true,
          "in2": false,
          "in3": false,
          "in4": false,
          //输出端口,0代表“无输入源”，1-4代表输入源编号。中控解析只需要看out部分内容，中控IN返回状态按最后一次OUT对应的数值为准。
          "out1": 0,
          "out2": 1,
          "out3": 1,
          "out4": 0
        }
      },
      "light": {
        "light1": { //灯光1 light1为第一个，如果有多个，接着添加light2...
          "switch": true //灯光开关
        },
        "light2": { //灯光2
          "switch": true //灯光开关
        },
        "light3": { //灯光3
          "switch": true //灯光开关
        },
        "light4": { //灯光4
          "switch": true //灯光开关
        }
      },
      "door": {
        "door1": { //门锁1door1为第一个，如果有多个，接着添加door2...
          "switch": true //门锁开关
        },
        "door2": { //门锁2
          "switch": true //门锁开关
        }
      },
      "record": {
        "record1": { //录播1 record1为第一个，如果有多个，接着添加record2...
          "status": 0 //录播状态，number类型，0关机，1录制，2暂停
        }
      },
      "airConditioner": {
        "airConditioner1": //空调1 airConditioner1为第一个，如果有多个，接着添加airConditioner2...
        {
          "mode": 0, //空调模式，number类型，0关闭，1制冷，2制热
          "fanMode": 0, //扫风模式，number类型，0关闭，1上下，2左右
          "volume": 0, //风量，number类型，0自动，1低，2中，3 高
          "temperature": 30 //温度，number类
        }
      },
      "curtain": {
        "curtain1": { //窗帘1 curtain1为第一个，如果有多个，接着添加curtain2...
          "switch": true //窗帘开关
        }
      },
      "environment": {
        "temperature1": {
          "value": 32, //温度，number 类型
          "normal": true //传感器是否正常，false为故障
        },
        "humidity1": {
          "value": 32, //湿度，number 类型
          "normal": true //传感器是否正常，false为故障
        },
        "lumen1": {
          "value": 32, //光照度，number 类型
          "normal": true //传感器是否正常，false为故障
        },
        "PM251": {
          "value": 32, //PM2.5，number 类型
          "normal": true //传感器是否正常，false为故障
        },
        "formaldehyde1": {
          "value": 32, //甲醛，number 类型
          "normal": true //传感器是否正常，false为故障
        },
        "smokeAlarm1": {
          "alarm": false, //烟雾报警，boolean类型 true发生报警
          "normal": true //传感器是否正常，false为故障
        },
        "infraredDetect1": {
          "alarm": true, //红外报警，boolean类型 true发生报警
          "normal": true //传感器是否正常，false为故障
        }
      },
      "electric": {
        "electric1": { //电表1 electric1为第一个，如果有多个，接着添加electric2...
          "power": 1000, //电功率，number 类型
          "voltage": 220, //电压，number类型
          "current": 10.8, //电流，number类型
          "frequency": 60, //频率，number类型
          "powerFactor": 90, //功率因数，number类型
          "total": 1220 //总共用电量，number类型
        }
      }
    }
  }

export default async function(request:Request){
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    
    if(/^\/logs/.test(pathname)){
        return new Response(JSON.stringify(logs), {
        status: 200,
            headers:{
                "Content-Type":"application/json; charset=utf-8"
            }
        })
    }

    if(/^\/ALL_STATUS/.test(pathname)){
        await log(request)
        return new Response(JSON.stringify(mockdata), {
        status: 200,
            headers:{
                "Content-Type":"application/json; charset=utf-8"
            }
        })
    }

    if(/^\/CTLCMD/.test(pathname)){
        if(request.method!=='POST'){
            return new Response(null,{
                status:200
            })
        }

        const _data = await request.text()
        await log(request,_data)

        if(!_data){
            return new Response(JSON.stringify({
                success:false,
                message:'参数错误'
            }), {
            status: 500,
                headers:{
                    "Content-Type":"application/json; charset=utf-8"
                }
            })
        }
        let data;

        try{  
            data = JSON.parse(_data) as any;
            if(typeof data !== 'object'){
                throw new Error('非对象')
            }
        }catch(ex){
            return new Response(JSON.stringify({
                success:false,
                message:'参数非JSON'
            }), {
            status: 500,
                headers:{
                    "Content-Type":"application/json; charset=utf-8"
                }
            })
        }
        
        for(const k in data){
            if(mockdata.data[k]){
                for(const o in data[k]){
                    if(typeof mockdata.data[k][o] !== 'undefined'){
                        for(const d in data[k][o]){
                            if(typeof mockdata.data[k][o][d] !== 'undefined'){
                                mockdata.data[k][o][d] = data[k][o][d]
                            }
                        }
                    }
                }
            }
        }

        return new Response(JSON.stringify({
            success:true
        }), {
        status: 200,
            headers:{
                "Content-Type":"application/json; charset=utf-8"
            }
        })
    }
}

function log(request:Request,args?:string){
    if(logs.length>10){
        logs.shift();
    }
    logs.push({
        pathname:request.url,
        args:args,
        time:new Date().toISOString()
    })
}