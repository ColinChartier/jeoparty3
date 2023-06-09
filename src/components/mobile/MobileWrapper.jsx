import React, { useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import styled, { createGlobalStyle } from 'styled-components';
import Button from 'react-bootstrap/Button';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';

const GlobalStyle = createGlobalStyle`
    .btn:hover {
        background-color: transparent;
        color: white;
    }
`;

const DisconnectedScreen = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    z-index: 3;
    
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
    width: 100vw;
    
    backdrop-filter: blur(4px);
    color: black;
`;

const DisconnectedScreenText = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    z-index: 2;
    
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
`;

const DisconnectedScreenButton = styled(Button)`
    font-size: 5vh;
    font-size: calc(var(--vh, 1vh) * 5);
`;

const MobileWrapper = (props) => {
    // eslint-disable-next-line no-unused-vars
    const [cookies, setCookie, removeCookie] = useCookies(['player-id']);
    
    const debug = useContext(DebugContext);
    const socket = useContext(SocketContext);

    const [disconnected, setDisconnected] = useState(debug ? false : false);

    useEffect(() => {
        socket.on('set_cookie', (player) => {
            setCookie('player-id', `${player.sessionName}-${player.socketId}`, { path: '/' });
        });

        socket.on('reload', () => {
            removeCookie('player-id', { path: '/' });
            window.location.reload();
        });

        socket.on('disconnect', () => {
            setDisconnected(true);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <GlobalStyle />

            {disconnected &&
                <DisconnectedScreen>
                    <DisconnectedScreenText onClick={() => window.location.reload()}>
                        <DisconnectedScreenButton variant={'danger'}>RECONNECT</DisconnectedScreenButton>
                    </DisconnectedScreenText>
                </DisconnectedScreen>
            }

            {props.children}
        </div>
    );
};

export default MobileWrapper;
