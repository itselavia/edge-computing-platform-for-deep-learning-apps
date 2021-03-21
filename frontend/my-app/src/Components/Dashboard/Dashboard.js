import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'

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

    fileUpload = ()=>{
        this.setState({showFileUpload: true})
        this.setState({showDeployModal: false})
    }

    deploymentModal = ()=>{
        this.setState({showFileUpload: false})
        this.setState({showDeployModal: true})
    }

    handleModalClose = ()=>{
        this.setState({showFileUpload: false})
        this.setState({showDeployModal: false})
    }

    deploy = ()=>{
        console.log("Deploy")
        this.handleModalClose()
    }

    render() {
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
                        <div className="mb-3">
                            <Form.File id="tf-file-upload" custom>
                            {/* <Form.File.Input isValid /> */}
                            <Form.File.Label data-browse="Browse">
                                Upload TensorFlow Model
                            </Form.File.Label>
                            <Form.Control.Feedback type="valid">Upload Sucessful!</Form.Control.Feedback>
                            </Form.File>
                        </div>
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
                    keyboard={false}
                >
                    <Modal.Header>
                    <Modal.Title>Configure and Deploy Application</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    Form to be created here
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

export default connect(mapStateToProps)(Dashboard);