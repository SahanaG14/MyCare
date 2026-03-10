const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

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
app.use(express.static(path.join(__dirname, 'public')));

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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle login POST request
app.post('/login', (req, res) => {
    const { usernameOrEmail, password, keepMeSignedIn } = req.body;
    console.log('Login attempt:', { usernameOrEmail, password, keepMeSignedIn });

    // Dummy authentication logic
    if (usernameOrEmail === 'user@example.com' && password === 'password123') {
        req.session.userId = 'dummyUserId123'; // Set a dummy user ID in session

        if (keepMeSignedIn) {
            // If "Keep me signed in" is checked, extend session duration (e.g., 7 days)
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        } else {
            // If not checked, set a shorter duration or default (e.g., 1 hour, as configured above)
            req.session.cookie.maxAge = 3600000; // 1 hour
        }

        res.redirect('/home'); // Redirect to home page on successful login
    } else {
        // Redirect back to login with an error message
        res.redirect('/login?message=' + encodeURIComponent('Invalid username or password.') + '&type=error');
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