const ObjectID = require('../database.js').ObjectID;

class Message
{
    constructor(chatRoomID, userID, username)
    {
        this._id = ObjectID();
        this.chatRoomID = ObjectID(chatRoomID);
        this.userID = ObjectID(userID);
        this.username = username;
        this.text = "";
        this.photoURL = "";
        this.timestamp = Date.now();
    }

    serialize()
    {
        return {
            _id: this._id,
            chatRoomID: this.chatRoomID,
            userID: this.userID,
            username: this.username,
            text: this.text,
            photoURL: this.photoURL,
            timestamp: this.timestamp
        };
    }

    static deserialize(message)
    {
        const deserializedMessage = new Message(
            message.chatRoomID, 
            message.userID,
            message.username
        );

        deserializedMessage._id = ObjectID(message._id);
        deserializedMessage.text = message.text;
        deserializedMessage.photoURL = photoURL;
        deserializedMessage.timestamp = message.timestamp;
    }
}

module.exports = Message;