import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Col, Row, Form, Dropdown, DropdownButton } from "react-bootstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Axios from 'axios';

class AddUser extends Component {
    onClose = e => {
        this.props.onClose && this.props.onClose(e);
      };
    submitUser = e => {
        const userData = {
            user_email: this.state.user_email,
            project_id: this.props.current_project.project_id
        }

       Axios.post("http://localhost:5000/addProjectUser", userData).then((response)=>{
            console.log(response);
            if(response.status === 201) {
                alert("User Added successfully");
                this.onClose();
            }
       })
    }

    onChange = e => {
        this.setState({
          [e.target.id]: e.target.value
        });
      //  console.log(this.state.model_file)
    };
    render() {
        return (
            <div>
                <Modal
                    show={this.props.showAddUser}
                    
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                    <Modal.Title>Add Users to project by just adding their emails</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <div>
                            <Form.Row>
                                <Form.Group as={Col} controlId="user_email">
                                            <Form.Label>
                                            <b>User Email</b>
                                            </Form.Label>
                                            
                                        
                                        <Form.Control name="user_email"
                                                type="text"
                                                onChange={this.onChange}
                                                placeholder="Enter the User's Email Address"
                                                
                                            required />
                                </Form.Group>     
                            </Form.Row>
                            <br/>
                       </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={this.onClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.submitUser}>Proceed</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}


AddUser.propTypes = {
    // addUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    pods: PropTypes.object.isRequired,
    projects: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    success: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    projects: state.projects,
    current_project: state.projects.current_project,
    pods: state.pods,
    errors: state.errors,
    success: state.success
});

export default connect(mapStateToProps, {  })(AddUser);