const ObjectID = require('../database.js').ObjectID;

class ChatRoom
{
    constructor(hostID, name)
    {
        this._id = ObjectID();
        this.name = name;
        this.hostID = hostID;
        this.adminID = null;
        this.userIDs = [];
        this.photoURL = null;
    }

    serialize()
    {
        return {
            _id = this._id,
            name = this.name,
            hostID = this.hostID,
            adminID = this.adminID,
            userIDs = this.userIDs,
            photoURL = this.photoURL
        };
    }

    static deserialize(chatRoom)
    {
        const deserializedChatRoom = new ChatRoom(chatRoom.hostID);
        deserializedChatRoom._id = ObjectID(chatRoom._id);
        deserializedChatRoom.name = chatRoom.name;
        deserializedChatRoom.adminID = chatRoom.adminID;
        deserializedChatRoom.userIDs = chatRoom.userIDs;
        deserializedChatRoom.photoURL = chatRoom.photoURL;

        return deserializedChatRoom;
    }
}

module.exports = ChatRoom;