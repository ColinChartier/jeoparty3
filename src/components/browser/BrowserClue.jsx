import React, { useContext, useEffect, useState } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import { timers } from '../../constants/timers';
import say from '../../helpers/say';
import mixins from '../../helpers/mixins';
import Timer from '../../helpers/components/Timer';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getClueTextCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 200) {
        compressor = 2.5;
    } else if (textLength > 100) {
        compressor = 2.25;
    } else {
        compressor = 2;
    }

    return compressor;
};

const BrowserClueContainer = styled(Container)`
    height: 100vh;
    width: 100vw;
`;

const ClueRow = styled(Row)`
    height: 80vh;
`;

const ClueCol = styled(Col)`
    ${mixins.flexAlignCenter}

    padding-left: 10em !important;
    padding-right: 10em !important;

    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.35em 0.35em #000;
`;

const TimerRow = styled(Row)`
    height: 20vh;
    ${mixins.flexAlignCenter}
`;

const BrowserClue = () => {
    // DEBUG
    // const [categories, setCategories] = useState(sampleCategories);
    // const [categoryIndex, setCategoryIndex] = useState(0);
    // const [clueIndex, setClueIndex] = useState(0);

    // const [showTimer, setShowTimer] = useState(false);
    // const [startTimer, setStartTimer] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);

    const [showTimer, setShowTimer] = useState(false);
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('request_clue', (categoryIndex, clueIndex, clueText) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);

            if (clueText) {
                say(clueText, () => {
                    socket.emit('start_timer');
                });
            }
        });

        socket.on('start_timer', () => {
            setTimeout(() => {
                setShowTimer(true);

                setTimeout(() => {
                    setStartTimer(true);
                }, 100);
            }, 100);
        });
    }, []);

    const clueText = (categoryIndex !== null && clueIndex !== null && categories && categories[categoryIndex]) && categories[categoryIndex].clues[clueIndex].question;
    const textLength = clueText ? clueText.length : 0;

    return (
        <BrowserClueContainer fluid>
            <ClueRow>
                <ClueCol lg={'12'}>
                    <FitText compressor={getClueTextCompressor(textLength)}>
                        {clueText && clueText.toUpperCase()}
                    </FitText>
                </ClueCol>
            </ClueRow>

            <TimerRow>
                {showTimer ? <Timer height={'6vh'} width={'60vw'} start={startTimer} time={timers.BUZZ_IN_TIMEOUT} slideUp={true} /> : ''}
            </TimerRow>
        </BrowserClueContainer>
    );
};

export default BrowserClue;
