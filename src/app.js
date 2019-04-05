require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const uuid = require('uuid/v4'); //required the unique id library

const app = express();
app.use(express.json());

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())


//We will build a POST /register endpoint for Curling enthusiasts in Utah to register themselves on a fan site. The endpoint will accept user details in this format: {
// "username": "String between 6 and 20 characters",
//     "password": "String between 8 and 36 characters, must contain at least one number",
//         "favoriteClub": "One of 'Cache Valley Stone Society', 'Ogden Curling Club', 'Park City Curling Club', 'Salt City Curling Club' or 'Utah Olympic Oval Curling Club'",
//             "newsLetter": "True - receive newsletters or False - no newsletters"
// }

//declaring an array with dummy data object tp push into the array to store the users
const users = [
    {
        "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80",
        "username": "sallyStudent",
        "password": "c00d1ng1sc00l",
        "favoriteClub": "Cache Valley Stone Society",
        "newsLetter": "true"
    },
    {
        "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
        "username": "johnBlocton",
        "password": "veryg00dpassw0rd",
        "favoriteClub": "Salt City Curling Club",
        "newsLetter": "false"
    }
];

//the purpose of POST method is to store new data on the server
app.post('/register', (req, res) => {
    //the newsletter is defaulted to false to make it optional
    const { username, password, favoriteClub, newsLetter = false } = req.body;
    //this is the validation code for user input
    if (!username) {
        return res
            .status(400)
            .send('Username required');
    }

    if (!password) {
        return res
            .status(400)
            .send('Password required');
    }

    if (!favoriteClub) {
        return res
            .status(400)
            .send('favorite Club required');
    }
    // make sure username is correctly formatted.
    if (username.length < 6 || username.length > 20) {
        return res
            .status(400)
            .send('Username must be between 6 and 20 characters');
    }

    // password length
    if (password.length < 8 || password.length > 36) {
        return res
            .status(400)
            .send('Password must be between 8 and 36 characters');
    }

    // password contains digit, using a regex here
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
        return res
            .status(400)
            .send('Password must be contain at least one digit');
    }
    
    const id = uuid(); //this calls the uuid function when a new id is needed
    const newUser = {
        id,
        username,
        password,
        favoriteClub,
        newsLetter
    };

    users.push(newUser);

    // at this point all validation passed
    //this is sending the new user object in the body. The client would be able to directly use the details of the user that was created. 
    //a location header is typically set with the URL to directly access the object
    res
        .status(201)
        .location(`http://localhost:8000/user/${id}`)
        .json(newUser);
});

//returns the full list of users
app.get('/user', (req, res) => {
    res
        .json(users);
});

//there is another way to send data to the server besides a query string parameter or thed body of the request. the other option is named route parameters:
// app.get('/book/:bookId', (req, res) => {
//     //the :bookId is a parameter
// })

app.delete('/user/:userId', (req, res) => {
    const { userId } = req.params;

    // findIndex() to find the index of the user in the array
    const index = users.findIndex(u => u.id === userId);

    // make sure we actually find a user with that id
    if (index === -1) {
        return res
        //return a 404 if the resource, user in this case, is not found
            .status(404)
            .send('User not found');
    }

    //if user is found, splice() to remove that user
    users.splice(index, 1);

    res
        .status(204)
        .end();
});

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})
module.exports = app