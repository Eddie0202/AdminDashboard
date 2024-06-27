const express = require('express');
const path = require('path')
const app = express();
const port = 3000;

const morgan = require('morgan')
const handlebars = require('express-handlebars');
const dotenv = require('dotenv')
require('dotenv').config();
const session = require('express-session');

const methodOverride = require('method-override');

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded(
  {
    extended: true
  }
));
app.use(express.json());
app.use(methodOverride('_method'));
const route = require("./routes");


// Sử dụng session middleware
app.use(session({
  secret: 'ecogreen_admin',
    resave: false,
  saveUninitialized: true
}));
//Template engine
app.engine(
  'hbs', 
  handlebars({
    extname: 'hbs',
    helpers: {
      sum: (a,b) => a + b,
      setStatusClass: function (status) {
        if (status === "active") {
          return "badge bg-label-success me-1";
        } else if (status === "banned") {
          return "badge bg-label-warning me-1";
        } else {
          return "";
        }
      },
      getActionButton: function(status) {
        if (status === "active") {
          return {
            class: "btn-danger",
            action: "ban",
            label: "Ban"
          };
        } else if (status === "banned") {
          return {
            class: "btn-success",
            action: "unban",
            label: "Unban"
          };
        } else {
          return null;
        }
      },
      eq: function(a, b, options) {
        if (a === b) {
          return options.fn(this);
        } else {
          return '';
        }
      },
      
    }
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
route(app);
app.use(morgan('combined'));

app.listen(port, () => console.log(`App listening to port ${port}`));