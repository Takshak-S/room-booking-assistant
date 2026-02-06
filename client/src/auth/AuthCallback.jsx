import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import { useEffect } from "react";

export default function AuthCallback() {
    const navigate = useNavigate();

    async function authenticatWithBackend() {
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session.access_token;
    
            const response = await fetch('http://localhost:5000/api/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res=>res.json());
            console.log(response)
            const { role, profile_completed } = response || {};
            if (!profile_completed) {
                if (role === 'STUDENT') navigate('/complete-form/student');
                else if(role==="FACULTY") navigate('/complete-form/faculty');
                else{
                    navigate("/");
                }
            } else {
                navigate("/home");
            }

        } catch (error) {
            console.error("Error authenticating with backend:", error);
            navigate("/login");
        }

    }

    useEffect(()=>{
        authenticatWithBackend();
    },[])
}