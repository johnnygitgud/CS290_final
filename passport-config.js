//This file uses node passport packages. the command used was: npm i passport passport-local express-session express-flash
//Passport is used to authenticate users, session mgmt and more. 


const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")

function initialize(passport, getUserbyEmail, getUserById){
    // Function for user authentication
    const verifyUsers = async (email, password, done) => {
    // Get users by email and check for registered users
        const user = getUserbyEmail(email)
        if (user == null){
            return done(null, false, {message: "No user found with that email"})
        }
        try {
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else{
                return done (null, false, {message: "Incorrect Password"})
            }
        } catch (e) {
            console.log(e);                         
            return done(e)
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, verifyUsers))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize // Allow function to be exported other files.