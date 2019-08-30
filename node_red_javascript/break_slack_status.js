var totalMinutes = 15
var i = 1;

var myTimer = setInterval(function setSlackStatus(){
    if (i < 14){
        var minutesLeft = totalMinutes - [i];
    
        msg.payload = {
            "profile": {
                "status_text": "Back in " + minutesLeft + " minutes",
                "status_emoji": ":coffee:",
                "status_expiration": 0
            }
        };
        node.send(msg);
        
        i++;
    } else if (i == 14 ){
        var minutesLeft = totalMinutes - [i];
    
        msg.payload = {
            "profile": {
                "status_text": "Back in " + minutesLeft + " minute",
                "status_emoji": ":coffee:",
                "status_expiration": 0
            }
        };
        node.send(msg);
        
        i++;
    } else if (i == 15){
        msg.payload = {
            "profile": {
                "status_text": "I'll be back any second now",
                "status_emoji": ":coffee:",
                "status_expiration": 0
            }
        };
        node.send(msg);
                
        clearInterval(myTimer);
        i = 1;
    }
}, 60000)
   
msg.payload = {
            "profile": {
                "status_text": "Back in 15 minutes",
                "status_emoji": ":coffee:",
                "status_expiration": 0
            }
        };
return [msg];