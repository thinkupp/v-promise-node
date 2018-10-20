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

function handleSelectField ( field, table ) {
    let str = 'select ';
    if (!field || Object.prototype.toString.call(field) !== '[object Array]' || field.length < 1) {
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

    return str + 'from ' + table;
}

function handleWhereQuery ( query ) {
    let str = ' WHERE';
    const keys = Object.keys(query);
    keys.forEach((item, index) => {
        if (index === 0) {
            str += ` ${item}=${query[item]} `
        } else {
            str += `AND ${item}=${query[item]} `
        }
    });
    return str;
}

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
        queryKeys.forEach(item => {
            prefix += ` ${item} = ?`;
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

/*
* @params
*   table: 表名
*   query: 查询条件
*   field: 指定获取字段
*   option: 分页条件
*       id: 从某个id开始查
*       size: 数量
* */

// function $findByLimit( table, query, field, option = {}, join = '' ) {
//     return new Promise((resolve, reject) => {
//         try {
//             const queryKey = isObject(query);
//             const optionKey = isObject(option);
//             const { id = 100000, size = 30 } = option;
//
//             if (!table) return reject('不存在的表');
//             if (!queryKey || !optionKey) return reject('查询参数有误');
//
//             let str = handleSelectField(field, table) + join + handleWhereQuery(query) + `AND ${table}.id > ${id} limit ${size}`;
//
//             console.log(str);
//             return resolve(dbQuery(str));
//         } catch (err) {
//             reject(err)
//         }
//     })
// }

function $findAppointByLimit( query, option ) {
    return new Promise(async (resolve, reject) => {
        try {
            const queryKey = isObject(query);
            const optionKey = isObject(option);
            const { id = 100000, size = 30 } = option;

            if (!queryKey || !optionKey) return reject('查询参数有误');

            const str = `select appoint.*, users.avatar, users.nickName from appoint inner join users on users.id = ${query.creatorId} WHERE appoint.creatorId = ${query.creatorId} AND appoint.id > ${id} limit ${size}`;

            const result = await dbQuery(str);
            result.forEach(item => {
                item.u = {
                    nickName: item.nickName,
                    avatar: item.avatar
                };
                delete item.nickName;
                delete item.avatar;
            })
            return resolve(result);
        } catch (err) {
            reject(err)
        }
    })
}



module.exports = {
    dbQuery,
    $update,
    $insert,
    $findOne,
    $findAppointByLimit
}
