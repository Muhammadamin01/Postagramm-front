import {createContext, useContext, useState} from "react";

const InfoContext = createContext()

export const useInfoContext = () => useContext(InfoContext)

export const InfoProvider = ({children}) => {
    const [user, setUser] = useState("")

    const [address, setAdress] = useState("")

    const value = {
        user, setUser,
        address, setAdress
    }

    return (
        <InfoContext.Provider value={value}>
            <InfoContext.Consumer>
                {
                  () => children  
                }
            </InfoContext.Consumer>
        </InfoContext.Provider>
    )
}