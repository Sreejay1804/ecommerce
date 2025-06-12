import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Register({ onSuccess, onSwitchToSignIn }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await register(username, password)) {
      onSuccess();
    } else {
      setError("User ID already exists");
    }
  };

  return (
    <div className="auth-panel">
      <h2>Register</h2>
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
        <button className="btn btn-green" type="submit">Register</button>
        {error && <div className="error-message">{error}</div>}
      </form>
      <div>
        Already registered?{" "}
        <button className="btn-link" onClick={onSwitchToSignIn}>
          Sign in
        </button>
      </div>
    </div>
  );
}