 const mysql = require('mysql2/promise');
const types = require('./types');

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'appoint',
    charset : 'utf8',
    insecureAuth: true
});

const dbQuery = function (sql, params) {
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
};

function isObject( obj ) {
    if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') return false;
    return Object.keys(obj);
}

function $update( table, query, updateData ) {
    const keys = isObject(updateData);

    if (!keys) return Promise.reject('错误的数据');

    let prefix = 'UPDATE ' + table + ' SET';
    const data = [];

    // 提取字段名
    keys.forEach((item, index) => {
        let value = updateData[item];
        let v = '?';
        if (typeof value === 'string' && value.indexOf(types.SPECIAL_SET_VALUE) > -1) {
            v = value.replace(types.SPECIAL_SET_VALUE, '');
        }

        if (index === keys.length - 1) {
            prefix += ` ${item}=${v}`;
        } else {
            prefix += ` ${item}=${v},`;
        }

        if (v === '?') {
            data.push(updateData[item])
        }
    });

    if (query) {
        const queryKeys = Object.keys(query);
        prefix += ' WHERE';
        queryKeys.forEach((item, index) => {
            if (index === 0) {
                prefix += ` ${item} = ?`;
            } else {
                prefix += ` AND ${item} = ?`;
            }
            data.push(query[item]);
        })
    }

    return dbQuery(prefix, data);
}

function $insert( table, insertData ) {
    const keys = isObject(insertData);
    if (!keys) return Promise.reject('错误的数据');

    let str = `insert into ${table} (`;
    let part2 = '';
    let value = [];
    keys.forEach((item, index) => {
        if (index === keys.length - 1) {
            str += `${item}`;
            part2 += '?'
        } else {
            str += `${item}, `;
            part2 += '?, '
        }

        value.push(insertData[item]);
    });
    str += `) VALUES (${part2})`;

    return dbQuery(str, value);
}

function $findOne( table, query, field ) {
    const queryKeys = isObject(query);

    if (!queryKeys) return Promise.reject('查询条件错误');

    let str = 'select ';
    if (!field || field.length < 1) {
        str += '* '
    } else {
        field.forEach((item, index) => {
            if (index === field.length - 1) {
                str += `${item} `
            } else {
                str += `${item}, `
            }
        });
    }

    const l = {
        id: 1,
        age: 1,
        sex: 1,
        u: {
            nickname: '',
            avatar: ''
        }
    }

    const u = {
        nickname: '',
        avatar: ''
    }

    return new Promise(async (resolve, reject) => {
        try {
            str += `from ${table} WHERE`;
            const queryValues = [];
            queryKeys.forEach((item, index) => {
                const fix = index === 0 ? ' ' : ' AND ';
                str += `${fix}${item}=?`;
                queryValues.push(query[item]);
            });

            const result = await dbQuery(str, queryValues);
            if (result.length) return resolve(result[0]);
            resolve(null);
        } catch (err) {
            reject(err)
        }
    })
}

function $findAppointByLimit( query, option ) {
    return new Promise(async (resolve, reject) => {
        try {
            const queryKey = isObject(query);
            const optionKey = isObject(option);
            const { id = 100000, size = 30 } = option;

            if (!queryKey || !optionKey) return reject('查询参数有误');

            const result = await dbQuery(`select appoint.* from appoint WHERE  deleted = 0 and appoint.creatorId = ${query.creatorId} AND appoint.id > ${id} order by id DESC limit ${size}`);

            result.handleAppointData(false);

            return resolve(result);
        } catch (err) {
            reject(err)
        }
    })
}

function $findJoinAppointByLimit ( uid, option ) {
    return new Promise(async (resolve, reject) => {
        try {
            if (option.startId === -1) {
                option.startId = 99999999;
            }

           // const result = await dbQuery(`SELECT appoint.*, users.avatar, users.gender, users.nickname FROM watcher INNER JOIN users on users.id = ${uid} INNER JOIN appoint on appoint.id = watcher.appointId WHERE deleted = 0 AND watcher.appointId = appoint.id AND watcher.userId = ${uid} AND watcher.id < ${option.startId} ORDER BY id desc limit ${option.size};`);

					  const result = await dbQuery(`select appoint.*, users.nickname, users.avatar, users.gender from (appoint, users, watcher) where watcher.appointId = appoint.id and watcher.userId = ${uid} and users.id = appoint.creatorId`);

            result.handleAppointData();

            resolve(result);
        } catch (err) {
            reject(err);
        }
    })
}

module.exports = {
    dbQuery,
    $update,
    $insert,
    $findOne,
    $findAppointByLimit,
    $findJoinAppointByLimit
}
