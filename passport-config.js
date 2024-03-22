//This file uses node passport packages. the command used was: npm i passport passport-local express-session express-flash
//Passport is used to authenticate users, session mgmt and more. 


const LocalStrategy = require("passport-local").Strategy //Local Strategy is part of Passport library. Is used for authentication for username and password
const bcrypt = require("bcrypt")

function initialize(passport, getUserbyEmail, getUserById){
    // Function for user authentication uses 3 parameters. Passport is required, getemail because registration requires email, user id becaause unique ID's are generated for each user.
    //They are call back functions to retrieve user data.
    const verifyUsers = async (email, password, done) => {
    // Get users by email and check for registered users
        const user = getUserbyEmail(email)
        // The same message is used twice to reduce probability of credential guessing.
        if (user == null){ // Error handling for when user does not exist in the array.
            return done(null, false, {message: "Incorrect email or password"})//This is displayed in login.ejs when the user is not registered
        }
        try {
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else{
                return done (null, false, {message: "Incorrect email or password"})//This is displayed when user enters correct email but incorrect password.
            }
        } catch (e) {// easy variable to display in terminal if an error occurs.
            console.log(e);                         
            return done(e)
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, verifyUsers))//Passport  uses the local strategy to confirm credentials.
    passport.serializeUser((user, done) => done(null, user.id)) // Serialization is for storing user authentication data in a session.
    passport.deserializeUser((id, done) => {  // Deserialization is the process of retrieving and reconstrucing the authentication data when needed. Helpful for multiple requests from users during a sesion.
        return done(null, getUserById(id))
    })
}

module.exports = initialize // Allow function to be exported to other files. Specifically server.js