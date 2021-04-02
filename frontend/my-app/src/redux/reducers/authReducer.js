import {
    SET_CURRENT_USER,
    USER_LOADING,
    USER_LOADING_STOP
  } from "../actions/action-types";
  
  const isEmpty = require("is-empty");
  
  const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false
  };
  
  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_CURRENT_USER:
        return {
          ...state,
          isAuthenticated: !isEmpty(action.payload),
          user: action.payload
        };
      case USER_LOADING:
        return {
          ...state,
          loading: true
        };
      case USER_LOADING_STOP:
        return {
          ...state,
          loading: false
        }
      default:
        return state;
    }
  }