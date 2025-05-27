import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SalaryForm = () => {
  const deductionOptions = [20000, 5000, 40000, 70000];

  const [departments, setDepartments] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [formData, setFormData] = useState({
    depId: '',
    depName: '',
    empId: '',
    grossSalary: '',
    totalDeduction: '',
    netSalary: '',
    month: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/department-details')
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDepartmentChange = (e) => {
    const depId = e.target.value;
    const selected = departments.find(dep => String(dep.depId) === depId);

    setFormData(prev => ({
      ...prev,
      depId: selected.depId,
      depName: selected.depName,
      grossSalary: selected.grossSalary,
      empId: '',
      totalDeduction: '',
      netSalary: ''
    }));

    const matchingEmployees = departments
      .filter(dep => dep.depId === selected.depId && dep.empId !== null)
      .map(dep => ({
        empId: dep.empId,
        empName: dep.empName
      }));

    setFilteredEmployees(matchingEmployees);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newState = { ...formData, [name]: value };

    if (name === 'totalDeduction') {
      const deduction = parseInt(value, 10);
      const gross = parseInt(formData.grossSalary, 10);
      newState.netSalary = isNaN(deduction) ? '' : gross - deduction;
    }

    setFormData(newState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/salaries', {
        depId: formData.depId,
        empId: formData.empId,
        totalDeduction: formData.totalDeduction,
        netSalary: formData.netSalary,
        month: formData.month
      });

      setMessage('Salary recorded successfully!');
      setError('');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to record salary');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md w-96 space-y-4">
      {message && <div className="text-green-600 font-semibold">{message}</div>}
      {error && <div className="text-red-600 font-semibold">{error}</div>}

      <div>
        <label>Department</label>
        <select name="depId" value={formData.depId} onChange={handleDepartmentChange} required className="w-full p-2 border rounded">
          <option value="">Select department</option>
          {[...new Set(departments.map(dep => dep.depId))].map(id => {
            const dep = departments.find(d => d.depId === id);
            return <option key={id} value={id}>{dep.depName}</option>;
          })}
        </select>
      </div>

      <div>
        <label>Employee</label>
        <select name="empId" value={formData.empId} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Select employee</option>
          {filteredEmployees.map(emp => (
            <option key={emp.empId} value={emp.empId}>{emp.empName}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Gross Salary</label>
        <input type="text" name="grossSalary" value={formData.grossSalary} className="w-full p-2 border rounded" readOnly />
      </div>

      <div>
        <label>Total Deduction</label>
        <select name="totalDeduction" value={formData.totalDeduction} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Select deduction</option>
          {deductionOptions.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Net Salary</label>
        <input type="text" name="netSalary" value={formData.netSalary} className="w-full p-2 border rounded" readOnly />
      </div>

      <div>
        <label>Month</label>
        <input type="month" name="month" value={formData.month} onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>

      <button type="submit" className="bg-pink-700 text-white px-4 py-2 rounded">Submit Salary</button>
    </form>
  );
};

export default SalaryForm;
