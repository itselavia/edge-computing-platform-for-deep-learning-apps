import React, { Component } from 'react'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getUserProjectsAndPods, changeCurrentProject } from "../../redux/actions/authActions";
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import DonutChart from 'react-donut-chart';
import { Col, Row ,Nav} from 'react-bootstrap';

class MyProject extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            email:props.auth.user.email,
            projects:[],
            pods:[]
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
    onProjectClick(proj_id) {
        console.log(proj_id)
        const projData = {project_id:proj_id}
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
                     <td onClick={()=>this.onProjectClick(proj.project_id)}>{proj.project_id}</td>
                     <td>{proj.project_name}</td>
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
                <br></br>
                
                   <Container>
                       <Row xs={1} md={2}>
                           <Col >
                            <Table striped bordered hover responsive variant="dark">
                                <thead>
                                    <tr>
                                        <th>Project Id</th>
                                        <th>Project Name</th>
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
            
            </Container>
         
        )
    }

    
}

MyProject.propTypes = {
    getUserProjectsAndPods: PropTypes.func.isRequired,
    changeCurrentProject: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { getUserProjectsAndPods, changeCurrentProject })(MyProject);
