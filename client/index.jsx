import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {ListMovies} from "./listMovies";
import {AddMovie} from "./addMovie";

function Frontpage() {
    return <div>
        <h1> Movie datebase</h1>
        <ul>
            <li> <Link to={"/movies"}> list new movie</Link> </li>
            <li> <Link to={"/addNewMovie"}>add new movie</Link> </li>
        </ul>
    </div>;
}

async function fetchJSON(url) {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`failed to load${res.status}: ${res.statusText}`);
    }
    return await res.json();
}

function Application() {
    async function listMovies(){
        return await fetchJSON("/api/movies")
    }
    return <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<Frontpage/>}/>
            <Route path={"/addNewMovie"} element={<AddMovie/>}/>
            <Route path={"/movies"} element={<ListMovies listMovies={listMovies}/>}/>
        </Routes>
    </BrowserRouter>

}
export async function postJSON(url, body) {
    const res = await fetch(url, {
        method: "post",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
    }
}

ReactDOM.render(<Application/>, document.getElementById("app"));