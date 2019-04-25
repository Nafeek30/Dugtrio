const express = require('express')
const app = express()
const database = require('./database.js')
const flash = require('connect-flash')
const passConfig = require('./passConfig.js')
const ChatRoom = require('./model/ChatRoom.js')
const User = require('./model/User.js')
const Message = require('./model/Message.js')
const Request = require('./model/Request.js')
const Invite = require('./model/Invite.js')
const utility = require('./utility.js')
const PORT = process.env.PORT || 3000

const session = require('express-session')
const nodemailer = require('nodemailer')

const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Peer = require("simple-peer")
const wrtc = require('wrtc')

const MAX_FILESIZE = 1020 * 1020 * 1
const fileTypes = /jpeg|jpg|png/;

app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'mysecretstring',
    resave: false,
    saveUninitialized: false,
}))


app.set('view engine', 'ejs')
app.set('views', './views')
app.use('/public', express.static(__dirname + '/public'))

database.startDBandApp(app, PORT)

app.use(flash())

passConfig.config(app)

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
})


// ----------------------------------------------------------------------------
// Login route
// --------------------------------------------------------------------------
app.get('/login', (req, res) => {
    res.render('login', { flash_message: req.flash('flash_message') })
})

// ----------------------------------------------------------------------------
// Login post route
// --------------------------------------------------------------------------
app.post('/login', passConfig.passport.authenticate(
    'loginStrategy',
    { successRedirect: '/welcome', failureRedirect: 'back', failureFlash: true }
))

// ----------------------------------------------------------------------------
// Signup route
// --------------------------------------------------------------------------
app.get('/signup', (req, res) => {
    res.render('signup', { flash_message: req.flash('flash_message') })
})

// ----------------------------------------------------------------------------
// Signup post route
// --------------------------------------------------------------------------
app.post('/signup', passConfig.passport.authenticate(
    'signupStrategy',
    { successRedirect: '/', failureRedirect: 'back', failureFlash: true }
))

// ----------------------------------------------------------------------------
// Index route
// --------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('home', { flash_message: req.flash('flash_message') })
})


// ----------------------------------------------------------------------------
// Welcome/home page route
// --------------------------------------------------------------------------
app.get('/welcome', auth, (req, res) => {
    if (!req.session.chatRooms) {
        const userID = app.locals.ObjectID(req.user._id)
        app.locals.chatRoomsCollection.find(
            {
                $or: [
                    { hostID: userID },
                    { adminID: userID },
                    {
                        userIDs: { $in: [userID] }
                    }
                ]
            }).toArray()
            .then(chatRooms => {
                req.session.chatRooms = chatRooms
                res.render('welcome', { user: req.user, chatRooms: chatRooms })
            })
            .catch(error => {
                res.send(`${error}`)
            })
    }
    else {
        //console.log('Session Chatrooms: ', JSON.stringify(req.session.chatRooms))
        res.render('welcome', { user: req.user, chatRooms: req.session.chatRooms })
    }
})


// ----------------------------------------------------------------------------
// Chatroom ID get route
// --------------------------------------------------------------------------
app.get('/welcome/:_id', auth, (req, res) => {
    const openChatRoom = req.session.chatRooms.find(chatRoom => chatRoom._id == req.params._id)
    //console.log(openChatRoom)
    if (!openChatRoom) {
        res.render('401')
    }
    else {
        //query messages for this chatroom and sort them in ascending order
        app.locals.messagesCollection.find({ chatRoomID: app.locals.ObjectID(req.params._id) })
            .sort({ timestamp: 1 }).toArray()
            .then(messages => {
                //console.log(messages)

                res.render('welcome', {
                    user: req.user,
                    chatRooms: req.session.chatRooms,
                    openChatRoom: openChatRoom,
                    messages: messages,
                    utility: utility,
                    flash_message: req.flash('flash_message')
                })
            })
            .catch(error => {
                res.send(`${error}`)
            })
    }
})



// ----------------------------------------------------------------------------
// Chatroom ID post route to send messages
// --------------------------------------------------------------------------
app.post('/welcome/:_id', auth, (req, res) => {
    const message = new Message(req.params._id, req.user._id, req.user.username, req.user.photoURL)
    message.text = req.body.message
    app.locals.messagesCollection.insertOne(message)
        .then(result => {
            res.redirect(`/welcome/${req.params._id}`)
        })
        .catch(error => {
            res.send(`${error}`)
        })
})

// ----------------------------------------------------------------------------
// Welcome page route: choose a friend to invite
// --------------------------------------------------------------------------
app.get('/inviteFriend', (req, res) => {
    const friendsQuery = []
    for (friendID of req.user.friendIDs) {
        friendsQuery.push({ _id: app.locals.ObjectID(friendID) })
    }
    if (friendsQuery.length > 0) {
        app.locals.usersCollection.find({ $or: friendsQuery }).toArray()
            .then(friends => {
                res.render('inviteFriend', { user: req.user, friends: friends })
            })
            .catch(error => {
                //error finding friends
                res.send(`${error}`)
            })
    }
    else {
        res.render('inviteFriend', { user: req.user, friends: [] })
    }
})

// ----------------------------------------------------------------------------
// Send Invite route: sends an chatroom invite to a friend
// --------------------------------------------------------------------------
app.get('/sendInvite/:chatRoomID', (req, res) => {
    const friendID = app.locals.ObjectID(req.query.friendID)
    const chatRoom = req.session.chatRooms.find(chatRoom => chatRoom._id == req.params.chatRoomID)
    chatRoom._id = app.locals.ObjectID(chatRoom._id)
    chatRoom.adminID = app.locals.ObjectID(chatRoom.adminID)
    chatRoom.hostID = app.locals.ObjectID(chatRoom.hostID)

    if (chatRoom.hostID.equals(friendID) || chatRoom.adminID.equals(friendID) || chatRoom.userIDs.find(_id => app.locals.ObjectID(_id).equals(friendID))) {
        req.flash('flash_message', 'That friend is already in your chatroom.')
        res.redirect(`/welcome/${chatRoom._id}`)
    }
    else {
        const invite = new Invite(User.deserialize(req.user), friendID, chatRoom)
        //insert if not exists
        app.locals.invitesCollection.updateOne(
            { $and: [{ 'receiver._id': friendID }, { 'chatRoom._id': chatRoom._id }] },
            {
                $setOnInsert: {
                    sender: invite.sender,
                    receiverID: invite.receiverID,
                    chatRoom: invite.chatRoom
                }
            },
            { upsert: true }
        )
            .then(result => {
                req.flash('flash_message', 'Invite sent successfully.')
                res.redirect(`/welcome/${chatRoom._id}`)
            })
            .catch(error => {
                res.send(`${error}`)
            })
    }
})

// ----------------------------------------------------------------------------
// Accept or Reject Invite route
// --------------------------------------------------------------------------
//"/friends/<%= invite._id %>?chatRoomID=<%= invite.chatRoom._id %>&isAccepted=true"
app.get('/friends/:_id', (req, res) => {
    const inviteID = app.locals.ObjectID(req.params._id)
    const chatRoomID = app.locals.ObjectID(req.query.chatRoomID)
    const isAccepted = (req.query.isAccepted == 'true')

    if (isAccepted) {
        app.locals.chatRoomsCollection.updateOne(
            { _id: chatRoomID },
            { $push: { userIDs: app.locals.ObjectID(req.user._id) } }
        )
            .then(result => {
                app.locals.invitesCollection.deleteOne({ _id: inviteID })
                    .then(result => {
                        req.flash('flash_message', 'Invite accepted.')
                        req.session.chatRooms = null
                        res.redirect('/friends')
                    })
                    .catch(error => {
                        //error deleting old invite
                        res.send(`${error}`)
                    })
            })
            .catch(error => {
                //error accepting invite
                res.send(`${error}`)
            })
    }
    else {
        //TODO: reject invite
    }
})

// ----------------------------------------------------------------------------
// Chatroom route
// --------------------------------------------------------------------------
app.get('/chatroom', (req, res) => {
    res.render('chatroom', { user: req.user })
})

// ----------------------------------------------------------------------------
// Show route for chatrooms
// --------------------------------------------------------------------------
app.post('/chatroom', auth, (req, res) => {

    const user = User.deserialize(req.user)
    app.locals.usersCollection.find({ isAdmin: true }).toArray()
        .then(admins => {
            if (admins.length == 0) {
                res.send("500 error")
            }
            else {
                console.log('Admins: ', admins)
                const admin = admins[Math.floor(Math.random() * admins.length)]
                const chatRoom = new ChatRoom(user._id, req.body.roomName)
                chatRoom.photoURL = req.body.roomImage
                chatRoom.adminID = admin._id

                req.session.chatRooms.push(chatRoom)

                app.locals.chatRoomsCollection.insertOne(chatRoom)
                    .then(result => {
                        res.redirect('/welcome')
                    })
                    .catch(error => {
                        res.send(`${error}`)
                    })
            }
        })
        .catch(error => {
            res.send(`${error}`)
        })
})

// ----------------------------------------------------------------------------
// Initialize webcam route
// --------------------------------------------------------------------------
app.get("/initWebcam", auth, (req, res) => {
    res.render('initWebcam', { user: req.user })
})


// ----------------------------------------------------------------------------
// render webcam
// --------------------------------------------------------------------------
app.get("/1", (req, res) => {
    res.render('webcam')
})


// ----------------------------------------------------------------------------
// Friends route
// --------------------------------------------------------------------------
app.get('/friends', auth, (req, res) => {
    const friendsQuery = []
    for (friendID of req.user.friendIDs) {
        friendsQuery.push({ _id: app.locals.ObjectID(friendID) })
    }
    if (friendsQuery.length > 0) {
        app.locals.usersCollection.find({ $or: friendsQuery }).toArray()
            .then(friends => {
                app.locals.invitesCollection.find({ receiverID: app.locals.ObjectID(req.user._id) }).toArray()
                    .then(invites => {
                        res.render(
                            'friends',
                            {
                                user: req.user,
                                friends: friends,
                                invites: invites,
                                flash_message: req.flash('flash_message')
                            }
                        )
                    })
                    .catch(error => {
                        //error finding invites
                        res.send(`${error}`)
                    })
            })
            .catch(error => {
                //error finding friends
                res.send(`${error}`)
            })
    }
    else {
        res.render(
            'friends',
            {
                user: req.user,
                friends: [],
                invites: [],
                flash_message: req.flash('flash_message')
            }
        )
    }
})


// ----------------------------------------------------------------------------
// Show friends route 
// --------------------------------------------------------------------------
app.post('/friends', (req, res) => {
    const friendName = req.body.friendName
    if (friendName == req.user.username) {
        req.flash('flash_message', 'Wow, you really are alone, huh?')
        return res.redirect('/friends')
    }
    app.locals.usersCollection.findOne({ username: friendName })
        .then(friend => {
            if (friend) {
                const userID = app.locals.ObjectID(req.user._id)
                //.equals must be used when comparing mongodb ObjectIds
                if (friend.friendIDs.find(_id => _id.equals(userID))) {
                    //don't send request if already friends
                    req.flash('flash_message', `${friend.username} is already your friend!`)
                    return res.redirect('/friends')
                }
                else {
                    //make sure request does not exist from either user or friend
                    app.locals.requestsCollection.find({
                        $or: [
                            {
                                $and: [
                                    { 'sender._id': userID },
                                    { 'receiver.username': friendName }
                                ]
                            },
                            {
                                $and: [
                                    { 'sender.username': friendName },
                                    { 'receiver._id': userID }
                                ]
                            }
                        ]
                    }).toArray()
                        .then(requests => {
                            if (requests.length == 0) {
                                //only insert if request does not exist
                                app.locals.requestsCollection.insertOne(
                                    new Request(sender = User.deserialize(req.user), receiver = User.deserialize(friend))
                                )
                                    .then(result => {
                                        req.flash('flash_message', `Friend request sent to ${friendName}`)
                                        res.redirect('/friends')
                                    })
                                    .catch(error => {
                                        //error sending request
                                        res.send(`${error}`)
                                    })
                            }
                            else {
                                //friend request already exists
                                req.flash('flash_message', `That friend request is already pending.`)
                                res.redirect('/friends')
                            }
                        })
                        .catch(error => {
                            //finding requests error
                            res.send(`${error}`)
                        })
                }
            }
            else {
                req.flash('flash_message', 'No one with that username was found.')
                res.redirect('/friends')
            }
        })
        .catch(error => {
            res.send(`${error}`)
        })
})



// ----------------------------------------------------------------------------
// Requests route
// --------------------------------------------------------------------------
app.get('/requests', auth, (req, res) => {
    app.locals.requestsCollection.find({ 'receiver._id': app.locals.ObjectID(req.user._id) }).toArray()
        .then(requests => {
            if (requests.length > 0) {
                console.log(requests)
                res.render('requests', { requests: requests })
            }
            else {
                res.render('requests', { requests: [] })
            }
        })
        .catch(error => {
            res.send(`${error}`)
        })
})

// ----------------------------------------------------------------------------
// Requests route: accept or reject request
// --------------------------------------------------------------------------
app.get('/requests/:_id', auth, (req, res) => {
    const requestID = app.locals.ObjectID(req.params._id)
    const senderID = app.locals.ObjectID(req.query.senderID)
    const userID = app.locals.ObjectID(req.user._id)
    const isAccepted = (req.query.isAccepted == 'true')

    if (isAccepted) {
        const bulkAccept = app.locals.usersCollection.initializeUnorderedBulkOp();
        //find user and add sender as friend
        //$push is used to append to arrays in mongodb
        bulkAccept.find({ _id: userID }).updateOne({ $push: { friendIDs: senderID } })
        //find friend and add user as friend
        bulkAccept.find({ _id: senderID }).updateOne({ $push: { friendIDs: userID } })
        bulkAccept.execute()
            .then(result => {
                //remove request
                app.locals.requestsCollection.deleteOne({ _id: requestID })
                    .then(result => {
                        res.redirect('/requests')
                    })
                    .catch(error => {
                        //remove request from request list failed
                        res.send(`${error}`)
                    })
            })
            .catch(error => {
                //add friend failed
                res.send(`${error}`)
            })
    }
    else {
        //TODO: reject request
    }
})

// ----------------------------------------------------------------------------
// User profile route
// --------------------------------------------------------------------------
app.get('/profile', auth, (req, res) => {
    console.log(req.user)
    res.render('profile', { user: req.user, flash_message: req.flash('flash_message') })
})


// ----------------------------------------------------------------------------
// User profile post route
// --------------------------------------------------------------------------
const passwordcrypto = require('./passwordcrypto')

app.post('/profile', auth, (req, res) => {
    const user = req.user;
    const username = req.body.username;
    const newPassword = req.body.password;
    const password = passwordcrypto.hashPassword(newPassword)
    const email = req.body.email;
    const birthday = req.body.birthday;
    const location = req.body.location;
    const bio = req.body.bio;

    const query = { _id: app.locals.ObjectID(user._id) }
    const newValue = { $set: { username, password, email, birthday, location, bio } }
    app.locals.usersCollection.updateOne(query, newValue)
        .then(result => {
            req.flash('flash_message', "Updated successfully")
            res.redirect('/profile')
        })
        .catch(error => {
            res.send(`${error}`)
        })
})

// ----------------------------------------------------------------------------
// Delete myself  post route
// --------------------------------------------------------------------------
app.post('/deleteMyself', auth, (req, res) => {
    const _id = req.body._id

    const query = { _id: app.locals.ObjectID(_id) }
    const cquery = { hostID: app.locals.ObjectID(_id) }
    const rquery = { 'sender._id': app.locals.ObjectID(_id) }
    const iquery = { 'sender._id': app.locals.ObjectID(_id) }
    app.locals.chatRoomsCollection.deleteMany(cquery)
        .then(result => {
            app.locals.requestsCollection.deleteMany(rquery)
                .then(result => {
                    app.locals.invitesCollection.deleteMany(iquery)
                        .then(result => {
                            app.locals.usersCollection.deleteOne(query)
                                .then(result => {
                                    req.logOut()
                                    res.redirect('/')
                                })
                                .catch(error => {
                                    console.log("Error deleting account")
                                })
                        })
                        .catch(error => { 
                            console.log("Error deleting invite")
                        })
                })
                .catch(error => { console.log("Error deleting request")
            })
        })
        .catch(error => {
            console.log("Error deleting chatroom")
        })
})

// ----------------------------------------------------------------------------
// Updating images route
// --------------------------------------------------------------------------
app.get('/uploadImage', auth, (req, res) => {
    res.render('uploadImage', { flash_message: req.flash('flash_message') })
})



// ----------------------------------------------------------------------------
// Using multer to upload a file for images
// --------------------------------------------------------------------------
const StorageOptions = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/images')
    },
    filename: (req, file, callback) => {
        const rand = Math.random().toFixed(4).toString()
        const originalName = rand + file.originalname.toString()
        callback(null, originalName)
    }
})

const imageUpload = multer({
    storage: StorageOptions,
    limits: { fileSize: MAX_FILESIZE },
    fileFilter: (req, file, callback) => {
        const ext = fileTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = fileTypes.test(file.mimetype)
        if (ext && mimetype) {
            return callback(null, true)
        } else {
            return callback('Error: Images (jpeg, jpg, png) image format only')
        }
    }
}).single('imageButton')



// ----------------------------------------------------------------------------
// Upload image post route to upload the image
// --------------------------------------------------------------------------
app.post('/uploadImage', auth, (req, res) => {
    imageUpload(req, res, error => {
        if (error) {
            req.flash('flash_message', "Can't upload because: " + error)
            return res.redirect('/uploadImage')
        }
        else if (!req.file) {
            req.flash('flash_message', "No file selected")
            return res.redirect('/uploadImage')
        }

        //update user collection
        const user = req.user
        const query = { _id: app.locals.ObjectID(user._id) }
        const photoURL = req.file.filename
        const newValue = { $set: { photoURL } }
        app.locals.usersCollection.updateOne(query, newValue)
            .then(result => {
                req.flash('flash_message', 'Profile update successful!')
                res.redirect('/profile')
            })
            .catch(error => {
                res.send(`${error}`)
            })
        res.redirect('/profile')
    })
})




// ----------------------------------------------------------------------------
// Contacts route
// --------------------------------------------------------------------------
app.get('/contactus', (req, res) => {
    res.render('contactus')
})

// ----------------------------------------------------------------------------
// Contacts post route to email issues
// --------------------------------------------------------------------------
app.post('/contactus', (req, res) => {

    const output = `
    <html>
        <p>You have a new message from ${req.body.name} </p>
        <h1> User information </h1>
        <ul>
            <li>Name: ${req.body.name} </li>
            <li>Email: ${req.body.email} </li>
            <li>Subject: ${req.body.subject} </li>
        </ul> <br>
        <h1> Message To Creator: </h1>
        <ul>
            <li>content: ${req.body.description} </li>
        </ul>
    </html>
    `
    async function main() {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "19webserver@gmail.com",
                pass: "@password123"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: `${req.body.email}`, // sender address
            to: "dat2pham@gmail.com, canaanm1114@gmail.com, nafeek30@gmail.com", // list of receivers
            subject: `${req.body.subject}`, // Subject line
            text: `${req.body.description}`, // plain text body
            html: output // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.redirect('/')
    }
    main().catch(console.error);
})


// ----------------------------------------------------------------------------
// Logout route
// --------------------------------------------------------------------------
app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        req.logOut()
        res.redirect('/')
    })
})

// ----------------------------------------------------------------------------
// Middlewares for authentication and admin authentication
// --------------------------------------------------------------------------
function auth(req, res, next) {
    const user = req.user
    if (!user) {
        res.render('401')
    }
    else {
        next()
    }
}

function authAsAdmin(req, res, next) {
    const user = req.user;
    if (!user || !user.isAdmin) {
        res.render('401');
    }
    else {
        next();
    }
}