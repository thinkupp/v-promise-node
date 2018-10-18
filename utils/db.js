const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'appoint',
    charset : 'utf8',
    insecureAuth: true
});

const query = function (sql, params) {
    return new Promise(async (resolve, reject) => {
        let conn;

        try {
            conn = await pool.getConnection();
            const [rows, fields] = await conn.execute(sql, params);
            conn.release();
            resolve(rows);
        } catch (err) {
            if (!conn) conn.release();
            reject(err)
        }
    })
}

module.exports = {
    query
}