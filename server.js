const VALID_CODES = ['2384751', '3847219', '9052137', '5870423', '6749208', '1234890', '4516273', '8924316', '5041987', '7365820'];  // List of valid 7-digit codes

// Route for entering the 7-digit code
app.get('/enter-code', (req, res) => {
  res.send(`
    <form method="POST" action="/enter-code">
      <input type="text" name="code" placeholder="Enter 7-digit code" required />
      <button type="submit">Submit</button>
    </form>
  `);
});

// Handle code entry
app.post('/enter-code', (req, res) => {
  const { code } = req.body;

  if (VALID_CODES.includes(code)) {
    // Code is valid, show the Kahoot embed
    res.redirect('/');
  } else {
    res.send('<h1>Invalid code. Please try again.</h1>');
  }
});
