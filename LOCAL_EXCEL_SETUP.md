# Transport Management System - Local Excel Mode

## ✅ Successfully Converted to Use Local Excel Files!

Your application has been fully converted to work **WITHOUT Supabase** - it now uses your local Excel files (`database.xlsx` and `Bus_Routes.xlsx`) as the database.

---

## 🚀 How to Run the Application

### 1. **The server is already running!**
The development server has been started in the background. Open your browser and go to:

```
http://localhost:5173
```

If port 5173 is busy, check the terminal output for the actual port (e.g., http://localhost:5174).

---

## 🔑 Login Credentials (from your Excel files)

### **Students**
- **ID:** `1JB` | **Password:** `new123`
- **ID:** `a` | **Password:** `123456`
- **ID:** `jayesh` | **Password:** `123456`
- **ID:** `qwerty` | **Password:** `123456`

### **Drivers**
- **ID:** `umesh` | **Password:** `1234` (Route 1, Bus: BUS-001)
- **ID:** `pradeep` | **Password:** `1234` (Route 2, Bus: KA-01-AB-1234)
- **ID:** `paramesh` | **Password:** `1234` (Route 3, Bus: KA-01-AB-5678)
- **ID:** `chandru` | **Password:** `1234` (Route 4, Bus: KA-01-AB-9012)
- **ID:** `driverr` | **Password:** `1234` (No route assigned)

### **Admin**
- **ID:** `adminn` | **Password:** `1234`

---

## 📋 What Was Changed

### **1. Created Local Data Service** (`src/lib/localData.ts`)
   - Reads `database.xlsx` and `Bus_Routes.xlsx` from the `/public` folder
   - Loads data when the app starts
   - Provides all authentication and data access methods
   - Stores notifications in memory (during current session)

### **2. Updated All Components**
   - ✅ `AuthContext.tsx` - Uses local Excel authentication
   - ✅ `UserDashboard.tsx` - Reads routes and notifications from local data
   - ✅ `DriverDashboard.tsx` - Sends notifications to local storage
   - ✅ `AdminDashboard.tsx` - Manages system using local data
   - ✅ `ChangePassword.tsx` - Updates passwords in local data service
   - ✅ `Login.tsx` - Updated with correct credentials

### **3. Excel Files Copied to Public Folder**
   - `public/database.xlsx` - Contains users, drivers, and admins
   - `public/Bus_Routes.xlsx` - Contains all 4 routes with stops, timings, and fares

---

## 🎯 Features That Work

### ✅ **Fully Working:**
- Login for Students, Drivers, and Admin
- View all bus routes and stops
- Change user passwords
- Select and view route details
- Send notifications (stored in memory)
- Driver management dashboard
- Route overview
- System statistics

### ⚠️ **Limited Functionality (Due to Local Mode):**
- **No Real-time Updates**: Since we're using local Excel files, real-time features like Supabase subscriptions don't work
- **No GPS Tracking**: Live location sharing requires a backend database
- **Notifications**: Stored in browser memory only (lost on page refresh)
- **Data Changes**: Password changes and route selections are in memory only (not saved to Excel file)

---

## 🔄 To Restart the Server

If you need to restart the development server:

```bash
npm run dev
```

---

## 📊 Data Loaded from Excel

**From `database.xlsx`:**
- 4 Students
- 5 Drivers (4 assigned to routes, 1 unassigned)
- 1 Admin

**From `Bus_Routes.xlsx`:**
- **Route 1:** 17 stops (Malleshwaram to SJBIT)
- **Route 2:** 14 stops (Kadhabagere to SJBIT)
- **Route 3:** 13 stops (Rama Krishna Ashrama to BEML)
- **Route 4:** 12 stops (BTM Layout to SJBIT)
- **Total:** 56 bus stops across 4 routes

---

## 🛠️ Future Enhancements (If Needed)

To add data persistence without Supabase:

1. **Option 1: LocalStorage** - Save data to browser's localStorage
2. **Option 2: JSON Files** - Export Excel to JSON and read/write to it
3. **Option 3: Simple Backend** - Create a simple Node.js backend with file storage
4. **Option 4: Supabase** - Use the original Supabase setup for full real-time features

---

## 📝 Notes

- All data is read from Excel files when the page loads
- Changes made in the app (passwords, route selections, notifications) are stored in **browser memory only**
- To persist changes, you would need to implement one of the options above
- The Excel files in `/public` folder are NOT modified by the application

---

## 🎉 You're All Set!

The application is now running using your local Excel files as the database. Open your browser to:

**http://localhost:5173**

Try logging in with any of the credentials listed above!

