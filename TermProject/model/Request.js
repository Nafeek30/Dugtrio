const ObjectID = require('../database.js').ObjectID;

class Request
{
    constructor(sender, receiver)
    {
        this._id = ObjectID();
        this.sender = sender;
        this.receiver = receiver;
    }

    serialize()
    {
        return {
            _id: this._id,
            sender: this.sender,
            receiver: this.receiver
        };
    }

    static deserialize(request)
    {
        const deserializedRequest = new Request(
            request.sender,
            request.receiver
        );

        deserializedRequest._id = ObjectID(message._id);
    }
}

module.exports = Request;