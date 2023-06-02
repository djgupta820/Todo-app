const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

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

const User = new mongoose.model('User', userSchema)
/* ----------------------------------------------------------------------- */

app.get('/', (req,res)=>{
    res.render('index')
})

app.post('/login', (req,res)=>{
    const {username, password} = req.body
    User.find({$and: [{username: username}, {password: password}]}).then((msg)=>{
        if(msg.length > 0){
            let user = User.find({$and: [{username: username}, {password: password}]})
            res.render('dashboard', {user})
        }else{
            console.log('login failed :(')
            // let message = "Invalid Username or Password"
            res.redirect('/')
        }
    }).catch((err)=>{
        console.log(err)
        res.redirect('/')
    })
})

app.get('/register', (req,res)=>{
    res.render('register')
})

app.get('/registerUser', (req,res)=>{
    const {name, username, email, password} = req.query
    console.log(name,username, email, password)
    User.create([{
        name: name,
        username: username,
        email: email, 
        password: password
    }]).then((msg)=>{
        console.log('User registered successfull :)')
        res.redirect('/')
    }).catch((err)=>{
        console.log('Error registering user :(')
        res.redirect('/')
    })
})

app.get('/dashboard', (req,res)=>{
    res.render('dashboard')
})

app.listen('5000', (req,res)=>{
    console.log('server running at http://localhost:5000')
})