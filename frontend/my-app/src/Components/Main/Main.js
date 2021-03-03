import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Devices from '../Devices/Devices'
import Home from '../Home/Home'
import { setCurrentUser, logoutUser } from "../../redux/actions/authActions";
import store from "../../store";
import setAuthToken from "../../firebase/setAuthToken";
import jwt_decode from "jwt-decode";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Login from "../Login/Login"
import Register from '../Register/Register';
if (localStorage.jwtToken) {
    // Set auth token header auth
    const token = localStorage.jwtToken;

    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));// Check for expired token
    const currentTime = Date.now() / 1000; // to get in milliseconds

    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());    // Redirect to login
        window.location.href = "./login";
    }
}


class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }
    render() {
        return (
            <React.Fragment>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Register} />
                    <Route exact path="/addDevice" component={Devices} />
                    <Route exact path="/viewDevices" component={Devices} />
                </Switch>
            </React.Fragment>
        )
    }
}
Main.propTypes = {
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors,
    success: state.success
});

export default connect(mapStateToProps, {})(Main);