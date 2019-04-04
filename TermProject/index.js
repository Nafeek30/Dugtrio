const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const session = require('express-session')
const nodemailer = require('nodemailer')

app.use(express.urlencoded({extended: true}))
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

app.get('/contactus', (req, res)=>{
    res.render('contactus')
})

app.post('/contactus', (req,res)=>{

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
    `
    async function main(){
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "19webserver@gmail.com",
          pass: "@password123"
        },
        tls:{
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