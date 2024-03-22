//Use npm run devStart to start server. rs to restart and CTRL+C to close..
// Load environment variables from .env file in development mode by avoiding a "production" environment.
//This is for testing in a safe environment before releasing to the public
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

// Import required libraries and initialize Express application
const express = require("express")//Express is part of Node JS. It simplifies handling of HTTP requests.
const app = express()
const bcrypt = require("bcrypt") //Bcrypt enables password hashing
const passport = require("passport") // Is litterally a passport for user authentication.
const initializePassport = require("./passport-config") // Separate passport config file is needed and is imprted to the server.js
const flash = require("express-flash") //Express Flash is used to display ERROR messages that respond to user requests.
const session = require("express-session") //Express Session is used to manage user sessions. This enhances security.
const methodOverride = require("method-override") //Method overide enables PUT/DELETE. Delete is used in the logout route below.


// Initialize passport with custom configuration
initializePassport(
    passport,
    // Function to find user by email
    email => users.find(user => user.email === email),
    // Function to find user by ID
    id => users.find(user => user.id === id)
)

// Array to store registered users (should be replaced with a database in production)
const users = []

// Middleware setup
app.use(express.urlencoded({ extended: false })) // Parse URL-encoded bodies
app.use(flash()) // Flash messages
app.use(express.static('public'));//This was a work around for the background image. When the .ejs was updated to fancier css, the image stopped working. This line was the fix and .css and jpeg are in path directory.

app.use(session({
    secret: process.env.SECRET_KEY, // Secret for session cookie
    resave: false, // Do not save session if not modified
    saveUninitialized: false // Do not save new sessions without modifications
}))
app.use(passport.initialize()) // Initialize Passport
app.use(passport.session()) // Persistent login sessions
app.use(methodOverride("_method")) // Method override for handling PUT and DELETE requests

// Route for handling login form submission
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/", // Redirect to home page on successful login
    failureRedirect: "/login", // Redirect back to login page on failure
    failureFlash: true // Enable flash messages for failed login attempts
}))

// Route for handling registration form submission
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // Add new user to the users array (should be stored in a database in production)
        users.push({
            id: Date.now().toString(), // Unique user ID
            email: req.body.email, // User's email
            password: hashedPassword, // Hashed password
        })
        console.log(users); // Log the newly registered user
        res.redirect("/login") // Redirect to login page after successful registration
    } catch (e) {
        console.log(e); // Log any errors that occur during registration
        res.redirect("/register") // Redirect back to registration page on error
    }
})

//Bellow are the paths for displaying each .ejs file that holds the html that the user sees. 
// Route for rendering the home page
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", { name: req.user.name }) // Render index.ejs with user's name
})

// Route for rendering the login page
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs") // Render login.ejs
})

// Route for rendering the registration page
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs") // Render register.ejs
})

// Route for handling logout
app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/") // Redirect to home page after logout
    })
})

// Route for handling message submission. NOT FULLY FUNCTIONAL YET. Database to improve this TBD.
app.post("/send-message", checkAuthenticated, (req, res) => {
    const { recipientEmail, message } = req.body;
    // Add message to messages array
    messages.push({
        sender: req.user.email,
        recipient: recipientEmail,
        message: message
    });
    res.redirect("/"); // Redirect to index page after sending message
})


// Middleware function to check if user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // Proceed to the next middleware if user is authenticated
    }
    res.redirect("/login") // Redirect to login page if user is not authenticated
}

// Middleware function to check if user is not authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/") // Redirect to home page if user is authenticated
    }
    next() // Proceed to the next middleware if user is not authenticated
}

// Start the Express server and listen on port 3000
app.listen(3000)
