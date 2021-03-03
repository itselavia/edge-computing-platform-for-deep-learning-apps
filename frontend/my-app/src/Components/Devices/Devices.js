import React, { Component } from 'react'
import axios from 'axios';
import Select from 'react-select'
import { Container } from 'react-bootstrap';
export default class Devices extends Component {
    constructor(props) {
        super(props)
        this.state={
            data:[],
            errorMessage:""
        }
    }
    componentDidMount() {
        axios
        .get(`http://localhost:3000/devices`)
        .then(res => {

            const data = res.data;
           console.log(data)
            this.setState({
                data : data
            },()=>console.log(this.state.data))
        }).catch(e=>{
            this.setState({errorMessage: e.message});
        })
    }
    render() {
        return (
            <Container style={{marginTop:"20px"}}>
                <Select options={this.state.data}>
                
            </Select>
            </Container>
        )
    }
}
