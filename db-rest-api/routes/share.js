
const express = require('express');
const router = express.Router();
const client = require('./database');


/* share 테이블이란? 컨테이너 공유 테이블 */


/* 공유된 유저 조회 (SharedUserId)*/
router.post('/select/userid', (req, res) => {
    console.log(req.body);
    var SharedUserId = req.body.sharedUserId;

    var query = "SELECT * FROM share WHERE userid=" + SharedUserId;
    client.query(query, (error, results) => {
        if (error) {
            console.log("Share Table SELECT error", error);
            res.send({ isError: true, errorMessage: error });
            return;
        }
        res.send({ isError: false, results: results });
    });
});



/* 공유된 컨테이너 조회 (ConatainerId) */
router.post('/select/cid', (req, res) => {
    console.log(req.body);
    var ContainerId = req.body.cid;

    var query = "SELECT * FROM share WHERE cid=" + ContainerId;
    client.query(query, (error, results) => {
        if (error) {
            console.log("Share Table SELECT error", error);
            res.send({ isError: true, errorMessage: error });
            return;
        }
        res.send({ isError: false, results: results });
    });
});


/* 공유된 컨테이너들 조회 (ConatainerId) */
router.post('/select/cids', (req, res) => {
    console.log(req.body);
    var whereQuery = "";
    var ContainerIds = req.body.cids;
    var flag = true;
    for (var containerid of ContainerIds) {
        if (flag) {
            whereQuery += "WHERE cid=" + containerid;
            flag = false;
        } else
            whereQuery += " OR cid=" + containerid
    }

    if (whereQuery.length == 0) {
        res.send({ isError: false, results: [] });
    } else {
        var query = "SELECT * FROM share " + whereQuery;
        console.log(query);
        client.query(query, (error, results) => {
            if (error) {
                console.log("Share Table SELECT error", error);
                res.send({ isError: true, errorMessage: error });
                return;
            }
            var resultJson = {};
            for (var element of results.rows) {
                if (resultJson[element.cid]) {
                    resultJson[element.cid].push(element.username);
                } else {
                    resultJson[element.cid] = [];
                    resultJson[element.cid].push(element.username);
                }
            }
            console.log("[/db/share/select/cids] >>> ", resultJson)
            res.send({ isError: false, results: resultJson });
        });
    }
});



/* 공유된 테이블 업데이트 */
router.post('/update', (req, res) => {
    console.log(req.body);
    /* Container의 유니크한 아이디 */
    var ContainerId = req.body.cid;
    /* 공유된 유저 아이디 */
    var SharedUserId = req.body.sharedUserId;
    /* 공유된 유저 이름 */
    var SharedUserName = req.body.sharedUserName;

    var query = "";
    if (SharedUserId.length == 0) {
        query = "Update containers set shared=0 where id=" + ContainerId;
    } else {
        query = "Update containers set shared=1 where id=" + ContainerId;
    }


    /* 컨테이너에 공유된 사실을 업데이트 */
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("Share Table Update error >>> ", error);
            res.send({ isError: true, errorMessage: error });
            return;
        }

        var query2 = "DELETE FROM share WHERE cid=" + ContainerId;
        client.query(query2, (error2, results2) => {
            if (error2) {
                console.log("Share Table Delete error >>> ", error2);
                res.send({ isError: true, errorMessage: error2 });
                return;
            }

            if (SharedUserId.length != 0) {
                /* share 테이블에 추가 */
                for (var i = 0; i < SharedUserId.length; i++) {
                    var query3 = "INSERT INTO share (userid, username, cid) VALUES (" + SharedUserId[i] + ", '" + SharedUserName[i] + "', " + ContainerId + ")";
                    client.query(query3, (error3, results3) => {
                        if (error3) {
                            console.log(error3);
                            //res.send({isError: true, errorMessage: error2});
                            return;
                        }
                        return;
                    });
                }
            }
            res.send({ isError: false });
        })
    });
});


module.exports = router



