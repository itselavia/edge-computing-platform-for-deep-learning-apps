import React, { Component } from 'react';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Col, Row, Form, Dropdown, DropdownButton } from "react-bootstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Axios from 'axios';
import config from '../../config/app-config'

// Axios.defaults.baseURL = config.pods_info_base;

class DeployModal extends Component {
    constructor() {
        super();
        this.state = {
            labels:"",
            gpu_support:false
        }
    }
    onClose = e => {
        this.props.onClose && this.props.onClose(e);
      };
    submitUser = e => {
        const deployData = {
            deployment_name: this.state.deployment_name,
            custom_image: this.state.custom_image,
            num_replicas: parseInt(this.state.replicas),
            memory_request: this.state.memory_request,
            cpu_request: this.state.cpu_request,
            project_name: this.props.current_project.project_name, 
            labels: [],
            gpu_support: this.state.gpu_support
        }
        const labelArr = this.state.label.split(':')
        deployData.labels.push({
            key:labelArr[0],
            value:labelArr[1]
        })
        console.log(deployData)
        const email = this.props.current_project.owner_email
       Axios.post(config.pods_info_base+"deployModel", deployData, {params : {email:email}}).then((response)=>{
            console.log(response);
            if(response.status === 200) {
                alert("Model Deployment scheduled successfully");
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
    handleChange = e => {
        this.setState({
            gpu_support : e.target.checked
        })
    }
    handleLabel = e => {
        
        this.setState({

        })
    }
    render() {
        return (
            <div>
                <Modal
                    show={this.props.showDepModal}
                    
                    backdrop="static"
                    size="lg"
                    keyboard={false}
                >
                    <Modal.Header>
                    <Modal.Title>Configure and Deploy Application</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                             <Form.Group controlId="deployment_name">
                                <Form.Row>
                                    <Col sm="3">
                                    <Form.Label>
                                        <b>Deployment Name</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="8">
                                        <Form.Control placeholder="Deployment Name" onChange={this.onChange}/>
                                    </Col>
                                </Form.Row>
                             </Form.Group>
                            <fieldset>
                                <Form.Row>
                                    <Col sm="3">
                                        <Form.Label>
                                        <b>Image Name</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="4">
                                        <Form.Check
                                        type="radio"
                                        label="Default Platform Image"
                                        name="imageNameRadios"
                                        id="imageNameRadios1"
                                        />
                                    </Col>
                                    <Col sm="4">
                                        <Form.Check
                                        type="radio"
                                        label="Custom Docker Image"
                                        name="imageNameRadios"
                                        id="imageNameRadios2"
                                        />
                                    </Col>
                                </Form.Row>
                                <Form.Group controlId="custom_image">
                                <Form.Row>
                                    <Col sm="3"></Col>
                                    <Col sm="8">
                                        <Form.Control placeholder="Image Path" onChange={this.onChange}/>
                                    </Col>
                                </Form.Row>
                                </Form.Group>
                            </fieldset>
                            <br/>
                                <Form.Group controlId="memory_request">
                                <Form.Row>
                                    <Col sm="2">
                                        <Form.Label>
                                        <b>Total Memory</b>
                                        </Form.Label>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="9">
                                        <Form.Control placeholder="In MegaBytes" onChange={this.onChange}/>
                                    </Col>
                                    </Form.Row>
                                    </Form.Group>
                            <br/>
                                <Form.Group controlId="cpu_request">
                                <Form.Row>
                                    <Col sm="2">
                                        <Form.Label>
                                        <b>CPU Units</b>
                                        </Form.Label>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="9">
                                        <Form.Control placeholder="Resuest Units" onChange={this.onChange}/>
                                    </Col>
                                    </Form.Row>
                                    </Form.Group>
                            <br/>
                                <Form.Group controlId="replicas">
                                <Form.Row>
                                    <Col sm="2">
                                        <Form.Label>
                                        <b>Number of Replicas</b>
                                        </Form.Label>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="9">
                                        <Form.Control onChange={this.onChange}/>
                                    </Col>
                                    </Form.Row>
                                </Form.Group>
                            <br/>
                            <Form.Group controlId="label">
                            <Form.Row>
                                    <Col sm="6">
                                        <Form.Label>
                                        <b>Label</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="12">
                                    <Form.Control placeholder="Key:Value" onChange={this.onChange}/>
                                    </Col>
                            </Form.Row>
                            </Form.Group>
                            <br/>
                            <fieldset>
                            <Form.Group controlId="gpu_support">
                                <Form.Row>
                                    <Col sm="3">
                                        <Form.Label>
                                        <b>GPU Support</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="4">
                                        <Form.Check
                                        type="checkbox"
                                        label="Required"
                                        name="podTypeCheckbox"
                                        id="podTypeCheckbox1"
                                        onChange={this.handleChange}/>
                                    </Col>
                                </Form.Row>
                            </Form.Group>
                            </fieldset>
                            <br/>
                            <fieldset>
                                <Form.Row>
                                    <Col sm="3">
                                        <Form.Label>
                                        <b>Node Selection</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="3">
                                        <Form.Check
                                        type="radio"
                                        label="Default Node Selection"
                                        name="nodeSelectionRadios"
                                        id="nodeSelectionRadios1"
                                        />
                                    </Col>
                                    <Col sm="3">
                                        <Form.Check
                                        type="radio"
                                        label="Custom Node Selection"
                                        name="nodeSelectionRadios"
                                        id="nodeSelectionRadios2"
                                        />
                                    </Col>
                                    <Col>
                                    <DropdownButton id="dropdown-basic-button" title="Select">
                                        <Dropdown.Item href="#/action-1"><Form.Check
                                        type="checkbox"
                                        label="Pod 1"
                                        name="podSelectCheckbox"
                                        id="podSelectCheckbox1"
                                        /></Dropdown.Item>
                                        <Dropdown.Item href="#/action-2"><Form.Check
                                        type="checkbox"
                                        label="Pod 2"
                                        name="podSelectCheckbox"
                                        id="podSelectCheckbox2"
                                        /></Dropdown.Item>
                                        <Dropdown.Item href="#/action-3"><Form.Check
                                        type="checkbox"
                                        label="Pod 3"
                                        name="podSelectCheckbox"
                                        id="podSelectCheckbox3"
                                        /></Dropdown.Item>
                                    </DropdownButton>
                                    </Col>
                                </Form.Row>
                                <br/>
                            </fieldset>
                            </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={this.onClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.submitUser}>Deploy</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}


DeployModal.propTypes = {
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

export default connect(mapStateToProps, {  })(DeployModal);