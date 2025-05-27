import React, { useState } from 'react';
import axios from 'axios';

const EmployeeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    Fname: '',
    Lname: '',
    position: '',
    address: '',
    phone: '',
    gender: '',
    hireDate: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/employees', formData);
      setMessage(res.data.message || 'Employee registered successfully');
      setError('');
      onSuccess?.();
      setTimeout(() => {
        window.location.reload(); // Refresh page after a short delay
      }, 1000);
    } catch (err) {
      console.error('Error registering employee:', err);
      setError(err.response?.data?.message || 'Failed to register employee');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded w-96 shadow-md space-y-4">
      {message && <div className="text-green-600 font-semibold">{message}</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}

      {['Fname', 'Lname', 'position', 'address', 'phone', 'hireDate'].map(field => (
        <div key={field}>
          <label className="block capitalize">{field}</label>
          <input
            name={field}
            type={field === 'hireDate' ? 'date' : 'text'}
            value={formData[field]}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      ))}

      <div>
        <label className="block">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">-- Select Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <button type="submit" className="bg-pink-700 text-white px-4 py-2 rounded">
        Register Employee
      </button>
    </form>
  );
};

export default EmployeeForm;
