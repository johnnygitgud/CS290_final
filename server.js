//This is the server file. To start the server in a terminal use the command: npm run devStart. CTRL+C to shut it down.

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//Imported libraries. Node express was installed locally with npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")//Import bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config") //Import passport config file
const flash = require("express-flash")
const session = require("express-session")


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)



//Array to to store users. WARNING!! NOT THE MOST SECURE METHOD. DATABASE LIKE MYSQL SHOULD BE USED EVENTUALLY!!
const users = []

//The line below uses app.use. It makes the info entered by the user accessible.
app.use(express.urlencoded({extended: false}))

//This syntax makes the views folder static. CSS file was unable to load until it was made static
app.use(express.static(__dirname + '/views'));


app.use(flash())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false, // Prevent saving users session
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))


//This app.post will handle hashing user passwords by calling to bcrypt that was imported
app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            email: req.body.email,
            password: hashedPassword,   //Setting password: req.body.password will reveal credentials when the test console.log line below is ran
        })
        console.log(users)// test to check users are being created
        res.redirect("/login")

    } catch (e) {
        console.log(e)
        res.redirect("/register")
    }
})
 
//Each app.get tells the server to render each webpage and the /'s are like directories
app.get('/', (req, res) => {
    res.render("index.ejs")
})

app.get('/login', (req, res) => {
    res.render("login.ejs")
})

app.get('/register', (req, res) => {
    res.render("register.ejs")
})
//Each app.get points to a .ejs file in the views folder and will not render if the folder is named something else.
//Each .ejs file will hold html and anything that will be rendered on the browser


app.listen(3000)
