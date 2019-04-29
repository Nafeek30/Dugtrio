const ObjectID = require('../database.js').ObjectID;

class Invite
{
    constructor(sender, receiverID, chatRoom)
    {
        this._id = ObjectID();
        this.sender = sender;
        this.receiverID = receiverID;
        this.chatRoom = chatRoom;
    }

    serialize()
    {
        return {
            _id: this._id,
            sender: this.sender,
            receiverID: this.receiverID,
            chatRoom: this.chatRoom
        };
    }

    static deserialize(invite)
    {
        const deserializedInvite = new Invite(
            invite.sender,
            invite.receiverID,
            invite.chatRoom
        );

        deserializedInvite._id = ObjectID(invite._id);
    }
}

module.exports = Invite;