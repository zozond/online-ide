
const express = require('express');
const router = express.Router();
const client = require('./database');

/****************************************
  user_team 이란? 팀과 팀원과의 관계 테이블 
*****************************************/


/* userid로 user_team 테이블 조회 */
router.post('/', (req, res) => {
    var UserId = req.body.id;
    var query = "SELECT * FROM user_team where userid=" + UserId;
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user_team] SELECT Error :\n", error);
            res.send({ isUser: false });
            return;
        }
        res.send({ isUser: true, data: results });
    })
});


/* teamid로 user_team 테이블 조회 */
router.post('/team', (req, res) => {
    var TeamId = req.body.teamid;
    var query = "SELECT * FROM user_team where teamid=" + TeamId;
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user_team/team] SELECT Error :\n", error);
            res.send({ isUser: false });
            return;
        }
        res.send({ isUser: true, data: results });
    })
});

/* user_team 테이블에서 자기 자신이 reader인 team 조회 */
router.post('/reader', (req, res) => {
    var UserId = req.body.id
    var query = "SELECT * FROM user_team where userid=" + UserId + " and reader=" + UserId;
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user_team/reader] SELECT Error :\n", error);
            res.send({ isUser: false, errorMessage: error });
            return;
        }
        res.send({ isUser: true, data: results });
    })
});

/* 현재 유저와 같은 팀원의 컨테이너 조회 */
router.post('/containers', (req, res) => {
    var TeamId = req.body.teamid;
    var query = "SELECT * FROM user_team where teamid=" + TeamId;
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user_team/containers] SELECT user_team Error :\n", error);
            res.send({ isError: true, errorMessage: error });
            return;
        }

        /* 컨테이너 테이블에서 같은팀원의 userid로 검색 */
        var queryString = "SELECT * FROM containers where ";
        for (var i = 0; i < results.rows.length; i++) {
            if (i == results.rows.length - 1)
                queryString += "userid=" + results.rows[i].userid;
            else
                queryString += "userid=" + results.rows[i].userid + " OR ";
        }
        console.log(queryString)
        client.query(queryString, (error2, results2) => {
            if (error2) {
                console.log("[/db/user_team/containers] SELECT containers Error :\n", error2);
                res.send({ isError: true, errorMessage: error });
                return;
            }

            /* 성공 */
            res.send({ isError: false, result: results2 });
        })
    })
});


/* 팀원 변경 시 */
router.post('/update', (req, res) => {

    /* 팀 아이디로 조회 */
    var UserIds = req.body.userid;
    var TeamId = req.body.teamid;
    var query = "SELECT * FROM user_team where teamid=" + TeamId;
    console.log(query);

    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/user_team/update] SELECT Error :\n", error);
            res.send({ isError: true, errorMessage: error });
            return;
        }

        var TeamId =  results.rows[0].teamid;
        var TeamName = results.rows[0].teamname ;

        /* 팀에 추가된 인원 찾아 업데이트 */
        for (var i = 0; i < UserIds.length; i++) {
            var query1 = "INSERT INTO user_team (userid, teamid, teamname) VALUES (";
            var update_userid = UserIds[i];
            var flag = true;
            for (var j = 0; j < results.rows.length; j++) {
                /* 테이블 검색 결과로 나온 userid와 비교 */
                if (update_userid == results.rows[j].userid) {
                    flag = false;
                    break;
                }
            }

            /* UI상에서 추가 되었다면 */
            if (flag) {
                query1 += update_userid + ", " + TeamId + ", \'" + TeamName + "\')";
                console.log(query1);
                client.query(query1, (error2, qres) => {
                    if (error2) {
                        console.log("[/db/user_team/update] INSERT Error :\n", error2);
                    } else { console.log("success") }
                });
            }
        }

        /* 팀에서 제거된 유저 찾아 업데이트 */
        for (var i = 0; i < results.rows.length; i++) {
            var query2 = 'DELETE FROM user_team WHERE userid=';
            var update_userid = results.rows[i].userid;
            var flag = true;

            /* 테이블 검색 결과로 나온 userid와 비교 */
            for (var j = 0; j < UserIds.length; j++) {
                if (update_userid == UserIds[j]) {
                    flag = false;
                    break;
                }
            }

            /* UI상에서 제거 되었다면 */
            if (flag) {
                query2 += update_userid + " and teamid=" + TeamId;
                console.log(query2);
                client.query(query2, (error3, qres) => {
                    if (error3) {
                        console.log("[/db/user_team/update] DELETE Error :\n", error3);
                    } else {
                        console.log("success")
                    }
                });
            }
        }

        res.send({ isError: false });
    });
});

module.exports = router



