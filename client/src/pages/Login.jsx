import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import supabase from "../config/supabase";

function Login() {
  const navigate = useNavigate();

  const handleLogin =async () => {
       const {error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: "http://localhost:5173/auth/callback"
        }
      })

      if (error) console.error(error)   
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <h2 style={{marginBottom: '8px'}}>VITMAS Portal</h2>
        <p style={{color: 'var(--text-muted)'}}>Room Booking Assistant</p>
        <div className={styles.form}>
          <button className={styles.googleBtn} onClick={handleLogin}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login;