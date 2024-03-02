import React, { useState } from "react";
import { loginObj } from "../../server/src/types";

export const Login = (login: loginObj) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    login.login({ username, password });
  };
  return (
    <form
      className="bg-slate-900 px-6 py-2 rounded-lg shadow-lg"
      onSubmit={submit}
    >
      <label className="block text-xl mb-2">Username:</label>
      <input
        className="bg-transparent  appearance-none border rounded w-full py-2 px-3"
        type="text"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <label className="block text-xl mb-2">Password:</label>
      <input
        className="bg-transparent  appearance-none border rounded w-full py-2 px-3"
        type="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button
        className="enabled:hover:bg-slate-600 disabled:text-slate-600 text-2xl font-bold px-4 rounded"
        disabled={!username || !password}
      >
        Login
      </button>
    </form>
  );
};
