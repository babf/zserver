// deno-lint-ignore no-explicit-any
const logs:{pathname:string,args:any,time:string}[] = [];

// deno-lint-ignore no-explicit-any
const mockdata:any = {
    "name": "room name",
    "serialNumber": "",
    "data": {
      "system": {
        "system1": {
          "switch": true,
          "status": 0 
        }
      },
      "computer": {
        "computer1": { 
          "switch": true 
        }
      },
      "largeScreen": {
        "largeScreen1": { 
          "switch": true 
        },
        "largeScreen2": { 
          "switch": true 
        },
        "largeScreen3": { 
          "switch": true 
        }
      },
      "audio": {
        "audio1": { 
          "switch": true, 
          "value": 0 
        }
      },
      "matrix": {
        "matrix1": { 
          "switch": true, 
          
          "in1": true,
          "in2": false,
          "in3": false,
          "in4": false,
          
          "out1": 0,
          "out2": 1,
          "out3": 1,
          "out4": 0
        }
      },
      "light": {
        "light1": { 
          "switch": true 
        },
        "light2": { 
          "switch": true 
        },
        "light3": { 
          "switch": true 
        },
        "light4": { 
          "switch": true 
        }
      },
      "door": {
        "door1": { 
          "switch": true 
        },
        "door2": { 
          "switch": true 
        }
      },
      "record": {
        "record1": { 
          "status": 0 
        }
      },
      "airConditioner": {
        "airConditioner1": 
        {
          "mode": 0, 
          "fanMode": 0, 
          "volume": 0, 
          "temperature": 30 
        }
      },
      "curtain": {
        "curtain1": { 
          "switch": true 
        }
      },
      "environment": {
        "temperature1": {
          "value": 32, 
          "normal": true 
        },
        "humidity1": {
          "value": 32, 
          "normal": true 
        },
        "lumen1": {
          "value": 32, 
          "normal": true 
        },
        "PM251": {
          "value": 32, 
          "normal": true 
        },
        "formaldehyde1": {
          "value": 32, 
          "normal": true 
        },
        "smokeAlarm1": {
          "alarm": false, 
          "normal": true 
        },
        "infraredDetect1": {
          "alarm": true, 
          "normal": true 
        }
      },
      "electric": {
        "electric1": { 
          "power": 1000, 
          "voltage": 220, 
          "current": 10.8, 
          "frequency": 60, 
          "powerFactor": 90, 
          "total": 1220 
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
        // deno-lint-ignore no-explicit-any
        let data:any;

        try{  
            data = JSON.parse(_data);
            if(typeof data !== 'object'){
                throw new Error('on object')
            }
        // deno-lint-ignore no-unused-vars
        }catch(ex){
            return new Response(JSON.stringify({
                success:false,
                message:'no object'
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