import React, { Component } from 'react'
import Carousel from 'react-bootstrap/Carousel'
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Card, Col, Container, Badge, Row } from 'react-bootstrap'
class Home extends Component {
    componentDidMount() {
        if (!this.props.auth.isAuthenticated) {
           // if (this.props.auth.user.email_verified) {
                this.props.history.push("/login");
            //}
        }
        // else {
        //     this.props.history.push("/login");
        //     console.log("not auth")
        // }
    }
    render() {
        return (
            <Container>
            <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                 
                        src="data:image/png;base64,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"
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                    
                        src="data:image/png;base64,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"
                        alt="Third slide"
                    />

                    <Carousel.Caption>
                       
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="data:image/png;base64,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"
                        alt="Third slide"
                    />

                    <Carousel.Caption>
                        
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
            </Container>
        )
    }
}
Home.propTypes = {
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});


export default connect(mapStateToProps, {})(withRouter(Home));
