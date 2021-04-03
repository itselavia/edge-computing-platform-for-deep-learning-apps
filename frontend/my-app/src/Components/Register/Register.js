import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../redux/actions/authActions";
import firebase from "firebase";
import { Col, Form, Button, ButtonGroup, Alert } from 'react-bootstrap';

class Register extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      name: "",
      phone:"",
      error_message: ""
    };
  }

  componentDidMount() {
    // if (this.props.auth.isAuthenticated) {
    //   if (this.props.auth.user.userExists) {
    //     this.props.history.push("/home");
    //   }
    //     //   } else {
    // //     this.props.history.push("/verify");
    // //   }
    // }
    firebase.auth().onAuthStateChanged(user => {
      if (!!user) {
        this.setState({
          email: user.email
        });
      } else {
        this.props.history.push("/login");
      }
    });
  }

  componentWillReceiveProps(props) {
    if (props.auth.user.userExists/*  && !props.a
      uth.user.email_verified */) {
      this.props.history.push("/projects");
    }
    if (props.errors) {
      this.setState({
        error_message: props.errors.message
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      error_message: ""
    });
  }

  onChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  cancelRegistration = e => {
    firebase.auth().signOut();
  }

  onSubmit = e => {
    e.preventDefault();

    const userData = {
      email: this.state.email,
      name: this.state.name,
      phone: this.state.phone
    };

    this.props.registerUser(userData);
  };

  render() {
    var errorMessage;
    if (this.state.error_message) {
      errorMessage = (
        <Alert variant="warning">{this.state.error_message}</Alert>
      );
    }
    return (
      <React.Fragment>
        <div className="container p-4">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-md-12">
              <div className="col-md-6 mx-auto bg-white p-3 border rounded">
                <center>
                  <h2>New to Dashboard? </h2>
                  <h3>Please register your details</h3>
                </center>
                <br />
                {errorMessage}

                <Form onSubmit={this.onSubmit} autoComplete="off">
                  <Form.Row>
                    <Form.Group as={Col} controlId="name">
                      <Form.Label><b>Screen Name</b></Form.Label>
                      <Form.Control name="name"
                        type="text"
                        onChange={this.onChange}
                        placeholder="Enter a screen name"
                        pattern="^[A-Za-z0-9 ]+$"
                        required />
                    </Form.Group>
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col} controlId="phone">
                      <Form.Label><b>Phone</b></Form.Label>
                      <Form.Control name="phone"
                        type="text"
                        onChange={this.onChange}
                        placeholder="Enter a phone number"
                        pattern="^[0-9 ]+$"
                        required />
                    </Form.Group>
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col} controlId="email">
                      <Form.Label><b>Email Id</b></Form.Label>
                      <Form.Control name="email"
                        type="text"
                        value={this.state.email}
                        readOnly />
                    </Form.Group>
                  </Form.Row>

                

                  <div className="row">
                    <div className="col-md-12 text-center p-2">
                      <ButtonGroup aria-label="Third group">
                        <Button type="submit" variant="success">Register</Button>&nbsp;&nbsp;
                        <Button variant="secondary" onClick={this.cancelRegistration}>Cancel</Button>
                      </ButtonGroup>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  success: state.success
});

export default connect(mapStateToProps, { registerUser })(withRouter(Register));