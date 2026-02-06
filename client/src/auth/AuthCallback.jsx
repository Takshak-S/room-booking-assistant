import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import { useEffect } from "react";

export default function AuthCallback() {
    const navigate = useNavigate();

    async function authenticatWithBackend() {
        const { data } = await supabase.auth.getSession();
        const token = data.session.access_token;

        const response = await fetch('http://localhost:5000/api/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res=>res.json());
        console.log(response)
    }

    useEffect(()=>{
        authenticatWithBackend();
        navigate("/setup-profile");
    })
}