import React, { useContext, useCallback, useState, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import {AiOutlineInfoCircle} from 'react-icons/ai';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import { info } from '../../constants/info';
import mixins from '../../helpers/mixins';
import MobileWait from '../../helpers/components/MobileWait';
import Sketchpad from '../../helpers/components/Sketchpad';

// DEBUG
import { samplePlayers } from '../../constants/samplePlayers';

const MobileLobbyRow = styled.div`
    ${mixins.flexAlignCenter}
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 10vh;
    font-size: calc(var(--vh, 1vh) * 10);
    text-shadow: 0.075em 0.075em #000;
`;

const ButtonWrapper = styled.div`
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    margin: 0.5em;
`;

const InfoButtonWrapper = styled.span`
`;

const MobileLobby = () => {
    const MobileLobbyState = {
        SESSION_NAME: 'sessionName',
        SIGNATURE: 'signature',
        WAITING: 'waiting'
    };

    const debug = useContext(DebugContext);

    const [sessionName, setSessionName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [mobileLobbyState, setMobileLobbyState] = useState(debug ? MobileLobbyState.SESSION_NAME : MobileLobbyState.SESSION_NAME);
    const [player, setPlayer] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('join_session_success', () => {
            setSessionName('');
            setMobileLobbyState(MobileLobbyState.SIGNATURE);
        });

        socket.on('join_session_failure', (sessionName) => {
            alert(`Couldn't find session (${sessionName})`);

            setSessionName('');
        });

        socket.on('submit_signature_success', (player) => {
            setMobileLobbyState(MobileLobbyState.WAITING);
            setPlayer(player);
        });

        socket.on('submit_signature_failure', (message) => {
            alert(message);

            setPlayerName('');
        });

        socket.on('reconnect', () => {
            setMobileLobbyState(MobileLobbyState.WAITING);
        });

        socket.on('player', (player) => {
            setPlayer(player);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInfo = useCallback(() => {
        alert(info);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleJoinSession = useCallback((sessionName) => {
        socket.emit('join_session', sessionName);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmitSignature = useCallback((playerName) => {
        const isCanvasBlank = (canvas) => {
            return !canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0);
        }

        const signatureCanvas = document.getElementById('signature-canvas');

        if (!isCanvasBlank(signatureCanvas)) {
            socket.emit('submit_signature', playerName, signatureCanvas.toDataURL());
        } else {
            alert('Try being a little more creative, please try again!');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container fluid>
            {
                mobileLobbyState === MobileLobbyState.SESSION_NAME &&
                <div>
                    <ButtonWrapper>
                        <InfoButtonWrapper onClick={() => handleInfo()}>
                            <AiOutlineInfoCircle size={'30px'} />
                        </InfoButtonWrapper>
                    </ButtonWrapper>

                    <MobileLobbyRow>
                        <Col lg={'12'}>
                            <LogoText>JEOPARTY!</LogoText>

                            <InputGroup className={'mb-3'}>
                                <FormControl placeholder={'Enter session name...'} value={sessionName.toUpperCase()} onChange={e => setSessionName(e.target.value)} />
                                <InputGroup.Prepend>
                                    <Button onClick={() => handleJoinSession(sessionName)} variant={'outline-light'}>JOIN</Button>
                                </InputGroup.Prepend>
                            </InputGroup>
                        </Col>
                    </MobileLobbyRow>
                </div>

            }

            {
                mobileLobbyState === MobileLobbyState.SIGNATURE &&
                <MobileLobbyRow>
                    <Col lg={'12'}>
                        <LogoText>JEOPARTY!</LogoText>

                        <InputGroup className={'mb-3'}>
                            <FormControl placeholder={'Enter your name...'} value={playerName.toUpperCase()} onChange={e => setPlayerName(e.target.value)} />
                        </InputGroup>

                        <Sketchpad onSubmit={() => handleSubmitSignature(playerName)} />
                    </Col>
                </MobileLobbyRow>
            }

            {
                mobileLobbyState === MobileLobbyState.WAITING &&
                <MobileWait player={player} />
            }
        </Container>
    );
};

export default MobileLobby;
