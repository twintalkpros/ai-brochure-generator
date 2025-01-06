# Use Python Node image
FROM nikolaik/python-nodejs:latest

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]