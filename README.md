# ExpenseFlow: Smart Expense Tracker with AI Financial Assistance

A full-stack MERN (MongoDB, Express, React, Node.js) application for tracking personal finances.

## Features

-   **Dashboard**: Visual overview of your spending with charts and statistics.
-   **Transaction Tracking**: Add, edit, and delete income and expense transactions.
-   **Reports**: Detailed financial analysis with filtered views, interactive charts (Bar, Pie, Line), and downloadable PDF reports.
-   **AI Financial Assistant**: Integrated AI chat (using Groq SDK) to answer questions about your finances and provide budget advice.
    -   *Message Limit*: Free tier includes 10 AI messages per user.
-   **User Authentication**: Secure signup and login with persistent sessions (2 days).
-   **Responsive Design**: Mobile-friendly interface with sidebar navigation.

## Tech Stack

-   **Client**: React, Vite, Bootstrap, Chart.js
-   **Server**: Node.js, Express, Mongoose (MongoDB)
-   **AI**: Groq SDK (Llama 3 70b)

## Installation & Setup

### Prerequisites

-   Node.js installed
-   MongoDB instance (local or Atlas)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd exp-tracker
```

### 2. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

Start the server:

```bash
npm run dev
```

### 3. Client Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Start the client development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## Usage

1.  Sign up for a new account.
2.  Log in to access the dashboard.
3.  Add your income and expenses.
4.  Use the "AI Chat" tab to ask questions like "How much did I spend this month?" or "Create a budget for me."
