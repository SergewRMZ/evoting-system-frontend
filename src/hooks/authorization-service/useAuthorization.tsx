import { useState } from "react"
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import axios from "axios";

const useAuthorization = () => {
    const[loading, setLoading] = useState(false);


    const authorizeVote = async (electionId: string, blindedMessage: string) => {
        try {
            setLoading(true);
            return await authorizationServiceApi.requestBlindSignature(
                electionId, 
                blindedMessage
            );
        }   catch(error) {
            if(axios.isAxiosError(error)) {
                const problemDetails = error.response?.data;
                if (problemDetails?.detail) {
                    throw new Error(problemDetails.detail, {cause: error});
                }
            }

            throw error;
        }   
        
        finally {
            setLoading(false);
        }
    };

    return {
        requestBlindSignature: authorizeVote,
        loading
    }
}

export default useAuthorization;