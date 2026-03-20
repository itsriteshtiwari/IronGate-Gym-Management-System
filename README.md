# 🏋️‍♂️ IronGate Gym Management System

A modern, full-stack gym management application designed with a unique, consumer-friendly membership model: **Visit-Based Tracking**. Instead of a membership expiring on a strict calendar date, days are only deducted from a user's account when they actually check into the gym.

This system features role-based access for both Gym Administrators and Gym Members, complete with real-time attendance tracking and a hardware-ready fingerprint scanner simulation.

## ✨ Key Features

### 🛡️ Admin Dashboard
* **Live Attendance Tracking:** See exactly who is in the gym right now and view daily activity logs.
* **Member Management:** Add new members, assign packages, generate 4-digit PINs, and simulate fingerprint registration.
* **Dynamic Packages:** Create, edit, and soft-delete membership packages (e.g., Premium, Standard, Basic). *Core packages are protected from deletion to maintain database integrity.*
* **Status Monitoring:** Automatically track which members are Active, Expiring (<= 5 days left), or Expired.

### 📱 Member Dashboard
* **Usage Analytics:** Visual progress bar showing total days, days attended, and days remaining.
* **Digital Check-In/Out:** Simulated biometric check-in system that automatically logs time and deducts a day from the membership on the first scan of the day.
* **Attendance History:** Filtered historical view of all gym sessions.
* **Self-Service Renewal:** Members can select a package, choose a duration (1 to 12 months), and renew expired memberships directly from their portal.

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), React Router DOM, Custom CSS (CSS Variables, Responsive Design)
* **Backend:** Python, Flask, Flask-CORS
* **Database:** MySQL (`mysql-connector-python`)

## 🚀 Installation & Setup

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/)
* [Python 3.x](https://www.python.org/)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

### 1. Database Setup
1. Open your MySQL terminal or GUI (like MySQL Workbench).
2. Execute the provided `schema.sql` file to create the `irongate_gym` database and tables.
3. Ensure the `is_active` column is added to the packages table for soft-delete functionality.

### 2. Backend Setup (Python/Flask)
1. Open a terminal and navigate to the `backend` directory.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
