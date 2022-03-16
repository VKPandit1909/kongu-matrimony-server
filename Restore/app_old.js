const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcryptjs');
const Username = 'Vikram_7_7'
const Password = 'm9cQlhNaEeDjQmg2';

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jhuguiy(*@(*&*(#$8u49579434759847)(!*)(&)(&!$xquyeriuhkj&*(&*#fhgfjkghjhalkhjhfg';

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

require('./Matrimonial');
const User = mongoose.model("MatrimonialUsers");

require('./BasicDetails');
const UserDetails = mongoose.model("UsersDetails");

const mongoUri = 'mongodb+srv://Vikram_7_7:m9cQlhNaEeDjQmg2@cluster0.7xb5m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

// Connecting to database
mongoose.connection.on("connected", () => {
    console.log('Connected to database');
})

// Connection Error
mongoose.connection.on("error", (err) => {
    console.log("Error is : "+err);
})


// Authentication
// Login
app.post('/login', async(req, res) => {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile }).lean();

    if(!user) {
        return res.json({ status: 'error', error: 'Invalid mobile/password' });
    }

    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({
            id: user._id,
            mobile: user.mobile
        }, JWT_SECRET)
        return res.json({ status: 'ok', data: token });
    }
    res.json({ status: 'error', error: 'Invalid mobile/password' });
})
// Change Password
app.post('/change-password', async (req, res) => {
    const { token, password: plainTextPassword } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const _id = user.id;
        const password = await bcrypt.hash(plainTextPassword, 10);
        await User.updateOne({
            _id: _id
        },{
            $set: {
                password: password
            }
        })
        res.json({ status: 'ok', 'data': 'Password Updated' });
    } catch (error) {
        res.json({ status: 'error', error: error });
    }
    res.json({ status: 'ok', data: user });
})
// Forgot Password
app.post('/forgot-password', async (req, res) => {
    const { mobile } = req.body;
    try {
        const user = await User.findOne({ mobile }).lean();
        if(!user) {
            return res.json({ status: 'error', error: 'Invalid mobile' });
        }
        res.json({ status: 'ok', 'data': 'Mobile found' });
    } catch (error) {
        res.json({ status: 'error', error: error });
    }
    res.json({ status: 'ok', data: 'Invalid mobile' });
})
// Register
app.post('/register', async (req, res) => {
    console.log(req.body);
    const { name, gender, caste, email, mobile, password: plainTextPassword } = req.body;
    const password = await bcrypt.hash(plainTextPassword, 10);
    try {
        const response = await User.create({
            name,
            gender,
            caste,
            email,
            mobile,
            password
        })
    } catch (error) {
        console.log(error);
        if(error.code === 11000) {
            // uses exists
            return res.json({ status: 'error', error: 'User exists' });
        }
        throw error
    }
    res.json({ status: 'ok' });
})


// Basic Details
app.post('/add-details', (req, res) => {
    const { token, name, gender, dob, height, weight, maritalstatus, mothertongue, bodytype, complexion, physicalstatus, eating, drinking, smoking } = req.body;
    try{
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user.id;

        const userDetail = UserDetails.findOne({ userid }).lean();
        console.log(userid);
        if(userDetail) {
            UserDetails.updateOne({
                userid
            },{
                $set: {
                    name,
                    gender,
                    dob,
                    height,
                    weight,
                    maritalstatus,
                    mothertongue,
                    bodytype,
                    complexion,
                    physicalstatus,
                    eating,
                    drinking,
                    smoking
                }
            })
            return res.json({ status: 'ok', data: 'Updated' });
        } else {
            UserDetails.create({
                userid,
                name,
                gender,
                dob,
                height,
                weight,
                maritalstatus,
                mothertongue,
                bodytype,
                complexion,
                physicalstatus,
                eating,
                drinking,
                smoking
            })
            return res.json({ status: 'ok', data: 'Added' });
        }
    } catch(error) {
        console.log(error);
        res.json({ status: 'error', error: error });
    }
})






// Connecting to Node JS
app.get('/', (req,res) => {
    res.send('Welcome to Node js');
})

app.listen(PORT, () => {
    console.log('Server Started on PORT '+PORT);
})