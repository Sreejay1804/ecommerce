import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SignIn({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(username, password)) {
      onSuccess();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-panel">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-input"
          placeholder="User ID"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn btn-blue" type="submit">Sign In</button>
        {error && <div className="error-message">{error}</div>}
      </form>
      <div>
        New user?{" "}
        <button className="btn-link" onClick={onSwitchToRegister}>
          Register here
        </button>
      </div>
    </div>
  );
}