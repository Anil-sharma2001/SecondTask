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

mongoose.connect('mongodb+srv://anilkumar2001:anil2001@userdata.wdht2zr.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

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
  console.log(`New client connected: ${socket.id}`);

  socket.on('new_user', async (data) => {
    const user = new User({ ...data, socketId: socket.id });
    await user.save();
    io.emit('user_list', await User.find());
  });

  socket.on('get_user_list', async () => {
    const users = await User.find();
    io.emit('user_list', users);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
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

app.get('/getUser/:socketId', async (req, res) => {
  const user = await User.findOne({ socketId: req.params.socketId });
  res.json(user);
});

app.post('/sign_up', async (req, res) => {
  const user = new User({
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
  await user.save();
  res.redirect('/');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
