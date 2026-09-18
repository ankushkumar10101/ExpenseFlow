import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TransactionModal from "./pages/TransactionModal";
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
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/dashboard/add-transaction" element={<TransactionModal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
