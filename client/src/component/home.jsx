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
    const [, setLoadedSections] = useState(new Set());

    useEffect(() => {
        fetch("https://fashionhub-tj47.onrender.com/health").catch(() => {});

        const handleSectionLoaded = (event) => {
            const section = event.detail;

            setLoadedSections((prev) => {
                const updated = new Set(prev);
                updated.add(section);

                if (
                    updated.has("navbar") &&
                    updated.has("banner") &&
                    updated.has("category") &&
                    updated.has("collection")
                ) {
                    setLoading(false);
                }

                return updated;
            });
        };

        window.addEventListener("home-section-loaded", handleSectionLoaded);

        return () => {
            window.removeEventListener(
                "home-section-loaded",
                handleSectionLoaded
            );
        };
    }, []);

    return (
        <>
            {loading && <Loader />}

            <div
                style={{
                    visibility: loading ? "hidden" : "visible"
                }}
            >
                <Navbar />
                <Welcome />
                <Banner />
                <Category />
                <Collection />
                <Contact />
                <About />
            </div>
        </>
    );
};

