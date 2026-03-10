const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://my_care_admin:my_care_123_sahana146@cluster0.mwtrrit.mongodb.net/mycare")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);
const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a strong, random secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000 // 1 hour in milliseconds
    }
}));

// Middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        // User is not authenticated, redirect to login page with an error message
        res.redirect('/login?message=' + encodeURIComponent('Please log in to view this page.') + '&type=error');
    }
}

// Route for the login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Route for the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle login POST request
app.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        const user = await User.findOne({ email: usernameOrEmail });

        if (!user || user.password !== password) {
            return res.redirect('/login?message=' + encodeURIComponent('Invalid username or password.') + '&type=error');
        }

        req.session.userId = user._id;
        res.redirect('/home');

    } catch (err) {
        console.log(err);
        res.redirect('/login?message=' + encodeURIComponent('Login error') + '&type=error');
    }
});

// Handle signup POST request
app.post('/signup', (req, res) => {
    const { email, password, confirmPassword, keepMeSignedIn } = req.body;
    console.log('Signup attempt:', { email, password, confirmPassword, keepMeSignedIn });

    // Dummy registration logic
    if (password === confirmPassword) {
        // In a real application, you would save the user to a database here
        console.log('DUMMY: User registered successfully:', { email });

        // *** IMPORTANT CHANGE HERE: Redirect to login with the email pre-filled ***
        res.redirect('/login?message=' + encodeURIComponent('Registration successful! Please log in.') + '&type=success&email=' + encodeURIComponent(email));
    } else {
        res.redirect('/signup?message=' + encodeURIComponent('Passwords do not match.') + '&type=error');
    }
});

// Route for the home page (protected)
app.get('/home', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Redirect root URL to login page
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Start the server
app.listen(PORT, () => {
    console.log(`MyCare server running on http://localhost:${PORT}`);
    console.log('Test Login Credentials: Username/Email: user@example.com, Password: password123');
});
