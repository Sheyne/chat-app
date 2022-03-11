import "./App.css";
import React, { useState } from "react";
import Chat from "./Chat";
import Login from "./Login";

function App() {
  const [currentUser, setCurrentUser] = useState(null as string | null);
  if (currentUser) {
    return (
      <Chat username={currentUser} onLogout={() => setCurrentUser(null)} />
    );
  } else {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }
}
export default App;
