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
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const eventSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
})

const User = new mongoose.model('User', userSchema)
const Event = new mongoose.model('Event', eventSchema)

var _user = null

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
    if(_user === null){
        res.redirect('error')
        return
    }
    res.render('dashboard', {user: _user, message: "Welcome to Dashboard"})
})

app.get('/profile', (req,res)=>{
    if(_user === null){
        res.redirect('error')
        return
    }
    res.render('profile', {user:_user})
})

app.get('/addEvent', (req,res)=>{
    if(_user === null){
        res.redirect('error')
        return
    }
    const message = ""
    res.render('addEvent', {user: _user, message: message})
})

app.get('/add-event', (req,res)=>{
    if(_user === null){
        res.redirect('error')
        return
    }
    const {title,date, time, description} = req.query
    Event.create({
        user: _user.username,
        title: title,
        date: date,
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

app.get('/all-events', (req,res)=>{
    if(_user === null){
        res.redirect('error')
        return
    }
    Event.find({ user: _user.username }).then((msg)=>{
        const message = ''
        res.render('allEvents', {user: _user, events:msg, message:message})
    }).catch((err)=>{
        console.log(err)
    })
})

app.get('/deleteEvent/:eventid', (req,res)=>{
    if(_user === null){
        res.redirect('error')
        return
    }
    const {eventid} = req.params
    Event.findByIdAndDelete({_id: eventid}).then((msg)=>{
        Event.find({user: _user.username}).then((msg)=>{
            const message = "Event Deleted! "
            const type = 'success'
            res.render('allEvents', {user: _user, events:msg, message:message, type:type})
        })
    }).catch((err)=>{
        console.log(err)
    })
})

app.get('/logout', (req,res)=>{
    if(_user === null){
        res.redirect('error')
        return
    }
    _user = null
    res.render('logout')
})

app.get('/error', (req,res)=>{
    res.render('error')
})
app.listen('5000', (req,res)=>{
    console.log('server running at http://localhost:5000')
})

/* djgupta820 
   djgupta
*/