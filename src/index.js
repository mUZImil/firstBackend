const express = require('express')
const app = express();
const fs = require('fs');
const { dirname } = require('path');

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  fs.readdir('./src/files', (err, file) => {
    res.render(__dirname + '/views/index.ejs', { files: file });
  })

})

app.get('/content/:filename', (req, res) => {
  fs.readFile('./src/files/' + req.params.filename, 'utf-8', (err, data) => {
    res.render(__dirname + '/views/content.ejs', { label: req.params.filename, content: data })
  })

})

app.get('/error/:error', (req, res) => {
  res.render(__dirname + '/views/error.ejs', { error: req.params.error });
})

app.get('/edit', (req, res) => {
  res.render(__dirname + '/views/editFile.ejs', {})
})

app.post('/', (req, res, next) => {

  let filename = req.body.username;
  let fileExist = false;
  fs.readdir('./src/files', (err, files) => {

    ////////////////////////
    if (err) {
      return res.redirect('/error/erroroccured')
    } else {
      fileExist = files.some((file) => filename.trim() + '.txt' === file);
    }

    /////////////////////////
    if (fileExist) { return res.redirect('/error/fileExist') }

    ////////////////////////
    if (filename === 'del') {
      fs.readdir('./src/files', (err, files) => {
        files.map((file) => {
          fs.rm('./src/files/' + file, (err) => {
            err ? console.log('no file deleted') : console.log(`file ${file} deleted`)
          })
        })
        return res.redirect('/');
      })
    }

    ////////////////////////
    else if (filename.trim() === "") {
      return res.redirect('/error/filename not entered')
    }

    ////////////////////////
    else {
      fs.writeFile(`./src/files/` + filename.trim() + '.txt', req.body.paswrd, (err) => {
        return err ? res.redirect('/error/nameNotEntered') : res.redirect('/');
      })
    }
  })
})

app.post('/edit', (req, res, next) => {
  let oldName = req.body.oldName.trim();
  let newName = req.body.newName.trim();

  if (oldName && newName) {
    let noExist = false;
    fs.readdir('./src/files', (err, files) => {
      noExist = files.some((file) => file === newName + '.txt')
      if (!noExist) {
        fs.rename('./src/files/' + oldName + '.txt', './src/files/' + newName + '.txt', (err) => {
          err ? res.redirect('/error/name not changed, error in inputs') : res.redirect('/');
        })
      }
      else {
        res.redirect('/error/filename Exists')
      }
    }
    )
  }
  else {
    res.redirect('/error/name not entered or wrong name entered');
  }
})


app.listen(3000, () => {
  console.log('server running');
})