import "./Login.css";
import React, { useState } from 'react';


export function Login(props: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");

  return (
    <div className="Login">
    <form onSubmit={e => {
      e.preventDefault();
      props.onLogin(username);
    }}>
      <label>Enter Username: <input type="text" value={username} onChange={e => setUsername(e.target.value)} /></label>
      <input type="submit" value="Login" />
    </form>
    </div>
  );
}
export default Login;
