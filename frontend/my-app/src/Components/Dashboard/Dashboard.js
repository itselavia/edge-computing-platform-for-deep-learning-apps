import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Col, Row, Form, Dropdown, DropdownButton } from "react-bootstrap";
import {uploadFile} from "../../redux/actions/authActions"
import Loader from "react-loader-spinner";
import AddUser from './AddUser';

class Dashboard extends Component {
    constructor() {
        super();
        this.state = {
            displayPods:[],
            deploy_button_text: "Create Deployment",
            showFileUpload: false,
            showDeployModal: false
        }
    }
    componentDidMount(){

        if (!this.props.auth.isAuthenticated) {
            this.props.history.push("/login");
        }

        if(!!this.props.pods && !!this.props.current_project) {
            const displayPods = this.props.pods.pods.map((pod)=>{
                if(pod.project_id === this.props.current_project.project_id) {
                    this.setState({deploy_button_text: "Edit Deployment"})
                    return <React.Fragment>
                    <tr>
                        <td>{pod.pod_id}</td>
                        <td>{pod.pod_name}</td>
                        <td>{pod.pod_status}</td>
                        <td>{pod.pod_restarts}</td>
                        <td>{pod.pod_age}</td>
                        <td>{pod.pod_cpu}</td>
                        <td>{pod.pod_memory}</td>
                    </tr>
                </React.Fragment>
                }
            })
            this.setState({
                displayPods:displayPods
            })
        }
    }

    onChange = e => {
        this.setState({
          [e.target.id]: e.target.value
        });
      //  console.log(this.state.model_file)
    };

    fileUpload = ()=>{
        this.setState({showFileUpload: true})
        this.setState({showDeployModal: false})
    }

    deploymentModal = ()=>{
       
        const modelData = {
            username : this.props.current_project.owner_email,
            projectname : this.props.current_project.project_name,
            model_file : this.state.model_file
        }
        const inferData = {
            username : this.props.current_project.owner_email,
            projectname : this.props.current_project.project_name,
            inference_file : this.state.inference_file
        }
        this.props.uploadFile(modelData, inferData);
       
        this.setState({showFileUpload: false})
        this.setState({showDeployModal: true})
    }

    handleModalClose = ()=>{
        this.setState({showFileUpload: false})
        this.setState({showDeployModal: false})
    }
    showAddUser = ()=>{
        this.setState({show: true})
    }
    showModal = e => {
        this.setState({
          show: !this.state.show
        });
      };
    deploy = ()=>{
        console.log("Deploy")
        this.handleModalClose()
    }

    render() {
        if(this.props.auth.loading) 
            return (
                <Container fluid ="lg">
                    <br/>
                    <Table>
                        <Loader
                        type="Puff"
                        color="#00BFFF"
                        height={100} 
                        width={100}
                        timeout={3000} //3 secs
                        style={{
                            position: 'absolute', left: '50%', top: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                        />
                </Table>
                </Container>
              );
        else
        return (
            <Container fluid ="lg">
                <br/>
                <Table striped bordered hover responsive >
                    <thead>
                        <tr>
                            <th>Pod Id</th>
                            <th>Pod Name</th>
                            <th>Pod Status</th>
                            <th>Pod Restarts</th>
                            <th>Pod Age</th>
                            <th>Pod CPU</th>
                            <th>Pod Memory</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.displayPods}
                    </tbody>
                </Table>
                <br/>
                <Button variant="primary" size="lg" block onClick={this.fileUpload}>{this.state.deploy_button_text}</Button>
                <Button variant="primary" size="lg" block onClick={this.showAddUser}>Add User to project</Button>
                <AddUser onClose={this.showModal} showAddUser = {this.state.show}></AddUser>
                <Modal
                    show={this.state.showFileUpload}
                    onHide={this.state.handleModalClose}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                    <Modal.Title>Upload Tensorflow Model and Inference Files</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <div>
                        <Form.File 
                            id="model_file"
                            label="Upload Tensorflow Model"
                            data-browse="Select"
                            onChange={this.onChange}
                            
                        />
                        </div>
                        <br/>
                        <div>
                        <Form.File 
                            id="inference_file"
                            label="Upload Inference file"
                            data-browse="Select"
                            onChange={this.onChange}
                            
                        />
                        </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.deploymentModal}>Proceed</Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.showDeployModal}
                    onHide={this.state.handleModalClose}
                    backdrop="static"
                    size="lg"
                    keyboard={false}
                >
                    <Modal.Header>
                    <Modal.Title>Configure and Deploy Application</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
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
                                <Form.Row>
                                    <Col sm="3"></Col>
                                    <Col sm="8">
                                        <Form.Control placeholder="Image Path" />
                                    </Col>
                                </Form.Row>
                            </fieldset>
                            <br/>
                            <Form.Row>
                                    <Col sm="2">
                                        <Form.Label>
                                        <b>Total Memory</b>
                                        </Form.Label>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="9">
                                        <Form.Control placeholder="In MegaBytes" />
                                    </Col>
                            </Form.Row>
                            <br/>
                            <Form.Row>
                                    <Col sm="2">
                                        <Form.Label>
                                        <b>CPU Units</b>
                                        </Form.Label>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="9">
                                        <Form.Control placeholder="Resuest Units" />
                                    </Col>
                            </Form.Row>
                            <br/>
                            <Form.Row>
                                    <Col sm="3">
                                        <Form.Label>
                                        <b>Label Key</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="3">
                                        <Form.Control/>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="2">
                                        <Form.Label>
                                        <b>Label Value</b>
                                        </Form.Label>
                                    </Col>
                                    <Col></Col>
                                    <Col sm="3">
                                        <Form.Control/>
                                    </Col>
                            </Form.Row>
                            <br/>
                            <fieldset>
                                <Form.Row>
                                    <Col sm="3">
                                        <Form.Label>
                                        <b>Pod Types</b>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="4">
                                        <Form.Check
                                        type="checkbox"
                                        label="GPU Support"
                                        name="podTypeCheckbox"
                                        id="podTypeCheckbox1"
                                        />
                                    </Col>
                                    <Col sm="4">
                                        <Form.Check
                                        type="checkbox"
                                        label="CPU only"
                                        name="podTypeCheckbox"
                                        id="podTypeCheckbox2"
                                        />
                                    </Col>
                                </Form.Row>
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
                    <Button variant="secondary" onClick={this.handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.deploy}>Deploy</Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        )
    }
}


Dashboard.propTypes = {
    uploadFile: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { uploadFile })(Dashboard);