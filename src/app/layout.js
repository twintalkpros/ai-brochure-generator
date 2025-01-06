// app/layout.js
import './globals.css'

export const metadata = {
  title: 'AI Brochure Generator',
  description: 'Generate professional brochures from websites using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}