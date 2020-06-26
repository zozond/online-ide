const express = require('express');
const router = express.Router();
const client = require('./database');


// router.get 으로 사용합니다
router.get('/', function(req, res) {
  // 모든 유저를 가져오는 코드...
  res.send("router test");
});


/* 팀 삭제 */
router.post('/delete', (req, res) => {
    // team 테이블에서 teamid로 조회 후 삭제
    var TeamName =  req.body.teamname;
    var query1 = 'DELETE FROM team WHERE teamname=\'' + TeamName  + "\'";

    console.log(query1);
    client.query(query1).then((out) => { console.log('[/db/team/delete] Query1 Success') }).catch((err) => { console.log('[/db/team/delete] DELETE team Failed\n', err); });
    // user_team 테이블에서 teamid로 조회 후 삭제
    var query2 = 'DELETE FROM user_team WHERE teamname=\'' + TeamName + "\'";
    console.log(query2);
    client.query(query2).then((out) => { console.log('[/db/team/delete] Query2 Success') }).catch((err) => { console.log('[/db/team/delete] DELETE user_team Failed\n', err); });
    res.send({ isError: false });
});

/* 팀 생성 */
router.post('/create', (req, res) => {
    var TeamName =  req.body.teamname;
    var Description = req.body.description;
    var UserId = req.body.userid;

    /* team 테이블에 팀 생성 */
    var query1 ='INSERT INTO team (teamname, description, userid) VALUES (\'' + TeamName + '\', \'' + Description + '\', ' + UserId + ') RETURNING *';
    console.log(query1);
    client.query(query1, (error, results) => {
        if (error) {
            console.log("[/db/team/create] INSERT team Error :\n" + error);
            res.send({ insertTeam: false, insertUserTeam : false });
            return;
        }
        
        /* user_team 테이블에서 현재 팀 추가 */
        var TeamId = results.rows[0].id;
        var query2 = 'INSERT INTO user_team (userid, teamid, teamname, reader) VALUES (\'' + UserId + '\', \'' + TeamId + '\' , \'' + TeamName + '\', ' + UserId + ') RETURNING *';
        console.log(query2)
        client.query(query2, (error2, results2) => {
            if (error2) {
                console.log("[/db/team/create] INSERT user_team Error :\n", error2);
                res.send( { insertTeam: true, insertUserTeam : false });
            }
            res.status(200).send({ insertTeam: true, insertUserTeam : true, teamid : TeamId}).end();
        });
    })
});

module.exports = router 