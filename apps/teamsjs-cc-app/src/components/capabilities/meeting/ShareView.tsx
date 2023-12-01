// <copyright file="shareview.jsx" company="Microsoft Corporation">
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// </copyright>

import React, { Component } from 'react';

class ShareView extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = { seconds: 0, result: [] };
    }

    componentDidMount() {
        this.timer();
    }
    //The onStart function increments the value of the state variable, seconds, by one and updates it using setState.
    onStart = () => {
        this.setState({ seconds: this.state.seconds + 1 });
    }

    timer = () => {
        setInterval(this.onStart, 1000);
    }

    render() {
        return (
            <div className="timerCount">
                <h1>{this.state.seconds}</h1>
            </div>
        )
    }
}
export default ShareView