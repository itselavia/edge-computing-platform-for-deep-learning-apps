import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Col, Row, Form, Dropdown, DropdownButton } from "react-bootstrap";
import {uploadFile, getProjectUsers} from "../../redux/actions/authActions"
import Loader from "react-loader-spinner";
import AddUser from './AddUser';
import DeployModal from './DeployModal';

class Dashboard extends Component {
    constructor() {
        super();
        this.state = {
            displayPods:[],
            deploy_button_text: "Create Deployment",
            showFileUpload: false,
            showDeployModal: false,
            project_users:{}
        }
    }
    componentDidMount(){

        if (!this.props.auth.isAuthenticated) {
            this.props.history.push("/login");
        }

        if(!!this.props.pods.pods && !!this.props.pods && !!this.props.current_project) {
            const displayPods = this.props.pods.pods.map((pod)=>{
                if(pod.project_name === this.props.current_project.project_name) {
                    this.setState({deploy_button_text: "Edit Deployment"})
                    return <React.Fragment>
                    <tr>
                        <td>{pod.pod_name}</td>
                        <td>{pod.project_name}</td>
                        <td>{pod.node_name}</td>
                        <td>{pod.status}</td>
                        <td>{pod.created_at}</td>
                    </tr>
                </React.Fragment>
                }
            })
            this.setState({
                displayPods:displayPods
            })
        }
        if(!! this.props.current_project) {
            const proj_info = {
                project_id : this.props.current_project.project_id
            }
            
            this.props.getProjectUsers(proj_info)
        }
    }
    
    componentWillReceiveProps(nextprops) {
        console.log("calling next props on dashboard")
        console.log(nextprops.projects.project_users)
        this.setState({
            project_users : nextprops.projects.project_users
        },()=>{
            const users = Object.keys(this.state.project_users).map((key, index) => (
                <tr><td>{key}</td></tr>
            ))
            this.setState({
                users:users
            })
        })
        
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
    onChangeModel = (e)=>{
        this.setState({
            model_file : e.target.files[0]
        })
    }
    onChangeInference = (e)=>{
        this.setState({
            inference_file : e.target.files[0]
        })
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

    launchDeployModal = (e)=>{
        this.setState({
            showDeployModal: !this.state.showDeployModal
        },()=>{
            const proj_info = {
                project_id : this.props.current_project.project_id
            }
            this.props.getProjectUsers(proj_info)
        })
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
        },()=>{
            const proj_info = {
                project_id : this.props.current_project.project_id
            }
            this.props.getProjectUsers(proj_info)
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
                           
                            <th>Pod Name</th>
                            <th>Project Name</th>
                            <th>Node Name</th>
                            <th>Status</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.displayPods}
                    </tbody>
                </Table>
                <br/>
                <Button variant="primary" size="lg" block onClick={this.fileUpload}>{this.state.deploy_button_text}</Button>
                <Table>
                    <th>Current Users Associated to this project</th>
                    {this.state.users}
                </Table>
                <Button variant="primary" size="lg" block onClick={this.showAddUser}>Add User to project</Button>
                <AddUser onClose={this.showModal} showAddUser = {this.state.show}></AddUser>
                <DeployModal onClose={this.launchDeployModal} showDepModal = {this.state.showDeployModal}></DeployModal>
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
                            onChange={this.onChangeModel}
                            
                        />
                        </div>
                        <br/>
                        <div>
                        <Form.File 
                            id="inference_file"
                            label="Upload Inference file"
                            data-browse="Select"
                            onChange={this.onChangeInference}
                            
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

            </Container>
        )
    }
}


Dashboard.propTypes = {
    uploadFile: PropTypes.func.isRequired,
    getProjectUsers: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { uploadFile, getProjectUsers })(Dashboard);