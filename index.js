const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://anilkumar2001:anil2001@userdata.wdht2zr.mongodb.net/');
const db = mongoose.connection;
db.on('error', () => console.log('error'));
db.once('open', () => console.log('connected'));

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    mobile: String,
    email: String,
    street: String,
    city: String,
    state: String,
    country: String,
    login: String,
    password: String,
    socketId: String
});

const User = mongoose.model('User', userSchema);

io.on('connection', (socket) => {
    console.log('New user connected');

    // Join the user to the "live_users" room
    socket.join('live_users');

    // When a new user is added to MongoDB
    socket.on('new_user', async (user) => {
        user.socketId = socket.id;
        const newUser = new User(user);
        await newUser.save();
        io.to('live_users').emit('user_list', await User.find({}));
    });

    // Disconnect event
    socket.on('disconnect', async () => {
        await User.findOneAndDelete({ socketId: socket.id });
        io.to('live_users').emit('user_list', await User.find({}));
    });
});

app.get('/getUser', (req, res) => {
    User.find()
        .then(users => res.json(users)) 
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' }); 
        });
});

app.post("/sign_up", async (req, res) => {
    const { login, password } = req.body;

    try {
        const existingUser = await User.findOne({ login });

        if (existingUser) {
            if (existingUser.password === password) {
                res.redirect('login.html')
            } else {
                return res.status(400).send('User with the same login ID already exists');
            }
        }

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile,
            email: req.body.email,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            login: req.body.login,
            password: req.body.password,
        });

        await newUser.save();

        // Emit the new user event
        io.emit('new_user', newUser);

        res.redirect('/');
    } catch (error) {
        console.error('Error occurred during submission:', error);
        res.status(500).send('Error occurred during submission.');
    }
});

app.get('/', (req, res) => {
    res.set("Access-Control-Allow-Origin", "*"); 
    return res.redirect('index.html');
});

app.get('/user', (req, res) => {
    return res.redirect('user.html');
});

server.listen(port, () => {
    console.log('server started');
});
