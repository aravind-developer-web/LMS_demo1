#!/bin/bash
set -e

# 1. Update System
echo "Updating system..."
sudo dnf update -y

# 2. Install Git and Docker
echo "Installing Git and Docker..."
sudo dnf install -y git docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 3. Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 4. Clone or Pull Repository
echo "Setting up repository..."
if [ -d "LMS-PROJECT" ]; then
    cd LMS-PROJECT
    echo "Pulling latest changes..."
    git pull
else
    echo "Cloning repository..."
    git clone https://github.com/aravind-developer-web/LMS-PROJECT.git
    cd LMS-PROJECT
fi

# 5. Create Root .env file for Docker Compose
echo "Configuring environment..."
cat <<EOF > .env
DEBUG=0
SECRET_KEY=django-insecure-prod-key-$(date +%s)
DATABASE_NAME=lms_db
DATABASE_USER=lms_user
DATABASE_PASSWORD=secure_db_password
DATABASE_HOST=db
DATABASE_PORT=5432
DJANGO_ALLOWED_HOSTS=13.60.42.253 lms-production.13.60.42.253.nip.io localhost 127.0.0.1
ALLOWED_HOSTS=13.60.42.253 lms-production.13.60.42.253.nip.io localhost 127.0.0.1
EOF

# 6. Build and Run containers
echo "Building and starting containers..."
# Try to use docker-compose command, fall back to docker compose plugin
if command -v docker-compose &> /dev/null; then
    sudo /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d --build
else
    sudo docker compose -f docker-compose.prod.yml up -d --build
fi

echo "Deployment Complete! Backend running on port 8000."
