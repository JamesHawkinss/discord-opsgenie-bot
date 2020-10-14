module.exports = {
    "discord": {
        "token": "bot token",
        "server": "id of server to operate in",
        "channel": "id of channel to operate in"
    },
    "opsgenie": {
        "api_key": "opsgenie api key, to act on alerts"
    },
    "port": 3333,
    "emojis": {
        "acknowledge": "emoji ids here",
        "close": "",
        "priority": {
            "main": "",
            "P1": "",
            "P2": "",
            "P3": "",
            "P4": "",
            "P5": ""
        }
    },
    "permissions": {
        "priority": [
            "user id for user",
            "this user has access to change alert priority"
        ]
    }
}