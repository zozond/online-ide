import React from 'react';
import { withStyles,Card,CardContent, CardHeader, Avatar, Table, FormGroup, FormControlLabel, Checkbox, Link, DialogContent, TextField, DialogActions, TableBody, AppBar, Tabs, Tab, FormControl, Input, TableRow, TableCell, Typography, Button, Grid, Box, InputLabel, Paper, TableHead } from '@material-ui/core';
import TabPanel from './TabPanel';
import LinearProgress from '@material-ui/core/LinearProgress';
import StopIcon from '@material-ui/icons/Stop';
import Toolbar from '@material-ui/core/Toolbar';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import "../App.css";
import PeopleIcon from '@material-ui/icons/People';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import axios from 'axios';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import cookie from 'react-cookies'
import jwt from 'jsonwebtoken'

// var container = "http://192.168.164.137:";
var container = "ide-test.danawa.io";

const styles = theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        }
    },
    root2: {
        '& > *': {
            flexGrow: 1,
        }
    },
    card: {
        '& > *': {
            border: 2,
            borderRadius: 32,
            boxShadow: 4
        }
    },
});

class MyContainers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sharedContainertoUsers: {},
            SharedContainers: '',
            shareDialogOpen: false,
            shareDialogOpenElement : {},
            anchorEl: null,
            containers: '',
            open: false,
            isCreated: false,
            gitModalOpen: false,
            toggleContainer: true,
            gitPath: '',
            allUsers: '',
            allUserBoxs: [],
            isAlert: false, alertMessage: ""
        };

        this.handleShareDialogOpen = this.handleShareDialogOpen.bind(this);
        this.handleInfo = this.handleInfo.bind(this);
        this.handleGitRemotePathChange = this.handleGitRemotePathChange.bind(this);
        this.handleCreatedContainerSnackClose = this.handleCreatedContainerSnackClose.bind(this);
        this.handleRedirect_CreateContainer = this.handleRedirect_CreateContainer.bind(this);
        this.handleContainerStartClick = this.handleContainerStartClick.bind(this);
        this.handleDeleteContainerDialogClose = this.handleDeleteContainerDialogClose.bind(this);
        this.handleDeleteContainerDialogOpen = this.handleDeleteContainerDialogOpen.bind(this);
        this.handleContainerDelete = this.handleContainerDelete.bind(this);
        this.handleContainerStopClick = this.handleContainerStopClick.bind(this);
        this.handleGitDialogOpen = this.handleGitDialogOpen.bind(this);
        this.handleGitDialogClose = this.handleGitDialogClose.bind(this);
        this.handleGitRemoteOriginAdd = this.handleGitRemoteOriginAdd.bind(this);
        this.handleContainerMenuClick = this.handleContainerMenuClick.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
        this.handleAlertSnackClose = this.handleAlertSnackClose.bind(this);
    }

    /* 시작 했을 때 */
    componentDidMount() {
        /* 토큰으로 로그인이 정상적으로 되어있는지 확인 */
        if (!sessionStorage.getItem('Oncelogin')) {
            /* 토큰으로 로그인이 정상적으로 되어있는지 확인 */
            if (!cookie.load('user')) {
                this.props.history.push("/");
                sessionStorage.setItem('cookieExpired', 1);
                return;
            }
            // /* 토큰이 제대로 살아 있는 지 */
            try {
                var decoded = jwt.verify(cookie.load('user'), 'danawa');
                console.log(decoded);
                sessionStorage.setItem("id", decoded.id)
                sessionStorage.setItem("user", decoded.value)
                sessionStorage.setItem("email", decoded.email)
            } catch (e) {
                console.log("jwt 토큰 에러 \n >>> ", e);
                this.props.history.push("/");
                return;
            }
        }

        /* 개발환경이 생성 되었다면 */
        var isCreated = false;
        if(sessionStorage.getItem('isCreated') == 'true') {
            isCreated = true;
        }
        this.setState({ isCreated: isCreated})

        /* 공유된 컨테이너 ID 조회 */
        axios.post('/db/share/select/userid', { sharedUserId: sessionStorage.getItem("id") }).then((res) => {
            var sharedContainers = res.data.results.rows; /* 공유된 컨테이너들 */
            console.log("sharedContainers \n", sharedContainers);
            /* 현재 유저 및 공유된 컨테이너 조회 */
            axios.post('/db/containers', { id: sessionStorage.getItem("id"), sharedContainers : sharedContainers}).then((res) => {
                console.log("/db/containers>>>", res);

                var currentUserContainers = res.data.data.rows;  /* 결과 */
                var containerids = []; 
                for(var currentUserContainer of currentUserContainers){
                    containerids.push(currentUserContainer.id);
                }
                /* 컨테이너에 공유된 유저 리스트 조회 */
                axios.post('/db/share/select/cids', {cids : containerids}).then((result) => {
                    var sharedContainertoUsers = result.data.results;
                    /* 조회된 유저 리스트들 각 container element 에 넣기 */
                    for(var i = 0; i < currentUserContainers.length; i++){
                        if(sharedContainertoUsers[currentUserContainers[i].id]){
                            /* 공유된 리스트 만들기 (형식 ex. 고길동, 둘리 ... )*/
                            var str = "";
                            var flag = false;
                            for(var username of sharedContainertoUsers[currentUserContainers[i].id]){
                                if(flag){ str += ", " }
                                str += username ;
                                flag = true;
                            }
                            currentUserContainers[i].sharedUsers = str;
                        }
                    }

                    /* 확인 후 setState에 넣기 */
                    this.setState({containers: currentUserContainers, sharedContainertoUsers : result.data.results });
                }).catch((error3) => {
                    console.log(error3);
                });
            }).catch((err2) => { console.log(err2) });
        }).catch((err) => { console.log(err) });

        /* 전체 유저 조회 */
        axios.get("/db/user/all").then((out) => {
            console.log("/db/user/all : " + out.data.rows.toString())
            var data = {};
            for (var i = 0; i < out.data.rows.length; i++) {
                data["" + out.data.rows[i].id] = false;
            }
            /* 체크박스 생성을 위한 State 업데이트 */
            console.log("allUserBoxs >>> \n", data)
            console.log("allUsers >>>\n", out.data.rows)
            this.setState({ allUserBoxs: data, allUsers: out.data.rows });
        }).catch((err) => { console.log(err) });
    }


    /* 컨테이너 생성 클릭 */
    handleRedirect_CreateContainer = (event) => {
        event.preventDefault();
        this.props.history.push("/container");
    }

    /* 컨테이너 삭제 함수 */
    handleContainerDelete = (event) => {
        var cname = document.getElementById("dialog-container-name");
        var form = {};

        form.id = sessionStorage.getItem("id");
        form.cid = sessionStorage.getItem("cid"); /* 컨테이너테이블 primary key */
        form.containername = cname.value;
        this.setState({ open: false })

        axios.post('/db/containers/delete', form).then((res) => {
            console.log(JSON.stringify(res));
            if (res.data.isUser) {
                window.location.reload();
            } else {
                this.setState({isAlert : true, alertMessage: "다른 유저의 개발환경을 삭제 시킬수 없습니다."})
            }
        }).catch((err) => { console.log(err); });
    }


    /* 컨테이너 기어버튼 클릭 시 */
    handleContainerMenuClick = (element, event) => {
        sessionStorage.setItem('ownerid', element.userid);
        sessionStorage.setItem('container', container + element.port);
        sessionStorage.setItem('containerid', element.containerid);
        sessionStorage.setItem('containerport', element.port);
        sessionStorage.setItem('containerstate', element.state);
        sessionStorage.setItem('containergitpath', element.gitpath);
        sessionStorage.setItem('cid', element.id);
        this.setState({ anchorEl: event.currentTarget });
    };

    /* 컨테이너 시작 클릭 시 */
    handleContainerStartClick = (element) => {
        if (!sessionStorage.getItem('Oncelogin')) {
            /* 토큰으로 로그인이 정상적으로 되어있는지 확인 */
            if (!cookie.load('user')) {
                this.props.history.push("/");
                sessionStorage.setItem('cookieExpired', 1);
                return;
            }
            // /* 토큰이 제대로 살아 있는 지 */
            try {
                var decoded = jwt.verify(cookie.load('user'), 'danawa');
                console.log(decoded);
            } catch (e) {
                console.log("jwt 토큰 에러 \n >>> ", e);
                this.props.history.push("/");
                return;
            }
        }

        this.setState({ anchorEl: null });

        if (element.state != '실행중' && element.userid != sessionStorage.getItem('id')) {
            this.setState({isAlert : true, alertMessage: "다른 유저의 개발환경을 시작시킬수 없습니다."})
            return;
        }

        /* 이미 컨테이너가 실행 중이라면 */
        if (element.state == '실행중') {
            var window_url = element.userid + "-" + element.containername + "." + container + ":10000/?folder=/home/danawa/" + element.containername
            console.log(window_url);
            sessionStorage.setItem('currentOpenURL', "http://" + window_url)
            window.open("http://" + window_url, '_blank', "width=1000, height=700, resizable=yes");
        } else {
            /* 컨테이너가 생성됨 or 정지됨 일 때*/
            var data = {};
            data.id = sessionStorage.getItem("id");
            data.state = element.state;
            data.containerid = element.containerid;
            data.containername = element.containername;
            data.port = element.port;
            axios.post("/db/containers/start", data).then((stdout) => {
                if (stdout.data.isUpdate) {
                    console.log(stdout.data.url);
                    sessionStorage.setItem('currentOpenURL', "http://" + stdout.data.url)
                    window.open("/loading", stdout.data.url, "width=1000, height=700, toolbar=no, menubar=no, scrollbars=no, resizable=yes");
                    window.location.reload();
                } else {
                    this.setState({isAlert : true, alertMessage: "정상적으로 시작 되지 못했습니다."})
                }
            }).catch((err2) => {
                console.log(err2);
                this.setState({isAlert : true, alertMessage: "관리 서버와 연결 에러"})
            });
        }
    }

    /* 컨테이너 중지 버튼 */
    handleContainerStopClick = (element) => {
        /* 다른사람의 컨테이너에는 접근만 가능. 중지 시킬수 없음. */
        if (element.userid != sessionStorage.getItem('id')) {
            this.setState({isAlert : true, alertMessage: "다른 유저의 컨테이너를 중지시킬수 없습니다."})
            return;
        }

        var progress = document.getElementById(element.containerid);
        progress.style.display = 'block';
        /* 컨테이너의 상태가 실행중일때만 중지 가능 */
        if (element.state == '실행중') {
            var data = {};
            data.id = sessionStorage.getItem("id");
            data.containerid = element.containerid;
            data.port = element.port;
            axios.post("/db/containers/stop", data).then((stdout) => {
                if (stdout.data.isUpdate) {
                    progress.style.display = 'none';
                    window.location.reload();
                } else {
                    progress.style.display = 'none';
                    this.setState({isAlert : true, alertMessage: "컨테이너 중지가 정상적으로 되지 않았습니다."})
                    console.log()
                    window.location.reload();
                }
            }).catch((err2) => {
                console.log(err2);
                progress.style.display = 'none';
                this.setState({isAlert : true, alertMessage: "컨테이너 중지가 정상적으로 되지 않았습니다."})
                window.location.reload();
            });
        } else {
            /* 생성됨 상태이거나 중지됨 상태 */
            progress.style.display = 'none';
            this.setState({isAlert : true, alertMessage: "개발환경이 '생성됨' 상태이거나 '중지됨' 상태입니다."})
        }
    }


    /* 개발환경 삭제 팝업 닫기  */
    handleDeleteContainerDialogClose = (event) => {
        event.preventDefault();
        this.setState({ open: false, anchorEl: null })
    }

    /* 개발환경 삭제 팝업 열기  */
    handleDeleteContainerDialogOpen = (event) => {
        event.preventDefault();
        this.setState({ open: true })
    }

    /* 로그아웃 버튼 */
    handleLogOut = (event) => {
        event.preventDefault();
        sessionStorage.clear();
        this.props.history.push("/");
    }

    /* Git Remote 저장소 변경 팝업 오픈  */
    handleGitDialogOpen = () => {
        this.setState({ gitModalOpen: true, anchorEl: null, gitPath: sessionStorage.getItem('containergitpath') });
    }
    /* Git Remote 저장소 변경 팝업 닫기  */
    handleGitDialogClose = (event) => {
        this.setState({ gitModalOpen: false })
        sessionStorage.removeItem("containerid");
    }

    /* Git Remote 저장소 변경 적용  */
    handleGitRemoteOriginAdd = (event) => {
        var gitpath = document.getElementById("mGitPath");
        var data = {};
        data.id = sessionStorage.getItem("id");
        data.containerid = sessionStorage.getItem("containerid");
        data.gitpath = gitpath.value;
        data.port = sessionStorage.getItem("containerport");

        axios.post("/db/containers/path", data).then((res) => {
            console.log(res);
            window.location.reload();
        }).catch((err) => {
            console.log(err);
            this.setState({isAlert : true, alertMessage: "Git Remote 저장소를 변경하는 도중 에러가 생겼습니다."})
        });

        sessionStorage.removeItem("containerid");
        this.setState({ gitModalOpen: false })
    }

    /* 새로운 개발환경 생성 되었을때 */
    handleCreatedContainerSnackClose = () => {
        this.setState({ isCreated: false })
        sessionStorage.removeItem('isCreated');
    }

    /* Git Remote 저장소 입력 및 변경시 함수 */
    handleGitRemotePathChange = (event) => {
        this.setState({ gitPath: event.target.value })
    }

    /* 내정보 창으로 이동 */
    handleInfo = () => {
        this.props.history.push("/info");
    }

    /* 앱 열기 버튼 클릭 */
    handleContainerAppStartClick = (element) => {
        /* 이미 컨테이너가 실행 중이라면 */
        if (element.state == '실행중') {
            var window_url = element.userid + "-" + element.containername + "." + container + ":18080/";
            console.log(window_url);
            sessionStorage.setItem('currentOpenURL', "http://" + window_url)

            /* 이 포트가 활성화 된 포트인지 확인 */
            axios.post('/db/containers/check', { url: sessionStorage.getItem('currentOpenURL') }).then((result) => {
                console.log(result)
                if (result.status == 200) {
                    window.open("http://" + window_url, "menubar=yes,addressbar=yes,location=yes,width=1000, height=700, toolbar=yes, scrollbars=yes, resizable=yes");
                } else {
                    /* 다른 status 일 때 */
                    this.setState({isAlert : true, alertMessage: "앱이 실행 중이 아닙니다."})
                }
            }).catch((error) => {
                /* 에러 일 때 */
                console.log(error);
                this.setState({isAlert : true, alertMessage: "앱이 실행 중이 아닙니다."})
            });
        } else {
            /* 컨테이너가 생성됨 or 정지됨 일 때*/
            this.setState({isAlert : true, alertMessage: '컨테이너를 시작해 주세요!'})
        }
    }

    /* 공유하기 버튼 클릭 */
    handleShareDialogOpen = () => {
        if(sessionStorage.getItem('ownerid') != sessionStorage.getItem('id')){
            this.setState({isAlert : true, alertMessage: "공유하기는 자기 자신이 만든 환경만 할 수 있습니다"})
            return;
        }

        var data = {};
        data.cid = sessionStorage.getItem('cid');
        console.log(data);
        axios.post('/db/share/select/cid', data).then((results) => {
            console.log(results)
            if (results.isError) {
                this.setState({isAlert : true, alertMessage: "공유할 목록을 불러오는 도중 에러가 생겼습니다"})
            } else {
                var sharedUsers = results.data.results.rows;
                var allUserBoxs = this.state.allUserBoxs;
                for (var i = 0; i < allUserBoxs.length; i++) {
                    allUserBoxs[i] = false;
                }
                for (var i = 0; i < sharedUsers.length; i++) {
                    console.log(sharedUsers[i])
                    allUserBoxs[sharedUsers[i].userid] = true;
                }
                console.log(allUserBoxs)
                this.setState({ shareDialogOpen: true, allUserBoxs: allUserBoxs});
            }
        }).catch((err) => {
            console.log(err)
            this.setState({isAlert : true, alertMessage: "공유할 목록을 불러오는 도중 에러가 생겼습니다."})
        });
    }

    /* 공유하기 Dialog Close */
    handleShareDialogClose = () => {
        var data = {};
        data.cid = sessionStorage.getItem('cid');
        data.sharedUserId = [];
        data.sharedUserName = [];
        var users = this.state.allUsers;
        var boxs = this.state.allUserBoxs;
        for (var i = 0; i < users.length; i++) {
            if (users.id == sessionStorage.getItem('cid')) continue;

            if (boxs["" + users[i].id]) {
                data.sharedUserId.push(users[i].id);
                data.sharedUserName.push(users[i].username);
                boxs["" + users[i].id] = false;
            }
        }
        console.log(boxs);
        /* 공유 된 내용 적용 */
        axios.post('/db/share/update', data).then((result) => {
            console.log(result)
            if (result.isError) {
                this.setState({isAlert : true, alertMessage: "공유하기를 적용하는 도중 에러가 생겼습니다."})
                return;
            }
            window.location.reload();
        }).catch((err) => {
            console.log(err)
            this.setState({isAlert : true, alertMessage: "공유하기를 적용하는 도중 에러가 생겼습니다."})
        });
        this.setState({ shareDialogOpen: false , allUserBoxs: boxs });
    }

    /* 공유하기 Dialog에서 체크박스 다루기 */
    handleCheckBox = (Id) => {
        console.log("checkbox " + this.state.allUserBoxs[Id])
        var cbox = this.state.allUserBoxs;
        if (cbox[Id]) {
            cbox[Id] = false;
        } else {
            cbox[Id] = true;
        }
        this.setState({ allUserBoxs: cbox })
    }

    /* 스낵바 닫기 */
    handleAlertSnackClose = () => {
        this.setState({ isAlert: false })
    }

    render() {
        const { classes } = this.props;
        return (
            <Box width="100%" height="100%">
                <Box>
                    <Toolbar width='100%' display='flex' >
                        <Box width='100%' display='flex' flexDirection='row' alignItems='center' justifyContent='center'>
                            <Box display="flex" flexDirection='column' alignItems='flex-start' width='40%'>
                                <div className={classes.root}>
                                    <Button variant="contained" color="primary" onClick={this.handleInfo}> 내 정보 </Button>
                                </div>
                            </Box>

                            <Box display='flex' flexDirection='row' alignItems='center' justifyContent='center' width='100%'>
                                <Box>
                                    <Typography className="typography" type="title" color="inherit" variant="h4">
                                        개발 환경
                                    </Typography>
                                </Box>
                            </Box>

                            <Box display="flex" justifyContent="flex-end" width="40%">
                                <div className={classes.root}>
                                    <Button variant="outlined" color="primary" onClick={this.handleRedirect_CreateContainer}>
                                        개발 환경 생성
                                    </Button>
                                </div>
                                <Dialog onClose={this.handleDeleteContainerDialogClose} aria-labelledby="dialog-title" open={this.state.open}>
                                    <DialogTitle id="dialog-title">삭제 하시겠습니까?</DialogTitle>
                                    <Box width={500} padding={2}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor="dialog-container-name">개발 환경의 이름을 입력해 주세요.</InputLabel>
                                            <Input
                                                required variant="outlined"
                                                margin="dense"
                                                aria-describedby="my-helper-text"
                                                id="dialog-container-name"
                                                label="dialog-container-name"
                                                name="dialog-container-name"
                                                autoComplete="Ex. My Container Name"
                                                autoFocus
                                            />
                                        </FormControl>
                                        <Button variant="contained" color="secondary" onClick={this.handleContainerDelete}> 제출 </Button>
                                    </Box>
                                </Dialog>
                                <Dialog open={this.state.gitModalOpen} onClose={this.handleGitDialogClose} maxWidth="md">
                                    <DialogTitle>저장소 설정</DialogTitle>
                                    <DialogContent >
                                        <TextField label="저장소를 넣어주세요" type="text" name="mGitPath" id="mGitPath" style={{ minWidth: "50vh" }} onChange={this.handleGitRemotePathChange} value={this.state.gitPath} />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button variant="contained" color="primary" onClick={this.handleGitRemoteOriginAdd}>추가</Button>
                                        <Button variant="outlined" color="primary" onClick={this.handleGitDialogClose}>닫기</Button>
                                    </DialogActions>
                                </Dialog>
                            </Box>
                        </Box>
                    </Toolbar>
                    <AppBar position='static'>
                        <Box width='100%' display='flex' flexDirection='column' alignItems='center'>
                            <Tabs value={0} onChange={this.handlePanelChange} aria-label='simple tabs example'>
                                <Tab label='내 개발 환경' />
                            </Tabs>
                        </Box>
                    </AppBar>

                    <TabPanel value={0} index={0} >
                        <Box width="100%" height="100%" m={1} p={1}>
                            <Snackbar open={this.state.isCreated} autoHideDuration={10000} onClose={this.handleCreatedContainerSnackClose}>
                                <MuiAlert elevation={6} variant="filled" severity="info">
                                    새로운 개발 환경이 생성 되었습니다.
                                </MuiAlert>
                            </Snackbar>
                            <Snackbar open={this.state.isAlert} autoHideDuration={10000} onClose={this.handleAlertSnackClose}>
                                <MuiAlert elevation={6} variant="filled" severity="error">
                                    {this.state.alertMessage}
                                </MuiAlert>
                            </Snackbar>
                            <Grid container spacing={2}  >
                                <Dialog open={this.state.shareDialogOpen} onClose={this.handleShareDialogClose} maxwidth="xs" >
                                    <DialogTitle>공유 하기</DialogTitle>
                                    <DialogActions>
                                        <Button onClick={this.handleShareDialogClose}>
                                            닫기
                                        </Button>
                                    </DialogActions>
                                    <DialogContent>
                                        <Box>
                                            {this.state.allUsers.length > 0 ? this.state.allUsers.map((element) => {
                                                if (element.id == sessionStorage.getItem("id")) {
                                                    return <React.Fragment key={"my"}></React.Fragment>;
                                                }
                                                var labeling = element.username + " (" + element.email + ")";
                                                return <FormGroup key={element.id + "_key"} row p={2}>
                                                    <FormControlLabel control={<Checkbox id={element.id + ""} name="chk_box" checked={this.state.allUserBoxs[element.id]} color="primary" onChange={this.handleCheckBox.bind(this, element.id)} />} label={labeling} />
                                                </FormGroup>
                                            }) : <FormGroup row p={2} key={"Key"}>
                                                    <FormControlLabel control={<Checkbox id="0" name="chk_box" checked={false} color="primary" />} label="Nothing" />
                                                </FormGroup>}
                                        </Box>
                                    </DialogContent>
                                </Dialog>

                                {this.state.containers.length > 0 ? this.state.containers.map((element) => {
                                    var link = "https://ide.goorm.io/static/imgs/icon/softwareStack/" + element.stack + "_logo.svg";

                                    var name = element.containername;
                                    var description = element.description;
                                    return <Grid item xs={4} key={"BOX_" + element.id} zeroMinWidth wrap="nowrap">
                                        <Card elevation={3} >
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" >
                                                    <Avatar style={{ width: "80px", height: "80px" }} alt="Image" variant="rounded" src={link} />
                                                    <Box display="flex" alignItems="center" justifyContent="center">
                                                        <h2>{name}</h2>
                                                        {element.shared == 1 ? <Avatar variant="rounded" style={{backgroundColor:"white", color:"grey"}}><PeopleIcon  /></Avatar>  :<></>}
                                                    </Box>
                                                    <Box>
                                                    <Button aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleContainerMenuClick.bind(this, element)}>
                                                        <SettingsIcon></SettingsIcon>
                                                    </Button>
                                                    <Menu
                                                        anchorEl={this.state.anchorEl}
                                                        keepMounted
                                                        open={Boolean(this.state.anchorEl)}
                                                        onClose={this.handleDeleteContainerDialogClose}>
                                                        
                                                        <MenuItem onClick={this.handleShareDialogOpen.bind(element)}> 공유하기 </MenuItem>
                                                        <MenuItem onClick={this.handleGitDialogOpen}>저장소 관리</MenuItem>
                                                        <MenuItem onClick={this.handleDeleteContainerDialogOpen}>환경 삭제</MenuItem>
                                                    </Menu>
                                                    </Box>
                                                </Box>
                                                <Table size="small">
                                                    <colgroup>
                                                        <col style={{minWidth:'100px', maxWidth: '100px'}}/>
                                                        <col style={{minWidth:'230px'}}/>
                                                    </colgroup>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell style={{width: '100px'}}></TableCell>
                                                            <TableCell></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                        <TableBody>
                                                            <TableRow hover >
                                                                <TableCell style={{width: '100px', whiteSpace: "nowrap"}}>아이디: </TableCell>
                                                                <TableCell >{element.containerid.substr(0, 12)}</TableCell>
                                                            </TableRow>
                                                            <TableRow hover>
                                                                <TableCell style={{whiteSpace: "nowrap"}}>상태: </TableCell>
                                                                <TableCell > 
                                                                    {element.state}
                                                                    {element.state == '실행중' ? 
                                                                        <IconButton edge="end" size="small" color="primary" onClick={this.handleContainerStopClick.bind(this, element)} ><StopIcon /> </IconButton>
                                                                        : <></>}
                                                                    <div id={element.containerid} style={{ display: 'none' }}> <LinearProgress /> </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            
                                                            <TableRow hover>
                                                                <TableCell style={{whiteSpace: "nowrap"}}>설명:</TableCell>
                                                                <TableCell >{description}</TableCell>
                                                            </TableRow>
                                                            <TableRow hover>
                                                                <TableCell style={{whiteSpace: "nowrap"}}>소유자:</TableCell>
                                                                <TableCell >{element.username}</TableCell>
                                                            </TableRow>
                                                            <TableRow hover>
                                                                <TableCell style={{whiteSpace: "nowrap"}}>저장소:</TableCell>
                                                                <TableCell>
                                                                    <Box style={{width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                                                        {element.gitpath ? <Link variant='inherit' href={element.gitpath} target="_blank"> {element.gitpath} </Link> : "저장소 없음"}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow hover>
                                                                <TableCell >공유:</TableCell>
                                                                <TableCell >
                                                                    <Box style={{width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                                                        {element.sharedUsers ? element.sharedUsers : "공유 되지 않음"}
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                    <div className={classes.root}>
                                                        <Button variant="outlined" color="primary" onClick={this.handleContainerStartClick.bind(this, element)}> 편집기 열기 </Button>
                                                        <Button variant="outlined" color="primary" onClick={this.handleContainerAppStartClick.bind(this, element)}> 앱 열기 </Button>
                                                    </div>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                }) : <Grid item xs={4} key="BOX_KEY"> <label> 현재 개발 환경이 없습니다 .</label></Grid> }
                            </Grid>
                        </Box>
                    </TabPanel>
                </Box>
            </Box>
        );
    }
}

export default withStyles(styles)(MyContainers);
