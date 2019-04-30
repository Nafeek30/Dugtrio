const socket = io.connect('http://localhost:3000');

function getDateTime(timestamp)
{
    let dateTime = new Date(timestamp).toLocaleString();
    const secondsIndex = dateTime.lastIndexOf(':');
    return dateTime.slice(0, -(dateTime.length - secondsIndex)) + dateTime.substring(secondsIndex + 3, dateTime.length);
}

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
        const htmlMessage = `
        <div class="message">
            <div class="text-center userInfoRight">
                <img src="/public/images/${message.userPhotoURL}" width="30" height="30" class="circlePhoto">
                <a href="#"> 
                    <small>
                        ${message.username}
                    </small> 
                </a>
            </div>
            <div class="messageInfoRight">
                <small>
                    ${getDateTime(message.timestamp)}
                </small>
                <p>
                    ${message.text}
                </p>
            </div>
        </div>
        `
        document.getElementById('messagesContainer').insertAdjacentHTML('beforeend', htmlMessage);
        setupMessages();
    }
});

socket.on('sendFile', message => {
    let chatRoomID = window.location.href;
    chatRoomID = chatRoomID.slice(chatRoomID.lastIndexOf('/') + 1);
    if(message.chatRoomID == chatRoomID)
    {
        let htmlMessage = `
        <div class="message">
            <div class="text-center userInfoRight">
                <img src="/public/images/${message.userPhotoURL}" width="30" height="30" class="circlePhoto">
                <a href="#"> 
                    <small>
                        ${message.username}
                    </small> 
                </a>
            </div>
            <div class="messageInfoRight">
                <small>
                    ${getDateTime(message.timestamp)}
                </small>
        `
        const imageTypes = /jpeg|jpg|png/;
        const ext = message.fileURL.slice(message.fileURL.lastIndexOf('.') + 1);
        const isImage = imageTypes.test(ext.toLowerCase());

        if(isImage)
        {
            htmlMessage += `
                        <p>
                            <a href="/public/chatFiles/${message.fileURL}" download>
                                <img src="/public/chatFiles/${message.fileURL}" width="60" height="60">
                            </a>
                        </p>
                    </div>
                </div>
            `;
        }
        else
        {
            htmlMessage += `
                        <p>
                            <a href="/public/chatFiles/${message.fileURL}" download>
                                ${message.fileURL}
                            </a>
                        </p>
                    </div>
                </div>
            `;
        }

        document.getElementById('messagesContainer').insertAdjacentHTML('beforeend', htmlMessage);
        setupMessages();
    }
});
