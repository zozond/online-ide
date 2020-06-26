import React from 'react';
import { Container, CssBaseline, Toolbar, withStyles, Link, Avatar, Paper, TextField, Typography, FormControlLabel, Button, Checkbox, Grid, Box } from '@material-ui/core';
import "../App.css";
import axios from 'axios';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import cookie from 'react-cookies'
import jwt from 'jsonwebtoken'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

const styles = theme => ({
    margin: {
        margin: theme.spacing(2),
    },
    padding: {
        padding: theme.spacing(1)
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        flexDirection: 'column',
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
});

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            value: '', 
            userid: '',
            loginIdError: false,
            loginPwError : false,
            isAlert :false,
            alertMessage: ""
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /* 시작했을때 */
    componentDidMount() {
        /* 쿠키가 남아 있다면  */
        
        if(cookie.load('user')){
            try{
                var decoded = jwt.verify(cookie.load('user'), 'danawa');
                console.log(decoded);
                sessionStorage.setItem("id", decoded.id)
                sessionStorage.setItem("user", decoded.user)
                sessionStorage.setItem("email", decoded.email)
                this.props.history.push("/mycontainers");
            }catch(e){
                console.log("jwt 토큰 에러 \n >>> ", e);
                this.setState({isAlert: true, alertMessage: "토큰이 만료 되었습니다. 다시 로그인을 해주세요."})
                return;
            }
        } else {
            console.log(sessionStorage.getItem('cookieExpired'));
            /* 쿠키가 없다면 */
            if(sessionStorage.getItem('cookieExpired') == "1"){
                /* 쿠키 만료  */
                this.setState({isAlert: true, alertMessage: "쿠키가 만료 되었습니다. 다시 로그인을 해주세요."})
            }else{
                /* 처음 접속 */
                // 아무것도 안함
            }
        }
    }


    /* 로그인 */
    handleSubmit = (event) => {
        event.preventDefault();
        var id = document.getElementById("userId");
        var pw = document.getElementById("password");
        var keepLogin = document.getElementById("keepLogin"); /* 쿠키로 할지 세션으로 할지 */

        /* 아이디 체크 */
        var id_regExp = /^[a-z]+[a-z0-9]{3,19}$/g;
        if( !id_regExp.test(id.value) || id.value.length > 20 || id.value.length < 4) {
            this.setState({loginIdError: true});
            return;
        }

	    /* 패스워드 체크 */
        var password_regExp = /^[0-9a-z!@#$%^*+=-]{4,16}$/;
        if(!password_regExp.test(pw.value)){
            this.setState({loginPwError: true});
            return;
        }

        var data = {};
        data.id = id.value;
        data.password = pw.value;
        data.keepLogin = keepLogin.checked ? 1 : 0;
        axios.post("/db/user/login", data).then((res) => {
            console.log(res)
            if (res.data.rows.auth != 1) {
                /* SNACK bar */
                this.setState({isAlert: true, alertMessage: "인증이 되지 않았습니다. 등록한 이메일을 확인해 주세요"});
            } else if (res.data.isUser && res.data.rows.auth == 1) {
                // console.log(res.data.rows)
                if(keepLogin.checked){
                    console.log("keepLogin  ",  keepLogin.checked)
                }else{
                    sessionStorage.setItem('Oncelogin', res.data.token);
                    cookie.remove('user');
                }
                sessionStorage.setItem("id", res.data.rows.id)
                sessionStorage.setItem("user", id.value)
                sessionStorage.setItem("email", res.data.rows.email)
                this.props.history.push("/mycontainers");
            } else if(res.data.error == 'password'){
                this.setState({loginPwError: true, isAlert: true, alertMessage: "패스워드가 올바르지 않습니다."});
            } else if(res.data.error == 'id'){
                this.setState({loginIdError: true, isAlert: true, alertMessage: "아이디가 올바르지 않습니다."});
            }
        }).catch((err) => {
            console.log("err>>",err)
            this.setState({loginIdError: true, loginPwError: true});
        });
    }

    handleAlertSnackClose = () =>{
        this.setState({isAlert: false});
    }
    render() {
        const { classes } = this.props;
        return (
            <Box width="100%" height="100%">
                <div className={classes.paper}>
                <Box display="flex" alignItems="center" justifyContent="center">
                        <Avatar className={classes.avatar}><LockOutlinedIcon /> </Avatar>
                        <Typography component="h1" variant="h5">
                            로그인
                    </Typography>
                </Box>
                <Grid container xs={4}>
                    <Paper className={classes.padding}>
                        <form className={classes.form} id="login-form" onSubmit={this.handleSubmit}>
                        <Snackbar open={this.state.isAlert} autoHideDuration={10000} onClose={this.handleAlertSnackClose}>
                                <MuiAlert elevation={6} variant="filled" severity="error">
                                    {this.state.alertMessage}
                                </MuiAlert>
                        </Snackbar>
                            <TextField
                                error={this.state.loginIdError}
                                type="text"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="userId"
                                label="아이디"
                                name="userId"
                                autoComplete="userId"
                                autoFocus
                            />
                            <TextField
                                error={this.state.loginPwError}
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="비밀번호"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" id="keepLogin"/>}
                                label="로그인 유지"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                로그인
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="/password" variant="body2">
                                        비밀번호 찾기
                                    </Link>
                                </Grid>
                                <Grid item xs>
                                    <Link href="/register" variant="body2">
                                        회원가입
                                    </Link>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                    </Grid>
                </div>
            </Box>
        );
    }
}

export default withStyles(styles)(Home);
