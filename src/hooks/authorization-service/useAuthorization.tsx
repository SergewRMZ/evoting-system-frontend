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