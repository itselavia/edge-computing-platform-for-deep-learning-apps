import { SET_USER_PODS} from "../actions/action-types";

const initialState = {
    pods:null
};

export default function(state = initialState, action) {
    switch (action.type) {
      case SET_USER_PODS:return {
        ...state,
       pods:action.payload
      };
      default:
        return state;
    }
  }