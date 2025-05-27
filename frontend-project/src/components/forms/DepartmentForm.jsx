import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DepartmentForm = () => {
  // Hardcoded department data as per your mapping
  const departmentsData = {
    Carwash: { depCode: 'CW', grossSalary: 300000 },
    Stock: { depCode: 'ST', grossSalary: 200000 },
    Mechanic: { depCode: 'MC', grossSalary: 450000 },
    'Administration staff': { depCode: 'ADMS', grossSalary: 600000 }
  };

  // We need a list of just department names for the dropdown
  const departmentNames = Object.keys(departmentsData);

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    depName: '',
    depCode: '',
    grossSalary: '',
    empId: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch employees from backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/employees')
      .then(res => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

  // When department changes, update code and salary automatically
  const handleDepartmentChange = (e) => {
    const depName = e.target.value;
    const depInfo = departmentsData[depName] || { depCode: '', grossSalary: '' };
    setFormData({
      ...formData,
      depName,
      depCode: depInfo.depCode,
      grossSalary: depInfo.grossSalary
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send only empId and depName/depCode/grossSalary to backend for assignment
      const { empId, depName, depCode, grossSalary } = formData;
      const res = await axios.post('http://localhost:5000/api/assign-department', {
        empId,
        depName,
        depCode,
        grossSalary
      });
      setMessage(res.data.message || 'Department assigned successfully');
      setError('');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign department');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md space-y-4 w-96">
      {message && <div className="text-green-600 font-semibold">{message}</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}

      <div>
        <label>Employee</label>
        <select
          name="empId"
          value={formData.empId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select employee</option>
          {employees.map(emp => (
            <option key={emp.empId} value={emp.empId}>
              {emp.Fname} {emp.Lname}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Department</label>
        <select
          name="depName"
          value={formData.depName}
          onChange={handleDepartmentChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select department</option>
          {departmentNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Department Code</label>
        <input
          type="text"
          name="depCode"
          value={formData.depCode}
          readOnly
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label>Gross Salary</label>
        <input
          type="text"
          name="grossSalary"
          value={formData.grossSalary}
          readOnly
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-pink-700 text-white px-4 py-2 rounded"
      >
        Assign Department
      </button>
    </form>
  );
};

export default DepartmentForm;
