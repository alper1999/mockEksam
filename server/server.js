import express from "express";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import path from "path";
import { WebSocketServer } from "ws";
import {MoviesApi} from "./moviesApi.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

//hente ut filmer og filterer
const mongoClient = new MongoClient(process.env.MONGODB_URL);
mongoClient.connect().then(async () => {
    console.log("Connected to mongodb");
    app.use(
        "/api/movies",
        MoviesApi(mongoClient.db(process.env.MONGODB_DATABASE || "pg6301-7"))
    );
});
//cookie secret for å logge inn
app.use(cookieParser(process.env.COOKIE_SECRET));
//logge inn med token
app.post("/api/login", (req, res) => {
    const { access_token } = req.body;
    res.cookie("access_token", access_token, { signed: true });
    res.sendStatus(200);
});
//feilmelding
async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error(`Failed ${res.status}`);
    }
    return await res.json();
}
//logge inn og hente client id
app.get("/api/config", (req, res) => {
    res.json({
        response_type: "token",
        client_id:
            "922011245740-23sohjmc1r12effq1rsffit53fv868ek.apps.googleusercontent.com",
        discovery_endpoint:
            "https://accounts.google.com/.well-known/openid-configuration",
    });
});

//logge inn
app.get("/api/login", async (req, res) => {
    const { access_token } = req.signedCookies;

    const { userinfo_endpoint } = await fetchJSON(
        "https://accounts.google.com/.well-known/openid-configuration"
    );
    const userinfo = await fetch(userinfo_endpoint, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    if (userinfo.ok) {
        res.json(await userinfo.json());
    } else {
        console.log(`failed to fetch ${userinfo.status} ${userinfo.statusText}`);
        res.sendStatus(500);
    }
});


app.use(express.static("../client/dist/"));
//logge inn
app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.resolve("../client/dist/index.html"));
    } else {
        next();
    }
});


const wsServer = new WebSocketServer({ noServer: true });

const sockets = [];

wsServer.on("connect", (socket) => {
    sockets.push(socket);
    setTimeout(() => {
        socket.send(JSON.stringify({ author: "Server", message: "Hello there" }));
    }, 1000);
    socket.on("message", (data) => {
        const { author, message } = JSON.parse(data);
        for (const recipient of sockets) {
            recipient.send(JSON.stringify({ author, message }));
        }
    });
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`http://localhost:${server.address().port}`);
    server.on("upgrade", (req, socket, head) => {
        wsServer.handleUpgrade(req, socket, head, (socket) => {
            wsServer.emit("connect", socket, req);
        });
    });
});


