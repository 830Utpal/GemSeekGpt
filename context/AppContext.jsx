"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, useContext } from "react";

// Create a context
const AppContext = createContext();

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};

// Provider component
export const AppContextProvider = ({ children }) => {
    const { user } = useUser();

    const value = {
        user
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
