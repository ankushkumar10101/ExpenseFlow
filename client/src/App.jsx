import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Expense from "./pages/Expense";
import Transactions from "./pages/Transactions";

import Reports from "./pages/Reports";
import AIChat from "./pages/AIChat";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login></Login>}></Route>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard></Dashboard>}></Route>
          <Route path="/transactions" element={<Transactions></Transactions>}></Route>
          <Route path="/reports" element={<Reports></Reports>}></Route>
          <Route path="/ai-chat" element={<AIChat></AIChat>}></Route>
          <Route path="/features" element={<Features></Features>}></Route>
          <Route
            path="/dashboard/add-expense"
            element={<Expense></Expense>}
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
