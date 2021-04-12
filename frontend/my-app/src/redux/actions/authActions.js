import axios from "axios";
import setAuthToken from "../../firebase/setAuthToken";
import jwt_decode from "jwt-decode";
import firebase from "firebase";
import config from "../../config/app-config"
import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING,
  GET_SUCCESS_MSG,
  RESET_ALL_STATE,
  RESET_SUCCESS_STATE,
  RESET_ERROR_STATE,
  SET_USER_PODS,
  SET_USER_PROJECTS,
  CURRENT_USER_INFO,
  SET_CURRENT_PROJECT,
  USER_LOADING_STOP,
  SET_PROJECT_USERS
} from "./action-types";


axios.defaults.baseURL = config.api_host;
axios.defaults.withCredentials = true;


export const loginUser = userData => dispatch => {
  dispatch({
    type: RESET_ALL_STATE
  });
  axios.post("login", userData)
    .then(res => {

      if (res.data.token.length > 0) {
        console.log("in action of login")

        //                                    Set token to localStorage                          
        const token = res.data.token;
        localStorage.setItem("jwtToken", token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        // const decoded = {userExists:false, email: "aish@gmail.com"}
        dispatch(setCurrentUser(decoded));
      }

    })
    .catch(err => {
      console.log(err)
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    }
    );
};


export const registerUser = userData => dispatch => {
  dispatch({
    type: RESET_ALL_STATE
  });
  axios.post("newUser", userData)
    .then(res => {
      console.log(res);
      userData = { userExists: true, email: userData.email, phone: userData.phone, name: userData.name }
      dispatch(setCurrentUser(userData))
    })
   .catch(err => {
      console.log(err);
   }
   );
};


export const getProjectUsers = proj_info => dispatch => {

  axios.get("projectUsers",{params : {project_id:proj_info.project_id}})
    .then(res => {
      console.log(res);
      dispatch(setProjectUsers(res.data));
    })
    .catch(err => {
      console.log(err);
    })
}


export const getUserProjectsAndPods = userData => dispatch => {
  const projReq = axios.get("projects", { params: { email: userData.email } });
  //const podsReq = axios.get(config.pods_info_base+"getAllPods", { params: { email: userData.email } });

  axios.all([projReq]).then(axios.spread((...response) => {
    const res1 = response[0];
    const res2 = response[1];
    console.log(res1)
    console.log(res2)
    if (res1!=null) {
      if(!!res1 && res1.data.length == 0) {
        console.log("size == 0")
        res1.data = [];
      }
      console.log("dispatching"+res1.data)
      dispatch(setUserProjects(res1.data));
    }
    // if(res2!=null) {
    //   if(!!res2 && res2.data.length == 0) {
    //     res2.data = [];
    //   }
    //   dispatch(setUserPods(res2.data));
    // }
  })).catch(errors => {
    console.log(errors)
  })
}


export const createProjectAction = projData => dispatch => {
  axios.post("newProject", projData)
    .then(res => {

      console.log(res.data)

    })
}


export const uploadFile = (modelData, inferData) => dispatch => {
  console.log(modelData)
  console.log(inferData)
  let model_formData = new FormData();
  let infer_formData = new FormData();
  model_formData.append('username', modelData.username);
  model_formData.append('projectname', modelData.projectname)
  model_formData.append('modelfile', modelData.model_file)

  infer_formData.append('username', inferData.username);
  infer_formData.append('projectname', inferData.projectname)
  infer_formData.append('inferencefile', inferData.inference_file)

  // for (var key of model_formData.entries()) {
  //   console.log(key[0] + ', ' + key[1])
  // }
  const headers = {
    'Content-Type': 'multipart/form-data',
  }
  const modelReq = axios.post("project/uploadModel", model_formData, headers);
  const inferReq = axios.post("project/uploadInference", infer_formData, headers);
  dispatch(setUserLoading())
  axios.all([modelReq, inferReq]).then(axios.spread((...response) => {
    const res1 = response[0];
    const res2 = response[1];
    console.log(res1)
    console.log(res2)
    dispatch(stopUserLoading())
    // if(res1.data.length>=0 ) {

    //   dispatch(setUserProjects(res1.data));
    //   dispatch(setUserPods(res2.data));
    // }
  })).catch(errors => {

  })
}


export const changeCurrentProject = projData => dispatch => {
  dispatch(changeCurrentProjState(projData));
}


export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};


export const setUserProjects = data => {
  return {
    type: SET_USER_PROJECTS,
    payload: data
  }
}


export const setProjectUsers = data => {
  return {
    type: SET_PROJECT_USERS,
    payload: data
  }
}


export const changeCurrentProjState = data => {
  return {
    type: SET_CURRENT_PROJECT,
    payload: data
  }
}


export const setUserPods = data => {
  return {
    type: SET_USER_PODS,
    payload: data
  }
}


export const setUserInfo = data => {
  return {
    type: CURRENT_USER_INFO,
    payload: data
  }
}

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};


export const stopUserLoading = () => {
  return {
    type: USER_LOADING_STOP
  };
};


export const logoutUser = (history) => dispatch => {
  // Remove token from local storage
  console.log("logging user out");
  localStorage.removeItem("jwtToken");
  firebase.auth().signOut();

  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
  dispatch({
    type: RESET_ALL_STATE
  });

  if (history) {
    history.push({
      pathname: "/",
      comingFrom: "logout"
    });
  }
};


export const startLoading = () => async dispatch => {
  dispatch({ type: '_REQUEST' })
}


export const endLoading = () => async dispatch => {
  dispatch({ type: '_SUCCESS' })
}