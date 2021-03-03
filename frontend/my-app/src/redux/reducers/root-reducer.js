import { combineReducers } from "redux";

import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import successReducer from "./successReducer";
import { interceptor } from "./loaderReducer";
import {
  RESET_ALL_STATE,RESET_ERROR_STATE,RESET_SUCCESS_STATE
} from "../../redux/actions/action-types";




const appReducer = combineReducers({
    auth: authReducer,
    errors: errorReducer,
    success: successReducer,
    interceptor: interceptor
    
});

const rootReducer = (state, action) => {
  if (action.type === RESET_ALL_STATE) {
    state = undefined;
  }

  if (action.type === RESET_SUCCESS_STATE) {
    state.success = undefined;
  }

  if (action.type === RESET_ERROR_STATE) {
    state.errors = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;