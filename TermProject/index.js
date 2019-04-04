const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const session = require('express-session')

app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: 'mysecretstring',
    resave: false,
    saveUninitialized: false,
}))

app.set('view engine', 'ejs')
app.set('views', './views')
app.use('/public', express.static(__dirname+'/public'))

const database = require('./database.js')
database.startDBandApp(app, PORT)

const flash = require('connect-flash')
app.use(flash())

const passConfig = require('./passConfig.js')
passConfig.config(app)

app.get('/', (req,res)=>{
    res.render('home', {flash_message: req.flash('flash_message')})
})

app.get('/logout', (req,res)=>{
    req.logout()
    res.redirect('/')
})

app.get('/welcome', auth, (req, res)=>{
    res.render('welcome', {user:req.user})
})

app.post('/chatRoom', (req, res) => {
    const user = User.deserialize(req.user)
    app.locals.usersCollection.find({isAdmin: true}).toArray()
        .then(admins => {
            if(admins.length == 0)
            {
                //error, no admins
            }
            else
            {
                const admin = admins[Math.random() * admins.length]
                const chatRoom = new ChatRoom(user._id, req.body.chatRoomName)
                chatRoom.admin = admin
                //TODO: insert chatroom into database
            }
        })
        .catch(error => {

        })
})

app.get('/contactus', (req, res)=>{
    res.render('contactus')
})

app.get('/login', (req,res)=>{
    res.render('login', {flash_message: req.flash('flash_message')})
})

app.post('/login', passConfig.passport.authenticate(
    'loginStrategy',
    {successRedirect: '/welcome', failureRedirect: '/login', failureFlash: true}
))

app.get('/signup', (req,res)=>{
    res.render('signup', {flash_message: req.flash('flash_message')})
})

app.post('/signup', passConfig.passport.authenticate(
    'signupStrategy',
    {successRedirect: '/', failureRedirect: '/signup', failureFlash: true}
))

function auth(req, res, next){
    const user = req.user
    if(!user){
        res.render('401')
    }
    else{
        next()
    } 
}

function authAsAdmin(req, res, next)
{
    const user = req.user;
    if(!user || !user.isAdmin)
    {
        res.render('401');
    }
    else
    {
        next();
    }
}