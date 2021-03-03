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
  CURRENT_USER_INFO
} from "./action-types";

// Login - get user token
axios.defaults.withCredentials = true;
export const loginUser = userData => dispatch => {
  dispatch({
    type: RESET_ALL_STATE
  });
  axios.post("http://localhost:3000/login", userData)
    .then(res => {
       console.log(res)
      if (res.data.length > 0) {
          console.log("in action of login")
         // console.log(res.data)
        // Set token to localStorage
        const token = res.data;
        localStorage.setItem("jwtToken", token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        console.log(decoded)
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
  axios.post("register", userData)
    .then(res => {
      if (res.data.token.length > 0) {
        // Set token to localStorage
        const token = res.data.token;
        localStorage.setItem("jwtToken", token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        dispatch(setCurrentUser(decoded));
      }

    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    }
    );
};

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