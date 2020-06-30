import React from 'react';
import axios from 'axios';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Container, Input, NativeSelect, Typography, Button, Grid, InputLabel, FormControl, Box, FormHelperText } from '@material-ui/core';
import "../App.css";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import cookie from 'react-cookies'
import jwt from 'jsonwebtoken'

const styles = {
    paper: {
        textAlign: 'center',
        margin: "4px"
    },
    formControl: {
        minWidth: 120,
    },
};

class CreateContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: '', open: "false", images: {}, imageList: [], framework: {}, selectFrameworkError: false, selectVersionError: false, nameError: false, nameErrorMessage: false, isAlert: false, alertMessage: "" };
        this.handleSoftwareStackButton = this.handleSoftwareStackButton.bind(this);
        this.handleCreateContainerSubmit = this.handleCreateContainerSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleAlertSnackClose = this.handleAlertSnackClose.bind(this);
        this.handleInput_EngAndDigit = this.handleInput_EngAndDigit.bind(this);
    }

    /* 시작 할 때 */
    componentDidMount() {
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

        axios.get('/db/images').then((res) => {
            var images = res.data.yaml;
            var list = [];
            /* 접근은 이렇게 하면 됨. */
            for (var item in images) {
                list.push(item);
            }
            this.setState({ images: images, imageList: list });
        }).catch((error) => {
            console.log(error);
        });
    }

    /* 컨테이너 생성 Submit 버튼 동작  */
    handleCreateContainerSubmit = (event) => {
        var name = document.getElementById('container-name');
        var description = document.getElementById('description');
        var stack = "";

        /* 개발 환경 이름 체크 */
        var containerName_regExp = /^[a-z]+[a-z0-9\-]{3,16}$/;  //영문, 숫자 입력
        if (!containerName_regExp.test(name.value)) {
            this.setState({ nameError: true, nameErrorMessage: true })
            return;
        } else {
            this.setState({ nameError: false, nameErrorMessage: false })
        }

        /* 프레임워크가 선택 되었는지 */
        var framework = document.getElementById('framework');
        if (framework.options[framework.selectedIndex].value.length <= 0) {
            this.setState({ selectFrameworkError: true })
            return;
        } else {
            this.setState({ selectFrameworkError: false })
        }

        /* 버전이 선택 되었는지 */
        var version = document.getElementById('version');
        if (version.options[version.selectedIndex].value.length <= 0) {
            this.setState({ selectVersionError: true })
            return;
        } else {
            this.setState({ selectVersionError: false })
        }

        /* docker image URL */
        var getUrl = this.state.images;
        console.log(getUrl);
        var toggleButtons = document.getElementsByName('toggleButton');
        for (var button of toggleButtons) {
            console.log(button)
            if (button.classList.contains("Mui-selected")) {
                getUrl = getUrl[button.value];
                stack = button.value;
                break;
            }
        }

        getUrl = getUrl[framework.options[framework.selectedIndex].value];
        getUrl = getUrl[version.options[version.selectedIndex].value];
        var Image = getUrl.url;

        var dockerForm = {
            "Image": "",
            "Hostname": "",
            "ExposedPorts": {
            },
            "Labels": {
                "Description": ""
            },
            "HostConfig": {
                "Dns": [
                    "8.8.8.8"
                ],
                "PortBindings": {
                }
            }
        }

        dockerForm.Hostname = name.value.replace(/ /g, "").toLowerCase(); /* 공백제거 */
        dockerForm.Image = Image;
        dockerForm.Labels.Description = description.value;
        dockerForm.Labels.Stack = stack;
        dockerForm.Labels.UserId = sessionStorage.getItem("id");
        dockerForm.Labels.UserName = sessionStorage.getItem("user");
        dockerForm.Labels.GitPath = "";
        dockerForm.Env = [];
        console.log(dockerForm);


        var gitRepo = document.getElementById('gitRepo').value;
        dockerForm.Env.push("GIT_USERNAME=" + sessionStorage.getItem('user'));
        dockerForm.Env.push("GIT_USERMAIL=" + sessionStorage.getItem('email'));
        if (gitRepo.length > 0) {
            let gitRepo_regExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
            if (!gitRepo_regExp.test(gitRepo)) {
                this.setState({ isAlert: true, alertMessage: "Git 주소를 제대로 입력해 주세요." })
                return;
            }

            dockerForm.Env.push("GIT_REPO=" + gitRepo);
            dockerForm.Labels.GitPath = gitRepo;

            var gitId = document.getElementById('gitId').value;
            var gitPassword = document.getElementById('gitPassword').value;
            if (gitId.length > 0 && gitPassword.length > 0) {
                var pattern = /^(?:http:\/\/|www\.|https:\/\/)([^\/]+)/i;
                var domain = gitRepo.match(pattern);
                var plainDomain = domain[1];
                gitPassword = encodeURIComponent(gitPassword);
                var credentials = "https://" + gitId + ":" + gitPassword + "@" + plainDomain;
                dockerForm.Env.push("GIT_CREDENTIALS=" + credentials);
            } else if (gitId.length > 0 || gitPassword.length > 0) {
                this.setState({ isAlert: true, alertMessage: "Git 아이디와 비밀번호를 제대로 입력해 주세요." })
                return;
            }

        }
        axios.post('/db/containers/create', dockerForm).then((res) => {
            console.log(res);
            if (res.data.error) {
                this.setState({ isAlert: true, alertMessage: "중복된 이름으로 컨테이너 생성에 실패 하였습니다." })
            } else {
                sessionStorage.setItem('isCreated', true);
                this.props.history.push("/mycontainers");
            }
        }).catch((err) => {
            this.setState({ isAlert: true, alertMessage: "컨테이너 생성에 실패 하였습니다." })
            console.log(err)
        });

    }


    /* 프레임워크 버튼 클릭 시 */
    handleFramework = (event) => {
        var version = document.getElementById('version')
        var list = this.state.framework[event.target.value]
        var innerHTML = '<option aria-label="None" value="" />';
        for (var item in list) {
            innerHTML += '<option value="' + item + '">' + item + '</option>';
        }
        version.innerHTML = innerHTML;
    }

    /* 소프트웨어 스택 버튼 동작 */
    handleSoftwareStackButton = (event, value) => {
        event.preventDefault();

        var framework = document.getElementById('framework');
        var toggleButtons = document.getElementsByName('toggleButton');
        for (var button of toggleButtons) {
            if (button.value == value[0]) {
                button.classList.add("Mui-selected");
                var innerHTML = '<option aria-label="None" value="" />';
                var obj = this.state.images[value[0]];
                for (var item in this.state.images[value[0]]) {
                    innerHTML += '<option value="' + item + '">' + item + '</option>';
                }
                framework.innerHTML = innerHTML;
                this.setState({ framework: obj });
            } else {
                button.classList.remove("Mui-selected");
            }
        }
        var version = document.getElementById('version')
        version.innerHTML = '<option aria-label="None" value="" />';
    }

    /* 영어와 숫자로만 입력하게 하기 */
    handleInput_EngAndDigit = (event) => {
        let value = event.target.value;
        value = value.replace(/[^a-z0-9\-]/gi, '').toLowerCase();
        //value = value.replace(/[^a-z0-9]/gi, '').toLowerCase();
        let name = document.getElementById('container-name')
        name.value = value;
    }

    /* 뒤로가기 */
    handleBack = (event) => {
        this.props.history.go(-1);
    }

    /* 팀환경을 선택 했을때 */
    handleEnvTeam = (event) => {
        var env_team = document.getElementById('env_teamname');
        if (event.target.value == 'team') {
            env_team.style.display = 'block';
        } else {
            env_team.style.display = 'none';
        }
    }

    /* 스낵바 닫기 */
    handleAlertSnackClose = () => {
        this.setState({ isAlert: false })
    }

    render() {
        const { classes } = this.props;
        return (
            <Box width="100%" height="100%">
                <div className={classes.paper}>
                    <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
                        <Button variant="contained" color="primary" className={classes.submit} onClick={this.handleBack}>뒤로가기</Button>
                        <Typography component="h1" variant="h5">
                            개발 환경 생성
                            </Typography>
                        <Box align="right">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={this.handleCreateContainerSubmit}
                            > 생성
                            </Button>
                        </Box>
                    </Box>
                    <form style={{ width: "100%" }} id="form" action="/send" method="post">
                        <Snackbar open={this.state.isAlert} autoHideDuration={10000} onClose={this.handleAlertSnackClose}>
                            <MuiAlert elevation={6} variant="filled" severity="error">
                                {this.state.alertMessage}
                            </MuiAlert>
                        </Snackbar>
                        <Grid container spacing={3} alignItems="center" justify="center" >
                            <Grid item xs={6}>
                                <FormControl fullWidth error={this.state.nameError}>
                                    <InputLabel htmlFor="container-name">개발 환경 이름 (필수) </InputLabel>
                                    <Input
                                        required
                                        variant="outlined"
                                        margin="dense"
                                        aria-describedby="my-helper-text"
                                        id="container-name"
                                        label="개발 환경 이름"
                                        name="container-name"
                                        autoComplete="개발 환경 이름을 입력하세요 "
                                        onChange={this.handleInput_EngAndDigit}
                                        autoFocus
                                    />
                                    <FormHelperText error={this.state.nameErrorMessage}>영문으로 시작되고 영문, 숫자, 대시('-') 조합으로 4자리 이상 16자리 이하로 설정해 주세요</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="center" justify="center" >
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="description">개발 환경 설명 </InputLabel>
                                    <Input
                                        required variant="outlined"
                                        margin="dense"
                                        aria-describedby="my-helper-text"
                                        id="description"
                                        label="설명"
                                        name="description"
                                        autoComplete="개발 환경에 대한 설명을 입력하세요"
                                    />
                                </FormControl>
                                <FormHelperText>선택, 100자 제한</FormHelperText>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="center" justify="center" >
                            <Grid item xs={6}>
                                <label> <h3> <strong>소프트웨어 스택 </strong> </h3></label>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="center" justify="center" direction="column">
                            <Grid item xs={6}>
                                <div style={{ padding: 2, flex: 1, flexWrap: "wrap" }} >
                                    <ToggleButtonGroup onChange={this.handleSoftwareStackButton}>
                                        {this.state.imageList ? this.state.imageList.map((item) => {
                                            let src = "https://ide.goorm.io/static/imgs/icon/softwareStack/" + item + "_logo.svg"
                                            return <ToggleButton key={"key_" + item} id={item} margin="dense" variant="contained" name="toggleButton" value={item}>
                                                <div>
                                                    <img style={{ width: "100px", height: "100px" }} src={src} alt={item} />
                                                    <div>{item}</div>
                                                </div>
                                            </ToggleButton>
                                        }) : <ToggleButton id="none" margin="dense" variant="contained" value="none" selected={true}>현재 준비된 이미지가 없습니다.</ToggleButton>}
                                    </ToggleButtonGroup>
                                </div>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl id="frameworkForm" fullWidth className={classes.formControl} error={this.state.selectFrameworkError} >
                                    <InputLabel htmlFor="framework"> 프레임워크를 선택해 주세요 </InputLabel>
                                    <NativeSelect style={{ width: '300px' }} onChange={this.handleFramework} required variant="standard" inputProps={{ name: 'framework', id: 'framework', }}>
                                        <option aria-label="None" value="" />
                                    </NativeSelect>
                                    <FormHelperText>필수</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl id="versionForm" fullWidth className={classes.formControl} error={this.state.selectVersionError}>
                                    <InputLabel htmlFor="version"> 버전을 선택해 주세요 </InputLabel>
                                    <NativeSelect style={{ width: '300px' }} required variant="standard" inputProps={{ name: 'Template', id: 'version', }}>
                                        <option aria-label="None" value="" />
                                    </NativeSelect>
                                    <FormHelperText>필수</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="center" justify="center" >
                            <Grid item xs={6}>
                                <FormControl fullWidth className={classes.formControl}>
                                    <InputLabel htmlFor="gitRepo"> Git 저장소 URL </InputLabel>
                                    <Input
                                        required variant="outlined"
                                        margin="dense"
                                        aria-describedby="my-helper-text"
                                        id="gitRepo"
                                        label="설명"
                                        name="gitRepo"
                                        autoComplete="Git URL"
                                    />
                                </FormControl>
                                <FormHelperText>선택</FormHelperText>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="center" justify="center" >
                            <Grid item xs={6}>
                                <FormControl fullWidth className={classes.formControl}>
                                    <InputLabel htmlFor="gitId"> Git User Id</InputLabel>
                                    <Input
                                        required variant="outlined"
                                        margin="dense"
                                        aria-describedby="my-helper-text"
                                        id="gitId"
                                        label="설명"
                                        name="gitId"
                                        autoComplete="Git User Id"
                                    />
                                </FormControl>
                                <FormHelperText>선택</FormHelperText>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="center" justify="center" >
                            <Grid item xs={6}>
                                <FormControl fullWidth className={classes.formControl}>
                                    <InputLabel htmlFor="gitPassword"> Git Password</InputLabel>
                                    <Input
                                        type="password"
                                        required variant="outlined"
                                        margin="dense"
                                        aria-describedby="my-helper-text"
                                        id="gitPassword"
                                        label="설명"
                                        name="gitPassword"
                                        autoComplete="Git User Password"
                                    />
                                    <FormHelperText>선택</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </Box>
        );
    }
}

export default withStyles(styles)(CreateContainer);

