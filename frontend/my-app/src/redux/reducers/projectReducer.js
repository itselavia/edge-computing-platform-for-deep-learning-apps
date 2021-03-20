import { SET_USER_PROJECTS, SET_CURRENT_PROJECT} from "../actions/action-types";

const initialState = {
    projects:null,
    current_project:null
};

export default function(state = initialState, action) {
    switch (action.type) {
      case SET_USER_PROJECTS:return {
        ...state,
       projects:action.payload
      };
      case SET_CURRENT_PROJECT: return {
          ...state,
       current_project:action.payload
      }
      default:
        return state;
    }
  }