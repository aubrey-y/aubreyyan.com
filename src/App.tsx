import React, {useState} from 'react';
import './App.css';
import {ParticlesContainer} from "./components/ParticlesContainer";
import classNames from "classnames";
import Typist from 'react-typist';
import 'react-typist/dist/Typist.css';

function App() {
    const [typing, setTyping] = useState(true);

    return (
        <div className="App">
            <div id="logo" className={classNames({show: !typing})}>
                <a href='/'>Aubrey Yan</a>
            </div>
            <ParticlesContainer />
            <div id="typing" style={{
                // fontSize: 70,
                fontWeight: 'bold',
                textAlign: 'left',
            }}>
                <Typist cursor={{
                    show: true,
                    blink: true,
                    hideWhenDone: true,
                    hideWhenDoneDelay: 0
                }} startDelay={1000} avgTypingDelay={100} onTypingDone={() => setTyping(false)}>
                    <span>hello world</span>
                    <Typist.Delay ms={500} />
                    <br />
                    <span>nice to meet you!</span>
                </Typist>
            </div>
        </div>
    );
}

export default App;
