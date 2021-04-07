import { SET_USER_PROJECTS, SET_CURRENT_PROJECT, SET_PROJECT_USERS} from "../actions/action-types";

const initialState = {
    projects:null,
    current_project:null,
    project_users:null
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
      case SET_PROJECT_USERS: return {
          ...state,
       project_users:action.payload
      }
      default:
        return state;
    }
  }