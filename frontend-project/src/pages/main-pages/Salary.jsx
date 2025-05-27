import React, { useEffect, useState } from 'react';
import SalaryForm from '../../components/forms/SalaryForm';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    totalDeduction: '',
    netSalary: '',
    month: '',
    grossSalary: '', // store grossSalary explicitly
  });

  
  const fetchSalaries = () => {
    axios.get('http://localhost:5000/api/salary')
      .then(res => setSalaries(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const handleDelete = (id) => {
    console.log("Delete clicked", id);
    axios.delete(`http://localhost:5000/api/salary/${id}`)
      .then(() => fetchSalaries())
      .catch(err => console.error(err));
  };

  const openEditDialog = (salary) => {
    console.log("Edit clicked", salary.salId);
    setEditing(salary.salId);

    // calculate grossSalary as number and store it
    const grossSalary = parseFloat(salary.netSalary) + parseFloat(salary.totalDeduction);

    setEditForm({
      totalDeduction: salary.totalDeduction,
      netSalary: salary.netSalary,
      month: salary.month,
      grossSalary: grossSalary,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm(prev => {
      if (name === 'totalDeduction') {
        // recalc netSalary from grossSalary - new deduction
        const totalDeductionNum = parseFloat(value) || 0;
        const grossSalaryNum = parseFloat(prev.grossSalary) || 0;
        const newNetSalary = grossSalaryNum - totalDeductionNum;

        return {
          ...prev,
          totalDeduction: value,
          netSalary: newNetSalary.toFixed(2), // keep 2 decimals
        };
      }

      // For other fields (month)
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const submitEdit = () => {
    console.log('Submitting edit for id', editing, editForm);
    const updatedData = {
      totalDeduction: parseFloat(editForm.totalDeduction),
      netSalary: parseFloat(editForm.netSalary),
      month: editForm.month,
    };

    axios.put(`http://localhost:5000/api/salary/${editing}`, updatedData)
      .then(() => {
        setEditing(null);
        fetchSalaries();
      })
      .catch(err => console.error(err));
  };
  const token = localStorage.getItem('token');
      if(!token){
          return <Navigate to = '/' replace/>
      }

  return (
    <div>
      <Navbar />
      <div className='flex justify-center pt-6'>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Salary Management</h1>
          <SalaryForm />

          <h2 className="text-xl font-semibold mt-8 mb-4">Salary Records</h2>
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Employee</th>
                <th className="p-2">Department</th>
                <th className="p-2">Gross</th>
                <th className="p-2">Deduction</th>
                <th className="p-2">Net</th>
                <th className="p-2">Month</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map(s => (
                <tr key={s.salId} className="border-t">
                  <td className="p-2">{s.Fname} {s.Lname}</td>
                  <td className="p-2">{s.depName}</td>
                  <td className="p-2">{(parseFloat(s.netSalary) + parseFloat(s.totalDeduction)).toFixed(2)}</td>
                  <td className="p-2">{s.totalDeduction}</td>
                  <td className="p-2">{s.netSalary}</td>
                  <td className="p-2">{s.month}</td>
                  <td className="p-2">
                    <button
                      className="text-blue-600 mr-2"
                      onClick={() => openEditDialog(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(s.salId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editing && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div key={editing} className="bg-white p-6 rounded shadow-lg w-80">
                <h3 className="text-lg font-semibold mb-4">Edit Salary</h3>

                <label className="block mb-1">Total Deduction</label>
                <input
                  name="totalDeduction"
                  value={editForm.totalDeduction}
                  onChange={handleEditChange}
                  type="number"
                  className="w-full p-2 border rounded mb-4"
                />

                <label className="block mb-1">Month</label>
                <input
                  name="month"
                  value={editForm.month}
                  onChange={handleEditChange}
                  type="month"
                  className="w-full p-2 border rounded mb-4"
                />

                <div className="flex justify-end gap-2">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={submitEdit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Salary;
