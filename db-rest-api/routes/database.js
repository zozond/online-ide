const { Client } = require("pg");

// const client = new Client({
//     user: 'sjh',
//     host: '127.0.0.1',
//     database: 'sjh',
//     password: 'qwe123!@#',
//     port: 5432,
// });

const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'qwe123!@#',
    port: 5432,
});

function queryDatabase() {
    // 테스트용 테이블 드랍 명령어, 각 테이블에 적용하면 됨.
    // drop table if exists users;

    const query = `
        CREATE TABLE users (
            id serial PRIMARY KEY, 
            username VARCHAR(50) UNIQUE, 
            password VARCHAR(50), 
            email VARCHAR(50) UNIQUE,
            auth Integer default 0
        );
        INSERT INTO users (username, password, email, auth) VALUES ('sjh1', 'sjh1', 'hello@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh2', 'sjh2', 'world@gmail.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh3', 'sjh3', 'hello2@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh4', 'sjh4', 'hello3@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh5', 'sjh5', 'hello4@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh6', 'sjh6', 'hello5@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh7', 'sjh7', 'hello6@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh8', 'sjh8', 'hello7@naver.com', 1);
        INSERT INTO users (username, password, email, auth) VALUES ('sjh9', 'sjh9', 'hello8@naver.com', 1);
    `;

    const query2 = `
        CREATE TABLE containers (
            id serial PRIMARY KEY, 
            userid Integer NOT NULL, 
            username VARCHAR(50) NOT NULL,
            containername VARCHAR(256) NOT NULL, 
            containerid VARCHAR(200), 
            description VARCHAR(200), 
            port VARCHAR(8), 
            stack VARCHAR(20), 
            state VARCHAR(20),
            status VARCHAR(100),
            gitpath VARCHAR(200),
	    shared INTEGER default 0,
            unique (userid, containername)
        );
    `;

    const query3 = `
        CREATE TABLE share (
            id serial PRIMARY KEY, 
            userid Integer NOT NULL,
            username VARCHAR(50) NOT NULL,
            cid Integer
        );
    `;

    client.query(query).then(() => { console.log('user Table created successfully!'); }).catch(err => console.log(err));
    client.query(query2).then(() => { console.log('container Table created successfully!'); }).catch(err => { console.log(err) });
    client.query(query3).then(() => { console.log('share Table created successfully!'); }).catch(err => { console.log(err) });
}

/* 서버가 시작할 때 */
client.connect((err) => {
    if (err) {
        console.log("DB Connection Error!!!! \n ", err);
        process.exit();
    }else {
        queryDatabase();
    }
});

module.exports = client 
