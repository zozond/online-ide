import React from 'react';
import axios from 'axios';

import { Avatar, withStyles, Paper, Box, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
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

class FindPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '', isAlert: false, alertMessage: ""};
        this.handleFindPasswordSubmit = this.handleFindPasswordSubmit.bind(true);
        this.handleBack = this.handleBack.bind(true);
        this.handleAlertSnackClose = this.handleAlertSnackClose.bind(true);
    }

    /* 뒤로가기 */
    handleBack = () => {
        this.props.history.goBack()
    }

    /* 스낵바 닫기 */
    handleAlertSnackClose = () => {
        this.setState({ isAlert: false })
    }

    handleFindPasswordSubmit = (event) => {
        event.preventDefault();
        var id = document.getElementById("id");
        var email = document.getElementById("email");

        this.setState({isAlert: false})
        /* 아이디 체크 */
        var id_regExp = /^[a-z]+[a-z0-9]{3,19}$/g;
        if (!id_regExp.test(id.value) || id.value.length > 20 || id.value.length < 4) {
            this.setState({isAlert : true, alertMessage: "아이디는 영문자로 시작하는 4~20자 영문자 또는 숫자이어야 합니다."})
            return;
        }

        /* 이메일 체크 */
        var email_regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        if (!email_regExp.test(email.value)) {
            this.setState({isAlert : true, alertMessage: "이메일 형식이 아닙니다."})
            return;
        }

        var data = {};
        data.id = id.value;
        data.email = email.value;
        axios.post("/db/user/password", data).then((res) => {
            alert("이메일을 확인해 주세요!");
            this.props.history.push("/");
        }).catch((err) => {
            console.log(err)
            this.setState({isAlert : true, alertMessage: "이메일 / 아이디가 일치하지 않습니다."})
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <Box width="100%" height="100%">
                <div style={{ textAlign: 'center', margin: "4px" }}>
                    <Box display="flex" alignItems="center" justifyContent="center">
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            패스 워드 찾기
                        </Typography>
                    </Box>
                    <form className={classes.form} onSubmit={this.handleFindPasswordSubmit}>
                        <Snackbar open={this.state.isAlert} autoHideDuration={10000} onClose={this.handleAlertSnackClose}>
                                <MuiAlert elevation={6} variant="filled" severity="error">
                                    {this.state.alertMessage}
                                </MuiAlert>
                        </Snackbar>
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
                                                            autoComplete="id"
                                                            name="id"
                                                            variant="outlined"
                                                            required
                                                            fullWidth
                                                            id="id"
                                                            label="아이디 입력"
                                                            autoFocus
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell align="left">
                                                        <TextField
                                                            variant="outlined"
                                                            required
                                                            fullWidth
                                                            id="email"
                                                            label="이메일 입력"
                                                            name="email"
                                                            autoComplete="email"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}
                                        >찾기</Button>
                                    </Box>
                                </Paper>
                                <Grid item xs={4}></Grid>
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

export default withStyles(styles)(FindPassword);