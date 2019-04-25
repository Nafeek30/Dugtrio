const socket = io.connect('http://localhost:3000');

/* Message Model Reference:
constructor(chatRoomID, userID, username, userPhotoURL)
    {
        this._id = ObjectID();
        this.chatRoomID = ObjectID(chatRoomID);
        this.userID = ObjectID(userID);
        this.username = username;
        this.userPhotoURL = userPhotoURL;
        this.text = "";
        this.photoURL = "";
        this.timestamp = Date.now();
    }
 */

function checkKey(event) {
    let allowNormalKeyFunction = true;
    if (!event.shiftKey && event.code == 'Enter') {
        allowNormalKeyFunction = false;
        let messageBox = document.getElementById('messageBox');
        messageBox.value = messageBox.value.trim();

        if(messageBox.value.length > 0)
        {
            let chatRoomID = window.location.href;
            chatRoomID = chatRoomID.slice(chatRoomID.lastIndexOf('/') + 1);
            socket.emit(
                'chat', 
                {
                    chatRoomID: chatRoomID,
                    userID: localUser._id,
                    username: localUser.username,
                    userPhotoURL: localUser.photoURL,
                    text: messageBox.value,
                    photoURL: "",
                    timestamp: Date.now()
                }
            );
            document.getElementById('messageSender').submit();
        }
    }
    return allowNormalKeyFunction;
}

socket.on('chat', message => {
    let chatRoomID = window.location.href;
    chatRoomID = chatRoomID.slice(chatRoomID.lastIndexOf('/') + 1);
    if(message.chatRoomID == chatRoomID)
    {
        alert(message.text);
    }
});