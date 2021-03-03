import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { verifyEmail } from "../../redux/actions/authActions";
import firebase from "firebase";
import { Col, Form, Button, ButtonGroup, Alert } from 'react-bootstrap';

class VerifyUser extends Component {
  constructor() {
    super();
    this.state = {
      access_code: "",
      submitted: false,
      error_message: ""
    };
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      if (this.props.auth.user.email_verified) {
        this.props.history.push("/home");
      }
    } else {
      this.props.history.push("/login");
    }
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
    if (props.auth.isAuthenticated) {
      if (props.auth.user.email_verified) {
        this.props.history.push("/home");
      }
      else if (this.state.submitted) {
        this.setState({
          error_message: "User could not be verified. Try again."
        });
      }
    }
    console.log(props);
  }

  componentWillUnmount() {
    this.setState({
      submitted: false,
      error_message: ""
    });
  }

  onChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  onSubmit = e => {
    e.preventDefault();

    const userData = {
      email: this.state.email,
      access_code: this.state.access_code
    };

    this.setState({
      submitted: true
    });
    this.props.verifyEmail(userData);
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
              <div className="col-md-7 mx-auto bg-white p-3 border rounded">
                <center>
                  <h2>Verify Email!</h2>
                  <h3>Please enter the access code sent to your registered email address</h3>
                </center>
                <br />
                {errorMessage}

                <Form onSubmit={this.onSubmit} autoComplete="off">

                  <Form.Row>
                    <Form.Group as={Col} controlId="email">
                      <Form.Label><b>Registered Email Id</b></Form.Label>
                      <Form.Control name="email"
                        type="text"
                        value={this.state.email}
                        readOnly />
                    </Form.Group>
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col} controlId="access_code">
                      <Form.Label><b>Access Code</b></Form.Label>
                      <Form.Control name="access_code"
                        type="text"
                        onChange={this.onChange}
                        value={this.state.access_code}
                        placeholder="Enter the access code"
                        pattern="^[0-9 ]+$"
                        required />
                    </Form.Group>
                  </Form.Row>

                  <div className="row">
                    <div className="col-md-12 text-center p-2">
                      <ButtonGroup aria-label="Third group">
                        <Button type="submit" variant="success">Verify</Button>
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

VerifyUser.propTypes = {
  verifyEmail: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  success: state.success
});

export default connect(mapStateToProps, { verifyEmail })(withRouter(VerifyUser));