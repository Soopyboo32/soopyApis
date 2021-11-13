const Socket = Java.type("java.net.Socket");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const BufferedReader = Java.type("java.io.BufferedReader");
const PrintWriter = Java.type("java.io.PrintWriter");

import serverData from "./socketData";

class WebsiteConnection {
    constructor() {
        this.socket = undefined;
        this.connected = false
        this.output = undefined
        this.writer = undefined
        this.lastTick = -1
        this.reconDelay = 1000

        this.connectedFull = false

        this.handlers = {}

        register("tick",()=>{
            if(this.lastTick === -1){
                this.lastTick = Date.now()
                this.connect()
                return;
            }
            this.lastTick = Date.now()
        })
    }

    connect(){
        //connect to server

        if(this.connected) return;

        this.connectedFull = false
        console.log("connecting to soopy socket")
        try{
        this.socket = new Socket("soopymc.my.to", serverData.port);
        }catch(e){
            console.log("socket error: " + JSON.stringify(e, undefined, 2))
            console.log("reconnecting in " + this.reconDelay + "ms")
            new Thread(() => {
                Thread.sleep(this.reconDelay)
                this.reconDelay *= 1.5
                this.reconDelay = Math.round(this.reconDelay)
                this.connect()
            }).start()
            return;
        }
        this.output = this.socket.getOutputStream();
        this.writer = new PrintWriter(this.output, true)

        this.connected = true

        this.reconDelay = 1000

        new Thread(() => {
            let input = this.socket.getInputStream();
            let reader = new BufferedReader(new InputStreamReader(input));

            let shouldCont = true

            while(this.connected && this.socket !== null && shouldCont && Date.now()-this.lastTick < 500) {
                try {
                    let data = reader.readLine()
                    if(data){
                        this.onData(JSON.parse(data))
                    }
                } catch(e) {
                    console.log("SOCKET ERROR (soopyApis/websiteConnection.js)")
                    console.error(JSON.stringify(e))
                    this.disconnect()
                    Thread.sleep(5000)
                    console.log("Attempting to reconnect to the server")
                    shouldCont = false

                    this.connect()
                }
            }
            let shouldReCon = false
            if(this.connected && shouldCont){
                shouldReCon = true
            }
            if(Date.now()-this.lastTick > 500){
                shouldReCon = false
                this.disconnect()
            }
            if(shouldCont && this.socket){
                this.disconnect()
            }
            if(shouldReCon){
                Thread.sleep(1000)
                console.log("Attempting to reconnect to the server")
                this.connect()
            }
        }).start();
    }

    disconnect(){
        //disconnect from server

        this.socket.close();
        this.socket = null;
        this.connected = false;
        this.connected = false

        console.log("disconnecting from soopy socket")
    }

    sendData(data){
        //send data to server
        if(!this.connected) return;
        if(!this.socket) return;

        this.writer.println(data);
    }

    onData(data){
        // console.log(JSON.stringify(data, undefined, 2));

        if(data.type === serverData.packetTypesReverse.connectionSuccess){

            this.sendData(this.createPacket(serverData.packetTypesReverse.connectionSuccess, 0, {
                "username": Player.getName(),
                "uuid": Player.getUUID()
            }))

            Object.values(this.handlers).forEach(handler => handler._onConnect())
            this.connectedFull = true
        } else if(data.type === serverData.packetTypesReverse.data){
            if(this.handlers[data.server]){
                this.handlers[data.server]._onData(data.data)
            }else if(data.noHandlerMessage){
                ChatLib.chat(data.noHandlerMessage)
            }
        } else if(data.type === serverData.packetTypesReverse.serverReboot){
            this.disconnect()
            new Thread(()=>{
                Thread.sleep(5000)
                this.connect()
            }).start()
        }
    }

    addHandler(handler){
        this.handlers[handler.appId] = handler;
        if(this.connectedFull){
            handler._onConnect()
        }
    }

    createDataPacket(data, server = serverData.serverNameToId.soopyapis) {
        return this.createPacket(serverData.packetTypesReverse.data, server, data)
    }

    createPacket(type, server = serverData.serverNameToId.soopyapis, data = {}) {
        return JSON.stringify({
            "type": type,
            "server": server,
            "data": data
        })
    }
}
if(!global.SoopyWebsiteConnectionThingConnection){

    global.SoopyWebsiteConnectionThingConnection = new WebsiteConnection();
}

export default global.SoopyWebsiteConnectionThingConnection;