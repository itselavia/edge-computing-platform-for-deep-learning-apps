const DOMAIN = process.env.REACT_APP_DOMAIN;
const config = {
    api_host: "http://"+process.env.REACT_APP_DOMAIN+":31000/",
    pods_info_base: "http://"+process.env.REACT_APP_DOMAIN+":32000/",
    inference_host: "http://"+process.env.REACT_APP_DOMAIN+":33000/"
}
// const config = {
//     api_host: "http://localhost:5000/",
//     pods_info_base: "http://localhost:3000/",
//     inference_host: "http://127.0.0.1:5001/"
// }
console.log("Hi i am in config")
console.log(process.env)
export default config;