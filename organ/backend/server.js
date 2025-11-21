const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();


// Middleware
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:4000'], // Angular dev server ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require('express-session');
const { log } = require('console');


app.use(session({
    secret: 'newnwe', // A strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` for HTTPS
}));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'organangular'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Start server
app.listen(8081, () => {
    console.log('Server is running on port 8081');
});

// Admin Routes
app.get('/admin/admin', (req, res) => {
    const sql = 'SELECT * FROM Admins';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.post('/admin/admin/add', (req, res) => {
    const sql = 'INSERT INTO Admins (Name, Email, Password) VALUES (?, ?, ?)';
    const values = [req.body.name, req.body.email, req.body.password];
    console.log("Values: ", values);
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.put('/admin/admin/update/:Id', (req, res) => {
    const sql = 'UPDATE Admins SET `Name` = ?, `Email` = ?, `Password` = ? WHERE Id = ?';
    const values = [req.body.name, req.body.email, req.body.password, req.params.Id];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.delete('/admin/admin/delete/:Id', (req, res) => {
    const sql = 'DELETE FROM Admins WHERE Id = ?';
    db.query(sql, req.params.Id, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// Category Routes
app.get('/admin/category', (req, res) => {
    const sql = 'SELECT * FROM Category';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.get('/api/counts', (req, res) => {
    const queries = {
      admins: 'SELECT COUNT(*) AS count FROM admins',
      clients: 'SELECT COUNT(*) AS count FROM clients',
      products: 'SELECT COUNT(*) AS count FROM products',
      categories: 'SELECT COUNT(*) AS count FROM category',
    };
  
    const results = {};
  
    db.query(queries.admins, (err, adminResult) => {
      if (err) throw err;
      results.admins = adminResult[0].count;
  
      db.query(queries.clients, (err, clientResult) => {
        if (err) throw err;
        results.clients = clientResult[0].count;
  
        db.query(queries.products, (err, productResult) => {
          if (err) throw err;
          results.products = productResult[0].count;
  
          db.query(queries.categories, (err, categoryResult) => {
            if (err) throw err;
            results.categories = categoryResult[0].count;
  
            res.json(results);
          });
        });
      });
    });
  });

  app.get('/admin/client', (req, res) => {
    const sql = 'SELECT * FROM Clients';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
})

app.post('/admin/login', (req, res) => {
  const sql = 'SELECT * FROM Admins WHERE Email = ?';
  
  db.query(sql, [req.body.email], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (result.length > 0) {
      const admin = result[0];
      
      // Compare password (assuming plain text for now - you should use bcrypt)
      if (admin.Password === req.body.password) {
        req.session.admin = admin;
        
        // Don't send password back to client
        const { Password, ...adminWithoutPassword } = admin;
        
        res.json({ 
          success: true, 
          message: 'Login successful', 
          admin: adminWithoutPassword 
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  });
});


app.post('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed', error: err });
    res.clearCookie('connect.sid');
    return res.json({ message: 'Admin logged out successfully' });
  });
});

app.post('/admin/category/add', (req, res) => {
    const sql = 'INSERT INTO Category (Name) VALUES (?)';
    const values = [req.body.name];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.put('/admin/category/update/:Id', (req, res) => {
    const sql = 'UPDATE Category SET `Name` = ? WHERE Id = ?';
    const values = [req.body.name, req.params.Id];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.delete('/admin/category/delete/:Id', (req, res) => {
    const sql = 'DELETE FROM Category WHERE Id = ?';
    db.query(sql, req.params.Id, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// Product Routes
app.get('/admin/product', (req, res) => {
    const sql = 'SELECT * FROM Products WHERE IsDeleted = 1';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// Product Add with file upload
app.post('/admin/product/add', upload.single('image'), (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('File:', req.file);
        
        // Get file name if a file was uploaded
        const imageFileName = req.file ? req.file.filename : null;
        
        const sql = 'INSERT INTO Products (Name, Description, Price, CategoryId, IsDeleted, ImageFileName) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.categoryId,
            1, // IsDeleted = 1 means active/not deleted
            imageFileName
        ];
        
        console.log('SQL values:', values);
        
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Insert result:', result);
            return res.status(201).json({
                message: 'Product added successfully',
                id: result.insertId,
                imageFileName: imageFileName
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.put('/admin/product/update/:Id', upload.single('image'), (req, res) => {
    try {
        // Get current product to check if image needs updating
        db.query('SELECT ImageFileName FROM Products WHERE Id = ?', [req.params.Id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            let imageFileName = results[0]?.ImageFileName;
            
            // If new file is uploaded, update the filename
            if (req.file) {
                // Delete old file if it exists
                if (imageFileName && fs.existsSync(path.join(uploadDir, imageFileName))) {
                    try {
                        fs.unlinkSync(path.join(uploadDir, imageFileName));
                    } catch (unlinkErr) {
                        console.error('Error deleting old file:', unlinkErr);
                    }
                }
                // Set new filename
                imageFileName = req.file.filename;
            }
            
            const sql = 'UPDATE Products SET `Name` = ?, `Description` = ?, `Price` = ?, `CategoryId` = ?, `ImageFileName` = ? WHERE Id = ?';
            const values = [
                req.body.name,
                req.body.description,
                req.body.price,
                req.body.categoryId,
                imageFileName,
                req.params.Id
            ];
            
            db.query(sql, values, (updateErr, result) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                return res.json({
                    message: 'Product updated successfully',
                    imageFileName: imageFileName
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.delete('/admin/product/delete/:Id', (req, res) => {
    const sql = 'UPDATE Products SET IsDeleted = 0 WHERE Id = ?';
    db.query(sql, req.params.Id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({
            message: 'Product deleted successfully'
        });
    });
});

app.get('/admin/order', (req, res) => {
    const sql = `
        SELECT 
            o.Status, o.Id, o.CartId, o.Status, p.Name AS ProductName
        FROM Orders o
        INNER JOIN Cart c ON o.CartId = c.Id
        INNER JOIN Products p ON c.ProductId = p.Id
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.put('/admin/order/:Id', (req, res) => {
    const orderId = req.params.Id;
    const { status } = req.body;
    
    // First, update the order status
    const updateOrderSql = 'UPDATE Orders SET Status = ? WHERE Id = ?';
    
    db.query(updateOrderSql, [status, orderId], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // If status is "Delivered", automatically create a payment entry
        if (status === 'Delivered') {
            // Check if payment already exists for this order
            const checkPaymentSql = 'SELECT * FROM Payment WHERE OrderId = ?';
            
            db.query(checkPaymentSql, [orderId], (err, paymentResult) => {
                if (err) return res.status(500).json(err);
                
                // Only create payment if it doesn't exist
                if (paymentResult.length === 0) {
                    const insertPaymentSql = 'INSERT INTO Payment (OrderId, Status) VALUES (?, ?)';
                    
                    db.query(insertPaymentSql, [orderId, 'Received'], (err, insertResult) => {
                        if (err) return res.status(500).json(err);
                        
                        return res.json({
                            message: 'Order status updated and payment entry created successfully',
                            paymentCreated: true
                        });
                    });
                } else {
                    return res.json({
                        message: 'Order status updated successfully',
                        paymentCreated: false,
                        note: 'Payment already exists for this order'
                    });
                }
            });
        } else {
            // If status is not "Delivered", just return success
            return res.json({
                message: 'Order status updated successfully',
                paymentCreated: false
            });
        }
    });
});

app.post('/admin/payment/add', (req, res) =>{
    const sql = 'INSERT INTO Payment (OrderId, Status) VALUES (?, ?)';
    const values = [req.body.orderId, req.body.status];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({
            message: 'Payment added successfully'
        });
    });
});

app.get('/admin/payment', (req, res) => {
    const sql = `
        SELECT Payment.Id AS PaymentId, Payment.OrderId, Payment.Status AS PaymentStatus,
        Products.Name AS ProductName
        FROM Payment
        JOIN Orders ON Payment.OrderId = Orders.Id
        JOIN Cart ON Orders.CartId = Cart.Id
        JOIN Products ON Cart.ProductId = Products.Id
        WHERE Orders.Status = 'Delivered'
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
});

app.get('/single/:id', (req, res) => {
    const sql = 'SELECT * FROM Products WHERE Id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ error: "Product not found" });
        return res.json(result[0]);
    });
});


app.post('/register', (req, res) => {
    const sql = 'INSERT INTO Clients (Name, Email, Password) VALUES (?, ?, ?)';
    const values = [req.body.name, req.body.email, req.body.password];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});



// Login API
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // SQL query to check if the user exists
    const sql = 'SELECT * FROM Clients WHERE Email = ? AND Password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed', details: err });
        }

        if (result.length > 0) {
            // User found, save session data
            req.session.clientId = result[0].Id;
            req.session.clientName = result[0].Name;

            // Save the session before sending response
            req.session.save((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to save session', details: err });
                }

                // Send response with session information
                return res.json({
                    message: 'Login successful',
                    sessionID: req.sessionID,
                    sessionInfo: {
                        clientId: req.session.clientId,
                        clientName: req.session.clientName
                    }
                });
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});


app.post('/cart', (req, res) => {
    const { quantity, productId } = req.body;
    const clientId = req.session.clientId;
    
    if (!clientId) {
        return res.status(401).json({ error: 'Not authenticated', message: 'Login required to add to cart' });
    }
    
    // Check if product already exists in active cart
    const checkSql = 'SELECT * FROM Cart WHERE ProductId = ? AND ClientId = ? AND IsDeleted = 1';
    db.query(checkSql, [productId, clientId], (err, results) => {
        if (err) return res.status(500).json(err);
        
        if (results.length > 0) {
            // Update quantity of existing cart item
            const updateSql = 'UPDATE Cart SET Quantity = Quantity + ? WHERE ProductId = ? AND ClientId = ? AND IsDeleted = 1';
            db.query(updateSql, [quantity, productId, clientId], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.json({ message: 'Cart updated', result });
            });
        } else {
            // Insert new cart item
            const insertSql = 'INSERT INTO Cart (Quantity, ProductId, ClientId, IsDeleted) VALUES (?, ?, ?, ?)';
            db.query(insertSql, [quantity, productId, clientId, 1], (err, result) => {
                if (err) return res.status(500).json(err);
                return res.json({ message: 'Added to cart', result });
            });
        }
    });
});

app.get('/cart', (req, res) => {
    const sql = `
        SELECT 
            Products.Name AS Name,
            Cart.Quantity,
            Products.ImageFileName AS Image,
            Products.Price AS Price,
            Cart.Id AS Id
        FROM Cart
        INNER JOIN Products ON Cart.ProductId = Products.Id
        WHERE Cart.IsDeleted = 1 AND Cart.ClientId = ?
    `;

    const clientId = req.session.clientId;
    if (!clientId) {
        return res.status(401).json({ error: 'Not authenticated', message: 'Login required to view cart' });
    }

    db.query(sql, [clientId], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
});

app.post('/checkout', (req, res) => {
    const { name, email, phone, address, city, state, zip, total } = req.body;
    // Require a logged-in client; do NOT use sessionID here due to FK to Clients(Id)
    const clientId = req.session.clientId;
    if (!clientId) {
        return res.status(401).json({ error: 'Not authenticated', message: 'Login required to checkout' });
    }

    const sql = `
        INSERT INTO Checkout (Name, Email, Phone, Address, City, State, Zip, Total, ClientId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [name, email, phone, address, city, state, zip, total, clientId];

    db.query(sql, values, (err, checkoutResult) => {
        if (err) return res.status(500).json(err);

        // After checkout, create order rows for all cart items of this client/session
        const selectCartSql = `SELECT Id FROM Cart WHERE IsDeleted = 1 AND ClientId = ?`;
        db.query(selectCartSql, [clientId], (selErr, cartRows) => {
            if (selErr) return res.status(500).json(selErr);

            if (!cartRows || cartRows.length === 0) {
                return res.json({ success: true, message: "Checkout successful (no cart items)", checkoutId: checkoutResult.insertId });
            }

            const orderValues = cartRows.map(r => [r.Id, 'Pending']);
            const insertOrderSql = `INSERT INTO Orders (CartId, Status) VALUES ?`;
            db.query(insertOrderSql, [orderValues], (ordErr, orderResult) => {
                if (ordErr) return res.status(500).json(ordErr);

                return res.json({ success: true, message: "Checkout and order creation successful", checkoutId: checkoutResult.insertId, ordersInserted: orderResult.affectedRows });
            });
        });
    });
});

app.post('/order', (req, res) => {
    const ids = req.body.id; // assuming it's an array of cart IDs
    const status = 'Pending';
    
    const sql = `INSERT INTO Orders (CartId, Status) VALUES ?`;
    const values = ids.map(id => [id, status]);

    db.query(sql, [values], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ success: true, message: "Order placed successfully", result });
    });
});

app.get('/admin/dashboard/counts', (req, res) => {
    // Use lowercase table names to match your database
    const clientsSql = 'SELECT COUNT(*) as count FROM clients';
    const productsSql = 'SELECT COUNT(*) as count FROM products';
    const adminsSql = 'SELECT COUNT(*) as count FROM admins';
    const categoriesSql = 'SELECT COUNT(*) as count FROM category';
    
    // Execute all queries
    db.query(clientsSql, (err, clientsResult) => {
        if (err) return res.status(500).json(err);
        
        db.query(productsSql, (err, productsResult) => {
            if (err) return res.status(500).json(err);
            
            db.query(adminsSql, (err, adminsResult) => {
                if (err) return res.status(500).json(err);
                
                db.query(categoriesSql, (err, categoriesResult) => {
                    if (err) return res.status(500).json(err);
                    
                    return res.json({
                        clients: clientsResult[0].count,
                        products: productsResult[0].count,
                        admins: adminsResult[0].count,
                        categories: categoriesResult[0].count
                    });
                });
            });
        });
    });
});

// ========================
// Donor Routes
// ========================

// Get all donors
app.get('/admin/donor', (req, res) => {
    const sql = 'SELECT * FROM Donors';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(result);
    });
});

// Add new donor
app.post('/admin/donor/add', (req, res) => {
    const sql = 'INSERT INTO Donors (UserName, Email, Password, ContactNumber) VALUES (?, ?, ?, ?)';
    const values = [req.body.username, req.body.email, req.body.password, req.body.contactNumber];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: 'Donor added successfully', donorId: result.insertId });
    });
});

// Update donor
app.put('/admin/donor/update/:Id', (req, res) => {
    const sql = 'UPDATE Donors SET UserName = ?, Email = ?, Password = ?, ContactNumber = ? WHERE Id = ?';
    const values = [req.body.username, req.body.email, req.body.password, req.body.contactNumber, req.params.Id];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: 'Donor updated successfully' });
    });
});

// Delete donor
app.delete('/admin/donor/delete/:Id', (req, res) => {
    const sql = 'DELETE FROM Donors WHERE Id = ?';
    db.query(sql, req.params.Id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: 'Donor deleted successfully' });
    });
});

// Donor login
app.post('/donor/login', (req, res) => {
    const sql = 'SELECT * FROM Donors WHERE Email = ? AND Password = ?';
    const values = [req.body.email, req.body.password];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            return res.json({ success: true, message: 'Donor login successful', donor: result[0] });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

// Get all receivers
app.get('/admin/receiver', (req, res) => {
  const sql = 'SELECT * FROM Receivers';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Add new receiver
app.post('/admin/receiver/add', (req, res) => {
  const sql = 'INSERT INTO Receivers (UserName, Email, Password, ContactNumber) VALUES (?, ?, ?, ?)';
  const values = [req.body.username, req.body.email, req.body.password, req.body.contactNumber];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Receiver added successfully', receiverId: result.insertId });
  });
});

// Update receiver
app.put('/admin/receiver/update/:Id', (req, res) => {
  const sql = 'UPDATE Receivers SET UserName = ?, Email = ?, Password = ?, ContactNumber = ? WHERE Id = ?';
  const values = [req.body.username, req.body.email, req.body.password, req.body.contactNumber, req.params.Id];
  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Receiver updated successfully' });
  });
});

// Delete receiver
app.delete('/admin/receiver/delete/:Id', (req, res) => {
  const sql = 'DELETE FROM Receivers WHERE Id = ?';
  db.query(sql, [req.params.Id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Receiver deleted successfully' });
  });
});

// ========================
// Organ Routes
// ========================

// Get all organs (with donor name)
app.get('/admin/organ', (req, res) => {
  const sql = `
    SELECT o.*, d.UserName AS DonorName 
    FROM Organs o
    LEFT JOIN Donors d ON o.DonorId = d.Id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Add new organ
app.post('/admin/organ/add', (req, res) => {
  const sql = 'INSERT INTO Organs (Name, BloodType, DonorId, Status) VALUES (?, ?, ?, ?)';
  const values = [req.body.name, req.body.bloodType, req.body.donorId, req.body.status];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Organ added successfully', organId: result.insertId });
  });
});

// Update organ
app.put('/admin/organ/update/:Id', (req, res) => {
  const sql = 'UPDATE Organs SET Name = ?, BloodType = ?, DonorId = ?, Status = ? WHERE Id = ?';
  const values = [req.body.name, req.body.bloodType, req.body.donorId, req.body.status, req.params.Id];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Organ updated successfully' });
  });
});

// Delete organ
app.delete('/admin/organ/delete/:Id', (req, res) => {
  const sql = 'DELETE FROM Organs WHERE Id = ?';
  db.query(sql, [req.params.Id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Organ deleted successfully' });
  });
});

// ========================
// Receiver Organ Request Routes
// ========================

// Get all available organs
app.get('/receiver/organs', (req, res) => {
  const sql = `
    SELECT o.*, d.UserName AS DonorName
    FROM Organs o
    LEFT JOIN Donors d ON o.DonorId = d.Id
    WHERE o.Status = 'Available'
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Get all organs
app.get('/organs', (req, res) => {
  const sql = 'SELECT * FROM Organs';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Request an organ
app.post('/receiver/request', (req, res) => {
  const { organId, receiverId } = req.body;

  if (!organId || !receiverId) {
    return res.status(400).json({ error: 'Missing organId or receiverId' });
  }

  // Check organ existence and availability
  const sqlCheckOrgan = 'SELECT * FROM Organs WHERE Id = ?';
  db.query(sqlCheckOrgan, [organId], (err, organRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (organRows.length === 0) return res.status(404).json({ error: 'Organ not found' });
    if (organRows[0].Status !== 'Available') return res.status(400).json({ error: 'Organ is not available' });

    // Check duplicate request
    const sqlCheckRequest = 'SELECT * FROM Requests WHERE OrganId = ? AND ReceiverId = ?';
    db.query(sqlCheckRequest, [organId, receiverId], (err, requestRows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (requestRows.length > 0) return res.status(400).json({ error: 'Already requested' });

      // Insert request
      const sqlInsert = 'INSERT INTO Requests (OrganId, ReceiverId, Status) VALUES (?, ?, ?)';
      db.query(sqlInsert, [organId, receiverId, 'Pending'], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Update organ status
        const sqlUpdateOrgan = 'UPDATE Organs SET Status = ? WHERE Id = ?';
        db.query(sqlUpdateOrgan, ['Requested', organId], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Organ request sent successfully!' });
        });
      });
    });
  });
});

