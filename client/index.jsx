import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {ListMovies} from "./listMovies";


function Frontpage() {
    return <div>
        <h1> Movie database</h1>
        <ul>
            <li> <Link to={"/movies"}> list new movie</Link> </li>
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
            <Route path={"/movies"} element={<ListMovies listMovies={listMovies}/>}/>
        </Routes>
    </BrowserRouter>
}

ReactDOM.render(<Application/>, document.getElementById("app"));