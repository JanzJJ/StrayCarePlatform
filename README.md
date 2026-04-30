# 🐕 StrayCare - Stray Dog Care & Adoption Platform

A full-stack web application for reporting, tracking, and adopting stray dogs. Features disease detection using machine learning, adoption platform, reporting system, and information hub.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Port Configuration](#port-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**StrayCare** is a comprehensive platform designed to:

- 📍 Report and track stray dogs
- 🏥 Detect dog skin diseases using ML
- 🏠 Facilitate dog adoption
- 📚 Provide pet care information
- 👥 Connect users with organizations
- 🎯 Reward users for community contributions

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Icons:** Lucide Icons
- **Maps:** Google Maps API
- **UI Components:** Custom React components

### Backend

- **Runtime:** Node.js with Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer
- **Email:** Nodemailer

### Machine Learning

- **Framework:** Flask (Python)
- **ML Library:** TensorFlow/Keras
- **Model:** MobileNetV2 for image classification
- **Purpose:** Dog skin disease detection

---

## 📦 Prerequisites

Before running the application, ensure you have installed:

### Required

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **MongoDB** (Local or Atlas URL) - [Download](https://www.mongodb.com/)
- **Git** - [Download](https://git-scm.com/)

### Optional

- **Postman** (for testing APIs)
- **VS Code** (recommended editor)

### Check Installations

```bash
node --version
npm --version
python --version
git --version
```

---

## 📁 Project Structure

```
StrayCare-System/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── AdoptionPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiseasePrediction.jsx
│   │   │   ├── InformationCentre.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── ReportingPage.jsx
│   │   │   ├── Userprofile.jsx
│   │   │   └── WelcomeLandingPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js               # Vite configuration with API proxy
│   ├── package.json
│   └── index.html
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/                 # Business logic
│   │   ├── authController.js
│   │   ├── adoptionController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── Report.js
│   │   └── AdoptionListing.js
│   ├── routes/                      # API endpoints
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── adoption.js
│   │   ├── Diseasedetectionroutes.js
│   │   ├── user.js
│   │   └── hub.js
│   ├── utils/
│   │   └── sendEmail.js             # Email utility
│   ├── uploads/                     # Uploaded files storage
│   ├── server.js                    # Main Express app
│   └── package.json
│
├── ml_service/                      # Flask ML microservice
│   ├── app.py                       # Flask application
│   ├── model/
│   │   └── dog_skin_model.h5        # Pre-trained ML model
│   ├── requirements.txt             # Python dependencies
│   ├── venv/                        # Virtual environment
│   └── README.md                    # ML service documentation
│
└── README.md                        # This file
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
cd D:\StrayCare-System
git clone <repository-url>
cd StrayCare-System
```

### Step 2: Setup Frontend

```bash
cd client
npm install
```

### Step 3: Setup Backend

```bash
cd ../server
npm install
```

### Step 4: Setup ML Service

```bash
cd ../ml_service

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 5: Environment Configuration

Create `.env` file in the `server/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/straycare
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/straycare

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Flask Service URL
FLASK_URL=http://localhost:5002

# Port Configuration
PORT=5001
```

---

## ▶️ Running the Application

### Option 1: Run All Services (Recommended)

Open **3 separate terminal windows** and run these commands:

#### Terminal 1: Flask ML Service (Port 5002)

```bash
cd StrayCare-System\ml_service

# Activate virtual environment
venv\Scripts\activate

# Run Flask app
python app.py
```

Expected output:

```
[INFO⚠️ ] Running in MOCK MODE for testing
[INFO] Starting Flask server on http://0.0.0.0:5002
 * Running on http://127.0.0.1:5002
```

#### Terminal 2: Express Backend (Port 5001)

```bash
cd StrayCare-System\server

# Install dependencies (if needed)
npm install

# Run server
node server.js
```

Expected output:

```
Server started on port 5001
```

#### Terminal 3: React Frontend (Port 5173)

```bash
cd StrayCare-System\client

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

Expected output:

```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🌐 Accessing the Application

Once all services are running:

| Service     | URL                   | Port |
| ----------- | --------------------- | ---- |
| Frontend    | http://localhost:5173 | 5173 |
| Backend API | http://localhost:5001 | 5001 |
| ML Service  | http://localhost:5002 | 5002 |

**Open in browser:** http://localhost:5173

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register      - User registration
POST   /api/auth/login         - User login
POST   /api/auth/login-google  - Google OAuth login
POST   /api/auth/forgot-password - Reset password
```

### User Profile

```
GET    /api/users/profile      - Get user profile
PUT    /api/users/profile      - Update user profile
GET    /api/users/rewards      - Get reward points
```

### Stray Reports

```
POST   /api/reports            - Create stray report
GET    /api/reports            - Get all reports
GET    /api/reports/:id        - Get specific report
PUT    /api/reports/:id        - Update report
DELETE /api/reports/:id        - Delete report
```

### Adoption

```
GET    /api/adoption           - Get adoption listings
POST   /api/adoption           - Create adoption listing
PUT    /api/adoption/:id       - Update listing
DELETE /api/adoption/:id       - Delete listing
```

### Disease Detection

```
GET    /api/disease-detection/status    - Check service status
POST   /api/disease-detection/analyze   - Analyze dog image
```

### Information Hub

```
GET    /api/hub                - Get care articles
```

---

## ✨ Features

### 1. **Authentication**

- ✅ User registration & login
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Password reset functionality

### 2. **Stray Dog Reporting**

- ✅ Report stray dogs with location (Google Maps)
- ✅ Upload dog photos
- ✅ Track report status
- ✅ View reports on interactive map

### 3. **Disease Detection**

- ✅ Upload dog image for skin disease analysis
- ✅ ML-powered classification (6 diseases)
- ✅ Confidence scores
- ✅ Safety warnings for contagious diseases
- ✅ Earn reward points for detection

### 4. **Adoption Platform**

- ✅ Browse adoptable dogs
- ✅ Create adoption listings
- ✅ Contact organizations
- ✅ Track adoption requests

### 5. **User Rewards**

- ✅ Earn points for reports
- ✅ Earn points for disease detection
- ✅ View reward breakdown
- ✅ Gamification elements

### 6. **Information Hub**

- ✅ Pet care articles
- ✅ Disease information
- ✅ Training tips
- ✅ Adoption guides

---

## 🔧 Port Configuration

| Service              | Port  | URL                   |
| -------------------- | ----- | --------------------- |
| **Flask ML Service** | 5002  | http://localhost:5002 |
| **Express Backend**  | 5001  | http://localhost:5001 |
| **React Frontend**   | 5173  | http://localhost:5173 |
| **MongoDB**          | 27017 | localhost:27017       |

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution:**

- Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`
- Test connection: `mongodb://localhost:27017/straycare`

### Issue: "Port already in use"

**Solution:**

```bash
# Kill process on port (Windows)
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Or change port in .env
PORT=5002
```

### Issue: "Flask service offline"

**Solution:**

- Ensure Python virtual environment is activated
- Check if port 5002 is available
- Try: `python ml_service/app.py`

### Issue: "VITE proxy not working"

**Solution:**

- Restart Vite dev server: `npm run dev`
- Check `vite.config.js` has correct backend URL (http://localhost:5001)

### Issue: "JWT token expired"

**Solution:**

- Clear browser localStorage
- Login again
- Token expires after 24 hours

### Issue: "Cannot upload files"

**Solution:**

- Check `server/uploads/` directory exists
- Ensure write permissions on folder
- Verify file size < 10MB

---

## 📚 Development Commands

### Frontend

```bash
cd client
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check for lint issues
```

### Backend

```bash
cd server
npm install          # Install dependencies
node server.js       # Start server
npm start            # Alternative start command
```

### ML Service

```bash
cd ml_service
python -m venv venv                    # Create venv
venv\Scripts\activate                  # Activate (Windows)
source venv/bin/activate               # Activate (macOS/Linux)
pip install -r requirements.txt        # Install dependencies
python app.py                          # Run Flask app
```

---

## 🔐 Default Test Credentials

```
Email: test@example.com
Password: password123
```

_Note: Create your own account for development_

---

## 📝 Important Notes

### ML Model

- Current: **MOCK MODE** (returns sample predictions)
- Real Model Setup: Requires TensorFlow on Python 3.11
- Model File: `ml_service/model/dog_skin_model.h5`

### Database

- Default: Local MongoDB on `localhost:27017`
- Production: Use MongoDB Atlas

### Security

- Change `JWT_SECRET` in `.env`
- Use strong passwords
- Enable HTTPS in production

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

---

## 📄 License

This project is protected and proprietary.

---

## ✅ Quick Start Checklist

- [ ] Install Node.js, Python, MongoDB
- [ ] Clone repository
- [ ] `cd client && npm install`
- [ ] `cd ../server && npm install`
- [ ] `cd ../ml_service && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt`
- [ ] Create `.env` in server directory
- [ ] Open 3 terminals and run services
- [ ] Access http://localhost:5173

---

## 📞 Support

For issues or questions, check the troubleshooting section or contact the development team.

---

**Last Updated:** April 3, 2026  
**Version:** 1.0.0
