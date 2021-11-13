export default {
    "port": 9898,
    "packetTypes": {
        "0": "connectionSuccess",
        "1": "data",
        "2": "joinServer",
        "3": "ping",
        "4": "serverReboot"
    },
    "packetTypesReverse": {
        "connectionSuccess": "0",
        "data": "1",
        "joinServer": "2",
        "ping": "3",
        "serverReboot": "4"
    },
    "servers": {
        "0": {
            "name": "soopyapis",
            "displayName": "SoopyApi",
            "module": "soopyApis"
        },
        "1": {
            "name": "soopytestchatthing",
            "displayName": "SoopyTestChatThing",
            "module": "SoopyTestChatThing"
        },
        "2": {
            "name": "minewaypoints",
            "displayName": "Mine Way Points",
            "module": "minewaypoints"
        },
        "3": {
            "name": "soopyv2",
            "displayName": "SoopyV2",
            "module": "SoopyV2"
        }
    },
    "serverNameToId": {
        "soopyapis": "0",
        "soopytestchatthing": "1",
        "minewaypoints": "2",
        "soopyv2": "3"
    }
}