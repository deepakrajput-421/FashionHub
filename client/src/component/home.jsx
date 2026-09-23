import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { Banner } from "./banner";
import { Collection } from "./collection";
import { Category } from "./Category";
import Contact from "./contact";
import About from "./About";
import Welcome from "./Welcome";
import Loader from "../pages/Loader";

export const Home = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Navbar />
            <Welcome />
            <Banner />
            <Category />
            <Collection />
            <Contact />
            <About />
        </>
    );
};