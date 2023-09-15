import React, { useContext, useState, useEffect, useCallback } from 'react';
import emailjs from 'emailjs-com';

import _ from 'lodash';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import SplitButton from 'react-bootstrap/SplitButton';
import { AiOutlineInfoCircle, AiOutlineMail } from 'react-icons/ai';
import { ImCancelCircle } from 'react-icons/im';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import { legalInfo } from '../../constants/info';
import mixins from '../../helpers/mixins';
import HypeText from '../../helpers/components/HypeText';

import lobbyMusicSound from '../../assets/audio/lobbyMusic.mp3';

// DEBUG
import { samplePlayers } from '../../constants/samplePlayers';

const CenteredContainer = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    z-index: 3;

    height: 100vh;
    width: 100vw;

    backdrop-filter: blur(8px);
`;

const ButtonWrapper = styled.div`
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 0;
`;

const InfoButtonWrapper = styled.span`
    margin-left: 0.5em;
    margin-right: 0.5em;
`;

const EmailPanel = styled.div`
    position: relative;
    width: 500px;
    margin: 0 auto;
    padding: 1em;

    border-radius: 1em;
    border: 0.2em solid #fff;
`;

const EmailPanelCancelButton = styled.div`
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    margin-right: 0.25em;
`;

const PatchNotesPanel = styled.div`
    background-color: white;
    color: black;

    margin: 1em;
    padding: 1em;
`;

const PatchNotesText = styled.p`
    word-break: break-word;
`;

const AsciiArtText = styled.p`
    white-space: pre;

    font-family: monospace;
    font-weight: bold;

    position: relative;
    animation: ${props => props.rainbow ? 'rainbow 1s, move-text 1s forwards' : 'move-text 1s forwards'};
    animation-iteration-count: ${props => props.rainbow ? 'infinite' : 1};
    animation-delay: ${props => `${0.5 + (props.index / 10)}s`};
    opacity: 0;
`;

const LogoRow = styled(Row)`
    ${mixins.flexAlignCenter}
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 28vh;
    text-shadow: 0.05em 0.05em #000;

    margin-bottom: 0;
`;

const InfoText = styled.h5`
    font-family: clue, serif;
    font-size: 3vh;
    text-shadow: 0.1em 0.1em #000;
`;

const JoinText = styled(InfoText)`
    display: flex;
    flex-direction: row;

    padding-left: 28vw;
    padding-right: 28vw;

    &:before, :after {
        content: '';
        flex: 1 1;
        border-bottom: 0.075em solid;
        margin: auto;
    }

    &:before {
        margin-right: 0.75em;
    }

    &:after {
        margin-left: 0.75em;
    }
`;

const InfoRow = styled(Row)`
    margin-top: 1.5em;
`;

const InfoHeading = styled.h1`
    font-family: board, serif;
    font-size: 6vh;
    text-shadow: 0.1em 0.1em #000;
    letter-spacing: 0.02em;
`;

const SessionNameText = styled.h1`
    font-family: board, serif;
    font-size: 15vh;
    color: #d69f4c;
    text-shadow: 0.075em 0.075em #000;
`;

const StartGameInputGroup = styled(InputGroup)`
    position: absolute;
    bottom: 4%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);

    font-family: clue, serif;
    font-size: 3vh;
`;

const DecadeDropdown = styled(SplitButton)`
    padding-right: 1em;
`;

const StartGameButton = styled(Button)`
    font-family: clue, serif;
    font-size: 3vh;
`;

const LeaderboardButton = styled(Button)`
    font-family: clue, serif;
    font-size: 2vh;
    margin-left: 0.25em;
    margin-right: 0.25em;
    margin-bottom: 0.5em;
`;

const InfoList = styled.ul`
    padding-inline-start: 0;
    list-style-type: none;
`;

const LeaderboardPlayerNames = styled(Col)`
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
`;

const LeaderboardScores = styled(Col)`
    text-align: left;
`;

const ActivePlayersText = styled.span`
    position: absolute;
    bottom: 0;
    right: 0;
    margin-right: 0.5em;

    font-family: clue, serif;
    font-size: 2vh;
    text-shadow: 0.1em 0.1em #000;
`;

const sortByJoinIndex = (players) => Object.values(players).sort((a, b) => a.joinIndex - b.joinIndex);

const BrowserLobby = () => {
    const debug = useContext(DebugContext);

    const [players, setPlayers] = useState(debug ? sortByJoinIndex(samplePlayers) : []);
    const [sessionName, setSessionName] = useState(debug ? 'TEST' : '');
    const [categoriesProvided, setCategoriesProvided] = useState(false);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [activePlayers, setActivePlayers] = useState(debug ? 1 : 0);
    const [categories, setCategories] = useState(new Array(12).fill(""));

    const socket = useContext(SocketContext);

    const lobbyMusicAudio = new Audio(lobbyMusicSound);

    useEffect(() => {
        socket.on('session_name', (sessionName) => {
            setSessionName(sessionName);
        });

        socket.on('active_players', (activePlayers) => {
            setActivePlayers(activePlayers);
        });

        socket.on('categories_provided', categoriesProvided => {
            setCategoriesProvided(categoriesProvided);
        })

        socket.on('categories_loaded', (categoriesLoaded) => {
            setCategoriesLoaded(categoriesLoaded);
        });

        socket.on('start_game_success', () => {
            lobbyMusicAudio.pause();
        });

        socket.on('start_game_failure', () => {
            alert(`There aren't any players in this session!`);
        });

        socket.on('players', (players) => {
            setPlayers(sortByJoinIndex(players));
        });

        return () => {
            socket.off('unmute');
            socket.off('start_game_success');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        lobbyMusicAudio.loop = true;
        lobbyMusicAudio.volume = 1;
        lobbyMusicAudio.play();
    }, []);

    const handleStartGame = useCallback(() => {
        socket.emit('start_game');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInfo = useCallback(() => {
        alert(legalInfo);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            {!categoriesProvided && <CenteredContainer>
                <div style={{display: "flex", justifyContent: "center", gap: "16px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                        <h3>First round categories</h3>
                        {(new Array(6).fill(null))
                            .map((_, i) => <input
                                key={i}
                                type="text"
                                placeholder={"Question " + (i+1)}
                                value={categories[i]}
                                onChange={e => setCategories(prev => {
                                    prev[i] = e.target.value;
                                    return [...prev]
                                })}
                            />)}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                        <h3>Second round categories</h3>
                        {(new Array(6).fill(null))
                            .map((_, i) => <input
                                key={i}
                                type="text"
                                placeholder={"Question " + (i+1)}
                                value={categories[i+6]}
                                onChange={e => setCategories(prev => {
                                    prev[i+6] = e.target.value;
                                    return [...prev]
                                })}
                            />)}
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center", marginTop: "16px"}}>
                    <button
                        onClick={() => {
                            socket.emit('user_provided_categories', JSON.stringify(categories));
                        }}
                        type="button"
                    >Submit categories</button>
                </div>
            </CenteredContainer>}

            <Container fluid>
                <LogoRow>
                    <Col lg={'12'}>
                        <LogoText>AI JEOPARDY</LogoText>
                        <JoinText>{`JOIN ON YOUR PHONE AT https://aijeopardy.org`}</JoinText>
                    </Col>
                </LogoRow>

                <InfoRow>
                    <Col lg={'4'}>
                        <InfoHeading>PLAYERS</InfoHeading>
                        <InfoList>
                            {sortByJoinIndex(players).map((player) => {
                                return <li key={player.name}><InfoText><HypeText text={player.name.toUpperCase()} /></InfoText></li>
                            })}
                        </InfoList>
                    </Col>

                    <Col lg={'4'}>
                        <InfoHeading>SESSION NAME</InfoHeading>
                        <SessionNameText>{sessionName.toUpperCase()}</SessionNameText>
                    </Col>
                </InfoRow>

                <StartGameInputGroup className={'mb-3 justify-content-center'}>
                    {
                        categoriesLoaded ? <StartGameButton onClick={() => handleStartGame()} variant={'outline-light'}>START GAME</StartGameButton>
                                         : <StartGameButton variant={'outline-light'} disabled={true}>GENERATING CLUES FOR YOUR CATEGORIES</StartGameButton>
                    }
                </StartGameInputGroup>

                <ButtonWrapper>
                    <InfoButtonWrapper onClick={() => handleInfo()}>
                        <AiOutlineInfoCircle size={'40px'} />
                    </InfoButtonWrapper>
                </ButtonWrapper>

                <ActivePlayersText>
                   {activePlayers} active game{activePlayers === 1 ? '' : 's'}
                </ActivePlayersText>
            </Container>
        </div>
    );
};

export default BrowserLobby;
