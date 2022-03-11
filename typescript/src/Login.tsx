import "./Login.css";
import React, { useState } from 'react';


export function Login(props: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");

  return (
    <form className="Login" onSubmit={e => {
      e.preventDefault();
      props.onLogin(username);
    }}>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="submit" />
    </form>
  );
}
export default Login;
