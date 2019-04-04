const ObjectID = require('../database.js').ObjectID;

class Message
{
    constructor(chatRoomID, senderID, content)
    {
        this._id = ObjectID();
        this.chatRoomID = chatRoomID;
        this.senderID = senderID;
        this.content = content;
        this.timestamp = Date.now();
    }

    serialize()
    {
        return {
            _id: this._id,
            chatRoomID: this.chatRoomID,
            senderID: this.senderID,
            content: this.content,
            timestamp: this.timestamp
        };
    }

    static deserialize(message)
    {
        const deserializedMessage = new Message(
            message.chatRoomID, 
            message.senderID, 
            message.content
        );

        deserializedMessage._id = ObjectID(message._id);
        deserializedMessage.timestamp = message.timestamp;
    }
}