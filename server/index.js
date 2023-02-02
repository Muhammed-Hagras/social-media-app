import express from "express";
import bodyParser from "body-parser"; 
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { register } from "./controllers/auth.js";
import authRoutes from "./routers/auth.js"
import userRouter from "./routers/users.js"
import postRouter from "./routers/posts.js"
import { verifyToken } from "./middleware/auth.js";
import { createPost } from "./controllers/posts.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

// CONFIGRATIONS

const __filename =fileURLToPath(import.meta.url);
const  __dirname = path.dirname(__filename);
dotenv.config();
const app =express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// FILE STORAGE

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({storage});

// ROUTES WITH FILES

app.post("/auth/register", upload.single("picture"), register)
app.post("/posts", verifyToken ,upload.single("picture"), createPost)

// ROUTES
app.use("/auth", authRoutes)
app.use("/users", userRouter)
app.use("/posts", postRouter)


// MONGOOSE SETUP

const DB = process.env.MONGO_URL.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD

)

mongoose.connect(DB).then(()=>{
    console.log("DB Connected succefully");
})

const PORT = process.env.PORT || 6000;
app.listen(PORT, ()=>{
    console.log(`APP Starts on port ${PORT}`)
    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
})

