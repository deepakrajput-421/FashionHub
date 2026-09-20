
import {Navbar} from "./navbar";
import { Banner } from "./banner";
import {Collection} from "./collection";
import { Category } from "./Category";
import Contact from "./contact";
import About from "./About";
import Welcome from "./Welcome";


export const Home = () =>{
    return(

    <>
        <Navbar/>
        <Welcome/>
        <Banner/>
        <Category/>
        <Collection/>
        <Contact/>
        <About/>
    </>
    )
}
