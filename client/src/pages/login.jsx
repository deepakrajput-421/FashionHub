import react, { useState } from 'react';
import axios from "axios";
import Flogo from '../assest/images/Fashionhub logo.png';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar';
export const Login = () => {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        "email": "",
        "pwd": ""
    })
    const inputHandler = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }
    const loginUser = async (event) => {
        event.preventDefault();
        let res = await axios.post("http://localhost:4000/login", values, { withCredentials: true });
        if (res.data.success === true) {
            navigate('/dashboard')
        }
    }

    return (
        <div className="container loginContainer">
            <Navbar />
            <div className="Flogo mt-5">
                <img src={Flogo} alt="" srcset="" />
            </div>
            <div className="LoginFrm">
                <form onSubmit={loginUser} className='Frm'>
                    <div className="form-group mt-3 frmHeading">
                        <label for="email">Email address:</label>
                        <input type="email" className="form-control mt-3" placeholder="Enter email" id="email" name='email' onChange={inputHandler} />
                    </div>
                    <div className="form-group mt-3 frmHeading">
                        <label for="pwd" >Password:</label>
                        <input type="password" className="form-control mt-3" placeholder="Enter password" id="pwd" name='pwd' onChange={inputHandler} />
                    </div>
                    <div className="ForgotLink">
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <button type="submit" className="btn loginBtn"><span>Submit</span> </button>
                </form>
            </div>

        </div>
    )
}