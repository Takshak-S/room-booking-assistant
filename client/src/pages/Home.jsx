import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroIcon}>🏛️</div>
          <h1 className={styles.heroTitle}>VITMAS Room Booking Assistant</h1>
          <p className={styles.heroSubtitle}>
            Streamline your facility reservations with our intelligent booking system
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => navigate("/dashboard")}
          >
            Get Started
          </button>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📅</span>
              <h3 className={styles.featureTitle}>Easy Scheduling</h3>
              <p className={styles.featureDescription}>
                Book classrooms, labs, and seminar halls with just a few clicks. View real-time availability and schedule instantly.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔍</span>
              <h3 className={styles.featureTitle}>Smart Search</h3>
              <p className={styles.featureDescription}>
                Filter facilities by type, capacity, location, and amenities like AC and projectors to find the perfect space.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⚡</span>
              <h3 className={styles.featureTitle}>Instant Confirmation</h3>
              <p className={styles.featureDescription}>
                Get immediate booking confirmations and manage your reservations from a centralized dashboard.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📊</span>
              <h3 className={styles.featureTitle}>Booking History</h3>
              <p className={styles.featureDescription}>
                Track all your past and upcoming bookings in one place. Edit or cancel reservations as needed.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔐</span>
              <h3 className={styles.featureTitle}>Secure Access</h3>
              <p className={styles.featureDescription}>
                Google OAuth integration ensures secure authentication with your institutional credentials.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📱</span>
              <h3 className={styles.featureTitle}>Responsive Design</h3>
              <p className={styles.featureDescription}>
                Access the system from any device - desktop, tablet, or mobile - with a seamless experience.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefitsSection}>
          <h2 className={styles.benefitsTitle}>Why Use VITMAS?</h2>
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>✅</span>
              <p className={styles.benefitText}>
                Eliminate scheduling conflicts with real-time availability
              </p>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>⏱️</span>
              <p className={styles.benefitText}>
                Save time with quick and efficient booking process
              </p>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>🎯</span>
              <p className={styles.benefitText}>
                Find the right facility with advanced filtering options
              </p>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>🔔</span>
              <p className={styles.benefitText}>
                Stay organized with booking history and management tools
              </p>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>🌐</span>
              <p className={styles.benefitText}>
                Access from anywhere, anytime with cloud-based system
              </p>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>👥</span>
              <p className={styles.benefitText}>
                Designed for students, faculty, and administrative staff
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;

