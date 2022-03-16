const express = require("express");
router = express.Router();
var cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const bcrypt = require("bcryptjs");
const Username = "Vikram_7_7";
const Password = "m9cQlhNaEeDjQmg2";
const uuid = require("uuid");
const uuidv4 = require("uuidv4");
const multer = require("multer");

app.use(cors());

const jwt = require("jsonwebtoken");
const success = require("./success");
const JWT_SECRET =
    "jhuguiy(@(&(#$8u49579434759847)(!)(&)(&!$xquyeriuhkj&(&#fhgfjkghjhalkhjhfg";

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

require("./Matrimonial");
const User = mongoose.model("MatrimonialUsers");

require("./arrivals");
const Arrivals = mongoose.model("Arrivals");

require("./photoSchema");
const Photos = mongoose.model("Photos");

//Success calling
require("./success");
const Success = mongoose.model("success");

const mongoUri =
    "mongodb+srv://Vikram_7_7:m9cQlhNaEeDjQmg2@cluster0.7xb5m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// Connecting to database
mongoose.connection.on("connected", () => {
});

// Connection Error
mongoose.connection.on("error", (err) => {
});

// Authentication
// Login
app.post("/login", async (req, res) => {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile }).lean();

    if (!user) {
        return res.json({ status: "error", error: "Invalid mobile/password" });
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                id: user._id,
                mobile: user.mobile,
            },
            JWT_SECRET
        );
        if (parseInt(user.status)) {
            return res.json({ status: "ok", data: token });
        } else {
            return res.json({
                status: "warning",
                data: { userStatus: user.status, userType: user.type },
            });
        }
    }
    res.json({ status: "error", error: "Invalid mobile/password" });
});
// Change Password
app.post("/change-password", async (req, res) => {
    const { token, password: plainTextPassword, prevpass } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const _id = user.id;
        const userData = await User.findOne({ _id }).lean();
        if (await bcrypt.compare(prevpass, userData.password)) {
            const password = await bcrypt.hash(plainTextPassword, 10);
            await User.updateOne(
                {
                    _id: _id,
                },
                {
                    $set: {
                        password: password,
                    },
                }
            );
            res.json({ status: "ok", data: "Password Updated" });
        } else {
            res.json({ status: "error", error: "Invalid Password" });
        }
    } catch (error) {
        res.json({ status: "error", error: error });
    }
    res.json({ status: "ok", data: user });
});
// Forgot Password
app.post("/forgot-password", async (req, res) => {
    const { mobile } = req.body;
    try {
        const user = await User.findOne({ mobile }).lean();
        if (!user) {
            return res.json({ status: "error", error: "Invalid mobile" });
        }
        res.json({ status: "ok", data: "Mobile found" });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
    res.json({ status: "ok", data: "Invalid mobile" });
});
// Register
app.post("/register", async (req, res) => {
    const regDate = new Date().toLocaleString();
    const jathagamId = Math.floor(Math.random() * Date.now());
    const {
        name,
        gender,
        caste,
        email,
        mobile,
        registeredBy,
        password: plainTextPassword,
    } = req.body;
    const password = await bcrypt.hash(plainTextPassword, 10);
    try {
        var regNumber = 1;
        await User.find({})
            .sort({ _id: -1 })
            .limit(1)
            .then((data) => {
                if (data[0]["regNumber"]) {
                    regNumber = parseInt(data[0]["regNumber"]) + 1;
                } else {
                    regNumber = 1;
                }
            })
            .catch((err) => {
            });
        const response = await User.create({
            name,
            gender,
            caste,
            email,
            mobile,
            password,
            regDate,
            jathagamId,
            regNumber,
            registeredBy,
        });
    } catch (error) {
        if (error.code === 11000) {
            // uses exists
            return res.json({ status: "error", error: "User exists" });
        }
        throw error;
    }
    res.json({ status: "ok" });
});

// Basic Details
app.post("/set-details", (req, res) => {
    const { token, fields } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user.id;
        User.updateOne(
            {
                _id: userid,
            },
            {
                $set: fields,
            },
            { overwrite: false, new: true },
            function (err, res) {
            }
        );
        return res.json({ status: "ok", data: "Updated" });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

// User Details
app.post("/user-details", (req, res) => {
    const token = req.body.token;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user.id;
        User.findOne({ _id: userid })
            .then((data) => {
                return res.json({ status: "ok", data: data });
            })
            .catch((err) => {
                return res.json({ status: "error", error: err });
            });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

// Getting data
app.post("/user-datas", (req, res) => {
    const { token, gender } = req.body;
    if (gender == undefined) {
        const { token } = req.body;
        User.find({})
            .then((data) => {
                res.json({ status: "ok", data: data });
            })
            .catch((err) => {
                res.json({ status: "ok", error: err });
            });
    } else {
        User.find({ gender: gender })
            .then((data) => {
                res.json({ status: "ok", data: data });
            })
            .catch((err) => {
                res.json({ status: "ok", error: err });
            });
    }
});
//withput Login users
// Getting data
app.post("/user-data-all", (req, res) => {
    User.find({})
        .then((data) => {
            res.json({ status: "ok", data: data });
        })
        .catch((err) => {
            res.json({ status: "ok", error: err });
        });
});
// Shortlisted Users
app.post("/shortlist-user", (req, res) => {
    const { token, suid } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user.id;
        User.findOne({ _id: userid }, { shortlistUsers: 1 })
            .then((data) => {
                var sUsers = "";
                if (data.shortlistUsers == undefined || data.shortlistUsers == "") {
                    sUsers = suid;
                } else {
                    sUsers = data.shortlistUsers + "," + suid;
                }
                User.updateOne(
                    {
                        _id: userid,
                    },
                    {
                        $set: {
                            shortlistUsers: sUsers,
                        },
                    },
                    { overwrite: false, new: true },
                    function (err, res) {
                    }
                );
                return res.json({ status: "ok", data: sUsers });
            })
            .catch((err) => {
                return res.json({ status: "error", error: err });
            });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

//Update ShortList User
app.post("/update-shortlist", (req, res) => {
    const { token, sUsers } = req.body;
    const user = jwt.verify(token, JWT_SECRET);
    const userid = user.id;
    try {
        User.updateOne(
            {
                _id: userid,
            },
            {
                $set: {
                    shortlistUsers: sUsers,
                },
            },
            { overwrite: false, new: true },
            function (err, res) {
            }
        );
        res.json({ status: "ok", data: "Shortlist Updated." });
    } catch (err) {
        res.json({ status: "error", error: err });
    }
});

// Interested Users
app.post("/interest-user", (req, res) => {
    const { token, iuid } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user.id;
        User.findOne({ _id: userid }, { interestInUsers: 1 })
            .then((data) => {
                var sUsersIn = "";
                if (data.interestInUsers == undefined || data.interestInUsers == "") {
                    sUsersIn = iuid;
                } else {
                    sUsersIn = data.interestInUsers + "," + iuid;
                }
                User.updateOne(
                    {
                        _id: userid,
                    },
                    {
                        $set: {
                            interestInUsers: sUsersIn,
                        },
                    },
                    { overwrite: false, new: true },
                    function (err, res) {
                    }
                );
                User.findOne({ _id: iuid }, { interestByUsers: 1 })
                    .then((data) => {
                        var sUsers = "";
                        if (
                            data.interestByUsers == undefined ||
                            data.interestByUsers == ""
                        ) {
                            sUsers = userid;
                        } else {
                            sUsers = data.interestByUsers + "," + userid;
                        }
                        User.updateOne(
                            {
                                _id: iuid,
                            },
                            {
                                $set: {
                                    interestByUsers: sUsers,
                                },
                            },
                            { overwrite: false, new: true },
                            function (err, res) {
                            }
                        );
                        return res.json({ status: "ok", data: sUsersIn });
                    })
                    .catch((err) => {
                        return res.json({ status: "error", error: err });
                    });
            })
            .catch((err) => {
                return res.json({ status: "error", error: err });
            });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

// Admin Panel Section
require("./AdminDetails");
const AdminUser = mongoose.model("AdminDetails");

// Set Address on jagatham PDF
app.post("/set-address", (req, res) => {
    const { fields, token } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const userid = user.id;

        AdminUser.updateOne(
            {
                _id: userid,
            },
            {
                $set: fields,
            },
            { overwrite: false, new: true },
            function (err, res) {
            }
        );
        return res.json({ status: "ok", data: "Updated Admin" });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

// Getting the admin details
app.post("/admin-details", (req, res) => {
    try {
        User.findOne({ _id: "6120d7942009d11c4c64eb79" })
            .then((data) => {
                return res.json({ status: "ok", data: data });
            })
            .catch((err) => {
                return res.json({ status: "error", error: err });
            });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

// Getting the single admin detail
app.post("/single-admin-detail", (req, res) => {
    const userid = req.body.userid;
    AdminUser.find({ _id: "6120d7942009d11c4c64eb79" })
        .then((data) => {
            res.json({ status: "ok", data: data });
        })
        .catch((err) => {
            res.json({ status: "ok", error: err });
        });
});

// Admin Login
app.post("/admin-login", async (req, res) => {
    const { username, password } = req.body;
    const adminuser = await AdminUser.findOne({ username }).lean();

    if (!adminuser) {
        return res.json({ status: "error", error: "Invalid username/password" });
    }

    if (await bcrypt.compare(password, adminuser.password)) {
        const token = jwt.sign(
            {
                id: adminuser._id,
                username: adminuser.username,
            },
            JWT_SECRET
        );
        return res.json({ status: "ok", data: token });
    }
    res.json({ status: "error", error: "Invalid username/password" });
});

// Change Admin Password
app.post("/change-admin-password", async (req, res) => {
    const { token, password: plainTextPassword } = req.body;
    try {
        const adminuser = jwt.verify(token, JWT_SECRET);
        const _id = adminuser.id;
        const password = await bcrypt.hash(plainTextPassword, 10);
        await AdminUser.updateOne(
            {
                _id: _id,
            },
            {
                $set: {
                    password: password,
                },
            }
        );
        res.json({ status: "ok", data: "Password Updated" });
    } catch (error) {
        res.json({ status: "error", error: error });
    }
});

// Admin Creation
app.post("/create-admins", async (req, res) => {
    const { name, username, type, password: plainTextPassword } = req.body;
    const password = await bcrypt.hash(plainTextPassword, 10);
    try {
        const response = await AdminUser.create({
            name,
            username,
            type,
            password,
        });
    } catch (error) {
        if (error.code === 11000) {
            // uses exists
            return res.json({ status: "error", error: "User exists" });
        }
        throw error;
    }
    res.json({ status: "ok" });
});

// Getting Users in Admin Panel
app.post("/users-list", (req, res) => {
    const type = req.body.fields;
    User.find(type, {
        name: 1,
        "basic.age": 1,
        gender: 1,
        type: 1,
        status: 1,
        caste: 1,
        email: 1,
        mobile: 1,
    })
        .then((data) => {
            res.json({ status: "ok", data: data });
        })
        .catch((err) => {
            res.json({ status: "ok", error: err });
        });
});
// Getting User Details in Admin Panel
app.post("/interest-users-details", (req, res) => {
    const userids = req.body.userids;
    User.find({ _id: { $in: userids } }, { name: 1, "basic.age": 1, photo: 1 })
        .then((data) => {
            res.json({ status: "ok", data: data });
        })
        .catch((err) => {
            res.json({ status: "ok", error: err });
        });
});

// Getting Single User Details in Admin Panel
app.post("/single-users-details", (req, res) => {
    let findObj;
    if ("jathagamId" in req.body) {
        const jathagamId = req.body.jathagamId;
        findObj = { jathagamId: jathagamId };
    } else {
        const userid = req.body.userid;
        findObj = { _id: userid };
    }

    User.find(findObj)
        .then((data) => {
            res.json({ status: "ok", data: data });
        })
        .catch((err) => {
            res.json({ status: "ok", error: err });
        });
});

// Updating Users status in Admin Panel
app.post("/update-user-status", (req, res) => {
    const { userid, status } = req.body;
    User.updateOne(
        {
            _id: userid,
        },
        {
            $set: {
                status: status,
            },
        },
        { overwrite: false, new: true },
        function (err, res) {
        }
    );
    return res.json({ status: "ok", data: "Updated" });
});

// Updating Users Type in Admin Panel
app.post("/update-user-type", (req, res) => {
    const { userid, type } = req.body;
    User.updateOne(
        {
            _id: userid,
        },
        {
            $set: {
                type: type,
            },
        },
        { overwrite: false, new: true },
        function (err, res) {
        }
    );
    return res.json({ status: "ok", data: "Updated" });
});

//New Arrivals
app.get("/getarrivals", (req, res) => {
    Arrivals.find({})
        .then((data) => {
            res.json({ data: data });
        })
        .catch((err) => {
            res.json({ error: err });
        });
});
//post arrivals
app.post("/postarrivals", function (req, res) {
    var u = new Arrivals({
        register_number: req.body.register_number,
        name: req.body.name,
        age: req.body.age,
        birth_place: req.body.birth_place,
        education: req.body.education,
        family_god: req.body.family_god,
        horoscope: req.body.horoscope,
        zodiac_sign: req.body.zodiac_sign,
    });

    u.save(function (err) {
        if (err) throw err;
        else {
            res.json(u);
        }
    });
});

//Success Marriages
app.post("/postsuccess", (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    const s = new Success({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        name2: req.body.name2,
        register_number: req.body.register_number,
        register_number2: req.body.register_number2,
        profileImg: req.body.profileImg,
    });
    s.save().then((result) => {
        res.status(201).json({
            message: "successfully!",
            userCreated: {
                name: result.name,
                name2: result.name2,
                register_number: result.register_number,
                register_number2: result.register_number2,
                profileImg: result.profileImg,
            },
        });
    });
});

app.get("/getsuccess", (req, res) => {
    success
        .find({})
        .then((data) => {
            res.json({ data: data });
        })
        .catch((err) => {
            res.json({ error: err });
        });
});

// Data Manipulation
app.post("/manipulate", (req, res) => {
    const { name, drinking } = req.body;
    const fields = req.body;

    User.find(fields)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.send(err);
        });

    User.updateOne(
        {
            _id: "61190484abdd9c21408c4781",
        },
        {
            $set: {
                lookingfor: "Hello",
                locationprefer: {
                    country: "India",
                    state: "Maharashtra",
                    city: "Virar",
                },
            },
        },
        { overwrite: false, new: true },
        function (err, res) {
        }
    );
});

app.post("/upload", function (req, res, next) {

    const id = uuid();
    const file = req.files.upload;
    file.mv("./uploads/" + file.name, function (err, result) {
        if (err) throw err;
        res.send({
            success: true,
            message: "File Uploaded!",
        });
    });
});
// Connecting to Node JS
app.get("/", (req, res) => {
    res.send("Welcome to Node JS.");
});

//Image Upload API

const DIR = "./public";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(" ").join("-");
        cb(null, fileName);
    },
});
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
});
// User model
// let User = require('../models/User');
app.post("/user-profile", upload.single("profileImg"), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const photos = new Photos({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        profileImg: req.body.profileImg,
    });
    photos
        .save()
        .then((result) => {
            res.status(201).json({
                message: "successfully!",
                userCreated: {
                    _id: result._id,
                    profileImg: result.profileImg,
                },
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
});
app.get("/get-profile-img", (req, res, next) => {
    Photos.find().then((data) => {
        res.status(200).json({
            message: "User list retrieved successfully!",
            users: data,
        });
    });
});

app.listen(PORT, () => {
});