import React from 'react';
import axios from 'axios';

import {Avatar, withStyles} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

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

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '', isAlert: false, alertMessage: "" };
        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleAlertSnackClose = this.handleAlertSnackClose.bind(this);
    }

    /* 뒤로가기 */
    handleBack = () => {
        this.props.history.goBack();
    }

    /* 회원가입 등록 버튼 클릭 */
    handleRegisterSubmit = (event) => {
        event.preventDefault();
        var id = document.getElementById("id");
        var password = document.getElementById("password");
        var email = document.getElementById("email");

        
        /* 아이디 체크 */
        var id_regExp = /^[a-z]+[a-z0-9]{3,19}$/g;
        if( !id_regExp.test(id.value) || id.value.length > 20 || id.value.length < 4) {
            this.setState({isAlert : true, alertMessage: "아이디는 영문자로 시작하는 4~20자 영문자 또는 숫자이어야 합니다."})
            return;
        }

        /* 이메일 체크 */
        var email_regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        if(!email_regExp.test(email.value)){
            this.setState({isAlert : true, alertMessage: "이메일 형식이 아닙니다."})
            return ;
        }

        /* 패스워드 체크 */
        var password_regExp = /^[0-9a-z!@#$%^*+=-]{4,16}$/;
        console.log(password.value + " " + password.value.length);
        if(!password_regExp.test(password.value)){
            this.setState({isAlert : true, alertMessage: "패스워드는 영문, 숫자, 특수문자의 조합으로 4자리 이상 16자리 이하로 설정해 주세요"})
            return;
        }

        var data = {};
        data.id = id.value;
        data.password = password.value;
        data.email = email.value;

        axios.post("/db/user/register", data).then((res) => {
            if(res.data.isRegister){
                alert("이메일을 보냈습니다. 메일함을 확인해 주세요!");
                this.props.history.push("/");
            }else{
                this.setState({isAlert : true, alertMessage: "중복된 아이디 혹은 중복된 이메일 입니다."})
            }
            console.log(res)
        }).catch((err) => {
            this.setState({isAlert : true, alertMessage: "유저 등록에 실패 했습니다."})
            console.log(err)
        });
    }

    /* 스낵바 닫기 */
    handleAlertSnackClose = () => {
        this.setState({ isAlert: false })
    }
    render() {
        const { classes } = this.props;
        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        회원가입
                    </Typography>
                    <form className={classes.form} onSubmit={this.handleRegisterSubmit}>
                        <Snackbar open={this.state.isAlert} autoHideDuration={10000} onClose={this.handleAlertSnackClose}>
                                <MuiAlert elevation={6} variant="filled" severity="error">
                                    {this.state.alertMessage}
                                </MuiAlert>
                        </Snackbar>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    type="text"
                                    autoComplete="id"
                                    name="id"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="id"
                                    label="아이디 입력 (4~20 자리)"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    type="email"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="이메일 입력"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    type="password"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="패스워드 입력 (4~16자리)"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            회원 등록
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item>
                                <Link href="#" onClick={this.handleBack} variant="body2">
                                    뒤로 가기
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                <Box mt={5}>
                </Box>
            </Container>
        );
    }
}

export default withStyles(styles)(Register);