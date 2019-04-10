const express = require('express')
const app = express()
const database = require('./database.js')
const flash = require('connect-flash')
const passConfig = require('./passConfig.js')
const ChatRoom = require('./model/ChatRoom.js')
const User = require('./model/User.js')
const PORT = process.env.PORT || 3000

const session = require('express-session')
const nodemailer = require('nodemailer')
var Grid = require("gridfs-stream");

const multer = require('multer')
const path = require('path')
const fs = require('fs')

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

app.get('/', (req, res) => {
    res.render('home', { flash_message: req.flash('flash_message') })
})

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
})

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

app.get('/welcome', auth, (req, res) => {
    app.locals.chatRoomsCollection.find({ hostID: app.locals.ObjectID(req.user._id) }).toArray()
        .then(chatRooms => {
            console.log(chatRooms)
            res.render('welcome', { user: req.user, chatRooms: chatRooms })
        })
        .catch(error => {
            res.send(error)
        })

})

app.get('/profile', auth, (req, res) => {
    console.log(req.user)
    res.render('profile', { user: req.user, flash_message: req.flash('flash_message') })
})

app.post('/profile', auth, (req, res) => {
    const user = req.user;
    const username = req.body.username;
    const email = req.body.email;
    const birthday = req.body.birthday;
    const location = req.body.location;
    const bio = req.body.bio;

    const query = { _id: app.locals.ObjectID(user._id) }
    const newValue = { $set: { username, email, birthday, location, bio } }

    app.locals.usersCollection.updateOne(query, newValue)
        .then(result => {
            req.flash('flash_message', 'Profile update successful!')
            res.redirect('/profile')
        })
        .catch(error => {
            res.send(error)
        })
})

app.get('/uploadImage', auth, (req, res) => {
    res.render('uploadImage', {flash_message: req.flash('flash_message')})
})

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

app.post('/uploadImage', auth, (req, res) => {
    imageUpload(req, res, error => {
        if (error) {
            req.flash('flash_message', "Can't upload because: "+ error)
            return res.redirect('/uploadImage')
        }
        else if (!req.file) {
            req.flash('flash_message',"No file selected")
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
                res.send(error)
            })
        res.redirect('/profile')
    })
})

app.get('/chatroom', (req, res) => {
    res.render('chatroom', { user: req.user })
})

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

                app.locals.chatRoomsCollection.insertOne(chatRoom)
                    .then(result => {
                        res.redirect('/welcome')
                    })
                    .catch(error => {
                        res.send(error)
                    })
            }
        })
        .catch(error => {
            res.send(error)
        })
})

app.get('/contactus', (req, res) => {
    res.render('contactus')
})

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

app.get('/login', (req, res) => {
    res.render('login', { flash_message: req.flash('flash_message') })
})

app.post('/login', passConfig.passport.authenticate(
    'loginStrategy',
    { successRedirect: '/welcome', failureRedirect: 'back', failureFlash: true }
))

app.get('/signup', (req, res) => {
    res.render('signup', { flash_message: req.flash('flash_message') })
})

app.post('/signup', passConfig.passport.authenticate(
    'signupStrategy',
    { successRedirect: '/', failureRedirect: 'back', failureFlash: true }
))

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