# 🚨 FraudGuard – Intelligent Financial Fraud Detection System

FraudGuard is an end-to-end fraud detection system designed to secure financial transactions. It enables **users** to submit and track transactions while offering **administrators** a powerful dashboard to monitor users, analyze patterns, and detect fraudulent behavior using machine learning.

---
## 🧰 Tech Stack

### 🌐 Frontend
- **React** + **Vite** + **Tailwind CSS**  for fast development

### 🔧 Backend
- **Node.js** and **Express.js** for API server
- **MongoDB** for data persistence
- **JWT Authentication** for secure sessions
- **Flask** (Python) for ML model integration

### 🤖 Machine Learning
- 🎯 **Random Forest**
- ⚡ **XGBoost**
  
> These models are trained offline using labeled transaction data and saved for prediction during runtime.

## 🚀 Getting Started

### 1. Clone the repository
```bash
https://github.com/Prince5598/FraudGuard.git
cd fraudguard
```

### 2. ⚙️ Install Dependencies
#### 📦 Backend Setup

```bash
cd backend
npm install
```
#### 💻 Frontend Setup
```bash
cd frontend
npm install
```
#### 🧠 ML Setup Instructions

> ⚠️ You must **train the model** before using the prediction service.

---

##### 📥 Step 1: Add the Dataset

- Download the dataset using the link below.
- Place the downloaded file (e.g., `fraudTrain.csv`) inside the `ML/` directory.

**🔗 Dataset Download Link:**  
`[https://drive.google.com/fraud-dataset](https://drive.google.com/file/d/17FVZaK8wDXs5xU7zSD-0j_qYKx8e-eyP/view?usp=sharing)`

---

##### ▶️ Step 2: Train the Model

- Open your terminal and navigate to the ML directory.
- Run the following command to train and save the machine learning model:

```bash
cd ML
pip install flask flask-cors requests pandas numpy scikit-learn imbalanced-learn xgboost joblib shap
python model.py
```

### 3. 🔐 Configure Environment Variables
- 📁 backend/.env
```bash
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the application
- start flask server
```bash
cd ML
python app.py
```
- start backend
```bash
cd backend
node index.js
```
- start frontend
```bash
cd frontend
npm run dev
```
#### ✅ Setup complete! You're ready to explore FraudGuard and secure your transactions.
---
## 🧠 Features Overview

### 🔐 Authentication
- Separate login/signup flows for Users and Admins
- JWT-based token handling
- Role-based access control

### 👤 User Dashboard Features

- #### ✅ Transaction Submission Form
- Fields: amount, type, location, etc.
- > Integrated with ML API for real-time fraud prediction

- #### 📊 Transaction History
- View all submitted transactions

- #### 📁 Download as CSV
- Export full transaction history as .csv

### 🛠️ Admin Dashboard Features

- #### 👥 User Management
  - View list of all registered users
  - Search/filter by name or email
  - Automatically flag/block users with more than 10 fraudulent transactions
- #### 🔍 Transaction Monitoring
  - View all transactions with fraud report 
  - Advanced filters:
- ### 📈 Analytics
  - Total users and total transactions
  - Fraud detection statistics and rates
  - Average transaction amount
  - City-wise and type-wise breakdown
  - Real-time charts and graphs
