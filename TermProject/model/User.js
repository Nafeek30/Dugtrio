const ObjectID = require('../database.js').ObjectID;

class User
{
    constructor(username, email, password)
    {
        this._id = ObjectID("");
        this.username = username;
        this.email = email;
        this.password = password;
        this.birthday = Date.now();
        this.location = "";
        this.bio = "";
    }

    serialize()
    {
        return {
            username: this.username, 
            email: this.email, 
            password: this.password, 
            birthday: this.birthday, 
            location: this.location, 
            job: this.bio
        };
    }

    static deserialize(user)
    {
        const deserializedUser = new User(user.username, user.email, user.password);
        deserializedUser._id = ObjectID(user._id);
        deserializedUser.birthday = user.birthday;
        deserializedUser.location = user.location;
        deserializedUser.bio = user.bio;
        
        return deserializedUser;
    }
}