const DOMAIN = process.env.REACT_APP_DOMAIN;
const config = {
    api_host: process.env.REACT_APP_DOMAIN,
    pods_info_base: process.env.MODEL_MANAGER_API
}
console.log("Hi i am in config")
console.log(process.env)
export default config;