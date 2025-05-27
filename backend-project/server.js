const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'epms'
});

db.connect((err) => {
    if (err) {
        console.log('Failed to connect to DB', err);
    } else {
        console.log('Connected to DB');
    }
});


// Register User
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    const checkSql = 'SELECT * FROM users WHERE username = ?';

    db.query(checkSql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertSql, [username, hashedPassword], (err) => {
                if (err) return res.status(500).json({ error: 'Signup failed' });
                return res.status(201).json({ message: 'Signup successful!' });
            });
        } catch (err) {
            return res.status(500).json({ error: 'Hashing error' });
        }
    });
});

// Login User
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';

    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.userId, username: user.username },
            'ttgf8gewvyf',
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    });
});

//register employee
app.post('/api/employees', (req, res) => {
  const { Fname, Lname, position, address, phone, gender, hireDate } = req.body;

  // Check for duplicates (based on full name and phone)
  const checkQuery = 'SELECT * FROM employee WHERE Fname = ? AND Lname = ? AND phone = ?';
  db.query(checkQuery, [Fname, Lname, phone], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length > 0) {
      return res.status(400).json({ message: 'Employee already registered' });
    }

    // Insert if not found
    const insertQuery = `
      INSERT INTO employee (Fname, Lname, position, address, phone, gender, hireDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertQuery, [Fname, Lname, position, address, phone, gender, hireDate], err => {
      if (err) return res.status(500).json({ message: 'Failed to register employee' });
      res.status(200).json({ message: 'Employee registered successfully' });
    });
  });
});

//department

// Get all departments
app.get('/api/departments', (req, res) => {
  db.query('SELECT * FROM department', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all employees
app.get('/api/employees', (req, res) => {
  db.query('SELECT empId, Fname, Lname FROM employee', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//add to department
app.post('/api/assign-department', (req, res) => {
  const { empId, depName, depCode, grossSalary } = req.body;
  const sql = `
    INSERT INTO department (depCode, depName, glossSalary, empId)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [ depCode,depName, grossSalary, empId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Department assigned to employee successfully' });
  });
});
//dep details

app.get('/api/department-details', (req, res) => {
  const sql = `
    SELECT 
      d.depId,
      d.depName,
      d.glossSalary,
      e.empId,
      e.Fname,
      e.Lname
    FROM department d
    LEFT JOIN employee e ON d.empId = e.empId
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching department details:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const formatted = results.map(row => ({
      depId: row.depId,
      depName: row.depName,
      grossSalary: row.glossSalary,
      empId: row.empId,
      empName: row.Fname && row.Lname ? `${row.Fname} ${row.Lname}` : 'Unassigned'
    }));

    res.json(formatted);
  });
});



// Add salary
app.post('/api/salaries', (req, res) => {
  const { totalDeduction, netSalary, month, depId, empId } = req.body;
  if (!totalDeduction || !netSalary || !month || !depId || !empId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const insertQuery = 'INSERT INTO salary (totalDeduction, netSalary, month, depId, empId) VALUES (?, ?, ?, ?, ?)';
  db.query(insertQuery, [totalDeduction, netSalary, month, depId, empId], (err) => {
    if (err) return res.status(500).json({ message: 'Error saving salary data' });
    res.json({ message: 'Salary saved successfully' });
  });
});

// Get all salaries with department and employee details
app.get('/api/salary', (req, res) => {
  const sql = `
    SELECT s.salId, s.depId, d.depName, s.empId, e.Fname, e.Lname,
           s.totalDeduction, s.netSalary, s.month
    FROM salary s
    JOIN department d ON s.depId = d.depId
    JOIN employee e ON s.empId = e.empId
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Update a salary
app.put('/api/salary/:id', (req, res) => {
  const { totalDeduction, netSalary, month } = req.body;
  const sql = `UPDATE salary SET totalDeduction=?, netSalary=?, month=? WHERE salId=?`;
  db.query(sql, [totalDeduction, netSalary, month, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Salary updated successfully' });
  });
});

// Delete a salary
app.delete('/api/salary/:id', (req, res) => {
  db.query('DELETE FROM salary WHERE salId = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Salary deleted successfully' });
  });
});

// GET /api/payroll-report?month=YYYY-MM
app.get('/api/payroll-report', (req, res) => {
  const { month } = req.query;
  const sql = `
    SELECT e.Fname, e.Lname, e.position, d.depName, s.netSalary
    FROM salary s
    JOIN employee e ON s.empId = e.empId
    JOIN department d ON s.depId = d.depId
    WHERE s.month = ?
  `;
  db.query(sql, [month], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});



app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
