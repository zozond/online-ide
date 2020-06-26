import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import {  Home, Register, CreateContainer, MyContainers,FindPassword, Info, Loading } from '../pages';
import { Box } from '@material-ui/core';



/* 라우팅 */
class App extends Component {
    render() {
        return (
            <Box width="100%"  height="100%" display="flex">
                <Route exact path="/" component={Home}/>
                <Route path="/register" component={Register}/>
                <Route path="/container" component={CreateContainer}/>
                <Route path="/mycontainers" component={MyContainers}/>
                <Route path="/password" component={FindPassword}/>
                <Route path="/info" component={Info}/>
		        <Route path="/loading" component={Loading}/>
            </Box>
        );
    }
}

export default App;
