import React, { useState } from 'react';
 import './Registration.css';
import {Link} from "react-router-dom";
import PropTypes from "prop-types"; // Import your custom CSS for additional styling

const Login = ({ setToken }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loginError, setLoginError] = useState("")

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setLoginError("")
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(formData);
        const response = await fetch('http://localhost:5000/api/login/',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        let data = await response.json();
        console.log('Data', data);
        if (response.status != 200) {
            setLoginError(data.message)
        } else {
            setToken({userToken:data.token})
            localStorage.setItem('user', data.user)
        }
        // Send login data to your server and handle the response
    };

    return (
        <div className="registration-container">
            <div className="registration-form">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="loginError">{loginError}</div>
                    <br/><br/>
                    <div className="form-group" style={{marginTop: 4}}>
                        <button type="submit" className="btn btn-success">
                            Login
                        </button>
                    </div>
                </form>
                <p>
                    <Link to="/register" className="nav-link">Don't have an account? <a href="/registration">Register</a></Link>
                    {/*Don't have an account? <a href="/registration">Register</a>*/}
                </p>
                <br/><br/>
            </div>

        </div>
    );
};

Login.propTypes = {
    setToken: PropTypes.func.isRequired
};
export default Login;
