// app/page.js
'use client';
import BrochureForm from './components/BrochureForm';
import BrochureDisplay from './components/BrochureDisplay';
import { useState } from 'react';
import LandingPage from './components/LandingPage';

export default function Home() {

  
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

  return <LandingPage />;
}