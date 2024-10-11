# Python image from the Docker Hub
FROM python:3.10 as build-stage

# Set the working directory in the container
WORKDIR /app

# Copy requirements.txt first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application files
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
# Prevents Python from writing pyc files
ENV PYTHONDONTWRITEBYTECODE=1
# Ensures Python output is logged in real-time
ENV PYTHONUNBUFFERED=1

# Expose the port your app runs on (e.g., 5000 for Flask)
EXPOSE 5000

# Use Gunicorn to run Flask app
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app.app"]
