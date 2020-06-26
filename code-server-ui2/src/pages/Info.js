import React from 'react';
import axios from 'axios';

import { Avatar, withStyles, TableBody, TableCell, Table, TableRow, Paper } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import cookie from 'react-cookies'
import jwt from 'jsonwebtoken'

const styles = theme => ({
    margin: {
        margin: theme.spacing(2),
    },
    padding: {
        padding: theme.spacing(1),
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    paper2: {
        textAlign: 'center',
        margin: "4px"
    },
    avatar: {
        // margin: theme.spacing(1),
        // flexDirection: 'column',
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
});

class Info extends React.Component {
    constructor(props) {
        super(props);
        this.state = { userinfo: '', isAlert: false, alertMessage: "" };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAlertSnackClose = this.handleAlertSnackClose.bind(this);
    }
    /* 스낵바 닫기 */
    handleAlertSnackClose = () => {
        this.setState({ isAlert: false })
    }

    componentDidMount() {
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


        /* UserId로 조회 */
        axios.post('/db/user', { id: sessionStorage.getItem("id") })
            .then((res) => {
                this.setState({ userinfo: res.data.rows });
            })
            .catch((err) => {
                console.log(err)
            });
    }

    /* 뒤로가기 */
    handleBack = () => {
        this.props.history.goBack();
    }

    /* 로그아웃 버튼 */
    handleLogOut = (event) => {
        event.preventDefault();
        cookie.remove('user');
        sessionStorage.clear();
        this.props.history.push("/");
    }

    /* 패스워드 변경 */
    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({ isAlert: false });
        var currentPassword = document.getElementById("currentPassword");
        var newPassword = document.getElementById("newPassword");
        var newPasswordConfirm = document.getElementById("newPasswordConfirm");
        if (newPassword.value != newPasswordConfirm.value) {
            this.setState({ isAlert: true, alertMessage: "입력한 패스워드와 확인 패스워드를 같게 입력해 주세요" })
            return;
        }
        var userinfo = this.state.userinfo;
        if (userinfo.password != currentPassword.value) {
            this.setState({ isAlert: true, alertMessage: "현재 패스워드와 입력한 현재 패스워드가 다릅니다" })
            return;
        }

        /* 패스워드 체크 */
        var password_regExp = /^[0-9a-z!@#$%^*+=-]{4,16}$/;  //영문, 숫자 입력
        if (!password_regExp.test(newPassword.value) || !password_regExp.test(newPasswordConfirm.value)) {
            this.setState({ isAlert: true, alertMessage: "패스워드는 영문, 숫자, 특수문자의 조합으로 4자리 이상 16자리 이하로 설정해 주세요" })
            return;
        }

        var data = {};
        data.id = sessionStorage.getItem("id");
        data.currentPassword = currentPassword.value;
        data.newPassword = newPassword.value;
        data.newPasswordConfirm = newPasswordConfirm.value;

        console.log(data)
        axios.post("/db/user/update", data).then((res) => {
            console.log(res)
            if (res.data.isChanged) {
                this.props.history.push("/");
            } else {
                this.setState({ isAlert: true, alertMessage: "이전과 비밀번호가 같습니다." })
            }
        }).catch((err) => {
            this.setState({ isAlert: true, alertMessage: "비밀번호 바꾸기에 실패 하였습니다." })
            console.log(err)
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <Box width="100%" height="100%">
                <div style={{ textAlign: 'center', margin: "4px" }}>
                    <Box display="flex" alignItems="center" justifyContent="center">
                        <Avatar className={classes.avatar}>
                            <InfoOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            내 정보
                        </Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center"  >
                        <Grid item xs={4}></Grid>
                        <Grid item xs={4}>
                            <Paper elevation={3} >
                                <Box m={2} p={2}>
                                    <Table size="medium" aria-label="a dense table">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="left">아이디</TableCell>
                                                <TableCell align="right">{this.state.userinfo.username}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell align="left">E-mail</TableCell>
                                                <TableCell align="right">{this.state.userinfo.email}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <br />
                                    <Button variant="contained" color="primary" onClick={this.handleLogOut} >로그아웃</Button>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={4}></Grid>
                    </Grid>
                    <form className={classes.form} onSubmit={this.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}></Grid>
                            <Grid item xs={4}>
                                <Typography component="h1" variant="h5">
                                    비밀 번호 수정
                                </Typography>
                            </Grid>
                            <Grid item xs={4}></Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={4}></Grid>
                            <Grid item xs={4}>
                                <Paper elevation={3} >
                                    <Box m={2} p={2}>
                                        <Table size="medium" aria-label="a dense table">
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell align="left">
                                                        <TextField
                                                            type="password"
                                                            variant="outlined"
                                                            required
                                                            fullWidth
                                                            id="currentPassword"
                                                            label="현재 비밀번호 입력"
                                                            name="currentPassword"
                                                            autoComplete="currentPassword"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell align="left">
                                                        <TextField
                                                            type="password"
                                                            variant="outlined"
                                                            required
                                                            fullWidth
                                                            id="newPassword"
                                                            label="새 비밀번호 입력"
                                                            name="newPassword"
                                                            autoComplete="newPassword"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell align="left">
                                                        <TextField
                                                            type="password"
                                                            variant="outlined"
                                                            required
                                                            fullWidth
                                                            id="newPasswordConfirm"
                                                            label="새 비밀번호 확인"
                                                            name="newPasswordConfirm"
                                                            autoComplete="newPasswordConfirm"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        <Button type="submit"
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}>비밀 번호 수정</Button>
                                    </Box>
                                </Paper>
                                <Grid item xs={4}>
                                    <Snackbar open={this.state.isAlert} autoHideDuration={10000} onClose={this.handleAlertSnackClose}>
                                        <MuiAlert elevation={6} variant="filled" severity="error">
                                            {this.state.alertMessage}
                                        </MuiAlert>
                                    </Snackbar>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid container alignItems="center" justify="flex-end" spacing={2}>
                            <Grid item xs={4}></Grid>
                            <Grid item >
                                <Link href="#" onClick={this.handleBack} variant="body2">
                                    뒤로 가기
                                </Link>
                            </Grid>
                            <Grid item xs={4}></Grid>
                        </Grid>
                    </form>
                </div>
            </Box>
        );
    }
}

export default withStyles(styles)(Info);