import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../redux/actions/authActions";
import firebase from "firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { firebaseConfig } from "../../firebase/firebaseIndex";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            isSignedIn: false
        };
    }

    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
           // if (this.props.auth.user.email_verified) {
              this.props.history.push("/home");
           // } else {
            //  this.props.history.push("/verify");
            //}
          }
        firebase.auth().onAuthStateChanged(user => {
            this.setState({ isSignedIn: !!user })
            if (!!user) {
                console.log(user)
                const userData = { email: user.email };
               this.props.loginUser(userData);
            }
        })
    }

    componentWillReceiveProps(props) {
        console.log("props receied")
        console.log(props)
        // if(!props.auth.isAuthenticated && !props.auth.user.userExists) {
        //     this.props.history.push("/register");
        // }
        if(props.auth.isAuthenticated && !props.auth.user.userExists) {
            this.props.history.push("/register");
        }
        else if(props.auth.isAuthenticated && props.auth.user.userExists) {
            this.props.history.push("/projects");
        }
        // if (!props.auth.isAuthenticated && !props.errors.userExists) {
        //   //  this.props.history.push("/register");
        // } else if(props.auth.user.id && !props.auth.user.email_verified){
        //     this.props.history.push("/verify");
        // } else {
        //     this.props.history.push("/home");
        // }
    }

    render() {
        var loginComponent;

        if (!this.state.isSignedIn) {
            loginComponent = (
                <div className="container p-4">
                    <div className="row justify-content-center align-items-center h-100">
                        <div className="col-md-5 mx-auto bg-white p-3 border rounded">
                            <StyledFirebaseAuth
                                uiConfig={firebaseConfig}
                                firebaseAuth={firebase.auth()}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {loginComponent}
            </div>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    success: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors,
    success: state.success
});

export default connect(mapStateToProps, { loginUser })(Login);