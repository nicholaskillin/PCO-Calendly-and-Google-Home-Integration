var totalMinutes = 30
var i = 1;

var myTimer = setInterval(function setSlackStatus(){
    if (i < 29){
        var minutesLeft = totalMinutes - [i];
    
        msg.payload = {
            "profile": {
                "status_text": "Back in " + minutesLeft + " minutes",
                "status_emoji": ":thisisforaoneononesojessdoesnthavetotypeasmuch:",
                "status_expiration": 0
            }
        };
        node.send(msg);
        
        i++;
    } else if (i == 29 ){
        var minutesLeft = totalMinutes - [i];
    
        msg.payload = {
            "profile": {
                "status_text": "Back in " + minutesLeft + " minute",
                "status_emoji": ":thisisforaoneononesojessdoesnthavetotypeasmuch:",
                "status_expiration": 0
            }
        };
        node.send(msg);
        
        i++;
    } else if (i == 30){
        msg.payload = {
            "profile": {
                "status_text": "I'll be back any second now",
                "status_emoji": ":thisisforaoneononesojessdoesnthavetotypeasmuch:",
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
                "status_text": "Back in 30 minutes",
                "status_emoji": ":thisisforaoneononesojessdoesnthavetotypeasmuch:",
                "status_expiration": 0
            }
        };
return [msg];