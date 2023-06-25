import React, { useState, useContext, useEffect} from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import CategoryReveal from '../../helpers/components/CategoryReveal';
import backgroundImage from '../../assets/images/background.png';
import dailyDoubleBackgroundImage from '../../assets/images/dailyDoubleBackground.png';
import starBackgroundImage from '../../assets/images/starBackground.png';
import dailyDoubleSound from '../../assets/audio/dailyDouble.mp3';
import applauseSound from '../../assets/audio/correct.mp3';
import BrowserClue from './BrowserClue';
import { revealBoard, revealCategories } from '../../helpers/reveal';

import { sayRoundFiller, sayBoardControllerNameFiller, sayClueRequestFiller, sayDailyDoubleFiller } from '../../helpers/sayFiller';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getCategoryNameCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = 0.75;
    } else if (textLength > 10) {
        compressor = 0.6;
    } else {
        compressor = 0.5;
    }

    return compressor;
};

const CategoryRevealWrapper = styled.div`
    display: flex;
    flex-direction: row;
    position: absolute;
    z-index: 2;
    
    left: ${props => `-${props.categoryRevealIndex * 100}vw`};
    opacity: ${props => props.showCategoryReveal ? 1 : 0};
    
    transition: left 1s linear, opacity 1s;
`;

const BrowserBoardContainer = styled(Container)`
    padding-left: 0 !important;
    padding-right: 0 !important;
`;

const BoardRow = styled(Row)`
    height: calc(100vh / 6);
`;

const CategoryText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const DollarValueTextWrapper = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const CategoryRow = styled(BoardRow)`
    ${CategoryText}
`;

const BoardRevealBackground = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    height: calc(500vh / 6);
    width: 100vw;
    z-index: 0;
    
    font-family: logo, serif;
    font-size: 36vh;
    text-shadow: 0.05em 0.05em #000;
    
    background-image: url(${starBackgroundImage});
    background-size: cover;
`;

const DollarValueRow = styled(BoardRow)`
    ${DollarValueText}
`;

const FitTextWrapper = styled.div`
    ${mixins.flexAlignCenter}
    height: 100%;
`;

const CategoryCol = styled(Col)`
    color: black;
    border-width: 0.2em;
    border-style: solid;
    border-bottom-width: 0.4em;
    line-height: 1;
    
    max-height: 100%;
    
    &.board-reveal {
        ${mixins.flexAlignCenter}
        background-image: url(${starBackgroundImage});
        background-size: cover;
    }
`;

const CategoryColLogoText = styled.span`
    font-family: logo, serif;
    font-size: 6vh;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const DollarValueCol = styled(Col)`
    max-height: 100%;
    vertical-align: middle;
    
    color: black;
    border-width: 0.2em;
    border-style: solid;
    
    background-image: ${props => props.revealed ? `url(${backgroundImage})` : 'none'};
`;

const ClueWrapper = styled.div`
    background-image: url(${backgroundImage});
    position: absolute;
    z-index: 2;
    
    transform: scale(0.16);
    top: ${props => `calc(-125vh/3 + ${(props.clueIndex + 1) * 100}vh/6)`};
    left: ${props => `calc(-25vw + ${(props.categoryIndex - 1) * 100}vw/6)`};
    opacity: 0;
    
    &.animate {
        transform: scale(1);
        top: 0;
        left: 0;
        opacity: 1;
        
        transition: transform 1s, top 1s, left 1s;
    }
`;

const DailyDoubleBackground = styled.div`
    ${mixins.flexAlignCenter};
    height: 100vh;
    width: 100vw;
    background-image: url(${dailyDoubleBackgroundImage});
    background-size: cover;
`;

const BrowserBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    const debug = useContext(DebugContext);

    const [categories, setCategories] = useState(debug ? sampleCategories : []);
    const [doubleJeoparty, setDoubleJeoparty] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState(debug ? 0 : null);
    const [clueIndex, setClueIndex] = useState(debug ? 1 : null);
    const [dailyDouble, setDailyDouble] = useState(debug ? true : false);
    const [animateClue, setAnimateClue] = useState(false);
    const [boardRevealed, setBoardRevealed] = useState(debug ? false : true);
    const [boardRevealMatrix, setBoardRevealMatrix] = useState(debug ?
        [[true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true]] :

        [[false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]]);
    const [showCategoryReveal, setShowCategoryReveal] = useState(debug ? true : false);
    const [categoryRevealIndex, setCategoryRevealIndex] = useState(debug ? 0 : 0);
    const [categoryPanelIndex, setCategoryPanelIndex] = useState(debug ? 0 : -1);

    const socket = useContext(SocketContext);

    const reveal = (categories, doubleJeoparty, boardControllerName) => {
	console.log("reveal called");
        revealBoard(setBoardRevealMatrix, () => {
	    console.log("revealBoard called");
            setTimeout(() => {
                setShowCategoryReveal(true);

                setTimeout(() => {
	            console.log("revealCategories");
                    revealCategories(categories, doubleJeoparty, setCategoryPanelIndex, setCategoryRevealIndex, () => {
	                console.log("revealCategories callback done");
                        setShowCategoryReveal(false);
                        setBoardRevealed(true);

                        setTimeout(() => {
                            sayRoundFiller(boardControllerName, doubleJeoparty, () => socket.emit('board_revealed'));
                        }, 1000);
                    });
                }, 1000);
            }, 1000);
        });
    };

    useEffect(() => {
        socket.on('categories', (categories, doubleJeoparty) => {
            setCategories(categories);
            setDoubleJeoparty(doubleJeoparty);
        });

        socket.on('request_clue', (categoryIndex, clueIndex, dailyDouble) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);
            setDailyDouble(dailyDouble);
        });

        socket.on('say_clue_request', (categoryName, dollarValue, dailyDouble) => {
            sayClueRequestFiller(categoryName, dollarValue, () => {
                socket.emit('say_clue_request');

                setTimeout(() => {
                    setAnimateClue(true);

                    if (dailyDouble) {
                        const dailyDoubleAudio = new Audio(dailyDoubleSound);
                        dailyDoubleAudio.volume = 0.25;

                        const applauseAudio = new Audio(applauseSound);
                        applauseAudio.volume = 0.5;

                        dailyDoubleAudio.play();
                        applauseAudio.play();
                        sayDailyDoubleFiller();
                    }
                }, 100);
            });
        });

        socket.on('say_board_introduction', (boardControllerName, boardRevealed, categories, doubleJeoparty) => {
            if (boardRevealed) {
                setBoardRevealMatrix([
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true]
                ]);
                sayBoardControllerNameFiller(boardControllerName);

                // DEBUG
                // Use this to simulate the full reveal animation finishing and being sent back to the server
                // Make sure to also force this branch of the if condition
                // setTimeout(() => {
                //     socket.emit('board_revealed');
                // }, 1000);
            } else {
                setBoardRevealed(false);
                reveal(categories, doubleJeoparty, boardControllerName);
            }
        });

        return () => {
            socket.off('request_clue');
            socket.off('say_clue_request');
            socket.off('say_board_introduction');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categoryRevealPanels = _.get(categories, `[0].title`) && Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        const category = categories[i];
        const categoryName = _.get(category, 'title');
        const categoryYear = category.clues[0].airdate.slice(0, 4);

        return <CategoryReveal categoryName={categoryName} categoryYear={categoryYear} reveal={categoryPanelIndex === i} />;
    });

    const categoryTitleRow = _.get(categories, `[0].title`) && Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        const category = categories[i];
        const categoryName = _.get(category, 'title');
        const categoryNameLength = _.size(categoryName) || 0;
        const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength);

        let categoryCol = null;

        if (boardRevealed) {
            categoryCol = (
                <CategoryCol lg={'2'} key={i}>
                    <FitTextWrapper>
                        <FitText compressor={categoryNameCompressor}>
                            <CategoryText>
                                {_.get(category, 'completed') ? '' : _.invoke(categoryName, 'toUpperCase')}
                            </CategoryText>
                        </FitText>
                    </FitTextWrapper>
                </CategoryCol>
            );
        } else {
            categoryCol = (
                <CategoryCol lg={'2'} className={'board-reveal'} key={`board-reveal-${i}`}>
                    <CategoryColLogoText>
                        JEOPARTY!
                    </CategoryColLogoText>
                </CategoryCol>
            );
        }

        return categoryCol;
    });

    const dollarValueRows = _.get(categories, `[0].title`) && Array.from(Array(NUM_CLUES).keys()).map((j) => {
        const dollarValue = (doubleJeoparty ? 400 : 200) * (j + 1);

        const dollarValueCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            const clue = _.get(categories, `[${i}].clues[${j}]`);
            const revealed = boardRevealMatrix[i][j];

            return (
                <DollarValueCol lg={'2'} revealed={revealed} key={`${i}-${j}`}>
                    <FitTextWrapper>
                        <FitText compressor={0.3}>
                            {_.get(clue, 'completed') || !revealed ? '' :
                                <DollarValueTextWrapper>
                                    <DollarValueText dollarValue={dollarValue} />
                                </DollarValueTextWrapper>
                            }
                        </FitText>
                    </FitTextWrapper>
                </DollarValueCol>
            );
        });

        return (
            <DollarValueRow key={j}>
                {dollarValueCols}
            </DollarValueRow>
        );
    });

    if (_.get(categories, '[0].title')) {
        return (
            <div>
                <CategoryRevealWrapper showCategoryReveal={showCategoryReveal} categoryRevealIndex={categoryRevealIndex}>
                    {categoryRevealPanels}
                </CategoryRevealWrapper>

                <BrowserBoardContainer fluid>
                    <CategoryRow>
                        {categoryTitleRow}
                    </CategoryRow>

                    <ClueWrapper className={animateClue && 'animate'}
                                 categoryIndex={categoryIndex && categoryIndex}
                                 clueIndex={clueIndex && clueIndex}>
                        {
                            dailyDouble ? (
                                <DailyDoubleBackground>
                                    <mixins.DailyDoubleText>
                                        DAILY DOUBLE
                                    </mixins.DailyDoubleText>
                                </DailyDoubleBackground>
                            ) : (
                                <BrowserClue />
                            )
                        }
                    </ClueWrapper>

                    {!boardRevealed && <BoardRevealBackground>JEOPARTY!</BoardRevealBackground>}

                    {dollarValueRows}
                </BrowserBoardContainer>
            </div>
        );
    } else {
        return <div />;
    }
};

export default BrowserBoard;
