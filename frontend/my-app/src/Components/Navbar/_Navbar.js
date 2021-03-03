import React, { Component } from 'react'
import { Navbar, Nav, NavDropdown, Form, FormControl, Button  } from 'react-bootstrap';
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../redux/actions/authActions";

class _Navbar extends Component {
    constructor() {
        super()
        this.state = {
            
        }
    }
    componentWillReceiveProps(props) {
        this.setState({
            showLogout:props.auth.isAuthenticated
        })
    }
    onChange = ()=>{
        this.props.logoutUser(this.props.history)
        this.props.history.push("/login");
    }
    render() {
        return (
            <Navbar bg="light" >
                <Navbar.Brand href="#home"><img style={{ width: "100px" }} src="https://thumbs.dreamstime.com/b/edge-computing-linear-icon-modern-outline-logo-c-concept-white-background-general-collection-suitable-use-web-apps-133520418.jpg" /></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/devices">Train Model</Nav.Link>
                        <Nav.Link href="/cluster">Cluster</Nav.Link>
                        <NavDropdown title="Devices" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/addDevice">Add a device</NavDropdown.Item>
                            <NavDropdown.Item href="/viewDevices">View All Devices</NavDropdown.Item>
                            
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    {this.props.auth.isAuthenticated && (
                    <Form inline>
                        {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
                        <Button variant="outline-success" onClick={this.onChange}>Logout</Button>
                    </Form>
                    )}
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

_Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
  };
  
  const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors,
    success: state.success
  });
  
  export default connect(mapStateToProps,{ logoutUser })(withRouter(_Navbar));