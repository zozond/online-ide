const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const client = require('./database');
const jwt = require("jsonwebtoken");

let secretKey = "danawa";

/* test code */
router.get('/', function (req, res) {
    res.send("router test");
});

/* jwt test code */
router.get('/jwt_test', (req, res) =>{
    let token = req.cookies.user;
    let decoded = jwt.verify(token, secretKey);
    if(decoded){
        res.send("권한이 있어서 API 수행 가능")
    }else{
        res.send("권한이 없습니다.")
    }
})


/*  */
router.post('/', (req, res) => {
    var query = "SELECT * FROM users where id=" + req.body.id;
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user] SELECT Error :\n" + error);
            res.send({ isUser: false, errorMessage: error});
            return;
        }
        console.log(results.rows[0])
        res.send({ isUser: true, rows: results.rows[0]});
    })
});

/* 등록한 이메일 인증 */
router.get('/register', (req, res) => {
    /* 인증 되었다는 것을 DB 업데이트 */
    var query = "UPDATE users SET auth=1 WHERE username=\'" + req.query.username + "\'";
    console.log(query);
    client.query(query).then((out) => { 
        console.log(req.query.username + " register success");
	res.send("<html><head><style> #box { text-align: center; }</style></head><body> <div id=\"box\"> <h1>" + req.query.username + "님의 이메일 인증에 성공하였습니다.</h1> </div> <script type='text/javascript'> setTimeout(\"location.href='http://ide.danawa.io:3000/'\",2000); </script></body> </html>");
//        res.send("<h1>" + req.query.username + "님의 이메일 인증에 성공하였습니다.</h1>  <script type='text/javascript'> setTimeout(\"location.href='http://ide.danawa.io:3000/'\",2000); </script> ");
    }).catch((err) => {
        console.log("[/db/user/register] UPDATE Error " + req.query.username + ":\n" + err.stack);
        res.send(req.query.username + " register failed");
    });
});

/* user 등록 */
router.post('/register', (req, res) => {
    var query = 'INSERT INTO users (username, password, email) VALUES (\'' + req.body.id + '\', \'' + req.body.password + '\', \'' + req.body.email + '\');'
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user/register] Insert Error :\n" + error);
            res.send({ isRegister: false, errorMessage: error });
            return;
        }

        /* E-mail 인증 */
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dnwlab@gmail.com',  // gmail 계정 아이디를 입력
                pass: 'dlfma!!!#kube1'     // gmail 계정의 비밀번호를 입력
            }
        });

        let mailOptions = {
            from: 'dnwlab@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
            to: req.body.email,          // 수신 메일 주소
            subject: "[다나와 연구소] 이메일 주소 인증을 완료해주세요",   // 제목
            html: '이메일을 인증하고 회원가입을 완료하려면 다음 링크를 클릭해주세요. <a href="http://192.168.0.87:3001/db/user/register?username=' + req.body.id + '"> [링크클릭] </a>'  // 내용
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("[/db/user/register] Send Mail Error :\n" + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.status(200).send({ isRegister: true });
        return;
    })
});

/* 모든 유저 검색 */
router.get('/all', (req, res) => {
    var query = "SELECT * FROM users ";
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user/all] SELECT Error :\n", error);
            res.send({ isUser: false, errorMessage: error});
            return;
        }
        res.send({ isUser: true, rows : results.rows});
    })
});

/* 유저 로그인 */
router.post('/login', (req, res) => {
    var UserName = req.body.id;
    var Password = req.body.password;
    var keepLogin = req.body.keepLogin;
    console.log("keepLogin", keepLogin);
    var query = "SELECT * FROM users where username='" + UserName + "'";
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user/all] SELECT Error :\n", error);
            res.send({ isUser: false, errorMessage: error});
            return;
        }

        if (results.rows.length > 0 && results.rows[0].password == Password ) {
            let token = jwt.sign( { 
                /* 토큰의 내용(payload) */
                email: results.rows[0].email,
                id: results.rows[0].id,
                user: UserName
            }, secretKey ,  { 
                expiresIn: '30d' /* 유효시간 30일 */ 
                // expiresIn: '100s' /* 유효시간 100초 */ 
            })
            
            res.cookie("user", token);
            if(keepLogin == 1){
                res.cookie('user', token, {
                                // maxAge: 1000  // 유효시간 1초
                                maxAge: 30 * 24 * 3600 * 1000   // 30일
                            });
            }else{
                res.cookie("user", token);
            }
            
            res.json({ isUser: true, token: token, rows : results.rows[0]});
        } else if (results.rows.length > 0 && results.rows[0].password != Password){
            console.log("[/db/user/all] 패스워드가 틀립니다. ");
            res.status(200).send({ isUser: false, error: "password", errorMessage: "패스워드가 틀립니다. " });
        } else {
            console.log("[/db/user/all] 유저 이름이 있지만 인증이 되지 않았거나 유저 이름이 틀립니다. ");
            res.status(200).send({ isUser: false, error: "id", errorMessage: "아이디가 틀립니다. " });
        }
    })
});

/* 비밀 번호 찾기 인증 메일 */
router.post('/password', (req, res) => {
    var email = req.body.email;
    var UserName = req.body.id 
    var query = "SELECT * FROM users WHERE username=\'" + UserName + "\'";
    console.log(query);
    client.query(query).then((result) => {
        if(email != result.rows[0].email){
            res.send("등록된 이메일과 이메일이 다릅니다.");
            return;
        }

        /* E-mail 인증 */
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dnwlab@gmail.com',  // gmail 계정 아이디를 입력
                pass: 'dlfma!!!#kube1'          // gmail 계정의 비밀번호를 입력
            }
        });

        let mailOptions = {
            from: 'dnwlab@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
            to: result.rows[0].email,       // 수신 메일 주소
            subject: '[다나와 연구소] 비밀번호 찾기',   // 제목
            html: '당신의 비밀번호는 <strong> ' + result.rows[0].password + ' </strong> 입니다.'  // 내용
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("[/db/user/password] Send Mail Error :\n", error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.send("이메일을 확인해 주세요");
    }).catch((err) => { 
        console.log("[/db/user/password] SELECT Error :\n", err.stack);
        res.send("데이터베이스 에러 입니다.");
    });
});


/* 패스워드 변경 */
router.post('/update', (req, res) => {
    var NewPassword = req.body.newPassword
    var UserId = req.body.id;
    var query = "UPDATE users SET password=\'" + NewPassword + "\' WHERE id=" + UserId;
    console.log(query)
    client.query(query).then((out) => {
        res.send({ isChanged: true });
    }).catch((err) => {
        console.log("[/db/user/update] UPDATE Error :\n", err);
        res.send({ isChanged: false, errorMessage: err});
    });
});

module.exports = router 
