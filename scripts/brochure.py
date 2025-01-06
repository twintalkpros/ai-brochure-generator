# scripts/brochure.py

import sys
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
from openai import OpenAI
import json
import unicodedata

load_dotenv()

def get_modern_html_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <body>
        <div class="brochure-content">
            <header class="header">
                <h1><i class="fas fa-building"></i> {company_name}</h1>
                <p class="tagline">{tagline}</p>
            </header>

            <section class="about-section">
                <h2><i class="fas fa-info-circle"></i> About Us</h2>
                {about_content}
            </section>

            <section class="services-section">
                <h2><i class="fas fa-cogs"></i> Our Services</h2>
                <div class="services-grid">
                    {services_content}
                </div>
            </section>

            <section class="solutions-section">
                <h2><i class="fas fa-lightbulb"></i> Industry Solutions</h2>
                <div class="solutions-grid">
                    {solutions_content}
                </div>
            </section>

            <section class="expertise-section">
                <h2><i class="fas fa-star"></i> Our Expertise</h2>
                {expertise_content}
            </section>

            <section class="contact-section">
                <h2><i class="fas fa-envelope"></i> Contact Us</h2>
                <div class="contact-info">
                    {contact_content}
                </div>
            </section>
        </div>

        <style>
            .brochure-content {
                font-family: 'Plus Jakarta Sans', sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
                color: #1e293b;
            }

            .header {
                text-align: center;
                margin-bottom: 3rem;
                padding: 2rem;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }

            .tagline {
                font-size: 1.25rem;
                opacity: 0.9;
            }

            section {
                margin-bottom: 3rem;
                padding: 2rem;
                background: white;
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            h2 {
                color: #1e40af;
                font-size: 1.8rem;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .services-grid, .solutions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-top: 1.5rem;
            }

            .service-card, .solution-card {
                padding: 1.5rem;
                background: #f8fafc;
                border-radius: 0.75rem;
                transition: transform 0.3s ease;
            }

            .service-card:hover, .solution-card:hover {
                transform: translateY(-5px);
            }

            .contact-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 0.75rem;
            }

            .contact-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            i {
                color: #3b82f6;
            }

            ul {
                list-style: none;
                padding: 0;
            }

            li {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                background: #f8fafc;
                border-radius: 0.5rem;
                transition: all 0.3s ease;
            }

            li:hover {
                transform: translateX(8px);
                background: #f1f5f9;
            }

            @media (max-width: 768px) {
                .brochure-content {
                    padding: 1rem;
                }

                .header h1 {
                    font-size: 2rem;
                }

                section {
                    padding: 1.5rem;
                }
            }
        </style>
    </body>
    </html>
    """

def get_detailed_prompt(category):
    prompts = {
        'default': """Create a modern, detailed HTML brochure with the following sections, using Font Awesome icons and modern styling:

1. Header:
   - Company name with icon
   - Compelling tagline
   - Modern gradient background

2. About Us:
   - Company overview
   - Mission and vision
   - Key achievements
   - Add relevant icons for each point

3. Services (minimum 4):
   - Each service in a card format
   - Icon for each service
   - Brief description
   - Key benefits

4. Industry Solutions:
   - Target industries
   - Specific solutions
   - Success metrics
   - Case studies

5. Expertise:
   - Technical capabilities
   - Team expertise
   - Technologies used
   - Certifications

6. Contact Information:
   - Office locations
   - Email and phone
   - Social media links
   - Working hours

Format everything in modern HTML with a clean, professional design. Use appropriate Font Awesome icons (fas fa-*) for each section and element. Make sure content is engaging and detailed.""",
        
        'professional': """Generate a sophisticated, business-focused HTML brochure with these sections:

1. Executive Summary:
   - Company positioning
   - Market presence
   - Core strengths

2. Service Portfolio:
   - Enterprise solutions
   - Consulting services
   - Implementation expertise
   - Support packages

3. Industry Expertise:
   - Sector-specific solutions
   - Client success stories
   - Market insights

4. Professional Services:
   - Methodology
   - Project approach
   - Quality assurance
   - Delivery models

5. Client Benefits:
   - ROI analysis
   - Success metrics
   - Value proposition
   - Competitive advantages

Use corporate styling, professional icons, and business-appropriate formatting.""",
        
        'creative': """Design an engaging, creative HTML brochure with:

1. Innovative Design:
   - Modern aesthetics
   - Creative layouts
   - Dynamic elements

2. Solutions Showcase:
   - Creative approaches
   - Unique methodologies
   - Innovation highlights

3. Portfolio Display:
   - Featured projects
   - Success stories
   - Client testimonials

4. Creative Process:
   - Methodology
   - Design thinking
   - Innovation approach

5. Team & Culture:
   - Creative expertise
   - Company values
   - Work environment

Use vibrant styling, creative icons, and engaging visuals described in text."""
    }
    return prompts.get(category, prompts['default'])

def clean_text(text):
    normalized = unicodedata.normalize('NFKD', text)
    return normalized.encode('ascii', 'ignore').decode('ascii')

class Website:
    def __init__(self, url):
        self.url = url
        try:
            response = requests.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            response.encoding = 'utf-8'
            self.body = response.text
            soup = BeautifulSoup(self.body, 'html.parser')
            self.title = clean_text(soup.title.string) if soup.title else "No title found"
            
            if soup.body:
                for tag in soup.body(["script", "style", "img", "input"]):
                    tag.decompose()
                text = soup.body.get_text(separator="\n", strip=True)
                self.text = clean_text(text)
            else:
                self.text = ""
                
            links = [link.get('href') for link in soup.find_all('a')]
            self.links = [link for link in links if link]
            
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            self.title = "Error fetching page"
            self.text = ""
            self.links = []

    def get_contents(self):
        return f"Webpage Title:\n{self.title}\nWebpage Contents:\n{self.text}\n\n"

def get_brochure(url, category):
    client = OpenAI()
    website = Website(url)
    
    try:
        template = get_modern_html_template()
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": """You are a HTML generator. 
                Generate ONLY pure HTML content. 
                Do not include any explanation text, markdown symbols, or code block markers.
                Start directly with <!DOCTYPE html> and end with </html>.
                Do not add any text before or after the HTML content."""},
                {"role": "user", "content": f"""
                Using this template, create a brochure for the following website content. 
                Return only the HTML, no other text:
                {template}
                
                Website Content:
                {website.get_contents()}
                """}
            ],
            max_tokens=8000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Ensure content starts with DOCTYPE and ends with </html>
        if not content.startswith('<!DOCTYPE'):
            content = '<!DOCTYPE html>' + content
        if not content.endswith('</html>'):
            content = content + '</html>'
            
        return content
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return "Error generating brochure"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python brochure.py <url> <category>")
        sys.exit(1)
        
    url = sys.argv[1]
    category = sys.argv[2]
    result = get_brochure(url, category)
    sys.stdout.buffer.write(result.encode('utf-8'))