import "../css/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("auth/login", { email, password },{ withCredentials: true });
      if (res.data.success) {
        toast.success("Logged-in Successfully");
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
      else{
          toast.error(res.data.message)
      }
    } catch (error) {
      toast.error(`Error: ${error} , Message: Login Failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Log in to ExpenseFlow</h2>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group-custom">
            <label className="input-label" htmlFor="email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-control-custom"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group-custom">
            <label className="input-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control-custom"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div 
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary-custom" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="bottom-text mt-4">
          Don't have an account?{" "}
          <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }} className="link-primary">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
