'use client';
import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './BrochureDisplay.module.css';
import { Download, Eye, Code2, Copy, Check, Loader } from 'lucide-react';

export default function BrochureDisplay({ content }) {
  const brochureRef = useRef(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Updated PDF generation function in BrochureDisplay.jsx

  const generatePDF = async () => {
    const element = brochureRef.current;
    if (!element) return;

    setIsGeneratingPDF(true);

    try {
      // Create a temporary container
      const container = document.createElement('div');
      const a4Width = 794; // A4 width in pixels at 96 DPI
      const a4Height = 1123; // A4 height in pixels

      // Style the container
      container.style.width = `${a4Width}px`;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = element.innerHTML;

      // Add page-break prevention styles
      const style = document.createElement('style');
      style.textContent = `
        .brochure-section {
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        h1, h2, h3 {
          page-break-after: avoid;
        }
        li, p {
          page-break-inside: avoid;
        }
        ul, ol {
          page-break-before: avoid;
        }
      `;
      container.prepend(style);

      // Wrap sections in page-break-avoiding div
      const sections = container.querySelectorAll('section, .section');
      sections.forEach(section => {
        const wrapper = document.createElement('div');
        wrapper.className = 'brochure-section';
        section.parentNode.insertBefore(wrapper, section);
        wrapper.appendChild(section);
      });

      // Add container to document
      document.body.appendChild(container);

      // Get dimensions
      const containerHeight = container.offsetHeight;
      const numPages = Math.ceil(containerHeight / a4Height);

      // Initialize PDF with better quality settings
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'px',
        hotfixes: ["px_scaling"],
        compress: true
      });

      // Function to check if an element is cut between pages
      const isElementCut = (elementTop, elementHeight, pageHeight) => {
        const elementBottom = elementTop + elementHeight;
        const pageBottom = Math.ceil(elementTop / pageHeight) * pageHeight;
        return elementBottom > pageBottom && elementTop < pageBottom;
      };

      // Track the last complete element on each page
      let lastCompleteY = 0;

      // Generate each page
      for (let i = 0; i < numPages; i++) {
        const pageTop = i * a4Height;
        
        // Find elements that would be cut on this page
        const elements = container.querySelectorAll('p, li, section, .brochure-section');
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (isElementCut(rect.top, rect.height, a4Height)) {
            // Move element to next page
            lastCompleteY = Math.floor(rect.top / a4Height) * a4Height;
          }
        });

        // Create canvas for current page
        const canvas = await html2canvas(container, {
          width: a4Width,
          height: a4Height,
          windowWidth: a4Width,
          windowHeight: a4Height,
          y: pageTop,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc) => {
            // Adjust positions of elements to prevent cuts
            const clonedElements = clonedDoc.querySelectorAll('p, li, section, .brochure-section');
            clonedElements.forEach(element => {
              const rect = element.getBoundingClientRect();
              if (isElementCut(rect.top, rect.height, a4Height)) {
                element.style.marginTop = `${(Math.ceil(rect.top / a4Height) * a4Height) - rect.top}px`;
              }
            });
          }
        });

        // Add page if not first page
        if (i > 0) {
          pdf.addPage();
        }

        // Add image to PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, a4Width, a4Height, '', 'FAST');
      }

      // Clean up
      document.body.removeChild(container);

      // Save PDF
      pdf.save('brochure.pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={styles.displayContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Generated Brochure</h2>
          <p>Preview your brochure and download as PDF</p>
        </div>
        <button 
          onClick={generatePDF} 
          disabled={isGeneratingPDF}
          className={styles.downloadButton}
        >
          {isGeneratingPDF ? (
            <>
              <Loader className={styles.spinner} size={20} />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={20} />
              Download PDF
            </>
          )}
        </button>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${activeTab === 'preview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={18} />
            Preview
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'code' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code2 size={18} />
            HTML Code
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'preview' ? (
            <div 
              ref={brochureRef}
              className={styles.brochureContent}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className={styles.codeContainer}>
              <button 
                onClick={handleCopyCode} 
                className={styles.copyButton}
                title="Copy code"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <pre className={styles.codeBlock}>
                <code>{content}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}