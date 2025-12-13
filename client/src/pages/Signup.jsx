import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import api from "../api/axios";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("auth/signup", { username,email, password });
      if (res) {
        toast.success("Registered Successfully");
        console.log(res)
        navigate("/");
      }
      else {
        toast.error('Incomplete Credentials')
      }
    } catch (error) {
      toast.error(`Error: ${error} , Message: Registration Failed`);
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h3>Create an account at ExpenseFlow</h3>
          <p>Join us to start tracking your expenses</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group-custom">
            <label className="input-label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="username"
                className="form-control-custom"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

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


          <button type="submit" className="btn-primary-custom">
            Sign up
          </button>
        </form>

        <p className="bottom-text">
          Already have an account?{" "}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="link-primary">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
