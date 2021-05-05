const DOMAIN = process.env.REACT_APP_DOMAIN;
const config = {
    api_host: "http://"+process.env.REACT_APP_DOMAIN+":31000/",
    pods_info_base: "http://"+process.env.REACT_APP_DOMAIN+":32000/",
    inference_host: "http://"+process.env.REACT_APP_DOMAIN+":"+localStorage.getItem("port").trim()+"/"
}
// const config = {
//     api_host: "http://104.196.243.152:31000/",
//     pods_info_base: "http://104.196.243.152:32000/",
//     inference_host: "http://104.196.243.152:32089/"
// }
// const config = {
//     api_host: "http://localhost:5000/",
//     pods_info_base: "http://104.196.243.152:32000/",
//     inference_host: "http://104.196.243.152:"+localStorage.getItem("port").trim()+"/"
// }
console.log("Hi i am in config")
console.log(process.env)
export default config;