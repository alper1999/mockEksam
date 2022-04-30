import express from "express";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import path from "path";

dotenv.config();

const app = express();
app.use(bodyParser.json());

if (process.env.MONGODB_URL) {
    const client = new MongoClient(process.env.MONGODB_URL);
    client.connect().then((connection) => {
        const database = connection.db("sample_mflix");
        app.get("/api/movies", async (req, res) => {
            const result = await database
                .collection("movies")
                .find({
                    countries: { $in: ["Sweden"] },
                    year: { $gt: 1999 },
                })
                .sort({ year: -1 })
                .project({
                    title: 1,
                    plot: 2,
                    fullplot: 3,
                    directors: 4,
                    countries: 5,
                    poster: 6,
                    year: 7,
                })
                .limit(10)
                .toArray();

            res.json(result);
        });

        app.post("/api/movies", async (req, res) => {
            const { title, year, directors, fullplot, countries } = req.body;
            const result = await database.collection("movies").insertOne({
                title,
                year,
                directors,
                fullplot,
                countries,
            });
            console.log({ result });
            res.sendStatus(200);
        });
    });
}
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.post("/api/login", (req, res) => {
    const { access_token } = req.body;
    res.cookie("access_token", access_token, { signed: true });
    res.sendStatus(200);
});

async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error(`Failed ${res.status}`);
    }
    return await res.json();
}
app.get("/api/config", (req, res) => {
    res.json({
        response_type: "token",
        client_id:
            "922011245740-23sohjmc1r12effq1rsffit53fv868ek.apps.googleusercontent.com",
        discovery_endpoint:
            "https://accounts.google.com/.well-known/openid-configuration",
    });
});


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

app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.resolve("../client/dist/index.html"));
    } else {
        next();
    }
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`started on http://localhost:${server.address().port}`);
});


