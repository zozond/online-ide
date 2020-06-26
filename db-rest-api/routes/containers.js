const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
let secretKey = "danawa";
var axios = require('axios');
const client = require('./database');
var fs = require('fs');
var yaml = require('js-yaml')

var NodeSSH = require('node-ssh');
var ssh = new NodeSSH();
var exec = require("child_process").exec;
/* 87 서버 */
// var docker = "http://192.168.0.87:2375";
// var IDE_URL = "http://192.168.0.87"
// var haproxy_url = "http://192.168.0.87:5555";

/* 로컬 서버 */
var docker = "http://localhost:2375";
var IDE_URL = "http://localhost"
var haproxy_url = "http://localhost:6666"


/* 호스트의 RSA 키 가져오기 */
// var cmd = "cat /home/sjh/.ssh/id_rsa.pub"
var cmd = "type C:\\Users\\admin\\.ssh\\id_rsa.pub"
var rsa = "";
exec(cmd, (err, stdout, stderr) => {
    if (err) { console.log(err); return; }
    if (stderr) { console.log(stderr); return; }

    rsa = "\'" + stdout + "\'";
});

router.get('/', function (req, res) {
    res.send("router test");
});

/* DB에 등록된 유저의 컨테이너 내용 가져오기 */
router.post('/', (req, res) => {
    /* 쿠키에 토큰이 있는지 검사 */
    // if (typeof req.cookies.user == "undefined" || req.cookies.user == null || req.cookies.user == "") {
    //     res.send({ token: true, errorMessage: "토큰이 없습니다." });
    //     return;
    // }

    // /* 토큰 유효성 검사 */
    // try {
    //     let decoded = jwt.verify(req.cookies.user, secretKey);
    //     console.log(decoded)
    // } catch(err) {
    //     console.log("jwt token error >>", err);
    //     res.send({ token: true, errorMessage: "토큰이 만료 되었습니다." });
    //     return;
    // }

    /* DB 컨테이너 테이블 조회 */
    console.log(req.body);
    var subQuery = " ";
    var sharedContainers = req.body.sharedContainers;
    for (var i = 0; i < sharedContainers.length; i++) {
        subQuery += " OR ";
        subQuery += "id=" + sharedContainers[i].cid;
    }
    var UserId = req.body.id;
    var query = "SELECT * FROM containers where userid=" + UserId + subQuery + " ORDER BY id DESC";
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/containers] Error :\n", error);
            res.send({ isUser: false, errorMessage: error });
            return;
        }
        res.send({ isUser: true, data: results });
    })
});

/* 유저의 컨테이너 1개 지우기 */
router.post('/delete', (req, res) => {
    /* 토큰 검사 */
    /* 쿠키에 토큰이 있는지 검사 */
    // if (typeof req.cookies.user == "undefined" || req.cookies.user == null || req.cookies.user == "") {
    //     res.send({ error: true, errorMessage: "토큰이 없습니다." });
    //     return;
    // }

    // /* 토큰 유효성 검사 */
    // try {
    //     let decoded = jwt.verify(req.cookies.user, secretKey);
    //     console.log(decoded)
    // } catch(err) {
    //     console.log("jwt token error >>", err);
    //     res.send({ error: true, errorMessage: "토큰이 만료 되었습니다." });
    //     return;
    // }

    /* 유저ID와 컨테이너 이름으로 DB조회 */
    var UserId = req.body.id;
    var ContainerName = req.body.containername;
    var query = "SELECT * FROM containers where userid=" + UserId + " and containername='" + ContainerName + "';";
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/containers/delete] SELECT Error :\n", error);
            res.send({ isUser: false, errorMessage: error });
            return;
        }

        /* 만약 가지고 있는 컨테이너가 없다면 */
        if (results.rows.length == 0) {
            res.send({ isUser: false, errorMessage: "현재 등록된 컨테이너가 없습니다." });
        } else {
            /* 컨테이너 Primary Key */
            var cid = results.rows[0].id;
            var ContainerId = results.rows[0].containerid;
            /* DB를 조회해서 있다면 DB에서 삭제 */
            var query2 = 'DELETE FROM containers WHERE userid=' + UserId + " and containername='" + ContainerName + "'";
            console.log(query2);
            client.query(query2, (error2, results2) => {
                if (error2) {
                    console.log("[/db/containers/delete] DELETE Error :\n", error2);
                    res.send({ isUser: false });
                    return;
                }
                
                /* DB에서 삭제 후 프록시 서버에서 해당 컨테이너 프록시 내용 삭제 */
                var acl = UserId + "-" + ContainerName;
                axios.delete(haproxy_url + '/config/services/' + UserId + '/ports/10000?acl=' + acl).then(() => {
                    console.log("프록시 내용 삭제 됨(port 10000)")
                    res.status(200).send({ isUser: true }).end();
                }).catch((error) => {
                    console.log("프록시 내용 삭제 실패(port 10000)\n", error)
                    res.status(304).send({ isUser: false }).end();
                });

                axios.delete(haproxy_url + '/config/services/' + UserId + '/ports/8080?acl=' + acl).then(() => {
                    console.log("프록시 내용 삭제 됨 (port 8080)")
                }).catch((error) => {
                    console.log("프록시 내용 삭제 실패 (port 8080))\n", error)
                });
            });

            var query3 = "DELETE FROM share WHERE cid=" + cid;
            console.log(query3);
            client.query(query3, (error3, results3) => {
                if (error3) {
                    console.log("[/db/containers/delete] share Table DELETE Error:\n", error3);
                    return;
                }
                console.log("[/db/containers/delete] share Table DELETE Done! ");
            });

            /* Docker 에서 컨테이너 삭제 */
            axios.post(docker + '/containers/' + ContainerId + '/stop').then((stdout) => {
                console.log("도커에서 컨테이너 중지 성공[" + ContainerId + "]")
                axios.delete(docker + '/containers/' + ContainerId).then((stdout2) => { console.log("도커에서 컨테이너 삭제 완료") }).catch((err2) => { console.log(docker + '/containers/' + ContainerId + " DELETE Error:\n", err2) });
            }).catch((err) => {
                console.log("도커에서 컨테이너 중지 실패[" + ContainerId + "] :\n", err)
                axios.delete(docker + '/containers/' + ContainerId).then((stdout2) => { console.log("도커에서 컨테이너 삭제 완료") }).catch((err2) => { console.log(docker + '/containers/' + ContainerId + " DELETE Error:\n", err2) });
            })
        }
    })
});

/* 유저의 컨테이너 1개 생성 */
router.post('/create', (req, res) => {
    /* 쿠키에 토큰이 있는지 검사 */
    // if (typeof req.cookies.user == "undefined" || req.cookies.user == null || req.cookies.user == "") {
    //     res.send({ error: true, errorMessage: "토큰이 없습니다." });
    //     return;
    // }

    // /* 토큰 유효성 검사 */
    // try {
    //     let decoded = jwt.verify(req.cookies.user, secretKey);
    //     console.log(decoded)
    // } catch(err) {
    //     console.log("jwt token error >>", err);
    //     res.send({ error: true, errorMessage: "토큰이 만료 되었습니다." });
    //     return;
    // }
    var dockerForm = req.body;

    /* Docker안의 전체 컨테이너 갯수 가져오기 */
    axios.get(docker + '/containers/json?all=true').then((containers) => {
        /* 현재 Docker에서 사용하고 있는 Host Port 조회 후 사용할 Port 번호 계산 */
        var list = containers.data;
        var Port = 10010;
        var i = 0;
        while (i < list.length) {
            if (list[i].Labels.Port == "" + Port) {
                i = 0;
                Port++;
            } else {
                i++;
            }
        }
        Port = Port.toString();
        var ExposedPort2 = "22/tcp";
        dockerForm.Labels.Port = Port;
        dockerForm.ExposedPorts[ExposedPort2] = {};
        dockerForm.HostConfig.PortBindings[ExposedPort2] = [];
        dockerForm.HostConfig.PortBindings[ExposedPort2].push({ "HostPort": Port });
        dockerForm.Env.push("RSA=" + rsa);
        dockerForm.Env.push("FOLDER=" + dockerForm.Hostname);

        console.log(JSON.stringify(dockerForm))

        /* Docker 컨테이너 생성 */
        var postRequest = docker + '/containers/create?name=' + dockerForm.Labels.UserId + "-" + dockerForm.Hostname;
        console.log(postRequest);
        axios.post(postRequest, dockerForm).then((createdContainer) => {

            /* DB에 생성한 컨테이너 내용 넣기 */
            var query = 'INSERT INTO containers (userid, username, containername, containerid, description, port, state, stack, gitpath) VALUES (\'' + dockerForm.Labels.UserId + '\', \'' + dockerForm.Labels.UserName + '\', \'' + dockerForm.Hostname + '\', \'' + createdContainer.data.Id + '\', \'' + dockerForm.Labels.Description + '\', \'' + Port + '\', \'생성됨\', \'' + dockerForm.Labels.Stack + '\', \'' + dockerForm.Labels.GitPath + '\');';
            console.log(query);
            client.query(query, (dberr, results) => {
                if (dberr) {
                    console.log("[/db/containers/create] Insert Error :\n", dberr);
                    res.send({ error: true, errorMessage: dberr });
                    return;
                }
                res.status(200).send({ error: false }).end();
                return;
            })
        }).catch((err2) => {
            console.log(postRequest + " Error: \n", err2);
            res.send({ error: true, errorMessage: err2 })
        });
    }).catch((err) => {
        console.log(docker + '/containers/json?all=true' + " Error:\n", err)
        res.send({ error: true, errorMessage: err })
    });
});


/* 유저의 Docker 컨테이너 시작 */
router.post('/start', (req, res) => {
    /* 쿠키에 토큰이 있는지 검사 */
    // if (typeof req.cookies.user == "undefined" || req.cookies.user == null || req.cookies.user == "") {
    //     res.send({ error: true, errorMessage: "토큰이 없습니다." });
    //     return;
    // }

    // /* 토큰 유효성 검사 */
    // try {
    //     let decoded = jwt.verify(req.cookies.user, secretKey);
    //     console.log(decoded)
    // } catch(err) {
    //     console.log("jwt token error >>", err);
    //     res.send({ error: true, errorMessage: "토큰이 만료 되었습니다." });
    //     return;
    // }
    var prevState = req.body.state;
    var UserId = req.body.id;
    var ContainerId = req.body.containerid;
    var ContainerName = req.body.containername;

    /* DB에서 컨테이너 상태를 실행중으로 변경 */
    var query = "UPDATE containers SET state=\'실행중\' WHERE userid=" + UserId + " and containerid=\'" + ContainerId + "\'";
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/containers/update] UPDATE Error :\n", error);
            res.send({ isUpdate: false, errorMessage: error });
            return;
        }

        /* Docker로 컨테이너 시작 명령 보내기 */
        var postRequest = docker + '/containers/' + ContainerId + '/start';
        console.log(postRequest);
        axios.post(postRequest).then((result) => {
            //생성된 docker local IP를 가져온다
            var getRequest = docker + '/containers/' + ContainerId + '/json';
            console.log(getRequest);
            axios.get(getRequest).then((result2) => {
                /* 등록할 서브 도메인 */
                var subdomain = result2.data.Name.substring(1, result2.data.Name.length);
                if (prevState == '정지됨') {
                    /* 이전상태가 '정지됨' 상태 였다면 현재는 Start 했으니 Proxy에 설정 등록 필요 없음 */
                    res.send({ isUpdate: true, url: subdomain + ".ide-test.danawa.io:10000/?folder=/home/danawa/"+ContainerName });
                    // res.send({ isUpdate: true, url: subdomain + ".ide-test.danawa.io:10000/?folder=/root/" + ContainerName });
                } else {
                    /* 이전상태가 '생성됨' 상태 였다면 현재는 Start 했으니 Proxy에 설정 등록 필요 */
                    /* Ide port 등록 */
                    var proxy_data = { mode: "http", bindPort: 10000, host: result2.data.NetworkSettings.IPAddress, timeout: 5000000, port: 10000, subdomain: subdomain };
                    axios.post(haproxy_url + '/config/services/' + UserId, proxy_data).then(() => {
                        console.log("HAProxy done,  port:10000")
                        res.send({ isUpdate: true, url: subdomain + ".ide-test.danawa.io:10000/?folder=/home/danawa/" + ContainerName});
                        // res.send({ isUpdate: true, url: subdomain + ".ide-test.danawa.io:10000/?folder=/root/" + ContainerName });
                    }).catch((error) => {
                        console.log("HAProxy port:10000 error", error)
                        res.send({ isUpdate: false, errorMessage: error });
                    });
                    /* Application Port 등록 */
                    var proxy_data2 = { mode: "http", bindPort: 8080, host: result2.data.NetworkSettings.IPAddress, timeout: 5000000, port: 8080, subdomain: subdomain };
                    axios.post(haproxy_url + '/config/services/' + UserId, proxy_data2).then(() => {
                        console.log("HAProxy done, port: 8080")
                    }).catch((error) => {
                        console.log("HAProxy port:8080   error", error)
                    });
                }
            }).catch((err3) => {
                if (err3.response.status == 304) console.log("already started!");
                console.log(getRequest + " Error:\n", err3);
                res.send({ isUpdate: false, errorMessage: err3 });
            });
        }).catch((err2) => {
            console.log(postRequest + " Error:\n", err2)
            res.send({ isUpdate: false, errorMessage: err2 });
        });
    })
});


/* 컨테이너 정지 */
router.post('/stop', (req, res) => {
    /* 쿠키에 토큰이 있는지 검사 */
    // if (typeof req.cookies.user == "undefined" || req.cookies.user == null || req.cookies.user == "") {
    //     res.send({ error: true, errorMessage: "토큰이 없습니다." });
    //     return;
    // }

    // /* 토큰 유효성 검사 */
    // try {
    //     let decoded = jwt.verify(req.cookies.user, secretKey);
    //     console.log(decoded)
    // } catch(err) {
    //     console.log("jwt token error >>", err);
    //     res.send({ error: true, errorMessage: "토큰이 만료 되었습니다." });
    //     return;
    // }

    /* DB안의 컨테이너 상태 변경 */
    var UserId = req.body.id;
    var ContainerId = req.body.containerid;
    var Port = req.body.port;
    var query = "UPDATE containers SET state=\'정지됨\' WHERE userid=" + UserId + " and containerid=\'" + ContainerId + "\'";
    console.log(query);
    client.query(query, (error, results) => {
        if (error) {
            console.log("[/db/containers/stop] UPDATE Error :\n" + error);
            res.send({ isUpdate: false, errorMessage: error });
            return;
        }

        /* Docker로 컨테이너 Stop 명령*/
        var postRequest = docker + '/containers/' + ContainerId + '/stop';
        console.log(postRequest);
        axios.post(postRequest).then((result) => {
            res.send({ isUpdate: true, url: IDE_URL + ":" + Port });
        }).catch((err2) => {
            console.log(postRequest + " Error:\n", err2)
            res.send({ isUpdate: false, errorMessage: err2 });
        });
    })
});


/* 컨테이너 안에 Git remote path 등록 */
router.post('/path', (req, res) => {
    /* 쿠키에 토큰이 있는지 검사 */
    // if (typeof req.cookies.user == "undefined" || req.cookies.user == null || req.cookies.user == "") {
    //     res.send({ error: true, errorMessage: "토큰이 없습니다." });
    //     return;
    // }

    // /* 토큰 유효성 검사 */
    // try {
    //     let decoded = jwt.verify(req.cookies.user, secretKey);
    //     console.log(decoded)
    // } catch(err) {
    //     console.log("jwt token error >>", err);
    //     res.send({ error: true, errorMessage: "토큰이 만료 되었습니다." });
    //     return;
    // }

    var GitPath = req.body.gitpath;
    var UserId = req.body.id;
    var ContainerId = req.body.containerid;
    var ContainerPort = req.body.port;
    var ContainerName= req.body.containername;

    /* DB 컨테이너 GitPath 내용 변경 */
    var query = "UPDATE containers SET gitpath=\'" + GitPath + "\' WHERE userid=" + UserId + " and containerid=\'" + ContainerId + "\'";
    console.log(query);
    client.query(query).then((result) => {
        ssh.connect({
            port: ContainerPort,
            username: 'danawa',
            // username: 'root',
            host: "localhost",
            privateKey: 'C:\\Users\\admin\\.ssh\\id_rsa'
            // privateKey: '/home/sjh/.ssh/id_rsa'
        }).then(() => {
            /* 컨테이너 접근 후 git remote origin 내용 변경 */
            var command = "cd /home/danawa/" + ContainerName + "; git remote remove origin; git remote add origin " + GitPath;
            ssh.execCommand(command).then(() => {
                console.log("ssh execCommand Done!");
                res.send({ isError: false });
                ssh.dispose();
            }).catch((error3) => {
                console.log("ssh execCommand error!", error3);
                ssh.dispose();
            });
        }).catch((error2) => {
            console.log("ssh connection error! \n", error2);
            res.send({ isError: true, errorMessage: error2 });
        });

    }).catch((error) => {
        console.log("[/db/containers/git] UPDATE Error :\n", error);
        res.send({ isError: true, errorMessage: error });
    });
});


router.post('/check', (req, res) => {
    var url = req.body.url;
    axios.get(url).then((result) => {
        console.log('<< check >>');
        console.log(result.status);
        res.status(result.status).send({ status: result.status })
    }).catch((err2) => {
        console.log(url + " Error:\n", err2)
        res.status(404).send({ status: 404 });
    });

    // var cmd = 'curl -o /dev/null -w "%{http_code}" ' + url
    // exec(cmd, (err, stdout, stderr) => {
    //     if (err) {
    //         // node couldn't execute the command
    //         console.log("check cmd error", err);
    //         res.status(404).send({ status: 404 });
    //         return;
    //     }

    //     if (stdout) {
    //         console.log(stdout);
    //         res.status(stdout).send({ status: stdout })
    //         return;
    //     } else {
    //         console.log(stderr);
    //         res.status(stderr).send({ status: stderr })
    //         return;
    //     }
    // });
});


module.exports = router
