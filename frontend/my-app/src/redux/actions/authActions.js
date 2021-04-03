import axios from "axios";
import setAuthToken from "../../firebase/setAuthToken";
import jwt_decode from "jwt-decode";
import firebase from "firebase";

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
  USER_LOADING_STOP
} from "./action-types";

// Login - get user token
axios.defaults.withCredentials = true;
export const loginUser = userData => dispatch => {
  dispatch({
    type: RESET_ALL_STATE
  });
  axios.post("http://localhost:5000/login", userData)
    .then(res => {
      console.log("userdata ---------------------"+userData)
      console.log(userData)
       console.log(res.data)
      if (res.data.token.length > 0) {
          console.log("in action of login")
         // console.log(res.data)
        // Set token to localStorage
        const token = res.data.token;
       localStorage.setItem("jwtToken", token);
        // Set token to Auth header
       setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        // const decoded = {userExists:false, email: "aish@gmail.com"}
        console.log(token)
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
  axios.post("http://localhost:5000/newUser", userData)
    .then(res => {
      console.log(res);
      userData = {userExists:true, email:userData.email, phone:userData.phone, name:userData.name}
      dispatch(setCurrentUser(userData))
      
      // if (res.data.token.length > 0) {
      //   // Set token to localStorage
      //   const token = res.data.token;
      //   localStorage.setItem("jwtToken", token);
      //   // Set token to Auth header
      //   setAuthToken(token);
      //   // Decode token to get user data
      //   const decoded = jwt_decode(token);
      //   // Set current user

      //   dispatch(setCurrentUser(decoded));
      // }

    })
    // .catch(err => {
    //   dispatch({
    //     type: GET_ERRORS,
    //     payload: err.response.data
    //   })
    // }
    // );
};

export const getUserProjectsAndPods = userData => dispatch => {
  const projReq = axios.get("http://localhost:5000/projects", {params: {email:userData.email}});
  const podsReq = axios.get("http://localhost:3000/allPods", {params: {email:userData.email}});

  axios.all([projReq, podsReq]).then(axios.spread((...response) => {
    const res1 = response[0];
    const res2 = response[1];
    console.log(res2)
    if(res1.data.length>=0 && res2.data.length>=0) {
      
      dispatch(setUserProjects(res1.data));
      dispatch(setUserPods(res2.data));
    }
  })).catch(errors => {

  })
}

export const createProjectAction = projData => dispatch =>{
  axios.post("http://localhost:5000/newProject", projData)
    .then(res => {
      
       console.log(res.data)
      // if (res.data.token.length > 0) {
      //     console.log("in action of login")
      //    // console.log(res.data)
      //   // Set token to localStorage
      //   const token = res.data.token;
      //  localStorage.setItem("jwtToken", token);
      //   // Set token to Auth header
      //  setAuthToken(token);
      //   // Decode token to get user data
      //   const decoded = jwt_decode(token);
      //   // Set current user
      //   // const decoded = {userExists:false, email: "aish@gmail.com"}
      //   console.log(token)
      //   dispatch(setCurrentUser(decoded));
      // }

    })
}

export const uploadFile = (modelData, inferData) => dispatch =>{
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
  const modelReq = axios.post("http://localhost:5000/project/uploadModel", model_formData, headers);
  // const inferReq = axios.post("http://localhost:5000/allPods", {params: {email:userData.email}});
  dispatch(setUserLoading())
  axios.all([modelReq]).then(axios.spread((...response) => {
    const res1 = response[0];
    // const res2 = response[1];
    console.log(res1)
    dispatch(stopUserLoading())
    // if(res1.data.length>=0 ) {
      
    //   dispatch(setUserProjects(res1.data));
    //   dispatch(setUserPods(res2.data));
    // }
  })).catch(errors => {

  })
}

export const changeCurrentProject = projData => dispatch =>{
  dispatch(changeCurrentProjState(projData));
}



// Set logged in user
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
// Logout
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