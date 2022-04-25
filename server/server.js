import express, {Router} from "express";
import * as path from "path";
import {MoviesApi} from "./moviesApi.js";
import {MongoClient} from "mongodb"
import dotenv from "dotenv"
import bodyParser from "body-parser";

dotenv.config();

const app = express()
app.use(bodyParser.json())


const Movies = new Router();
Movies.get("/",(req,res) =>{
    res.json([
        {
            title:"movie1",
        }
    ])

})
Movies.post("/new", (req,res) =>{
    res.sendStatus(500);
})


const mongoClient = new MongoClient(process.env.MONGODB_URL);
mongoClient.connect().then(async () => {
    console.log("Connected to mongodb");
    app.use("/api/movies", MoviesApi(mongoClient.db(process.env.MONGODB_DATABASE ||"pg6301-7")));
});


app.use(express.static("../client/dist/"))

app.use((req,res,next) =>{
    if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.resolve("../client/dist/index.html"));
    } else {
        next();
    }
})
const server = app.listen(process.env.PORT ||3001,() =>{
    console.log(`started on http://localhost:${server.address().port}`);
});