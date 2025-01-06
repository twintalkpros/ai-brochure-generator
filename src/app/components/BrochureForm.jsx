'use client';
import { useState } from 'react';
import { Globe, Wand2, Loader2 } from "lucide-react";
import styles from './BrochureForm.module.css';

export default function BrochureForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('default');

  const categories = [
    { value: 'default', label: 'Modern Design', icon: 'fa-pen-fancy', gradient: 'blue-gradient' },
    { value: 'professional', label: 'Professional', icon: 'fa-briefcase', gradient: 'purple-gradient' },
    { value: 'creative', label: 'Creative', icon: 'fa-paintbrush', gradient: 'pink-gradient' },
    { value: 'minimal', label: 'Minimal', icon: 'fa-feather', gradient: 'gray-gradient' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ url, category });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>Generate Your Brochure</h2>
          <p>Enter a website URL and choose your preferred style</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Website URL</label>
            <div className={styles.inputWrapper}>
              <Globe className={styles.inputIcon} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          <div className={styles.categoryGroup}>
            <label>Choose Style</label>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`${styles.categoryCard} ${category === cat.value ? styles.selected : ''} ${styles[cat.gradient]}`}
                >
                  <div className={styles.iconWrapper}>
                    <i className={`fas ${cat.icon}`}></i>
                  </div>
                  <p>{cat.label}</p>
                  {category === cat.value && (
                    <span className={styles.checkmark}>
                      <i className="fas fa-check"></i>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <span className={styles.buttonContent}>
                <Loader2 className={styles.spinnerIcon} />
                Generating...
              </span>
            ) : (
              <span className={styles.buttonContent}>
                <Wand2 />
                Generate Brochure
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );

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
      alert('Error generating brochure: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

}