import React, { useState, useCallback, useContext, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobilePlayerCard from '../../helpers/components/MobilePlayerCard';
import MobileWait from '../../helpers/components/MobileWait';
import { timers } from '../../constants/timers';
import Timer from '../../helpers/components/Timer';

// DEBUG
import {samplePlayers} from '../../constants/samplePlayers';

const MobileAnswerRow = styled.div`
    ${mixins.flexAlignCenter}
    height: 60vh;
    height: calc(var(--vh, 1vh) * 60);
`;

const BottomRow = styled.div`
    height: 15vh;
    height: calc(var(--vh, 1vh) * 15);
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 10vh;
    font-size: calc(var(--vh, 1vh) * 10);
    text-shadow: 0.075em 0.075em #000;
`;

const MobileAnswer = () => {
    const debug = useContext(DebugContext);

    const [answer, setAnswer] = useState('');
    const [isAnswering, setIsAnswering] = useState(debug ? true : false);
    const [player, setPlayer] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});
    const [startTimer, setStartTimer] = useState(false);
    const [finalJeoparty, setFinalJeoparty] = useState(debug ? false : false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('is_answering', (isAnswering, finalJeoparty) => {
            setIsAnswering(isAnswering);
            setFinalJeoparty(finalJeoparty);
        });

        socket.on('player', (player) => {
            setPlayer(player);
        });

        setTimeout(() => {
            setStartTimer(true);
        }, 100);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAnswerLivefeed = useCallback((e) => {
        setAnswer(e.target.value);
        socket.emit('answer_livefeed', e.target.value);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmitAnswer = useCallback((answer) => {
        socket.emit('submit_answer', answer, false);
        setIsAnswering(false);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container fluid>
            {
                isAnswering && (
                    <div>
                        <MobilePlayerCard player={player} />

                        <MobileAnswerRow>
                            <Col lg={'12'}>
                                <LogoText>JEOPARTY!</LogoText>

                                <InputGroup className={'mb-3'}>
                                    <FormControl placeholder={'Enter your answer...'} value={answer.toUpperCase()} onChange={e => handleAnswerLivefeed(e)} />
                                    <InputGroup.Prepend>
                                        <Button onClick={() => handleSubmitAnswer(answer)} variant={'outline-light'}>SUBMIT</Button>
                                    </InputGroup.Prepend>
                                </InputGroup>

                                <Timer height={'3vh'} width={'100%'} start={startTimer} time={finalJeoparty ? timers.FINAL_JEOPARTY_ANSWER_TIMEOUT : timers.ANSWER_TIMEOUT} />
                            </Col>
                        </MobileAnswerRow>

                        <BottomRow />
                    </div>
                )
            }

            {
                !isAnswering && (
                    <div>
                        <MobileWait player={player} />
                    </div>
                )
            }
        </Container>
    );
};

export default MobileAnswer;
