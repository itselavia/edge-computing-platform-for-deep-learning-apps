import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getUserProjectsAndPods, changeCurrentProject, createProjectAction } from "../../redux/actions/authActions";
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import DonutChart from 'react-donut-chart';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Col, Row ,Nav, Form} from 'react-bootstrap';

class MyProject extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            email:props.auth.user.email,
            projects:[],
            pods:[],
            showCreateProject: false
        }
    }
    componentDidMount() {
        if (!this.props.auth.isAuthenticated) {
                this.props.history.push("/login");
        }
        else {
            const userData = { email: this.state.email };
            this.props.getUserProjectsAndPods(userData); 
        }
    }
    onProjectClick(proj) {
        // console.log(proj_id)
        const projData = proj
        this.props.changeCurrentProject(projData);
        this.props.history.push("/dashboard");
    }
    componentWillReceiveProps(props) {
       
        this.setState({
            projects:props.projects.projects,
            pods:props.pods.pods
        },()=>{
            if(!!this.state.pods && !!this.state.projects) {
            const displayProjects = this.state.projects.map(proj => 
               
            <React.Fragment>
                <tr>
                     <td onClick={()=>this.onProjectClick(proj)}>{proj.project_id}</td>
                     <td>{proj.project_name}</td>
                     <td>{proj.project_desc}</td>
                </tr>
                
            </React.Fragment>
            
            );
           
            var dict = {}
         
            const displayPods = this.state.pods.map(pod =>
                {
                    let x = dict[pod.project_id];
                    dict[pod.project_id] = x ? dict[pod.project_id] +1 : 1;

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
            
              
            );
            const pods_per_proj_data = []
            for (var key in dict) {
                // check if the property/key is defined in the object itself, not in parent
                if (dict.hasOwnProperty(key)) {           
                    pods_per_proj_data.push({value:dict[key], label:"Project"+key})
                    console.log(key, dict[key]);
                }
            }
            console.log(pods_per_proj_data)

            this.setState({
                displayProjects:displayProjects,
                displayPods:displayPods,
                pods_per_proj_data:pods_per_proj_data
            },()=>{
                console.log(pods_per_proj_data)
                const graph =  <DonutChart
                height={500}
                width={500}
                data={pods_per_proj_data} />
                this.setState({
                    graph:graph
                })
            })
           
         
        }
        })
    }

    createProjectModal = ()=>{
        this.setState({showCreateProject: true})
    }

    handleModalClose = ()=>{
        this.setState({showCreateProject: false})
    }

    onChange = e => {
        this.setState({
          [e.target.id]: e.target.value
        });
    };

    createProject = ()=>{
        console.log("Creating Project");
        const data = {
            project_name:this.state.project_name,
            project_desc:this.state.project_desc,
            user_email:this.state.email
        }
        this.props.createProjectAction(data);
        this.setState({showCreateProject: false})
    }

    render() {
        return (
          
            <Container fluid ="lg">
                <br/>
                <h1>Resource Summary</h1>
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
                <Button variant="primary" size="lg" block onClick={this.createProjectModal}>Create New Project</Button>
                <br/>

                   <Container>
                       <br/>
                       <h1>Project Summary</h1>
                       <br/>
                       <Row xs={1} md={2}>
                           <Col >
                            <Table striped bordered hover responsive variant="dark">
                                <thead>
                                    <tr>
                                        <th>Project Id</th>
                                        <th>Project Name</th>
                                        <th>Project Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.displayProjects}
                                </tbody>
                            </Table>
                           </Col>
                            <Col>
                           
                                {this.state.graph}
                           
                            </Col>
                       </Row>
                    </Container>
            
                <Modal
                show={this.state.showCreateProject}
                onHide={this.state.handleModalClose}
                backdrop="static"
                size="lg"
                keyboard={false}
                >
                <Modal.Header>
                <Modal.Title>Create New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                            <Form.Row>
                                <Form.Group as={Col} controlId="project_name">
                                            <Form.Label>
                                            <b>Project Name</b>
                                            </Form.Label>
                                            
                                        
                                        <Form.Control name="project_name"
                                                type="text"
                                                onChange={this.onChange}
                                                placeholder="Enter a Project name"
                                                
                                            required />
                                </Form.Group>     
                            </Form.Row>
                            <br/>
                            <Form.Row>
                                <Form.Group as={Col} controlId="project_desc">
                                            <Form.Label>
                                            <b>Project Description</b>
                                            </Form.Label>
                                    
                                        <Form.Control name="project_desc"
                                                type="text"
                                                onChange={this.onChange}
                                                placeholder="Enter Project Desc"
                                                
                                            required />
                                </Form.Group>  
                            </Form.Row>
                    </Form>
                    </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleModalClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={this.createProject}>Create</Button>
                </Modal.Footer>
                </Modal>

            </Container>
        )
    }
}

MyProject.propTypes = {
    getUserProjectsAndPods: PropTypes.func.isRequired,
    changeCurrentProject: PropTypes.func.isRequired,
    createProjectAction: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { getUserProjectsAndPods, changeCurrentProject, createProjectAction })(MyProject);