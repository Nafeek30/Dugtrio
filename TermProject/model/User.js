const ObjectID = require('../database.js').ObjectID;

class User
{
    constructor(username, email, password)
    {
        this._id = ObjectID();
        this.username = username;
        this.email = email;
        this.password = password;
        this.birthday = "";
        this.location = "";
        this.bio = "";
        this.isAdmin = false;
        this.friendIDs = [];
        this.photoUrl = "";
    }

    serialize()
    {
        return {
            _id: this._id,
            username: this.username, 
            email: this.email, 
            password: this.password, 
            birthday: this.birthday, 
            location: this.location, 
            bio: this.bio,
            isAdmin: this.isAdmin,
            friendIDs: this.friendIDs,
            photoUrl: this.photoUrl
        };
    }

    static deserialize(user)
    {
        const deserializedUser = new User(user.username, user.email, user.password);
        deserializedUser._id = ObjectID(user._id);
        deserializedUser.birthday = user.birthday;
        deserializedUser.location = user.location;
        deserializedUser.bio = user.bio;
        deserializedUser.isAdmin = user.isAdmin;
        deserializedUser.friendIDs = user.friendIDs;
        deserializedUser.photoUrl = user.photoUrl;
        
        return deserializedUser;
    }
}

module.exports = User;