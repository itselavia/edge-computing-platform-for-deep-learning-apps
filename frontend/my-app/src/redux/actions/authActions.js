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
  SET_CURRENT_PROJECT
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
// export const getUserProjects = userData => dispatch => {
//   // dispatch({
//   //   type: RESET_ALL_STATE
//   // });
//   axios.get("http://localhost:3000/projects", {params: {email:userData.email}})
//     .then(res => {
//       if (res.data.length > 0) {
//         console.log(res.data)
//         dispatch(setUserProjects(res.data));
//       }
//     })
//     .catch(err => {
//       dispatch({
//         type: GET_ERRORS,
//         payload: err.response.data
//       })
//     });
// };
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


export const changeCurrentProject = projData => dispatch =>{
  dispatch(changeCurrentProjState(projData));
}

// export const verifyEmail = userData => dispatch => {
//   dispatch({
//     type: RESET_ALL_STATE
//   });
//   axios.post(`verify/${userData.email}/${userData.access_code}`)
//     .then(res => {
//       if (res.data.token.length > 0) {
//         // Set token to localStorage
//         const token = res.data.token;
//         localStorage.setItem("jwtToken", token);
//         // Set token to Auth header
//         setAuthToken(token);
//         // Decode token to get user data
//         const decoded = jwt_decode(token);
//         // Set current user
//         dispatch(setCurrentUser(decoded));
//       }
//     })
//     .catch(err => {
//       dispatch({
//         type: GET_ERRORS,
//         payload: err.response.data
//       })
//     });
// };

// export const updateProfile = (userData) => dispatch => {
//   axios.put(`/profile/${userData.user_id}`, userData)
//     .then(res => {
//       if (res.data.token.length > 0) {
//         // Set token to localStorage
//         const token = res.data.token;
//         localStorage.setItem("jwtToken", token);
//         // Set token to Auth header
//         setAuthToken(token);
//         // Decode token to get user data
//         const decoded = jwt_decode(token);
//         // Set current user
//         dispatch(setCurrentUser(decoded));
//         dispatch({
//           type: GET_SUCCESS_MSG,
//           payload: res.data
//         });
//         dispatch({
//           type: RESET_ERROR_STATE
//         });
//       }
//     })
//     .catch(err => {
//       dispatch({
//         type: GET_ERRORS,
//         payload: err.response.data
//       });
//       dispatch({
//         type: RESET_SUCCESS_STATE
//       });
//     });
// };

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

// Logout
export const logoutUser = (history) => dispatch => {
  // Remove token from local storage
    console.log("logging user out");
  localStorage.removeItem("jwtToken");
  firebase.auth().signOut();
//   localStorage.removeItem("cart_store_id");
//   localStorage.removeItem("cart_items");
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