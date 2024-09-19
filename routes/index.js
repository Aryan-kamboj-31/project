const express = require('express');
const router = express.Router();
const db = require('../db.js');
const session=require('express-session');
const nodemailer = require('nodemailer');
const crypto= require('crypto');
const bcrypt = require('bcrypt'); // For hashing passwords



const login=(req,res,next)=>{
    if(!req.session.login){
        res.redirect('/login')
    }else{
        next();
    }
}
const admin=(req,res,next)=>{
    if(!req.session.admin){
        res.redirect('/admin')
    }else{
        next();
    }
}
// Serve the home page
router.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});


// Serve the registration page
router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/', (req, res) => {
    res.render('index');
});

// Handle registration
router.post('/register', async (req, res) => {
    const { name, email, pass, skills, number } = req.body;

    try {
        // Attempt to insert the user data into the database
        await db.query('INSERT INTO users (name, email, pass, skills, number) VALUES (?, ?, ?, ?, ?)', [name, email, pass, skills, number]);
        // Redirect to login page upon successful registration
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err.message);

        // If there is an error, such as a network issue, show an appropriate error message
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            res.status(503).send('Network error. Please check your internet connection and try again.');
        } else {
            res.status(500).send('Internal server error. Please try again later.');
        }
    }
});

// Serve the login page
// Render login page
router.get('/login', (req, res) => {
    req.session.login = false;
    res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
    const { name, pass } = req.body;
    
    try {
        const rows = await db.query('SELECT * FROM users WHERE name = ? AND pass = ?', [name, pass]);
        console.log(rows[0]);

        if (rows[0].length >0) {
            req.session.user = rows[0];
            req.session.login = true;
            res.redirect('/profile');
        } else {
            // Incorrect email/password message
            res.render('login', { error: 'Email and password are incorrect' });
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});


// Serve the profile page
router.get('/profile', login, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    console.log(req.session.user[0]);
    console.log('abcde');

    res.render('profile', { user: req.session.user[0] });
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Failed to log out.');
      }
      res.redirect('/login'); // Redirect to login or another page
    });
  });

  router.get('/company',login, async (req, res) => {
    try {
        // Extract query parameters
        const { compuny_name, compuny_salary, compuny_location, company_requirement } = req.query;
        

        // Query the database
        const result = await db.query('SELECT * FROM compuny_data');
        // console.log('Database query result:', result);
        
        // Check if result and result.rows are defined
        if (result && result.length > 0) {
            // Save result to session if needed
            // req.session.user = user;
            res.render('company', { user: result[0] });
        } else {
            console.log("hello")
            // Handle case where no rows are found
            res.render('company', { user: [] });
        }
    } catch (error) {
        console.error('Error querying database:', error);
        // Handle the error and respond appropriately
        res.status(500).send('Server error');
    }
});
router.post('/company', async (req, res) => {
    try {
        // Use req.query for GET requests
        const { company_requirement } = req.body;
        // console.log(company_requirement);

        // Check if company_requirement is provided
        if (!company_requirement) {
            return res.status(400).send('Missing company_requirement parameter');
        }

        // Use parameterized queries to avoid SQL injection
        const result = await db.query('SELECT * FROM compuny_data WHERE LOWER(company_requirement) LIKE ?', [`%${company_requirement.toLowerCase()}%`]);

        console.log(result);

        if (result.length > 0) {
            // Save result to session if needed
            // req.session.user = user;
            res.render('company', { user: result[0] });
        } else {
            console.log("No data found");
            // Handle case where no rows are found
            res.render('company', { user: [] });
        }
    } catch (error) {
        console.error('Error querying database:', error);
        // Handle the error and respond appropriately
        res.status(500).send('Server error');
    }
});
router.get('/apply/:company_requirement',login,(req,res)=>{
      const company_requirement=req.params.company_requirement
     res.render('apply',{company_requirement});
});
router.post('/apply', async(req,res)=>{
    const { name, email, phone, position,  coverLetter } = req.body;
    console.log(req.body);
    try {
        await db.query('INSERT INTO indata (name, email, phone, position,coverLetter) VALUES (?, ?, ?, ?, ?)', [name, email, phone,position,coverLetter]);
        res.redirect('/verify');
    } catch (err) {
        res.status(500).send('Error registering user');
    } 
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services like 'smtp', 'yahoo', etc.
        auth: {
            user: 'aryankamboj31@gmail.com', // Your email address
            pass: 'nbip svwh xolr caji'   // Your email password or app-specific password
        }
    });
    function getRandomDate() {
        const currentYear = new Date().getFullYear();
        const year = Math.floor(Math.random() * 6) + currentYear; // Generates a year between the current year and 5 years in the future
        const month = Math.floor(Math.random() * 12); // Random month from 0 to 11
        const day = Math.floor(Math.random() * (new Date(year, month + 1, 0).getDate())) + 1; // Random day within the month
        
        // Create the random date
        const randomDate = new Date(year, month, day);
        
        // Set the time to midnight
        randomDate.setHours(0, 0, 0, 0);
        
        return randomDate;
    }
    
    const date = getRandomDate();
    console.log(date.toISOString()); // Prints the date in ISO format
     
    let random= getRandomDate()
    // console.log(random);
    // Define email options
    const mailOptions = {
        from: 'aryankamboj31@gmail.com',    // Sender address
        to: `${req.body.email}`,     // List of recipients
        subject: 'interview infomation', // Subject line
        text: `your interview for ${req.body.position} is set on  ${random} `,            // Plain text body
    };
    
    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
    });  
})
router.get('/verify',(req,res)=>{
    res.render('verify')
})
router.get('/admin',(req,res)=>{
    req.session.admin=false;
    res.render('admin');
    
});
router.get('/companyadmin',async(req,res)=>{
    try {
        // Extract query parameters
        const { compuny_name, compuny_salary, compuny_location, company_requirement ,id} = req.query;
        

        // Query the database
        const result = await db.query('SELECT * FROM compuny_data');
        // console.log('Database query result:', result);
        
        // Check if result and result.rows are defined
        if (result && result.length > 0) {
            // Save result to session if needed
            // req.session.user = user;
            res.render('companyadmin', { user: result[0] });
        } else {
            // console.log("hello")
            // Handle case where no rows are found
            res.render('companyadmin', { user: [] });
        }
    } catch (error) {
        console.error('Error querying database:', error);
        // Handle the error and respond appropriately
        res.status(500).send('Server error');
    }
});
router.post('/companyadmin', async(req,res)=>{
     try {
        // Use req.query for GET requests
        const { company_requirement } = req.body;
        console.log(company_requirement);

        // Check if company_requirement is provided
        if (!company_requirement) {
            return res.status(400).send('Missing company_requirement parameter');
        }

        // Use parameterized queries to avoid SQL injection
        const result = await db.query('SELECT * FROM compuny_data WHERE LOWER(company_requirement) LIKE ?', [`%${company_requirement.toLowerCase()}%`]);

        // console.log(result);

        if (result.length > 0) {
            // Save result to session if needed
            // req.session.user = user;
            res.render('companyadmin', { user: result[0] });
        } else {
            console.log("No data found");
            // Handle case where no rows are found
            res.render('companyadmin', { user: [] });
        }
    } catch (error) {
        console.error('Error querying database:', error);
        // Handle the error and respond appropriately
        res.status(500).send('Server error');
    }
})
router.post('/admin',async(req,res)=>{
    const {admin_email,admin_pass}=req.body
    try{
        const rows = await db.query('SELECT * FROM  admin1 WHERE admin_email = ? AND admin_pass = ?', [admin_email, admin_pass]);
        console.log(rows);
        if (rows.length > 0) {
            req.session.user = rows[0];
            req.session.admin=true;
            res.redirect('/companyadmin')
        } else {
            res.send('Invalid credentials');
        }
    }catch{

    }

})
router.get('/add-company',(req,res)=>{
    res.render('addcom');
})
router.post('/add-company',admin, async (req, res) => {
    const { compuny_name, compuny_salary, compuny_location, company_requirement } = req.body;
    
    try {
        // Insert the company data into the database
        await db.query('INSERT INTO compuny_data (compuny_name, compuny_salary, compuny_location, company_requirement) VALUES (?, ?, ?, ?)', 
            [compuny_name, compuny_salary, compuny_location, company_requirement]);

        // Redirect to a confirmation page or the company list
        res.redirect('/companyadmin');
    } catch (err) {
        console.error('Error adding company:', err);
        res.status(500).send('Error adding company');
    }
});
router.get('/companyadmin/:id', async (req, res) => {
    const { compuny_name, compuny_salary, compuny_location, company_requirement} = req.query;
    const id = req.params.id;
    // console.log('id', id);
    // Validate the ID to be a number
    if (!/^\d+$/.test(id)) {
        return res.status(400).send('Invalid ID');
    }

    const query = 'DELETE FROM compuny_data WHERE id = ?';
    
    const result = await db.query(query, [id], (err, result) => {
        // console.log("after delete", result);
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        else if (result.affectedRows === 0) {
            return res.status(404).send('Record not found');
        }
    });
    // console.log("result", result);
    if(result[0].affectedRows) {
        res.redirect('/companyadmin');
    }
});
router.get('/companyedit/:id/',async(req,res)=>{
    try {
        // Extract query parameters
        const { compuny_name, compuny_salary, compuny_location, company_requirement } = req.query;
        const id=req.params.id;

        // Query the database
        const result = await db.query(`SELECT * FROM compuny_data where id=?`,[id]);
        // console.log('Database query result:', result[0]);
        
        // Check if result and result.rows are defined
        if (result && result.length > 0) {
            // Save result to session if needed
            // req.session.user = user;
            res.render('companyedit', { user: result[0][0],id });
        } else {
            console.log("hello")
            // Handle case where no rows are found
            res.render('companyedit', { user: [] });
        }
    } catch (error) {
        console.error('Error querying database:', error);
        // Handle the error and respond appropriately
        res.status(500).send('Server error');
    }
});
router.post('/companyedit/:id',async(req,res)=>{
    const id = req.params.id;
   const name=req.body.compuny_name;
   const salary=req.body.compuny_salary;
   const location=req.body.compuny_location;
   const requirement=req.body.company_requirement;
  await db.query('UPDATE compuny_data SET compuny_name=?,compuny_salary=?,compuny_location=?,company_requirement=? WHERE id=?',[name,salary,location,requirement,id]);
  res.redirect('/companyadmin');

});

    router.get('/forgotten_password',(req,res)=>{
         res.render('forgotten_password');
    });
    router.post('/forgotten_password', async (req, res) => {
        const { email } = req.body;
    
        try {
            // Check if email is provided
            if (!email) {
                return res.status(400).send('Please provide an email address.');
            }
    
            // Find the user by email using your database query
            const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            // If no user exists with that email, return an error
            if (user[0].length === 0) {
                return res.status(400).send('No account with that email address exists.');
            }
    
            // If user is found, proceed with generating reset token and sending the email
            const userData = user[0]; // Assuming you get an array of results, take the first one
    
            // Generate a reset token using crypto
            const token = crypto.randomBytes(20).toString('hex');
    
            // Update user with the reset token and expiration
            await db.query('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?', [token, Date.now() + 3600000, email]);
    
            // Set up email transporter (configure with your email provider)
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'aryankamboj31@gmail.com', // Your email address
                    pass: 'nbip svwh xolr caji'   // Your email password or app-specific password
                },
            });
    
            // Set up email data
            const mailOptions = {
                to: email,
                from: 'aryankamboj31@gmail.com', // Your email address
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://${req.headers.host}/reset/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };
    
            // Send the email
            await transporter.sendMail(mailOptions);
    
            res.status(200).send('An e-mail has been sent to ' + email + ' with further instructions.');
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(500).send('An error occurred. Please try again later.');
        }
    });

    router.get('/reset/:token', async (req, res) => {
        const { token } = req.params;
    
        try {
            // Find the user with the provided token and check if it has expired
            const user = await db.query('SELECT * FROM users WHERE Pass = ? AND resetPasswordExpires > ?', [token, Date.now()]);
            if (user.length === 0) {
                return res.status(400).send('Password reset token is invalid or has expired.');
            }
    
            // Render the reset password form
            res.render('reset_password', { token }); // Pass the token to the EJS view
        } catch (err) {
            res.status(500).send('An error occurred. Please try again later.');
        }
    });
    router.post('/reset/:token', async (req, res) => {
        const { token } = req.params;
        const { pass } = req.body;
    
        try {
            // Check if token and password are provided
            if (!token || !pass) {
                return res.status(400).send('Token and password are required.');
            }
    
            // Find the user with the provided token and check if it has expired
            const user = await db.query('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?', [token, Date.now()]);
            if (user.length === 0) {
                return res.status(400).send('Password reset token is invalid or has expired.');
            }
    
            // Hash the new password
            // const saltRounds = 10; // Define the salt rounds
            if (!pass || typeof pass !== 'string') {
                throw new Error('Invalid password input');
            }
    
            // const hashedPassword = await bcrypt.hash(pass, saltRounds);
    
            // Update the user's password and clear the reset token
            await db.query('UPDATE users SET pass = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?', [pass, token]);
    
            res.status(200).send('Password has been successfully reset.');
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(500).send('An error occurred. Please try again later.');
        }
    });
    router.get('/policys',(req,res)=>{
        res.render('private');
    })
    router.get('/terms',(req,res)=>{
        res.render('terms');
    })
    router.get('/contact',(req,res)=>{
        res.send("contact as on our email:aryankamboj31@gmail.com");
    })
module.exports = router;
