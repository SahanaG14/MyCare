const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb+srv://my_care_admin:sahana123@cluster0.mwitrit.mongodb.net/mycare?retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
    email: email,
    password: hashedPassword
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

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.redirect('/login?message=Invalid username or password&type=error');
        }

        req.session.userId = user._id;
        res.redirect('/home');

    } catch (err) {
        console.log(err);
        res.redirect('/login?message=Login error&type=error');
    }
});

// Handle signup POST request
app.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/signup?message=Passwords do not match&type=error');
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        res.redirect('/login?message=Account created! Please login.&type=success');

    } catch (err) {
        console.log(err);
        res.redirect('/signup?message=Signup failed&type=error');
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
