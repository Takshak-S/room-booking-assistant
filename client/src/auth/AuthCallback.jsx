import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import { useEffect } from "react";
import styles from "./AuthCallback.module.css";

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
            }).then(res => res.json());

            console.log(response);
            const { role, profile_completed } = response || {};

            if (!profile_completed) {
                if (role === 'STUDENT') navigate('/complete-form/student');
                else if (role === "FACULTY") navigate('/complete-form/faculty');
                else {
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

    useEffect(() => {
        authenticatWithBackend();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.loadingContainer}>
                <div className={styles.loadingIcon}>🔐</div>
                <div className={styles.spinner}></div>
                <h2 className={styles.loadingText}>Authenticating...</h2>
                <p className={styles.loadingSubtext}>Please wait while we verify your credentials</p>
            </div>
        </div>
    );
}
