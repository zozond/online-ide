var express = require('express'); // 설치한 express module을 불러와서 변수(express)에 담습니다.
var app = express(); //express를 실행하여 app object를 초기화 합니다.
var axios = require('axios');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const user = require('./routes/user');
const containers = require('./routes/containers');
const share = require('./routes/share');
const images = require('./routes/images');

var exec = require("child_process").exec;

const port = 3001;
var docker = "http://localhost:2375";

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

/* 사용할 URI 별 router */
app.use('/db/user', user);
app.use('/db/containers', containers);
app.use('/db/share', share);
app.use('/db/images', images);

/* 컨테이너에 접속해서 ssh 로 git config 나 remote setting을 위한 RSA 키 값 가져오기*/
// var cmd = "cat /home/sjh/.ssh/id_rsa.pub"
var cmd = "type C:\\Users\\admin\\.ssh\\id_rsa.pub"
exec(cmd, (err, stdout, stderr) => {
    if(err) {
        console.log("CMD Error! : " + cmd + "\n" + err);
        return;
    }

    if(stderr) {
        console.log("stderr Error! :\n" + cmd + "\n" + stderr);
        return;
    }
    console.log(stdout);

    /* Docker REST API Json 폼 생성 */
    var rsa = stdout;
    var proxyForm = {
        "Image": "",
        "Hostname": "",
        "ExposedPorts": {},
        "Labels": {
            "Description": ""
        },
        "HostConfig": {
            "Dns": [
                "8.8.8.8"
            ],
            "PortBindings": {}
        }
    };
    proxyForm.Hostname = "haproxy";
    proxyForm.Image = "dcr.danawa.io/haproxy-restapi:4.3";
    proxyForm.Labels.Stack = "proxy";
    proxyForm.Volumes = {
        "/etc/haproxy": { }
        }
    
    proxyForm.Labels.ProxyRESTAPIPort = "9999";
    proxyForm.Labels.ProxyPort = "10000";
    proxyForm.HostConfig.Binds = [];
    // proxyForm.HostConfig.Binds.push("/home/sjh/remarks/online-ide/db-rest-api/proxy_files" + ":" + "/etc/haproxy");
   proxyForm.HostConfig.Binds.push("C:\\Users\\admin\\Desktop\\test2\\online-ide\\db-rest-api\\proxy_files" + ":" +  "/etc/haproxy");
    var ExposedPort = "10000/tcp";
    var ExposedPort2 = "9999/tcp";
    var ExposedPort3 = "8080/tcp";
    proxyForm.ExposedPorts[ExposedPort] = {};
    proxyForm.ExposedPorts[ExposedPort2] = {};
	proxyForm.ExposedPorts[ExposedPort3] = {};

    proxyForm.HostConfig.PortBindings[ExposedPort] = [];
    proxyForm.HostConfig.PortBindings[ExposedPort].push({ "HostPort": "10000" });
    proxyForm.HostConfig.PortBindings[ExposedPort2] = [];
    proxyForm.HostConfig.PortBindings[ExposedPort2].push({ "HostPort": "6666" });
    proxyForm.HostConfig.PortBindings[ExposedPort3] = [];
    proxyForm.HostConfig.PortBindings[ExposedPort3].push({ "HostPort": "18080" });

    proxyForm.Env = []
    proxyForm.Env.push("RSA=\'" + rsa + "\'");


	/* HAProxy로 교체*/

    /* HAPROXY proxy를 처음 시작할 때 같이 띄워줌 */
    axios.post(docker + '/containers/create?name=haproxy', proxyForm).then((createdContainer) => {
        axios.post(docker + '/containers/' + createdContainer.data.Id + '/start').then((result) => {
            console.log("HAProxy Container Started!");
        }).catch((err) => {
            if (Number(err.response.status) == 304) {
                console.log("Proxy Container Already Started: \n" + err);
            } else if (Number(err.response.status) == 404) {
                console.log("Proxy Container Start No Such Container: \n" + err);
                process.exit();
            } else if (Number(err.response.status) == 500) {
                console.log("Proxy Container Start Server Error: \n" + err);
                process.exit();
            } else {
                console.log("Proxy Container Start Something Strange Error: \n" + err);
                process.exit();
            }
        });
    }).catch((err2) => {
        if (Number(err2.response.status) == 409) {
            console.log("Proxy Container create Conflict Proxy Name: \n" + err2);
        } else if (Number(err2.response.status) == 404) {
            console.log("Proxy Container create No Such Proxy Image: \n" + err2);
            process.exit();
        } else if (Number(err2.response.status) == 400) {
            console.log("Proxy Container create Bad Parameter: \n" + err2);
            process.exit();
        } else if (Number(err2.response.status) == 500) {
            console.log("Proxy Container create Server Error: \n" + err2);
            process.exit();
        } else {
            console.log("Proxy Container create Something Strange Error: \n" + err2);
            process.exit();
        }
    });
})

/* 제대로 떴는지 확인 할 URI */
app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
