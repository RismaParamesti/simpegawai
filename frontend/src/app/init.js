import axios from "axios"

const initializeApp = () => {
    const configuredBaseUrl = process.env.REACT_APP_BASE_URL
    const fallbackBaseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const baseUrl = (configuredBaseUrl || fallbackBaseUrl).replace(/\/$/, "")

    if (baseUrl) {
        axios.defaults.baseURL = baseUrl
    }


    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        // dev code



    } else {
        // Prod build code



        // Removing console.log from prod
        console.log = () => {};


        // init analytics here
    }

}

export default initializeApp
