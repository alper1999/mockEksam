import {postJSON} from "./index";
import {useState} from "react";
import React from "react";


function FormInput({ label, value, setValue }) {
    return (
        <div>
            <div>
                <label>{label}</label>
            </div>
            <div>
                <input value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
        </div>
    );
}

function FormTextarea({ label, value, setValue }) {
    return (
        <div>
            <div>
                <label>{label}</label>
            </div>
            <div>
                <textarea value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
        </div>
    );
}

 export function MovieView({
                       movie: { countries, directors, fullplot, poster, title, year },
                   }) {
    return (
        <div>
            <h3>
                {title} ({year})
            </h3>
            {directors && (
                <div>
                    <strong>Directed by {directors.join(", ")}</strong>
                </div>
            )}
            <img src={poster} alt="Movie poster" width={100} />
            <div>
                {fullplot} (countries: {countries.join(", ")})
            </div>
        </div>
    );
}

 export function AddMovie() {

    const [title, setTitle] = useState("");
    const [year, setYear] = useState("");
    const [director, setDirector] = useState("");
    const [fullplot, setFullplot] = useState("");
    const [country, setCountry] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        await postJSON("/api/movies", {

            title,
            year: parseInt(year),
            directors: [director],
            fullplot,
            countries: [country],
        });
        setTitle("");
        setYear("");
        setDirector("");
        setFullplot("");
        setCountry("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add new movie</h2>
            <FormInput label={"Title"} value={title} setValue={setTitle} />
            <FormInput label={"Year"} value={year} setValue={setYear} />
            <FormInput label={"Director"} value={director} setValue={setDirector} />
            <FormInput label={"Country"} value={country} setValue={setCountry} />
            <FormTextarea
                label={"Full plot"}
                value={fullplot}
                setValue={setFullplot}
            />
            <div>
                <button disabled={title.length === 0 || year.length === 0}>Save</button>
            </div>
        </form>
    );
}