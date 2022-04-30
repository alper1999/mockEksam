import React from "react";
import ReactDOM from "react-dom";
import React, { useEffect } from "react"
import {BrowserRouter, Link, Route, Routes, useNavigate} from "react-router-dom";
import {ListMovies} from "./listMovies";
import {AddMovie} from "./addMovie";

function Frontpage() {
    return <div>
        <h1> Movie datebase</h1>
        <ul>
            <li> <Link to={"/movies"}> list new movie</Link> </li>
            <li> <Link to={"/addNewMovie"}>add new movie</Link> </li>
            <div>
                <Link to="/login">Login</Link>
            </div>
            <div>
                <Link to="/profile">Profile</Link>
            </div>
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
            <Route path={"/login"} element={<Login />} />
            <Route path={"/login/callback"} element={<LoginCallback />} />
            <Route path={"/profile"} element={<Profile />} />
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
function Login() {

    useEffect(async () => {
        const { authorization_endpoint } = await fetchJSON(
            "https://accounts.google.com/.well-known/openid-configuration"
        );

        const parameters = {
            response_type: "token",
            client_id:
                "922011245740-23sohjmc1r12effq1rsffit53fv868ek.apps.googleusercontent.com",
            scope: "email profile",
            redirect_uri: window.location.origin + "/login/callback",
        };

        window.location.href =
            authorization_endpoint + "?" + new URLSearchParams(parameters);
    }, []);

    return (
        <div>
            <h1>Please wait....</h1>
        </div>
    );
}
function LoginCallback() {
    const navigate = useNavigate();

    useEffect(async () => {
        const { access_token } = Object.fromEntries(
            new URLSearchParams(window.location.hash.substring(1))
        );
        console.log(access_token);

        await fetch("/api/login", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ access_token }),
        });
        navigate("/");

    });

    return <h1>Please wait...</h1>;
}
function Profile() {
    const { loading, data, error } = useLoader(async () => {
        return await fetchJSON("/api/login");
    });

    if (loading) {
        return <div>Please wait...</div>;
    }
    if (error) {
        return <div>Error! {error.toString()}</div>;
    }

    return (
        <div>
            <h1>
                Profile for {data.name} ({data.email})
            </h1>
            <div>
                <img src={data.picture} alt={"Profile picture"} />
            </div>
        </div>
    );
}

ReactDOM.render(<Application/>, document.getElementById("app"));