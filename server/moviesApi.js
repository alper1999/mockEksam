
import { Router } from "express";

export function MoviesApi(mongoDatabase) {
    const router = new Router();

    router.get("/", async (req, res) => {
        const movies = await mongoDatabase
            .collection("movies")
            .find({
                countries: {
                    $in: ["Ukraine"],
                },
                year: {
                    $gte: 2000,
                },
            })
            .sort({
                metacritic: -1,
            })
            .map(({ title, year, plot, genre, poster }) => ({
                title,
                year,
                plot,
                genre,
                poster,
            }))
            .limit(100)
            .toArray();
        res.json(movies);
    });

    router.post("/", (req, res) => {
        const { title, text, date } = req.body;
        const result = mongoDatabase.collection("movies").insertOne({
            title,
            date: [date],
            text,
        });
        res.sendStatus(200);
    });

    return router;
}