const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const crypto = require('crypto')

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* ------------------    Database    ------------------------------------- */
mongoose.connect('mongodb://127.0.0.1:27017/todoapp').then((msg)=>{
    console.log('Connection Success :)')
}).catch((err)=>{
    console.log("Connection Failed :(")
})

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String
})

const eventSchema = new mongoose.Schema({
    user: String,
    title: String,
    time: String,
    description: String
})

const User = new mongoose.model('User', userSchema)
const Event = new mongoose.model('Event', eventSchema)

var _user = {}
/* ----------------------------------------------------------------------- */

app.get('/', (req,res)=>{
    res.render('index', {message: ""})
})

app.post('/login', (req,res)=>{
    const {username, password} = req.body
    let algorithm = 'sha256'
    let key = password
    let digest = crypto.createHash(algorithm).update(key).digest('hex')
    User.find({$and: [{username: username}, {password: digest}]}).then((msg)=>{
        if(msg.length > 0){
            let user = msg[0]
            _user = user
            let message = "Login Successfull :)"
            res.render('dashboard', {user, message})
        }else{
            console.log('login failed :(')
            let message = "Invalid Username or Password"
            res.render('index', {message})
        }
    }).catch((err)=>{
        console.log(err)
        let message = "Error"
        res.render('index', {message})
    })
})

app.get('/register', (req,res)=>{
    res.render('register')
})

app.get('/registerUser', (req,res)=>{
    const {name, username, email, password} = req.query
    let algorithm = 'sha256'
    let key = password
    let digest = crypto.createHash(algorithm).update(key).digest('hex')
    User.create([{
        name: name,
        username: username,
        email: email, 
        password: digest
    }]).then((msg)=>{
        let message = 'Registration Successfull! :)'
        res.render('index', {message})
    }).catch((err)=>{
        let message = 'Error registering user :('
        res.render('register', {message})
    })
})

app.get('/dashboard', (req,res)=>{
    res.render('dashboard', {user: _user, message: "Welcome to Dashboard"})
})

app.get('/profile', (req,res)=>{
    res.render('profile', {user:_user})
})

app.get('/addEvent', (req,res)=>{
    const message = ""
    res.render('addEvent', {user: _user, message: message})
})

app.get('/add-event', (req,res)=>{
    const {title, time, description} = req.query
    Event.create({
        user: _user.username,
        title: title,
        time: time,
        description: description
    }).then((msg)=>{
        const message = "Event Created Successfully! :)"
        const type = "success"
        res.render('addEvent', {user: _user, message:message, type:type})
    }).catch((err)=>{
        const message = "Couldn't Create Successfully! :)"
        const type = "danger"
        res.render('addEvent', {user: _user, message:message, type:type})  
    })
})

app.get('/allEvents', (req,res)=>{
    Event.find({ user: _user.username }).then((msg)=>{
        const message = ''
        console.log(msg)
        res.render('allEvents', {user: _user, events:msg, message:message})
    }).catch((err)=>{
        console.log(err)
    })
})

app.get('/deleteEvent/:eventid', (req,res)=>{
    const {eventid} = req.params
    console.log(eventid)
    Event.findByIdAndDelete({_id: eventid}).then((msg)=>{
        Event.find({ user: _user.user }).then((msg)=>{
            const message = "Event Deleted! "
            const type = 'success'
            res.render('allEvents', {user: _user, events:msg, message:message, type:type})
        }).catch((err)=>{
            const message = "Couldn't Delete! "
            const type = 'danger'
            res.render('allEvents', {user: _user, events:msg, message:message, type:type})
        })
    }).catch((err)=>{
        console.log(err)
    })
})

app.get('/logout', (req,res)=>{
    console.log(_user)
    res.render('logout')
})

app.listen('5000', (req,res)=>{
    console.log('server running at http://localhost:5000')
})