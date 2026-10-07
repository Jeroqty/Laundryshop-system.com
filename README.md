# 🧺 CleanPro Laundry & Dry Cleaning Suite
### Enterprise Business Management & Operations System (v2.5)

A modern, responsive, and complete operations platform designed for professional commercial laundry, dry cleaning, and garment-care businesses.

---

## ⚡ Quick Start (No Server or Database Required!)

1. **Locate the Project Folder**:
   - Navigate to `c:\Users\aquin\OneDrive\Desktop\LARS\laundry-system\`
2. **Launch the System**:
   - Double-click **`index.html`** or open it in any modern browser (Chrome, Edge, Firefox, Safari).
3. **Sign In**:
   - Enter your registered email and password to access your role's portal (Customer, Staff, or Shop Owner).

---

## 🌟 What Was Improved & Modernized

### 1. Executive Visual & Brand Identity
- **Refined Color Architecture**: Replaced generic loud gradients with a deep corporate slate & ocean blue palette (`#0f172a`, `#1e40af`, `#0284c7`, `#059669`).
- **Typography & Icons**: Integrated Google Fonts **Plus Jakarta Sans** and crisp **FontAwesome 6** vector icons, replacing inconsistent raw emojis.
- **Glassmorphic Hero Split Login**: The authentication screen is a dedicated full-screen experience with feature highlights and commercial security badges.

### 2. Operational Enhancements for Commercial Use
- **Real-Time Notification Popover**: Clicking the top 🔔 notification bell reveals an interactive floating notification center with unread badges, timestamps, and "Mark all read" capabilities.
- **Printable Thermal Claim Slips & Invoices**: Generates authentic customer laundry claim tickets with shop details, pricing breakdowns, pickup dates, and clean vector barcode simulation ready for physical receipt printers (`window.print()`).
- **Visual 4-Stage Garment Stepper**: Live tracking for customer orders (`Order Placed` ➔ `In Wash / Drying` ➔ `Ready for Pickup` ➔ `Claimed`).
- **Intelligent Time Slot Matrix**: Day-of-week slots with capacity tracking, prevent counter bottlenecks during rush hours.
- **Financial & Operational Analytics**: Generate rolling daily, weekly, or monthly reports displaying total revenue, completed batches, and average order value.

---

## 📂 File Structure

```
laundry-system/
├── index.html        # Clean semantic HTML5 application shell & modals
├── style.css         # Modern enterprise CSS design tokens & print styles
├── app.js            # Pure vanilla JS state engine & LocalStorage persistence
└── README.md         # Documentation & Quick Start guide
```

---

## 🔐 User Roles & Permissions

| Role | Access Scope |
| :--- | :--- |
| **Owner** | Full business oversight: shop branding, pricing rate cards, weekly time slots, user directory, broadcast announcements, and financial reports. |
| **Staff** | Intake queue, customer check-ins, batch status advancement (Washing ➔ Ready ➔ Picked Up), and claim slip printing. |
| **Customer** | Online appointment bookings, real-time batch progression tracker, appointment cancellation, and printable claim tickets. |

---

*Production Ready • Free Commercial Use • Offline Capable*
