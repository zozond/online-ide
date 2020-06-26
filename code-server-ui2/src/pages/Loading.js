import React from 'react';
import axios from 'axios';

import { Avatar, withStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import CssBaseline from '@material-ui/core/CssBaseline';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

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

class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = { userinfo: '' };
    }


    health_check = () => {
        // var window_URL = sessionStorage.getItem('currentOpenURL');
        // window.open(window_URL, window_URL);


	    if(sessionStorage.getItem('status') == '200'){

	    }else{
        axios.post('/db/containers/check',  {url: sessionStorage.getItem('currentOpenURL')}).then((result) => {

            console.log(result)
            if(result.status == 200){
		    sessionStorage.setItem('status', '200') 
		 window.location.href = sessionStorage.getItem('currentOpenURL');
            } 
        }).catch((error) => {
            console.log(error);
        });
	    }
    };

    componentDidMount() {
        /* 로그인을 했는지 안했는지 여부 판단 */
        // if (!sessionStorage.getItem("id") && !sessionStorage.getItem("user")) {
        //     this.props.history.push("/");
        // }

        /* health check 기능 추가 */
	 sessionStorage.setItem('status', '400');
        setInterval(this.health_check, 10000);
    }

    

    render() {
        const { classes } = this.props;
        return (
            <Container component="main" maxWidth="md">
                <CssBaseline />
                <div className={classes.paper}>
                    <Dialog maxWidth="lg" aria-labelledby="dialog-title" open={true} >
                        <DialogTitle id="dialog-title" >
                            <Box display="flex" alignItems="center" >
                                <Avatar className={classes.avatar}>
                                    <AutorenewIcon></AutorenewIcon>
                                </Avatar>
                                <Typography component="h1" variant="h4">
                                    현재 개발 환경이 로딩 중입니다.
                                </Typography>
                            </Box>
                        </DialogTitle>

                        <Box padding={2}>
                            <LinearProgress variant="indeterminate" />
                        </Box>
                    </Dialog>
                </div>
            </Container>
        );
    }
}

export default withStyles(styles)(Loading);
