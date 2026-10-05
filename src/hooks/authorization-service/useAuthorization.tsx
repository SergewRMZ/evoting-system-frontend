import { useState } from "react"
import authorizationServiceApi from "../../services/authorization-service/authorization.api";

const useAuthorization = () => {
    const[loading, setLoading] = useState(false);
    const requestBlindSignature = async (electionId: string, blindedMessage: string) => {
        try {
            setLoading(true);
            return await authorizationServiceApi.requestBlindSignature(
                electionId, 
                blindedMessage
            );
        }   catch (error) {
            if (error instanceof Error) {
                throw error;
            }
        }   finally {
            setLoading(false);
        }
    };

    return {
        requestBlindSignature,
        loading
    }
}

export default useAuthorization;