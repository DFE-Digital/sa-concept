// app.js
require('dotenv').config();

const express = require('express');

const session = require('express-session');
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks');
const routes = require('./app/routes'); 
var dateFilter = require('nunjucks-date-filter');
var markdown = require('nunjucks-markdown');
var marked = require('marked');
const moment = require('moment');

const app = express();

// set up session

// set up body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/assets', express.static('public/assets'))

app.locals.style = process.env.style || 'mixed';

app.use(
  session({
    secret: process.env.sessionkey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note: `secure: true` in a production environment with HTTPS
  }),
);


const { saveFormDataToSession, makeFormDataGlobal } = require('./app/middleware/session');


// Register the middlewares globally
app.use(saveFormDataToSession);
app.use(makeFormDataGlobal);

// set up routes
app.use('/', routes)

// set up static files
app.set('view engine', 'html')

// set up nunjucks
var nunjuckEnv = nunjucks.configure(
    [
      'app/views',
      'node_modules/govuk-frontend/dist/',
      'node_modules/dfe-frontend-alpha/packages/components',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

nunjuckEnv.addFilter('date', dateFilter)

nunjuckEnv.addFilter('split', function(str, seperator) {
  return str.split(seperator);
});

markdown.register(nunjuckEnv, marked.parse)

nunjuckEnv.addFilter('array', function (input, key) {
  try {
    const parsedInput = JSON.parse(input);
    return parsedInput[key];
  } catch (error) {
    return input; // Return the original input if parsing fails
  }
});

nunjuckEnv.addFilter('fromNow', function(date) {
  return moment(date).fromNow();
});

app.post('/cif-1', function (req, res) {

  console.log(req.body);

  var cif1 = req.body;
  if (req.session == undefined && req.session.data == undefined) {
    req.session.data = {};
  }
  req.session.data['cif-app-name'] = cif1;

  res.redirect('/cif-2');

})

app.post('/cif-3', function (req, res) {

  console.log(req.body);

  const {amount} = req.body;
  if (req.session == undefined && req.session.data == undefined) {
    req.session.data = {};
  }
  req.session.data['amount'] = amount;

  res.redirect('/cif-4');

})



app.get('/finance-cif-apply', function (req, res) {


    req.session.data = {};
  
  res.render('finance-cif-apply');

})

app.get('/cif-2', function (req, res) {

  if (!req.session.data) {
    req.session.data = {};
  }

  const pupilList = req.session.data.pupilList;



  res.render('cif-2', {pupilList});

})


app.get('/cif-4', function (req, res) {

  if (!req.session.data) {
    req.session.data = {};
  }

  const pupilList = req.session.data.pupilList;

  console.log('GET /cif-4')
  console.log(pupilList)

  res.render('cif-4', {pupilList});

})



app.post('/cif-4-add', function (req, res) {

  console.log(req.body);

  const {pupilName, dobday, dobmonth, dobyear, organisation} = req.body;
  if (req.session == undefined && req.session.data == undefined) {
    req.session.data = {};
  }
 
  // Check if req.session.data exists and initialize it if not
  if (!req.session.data) {
    req.session.data = {};
  }

  // Check if req.session.data.pupilList exists and initialize it as an array if not
  if (!req.session.data.pupilList) {
    req.session.data.pupilList = [];
  }

  // Create a new pupil object with the received data
  const newPupil = {
    pupilName,
    dobday,
    dobmonth,
    dobyear,
    organisation
  };

  // Add the new pupil to the pupilList
  req.session.data.pupilList.push(newPupil);

  res.redirect('/cif-4');

})

app.get(/\.html?$/i, function (req, res) {
    var path = req.path
    var parts = path.split('.')
    parts.pop()
    path = parts.join('.')
    res.redirect(path)
  })
  
  app.get(/^([^.]+)$/, function (req, res, next) {
    matchRoutes(req, res, next)
  })
  
  // Handle 404 errors
  app.use(function (err, req, res, next) {
    console.log(err);
    res.status(404).redirect('/404.html');
  });
  
  // Handle 500 errors
  app.use(function (err, req, res, next) {
   //console.log('error 500')
   console.log(err)
    res.status(500).render('error.html', { error: err })
  })
  
  // Try to match a request to a template, for example a request for /test
  // would look for /app/views/test.html
  // and /app/views/test/index.html
  
  function renderPath(path, res, next) {
    // Try to render the path
    res.render(path, function (error, html) {
      if (!error) {
        // Success - send the response
        res.set({ 'Content-type': 'text/html; charset=utf-8' })
        res.end(html)
        return
      }
      if (!error.message.startsWith('template not found')) {
        // We got an error other than template not found - call next with the error
        next(error)
        return
      }
      if (!path.endsWith('/index')) {
        // Maybe it's a folder - try to render [path]/index.html
        renderPath(path + '/index', res, next)
        return
      }
      // We got template not found both times - call next to trigger the 404 page
      next()
    })
  }
  
  matchRoutes = function (req, res, next) {
    var path = req.path
  
    // Remove the first slash, render won't work with it
    path = path.substr(1)
  
    // If it's blank, render the root index
    if (path === '') {
      path = 'index'
    }
  
    renderPath(path, res, next)
  }

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
});
