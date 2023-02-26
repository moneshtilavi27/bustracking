import mysql from 'mysql';

const credentil = false ? {
    host: "localhost",
    user: "root",
    password: "",
    database: "bustrack"
} :
    {
        host: "localhost",
        user: "root",
        password: "Monesh@123",
        database: "bustrack"
    }

const con = mysql.createConnection(credentil);


con.connect(function (err) {
    if (err) {
        console.log("Fail to connect to database", err.message);
    } else {
        console.log("database Connected successfully!");
    }
});

// export const dbConnect= () => new Promise((resolve, reject) => {
//     con.connect(function (err) {
//         if (err) {
//             reject("Fail to connect to database",err.message);
//         } else {
//             resolve("database Connected successfully!");
//         }
//     });
// });


export const getData = (query, next) => new Promise((resolve, reject) => {
    con.query(query, function (err, result, fields) {
        if (err) {
            resolve(err);
        } else {
            resolve(result);
        }
    });
});

export const insertData = (query, array, next) => new Promise((resolve, reject) => {
    con.query(query, array, function (err, result, fields) {
        if (err) {
            next(err);
        } else {
            resolve(result);
        }
    });
});

export const getCount = async (query, next) => {
    let result = await getData(query, next).then(async (data) => {
        if (data.length <= 0) {
            return next(CustomErrorHandler.notFound());
        } else {
            return data[0];
        }
    });
    return result;
}


export default con;