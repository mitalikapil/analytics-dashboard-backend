// backend/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // Your MySQL username
  password: 'yourpassword', // Your MySQL password
  database: 'your_database_name'
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Example API endpoint to fetch data
app.get('/api/data', (req, res) => {
  const sql = 'SELECT * FROM your_table';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(results);
  });
});

// Example API endpoint to add data
app.post('/api/data', (req, res) => {
  const { name, value } = req.body;
  const sql = 'INSERT INTO your_table (name, value) VALUES (?, ?)';
  db.query(sql, [name, value], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ id: result.insertId });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// frontend/src/components/DataComponent.jsx
import React, { useState, useEffect } from 'react';

function DataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newItem, setNewItem] = useState({ name: '', value: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data');
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      await fetchData(); // Refresh data
      setNewItem({ name: '', value: '' }); // Reset form
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Data from MySQL</h2>
      
      {/* Add new item form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          placeholder="Name"
          className="mr-2 p-2 border"
        />
        <input
          type="text"
          value={newItem.value}
          onChange={(e) => setNewItem({...newItem, value: e.target.value})}
          placeholder="Value"
          className="mr-2 p-2 border"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Add Item
        </button>
      </form>

      {/* Display data */}
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.id} className="p-2 border rounded">
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DataComponent;