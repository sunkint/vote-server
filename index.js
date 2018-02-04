let express = require('express');
let app = express();

let mysql = require('mysql');
let pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'qwer1234',
  database: 'ybusad',
});

app.get('/', (req, res) => {
  // res.append('Content-type', 'text/plain; charset=utf8');
  let result = {data: []};
  pool.query('select * from myessay order by ID desc limit 5', (err, results, fields) => {
    for(let d of results) {
      result.data.push(d.Content);
    }
    res.send(result);
  });
});

let server = app.listen(3000, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log(`Server is listening at http://${host}:${port}`);
});