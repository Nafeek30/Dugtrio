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
    res.render('home',{flash_message: req.flash('flash_message')})
})

app.get('/welcome', auth, (req, res)=>{
    res.render('welcome', {user:req.user})
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