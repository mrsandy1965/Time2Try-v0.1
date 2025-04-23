'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    router.push('/select');
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div 
            className={styles.titleContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              transform: isHovered ? `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg)` : 'none'
            }}
          >
            <h1 className={styles.title}>
              <span className={styles.titleText}>Time2Try</span>
              <small className={styles.subtitleText}>Turn Your Skills Into Projects</small>
            </h1>
          </div>
          <p className={styles.subtitle}>
            Generate project ideas based on your skills and available time. Perfect for weekend projects or learning new technologies.
          </p>
          <div className={styles.ctaContainer}>
            <button 
              onClick={handleGetStarted} 
              className={styles.ctaButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className={styles.buttonText}>Get Started</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
            <div className={styles.ctaDecoration}></div>
          </div>
        </div>
        <div className={styles.heroBackground}>
          <div className={styles.heroGlow}></div>
          <div className={styles.heroParticles}></div>
        </div>
      </div>

      <div className={styles.features}>
        <div 
          className={`${styles.featureCard} ${activeFeature === 0 ? styles.active : ''}`}
          onMouseEnter={() => setActiveFeature(0)}
          onMouseLeave={() => setActiveFeature(null)}
        >
          <div className={styles.featureIcon}>
            <span className={styles.iconEmoji}>🎯</span>
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.featureContent}>
            <h3>Skill-Based Ideas</h3>
            <p>Get project ideas that match your current skill set and help you learn new technologies.</p>
          </div>
          <div className={styles.featureDecoration}></div>
        </div>

        <div 
          className={`${styles.featureCard} ${activeFeature === 1 ? styles.active : ''}`}
          onMouseEnter={() => setActiveFeature(1)}
          onMouseLeave={() => setActiveFeature(null)}
        >
          <div className={styles.featureIcon}>
            <span className={styles.iconEmoji}>⏰</span>
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.featureContent}>
            <h3>Time Management</h3>
            <p>Projects tailored to your available time, from quick 1-hour tasks to weekend-long challenges.</p>
          </div>
          <div className={styles.featureDecoration}></div>
        </div>

        <div 
          className={`${styles.featureCard} ${activeFeature === 2 ? styles.active : ''}`}
          onMouseEnter={() => setActiveFeature(2)}
          onMouseLeave={() => setActiveFeature(null)}
        >
          <div className={styles.featureIcon}>
            <span className={styles.iconEmoji}>🚀</span>
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.featureContent}>
            <h3>Ready to Build</h3>
            <p>Each idea comes with a tech stack, description, and estimated completion time.</p>
          </div>
          <div className={styles.featureDecoration}></div>
        </div>
      </div>

      <div className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Select Your Skills</h3>
              <p>Choose the technologies you're familiar with or want to learn.</p>
            </div>
            <div className={styles.stepConnector}></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Set Your Time</h3>
              <p>Specify how much time you can dedicate to your project.</p>
            </div>
            <div className={styles.stepConnector}></div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Get Ideas</h3>
              <p>Receive personalized project ideas that match your skills and time.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Building?</h2>
          <p>Generate your first project idea in seconds.</p>
          <div className={styles.ctaButtonContainer}>
            <button 
              onClick={handleGetStarted} 
              className={styles.ctaButton}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className={styles.buttonText}>Get Started Now</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
            <div className={styles.ctaButtonGlow}></div>
          </div>
        </div>
        <div className={styles.ctaBackground}>
          <div className={styles.ctaGlow}></div>
          <div className={styles.ctaParticles}></div>
        </div>
      </div>
    </main>
  );
}
