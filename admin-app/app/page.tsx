"use client";

import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password_hash: '',
    role: 'hostel_admin', // Default role
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Registering...');
    try {
      const res = await fetch('http://localhost:1000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Check your email.');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Error connecting to backend');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: 8, width: '100%' }}
        />
        <input
          name="password_hash"
          type="password"
          placeholder="Password"
          value={form.password_hash}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: 8, width: '100%' }}
        />
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop: 16 }}>{message}</div>
    </div>
  );
}