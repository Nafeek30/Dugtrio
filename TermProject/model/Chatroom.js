const ObjectID = require('../database.js').ObjectID;

class ChatRoom
{
    constructor(hostID)
    {
        this._id = ObjectID();
        this.hostID = hostID;
        this.adminID = null;
        this.userIDs = [];
    }

    serialize()
    {
        return {
            _id = this._id,
            hostID = this.hostID,
            adminID = this.adminID,
            userIDs = this.userIDs
        };
    }

    static deserialize(chatRoom)
    {
        const deserializedChatRoom = new ChatRoom(chatRoom.hostID);
        deserializedChatRoom._id = ObjectID(chatRoom._id);
        deserializedChatRoom.adminID = chatRoom.adminID;
        deserializedChatRoom.userIDs = chatRoom.userIDs;

        return deserializedChatRoom;
    }
}

module.exports = ChatRoom;