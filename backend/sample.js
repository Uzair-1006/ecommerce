const bcrypt = require('bcryptjs');
bcrypt.compare("admin123", "$2b$10$a9D869gsa5oSWLFVy09ZVuKf6WaHDmDmgTP.09FAK1YzPR6qRBZD2")
  .then(result => console.log("Password match:", result));
