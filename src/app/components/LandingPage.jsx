// app/components/LandingPage.jsx
'use client';
import BrochureForm from './BrochureForm';
import BrochureDisplay from './BrochureDisplay';
import { useState } from 'react';

export default function LandingPage() {
  const [brochure, setBrochure] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setBrochure(data.content);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-content">
          <div className="logo">AI Brochure Generator</div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#demo" className="nav-link">Live Demo</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <h1>Transform Websites into Professional Brochures</h1>
        <p>Generate beautiful, customized brochures from any website URL using advanced AI technology.</p>
        <a href="#demo" className="button">
          <i className="fas fa-magic"></i>
          Try it Now
        </a>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-bolt feature-icon"></i>
            <h3>Instant Generation</h3>
            <p>Transform any website into a professionally designed brochure in seconds using our advanced AI algorithms.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-paint-brush feature-icon"></i>
            <h3>Multiple Styles</h3>
            <p>Choose from various design templates including Modern, Professional, Creative, and Minimal styles.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-file-pdf feature-icon"></i>
            <h3>Export Options</h3>
            <p>Download your brochure as PDF or view the HTML code for further customization.</p>
          </div>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <BrochureForm onSubmit={handleGenerate} loading={loading} />
        {brochure && <BrochureDisplay content={brochure} />}
      </section>

      <section className="cta">
        <h2>Ready to Create Your Brochure?</h2>
        <p>Join thousands of users who trust our AI-powered brochure generator.</p>
        <a href="#demo" className="button">
          <i className="fas fa-arrow-right"></i>
          Get Started
        </a>
      </section>
    </>
  );
}