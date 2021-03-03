import React, { Component } from 'react'
import { BrowserRouter } from "react-router-dom";
import Navbar from './Components/Navbar/_Navbar';
import  Main  from "./Components/Main/Main"
import { Provider } from 'react-redux';
import store from "./store";


export default class App extends Component {
  render() {

    return (
     <div>
       <Provider store={store}>
        <BrowserRouter>
          <Navbar />
          <Main />
        </BrowserRouter>
      </Provider>
     </div>
    )
  }
}

