# Sports Ground Construction Quotation System

A comprehensive MERN stack application for generating professional quotations for sports ground construction projects. Built for NEXORA GROUP.

## Features

- 🏀 Multi-sport support (Basketball, Football, Tennis, Badminton, Volleyball, Cricket, Pickleball, Swimming, Table Tennis)
- 🏠 Indoor & Outdoor facility types
- 📊 Dynamic pricing based on court size and materials
- 📄 Professional PDF quotation generation
- 🎯 Multi-step form with progress tracking
- 💰 Automatic cost calculation
- 📱 Responsive design

## Supported Sports

### Outdoor Facilities
- Basketball Court
- Football Field
- Volleyball Court
- Badminton Court
- Pickleball Court
- Tennis Court
- Cricket Ground

### Indoor Facilities
- Table Tennis
- Swimming Pool
- Basketball Court (Indoor)
- Badminton Court (Indoor)

## Technology Stack

### Frontend
- React.js
- CSS3
- jsPDF for PDF generation
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017/sports-ground-quotation
# PORT=5000
npm run dev