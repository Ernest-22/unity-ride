This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





# UnityRide 🚗⛪

> A full-stack carpooling platform designed for church communities to facilitate easier transportation to services and events.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📖 About
UnityRide solves the transportation gap in church communities. It allows members with cars (**Drivers**) to offer seats for specific church events, and members without transport (**Riders**) to book them securely. The system manages real-time seat availability, role-based access, and booking approvals.

**Built by:** Singo Ndivhadzo Ernest  
**Role:** Full-Stack Software Developer

## 🚀 Key Features
- **Role-Based Onboarding:** Distinct workflows for Drivers (car details required) vs. Riders.
- **Event-Centric Routing:** Rides are grouped by specific service dates/times (fetched from Admin CMS).
- **Concurrency Handling:** Firestore Transactions ensure no two riders can book the last seat simultaneously.
- **Driver Dashboard:** Drivers can approve or reject incoming booking requests.
- **Real-Time Status:** Riders get instant updates on their booking status (Pending/Approved).

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Backend (Serverless)
- **Authentication:** Firebase Auth (Email/Password)
- **Database:** Cloud Firestore (NoSQL)
- **Security:** Firestore Security Rules

## 📸 Application Flow
1. **User Onboarding:** Select Role -> If Driver, input Car Model/Plate.
2. **Dashboard:** View upcoming services (e.g., Sunday Service).
3. **Marketplace:** View available rides for that service.
4. **Booking:** Rider requests a seat -> Driver approves -> Seat count decrements.

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase Project

### Installation
1. Clone the repository
   ```bash
   git clone [https://github.com/your-username/unity-ride.git](https://github.com/your-username/unity-ride.git)