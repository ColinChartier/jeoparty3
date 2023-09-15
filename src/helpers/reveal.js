import _ from 'lodash';

import { sayCategoryRevealIntroductionFiller, sayCategoryRevealFiller } from './sayFiller';
import boardReveal from '../assets/audio/boardReveal.mp3';

export const revealBoard = (setBoardRevealMatrix, onEnd) => {
    const boardRevealSound = new Audio(boardReveal);
    boardRevealSound.play();

    setBoardRevealMatrix([
        [false, false, true, false, false],
        [true, false, false, false, false],
        [false, false, false, true, false],
        [false, false, false, false, false],
        [false, true, false, false, false],
        [false, false, false, false, true]
    ]);

    setTimeout(() => {
        setBoardRevealMatrix([
            [false, false, true, false, true],
            [true, false, false, true, false],
            [false, false, false, true, false],
            [true, false, true, false, false],
            [false, true, false, false, false],
            [false, true, false, false, true]
        ]);

        setTimeout(() => {
            setBoardRevealMatrix([
                [true, false, true, false, true],
                [true, false, true, true, false],
                [false, true, false, true, false],
                [true, false, true, false, true],
                [false, true, false, true, false],
                [false, true, false, false, true]
            ]);

            setTimeout(() => {
                setBoardRevealMatrix([
                    [true, false, true, true, true],
                    [true, true, true, true, false],
                    [false, true, false, true, true],
                    [true, false, true, false, true],
                    [false, true, true, true, false],
                    [true, true, false, false, true]
                ]);

                setTimeout(() => {
                    setBoardRevealMatrix([
                        [true, false, true, true, true],
                        [true, true, true, true, false],
                        [true, true, true, true, true],
                        [true, true, true, false, true],
                        [false, true, true, true, true],
                        [true, true, false, true, true]
                    ]);

                    setTimeout(() => {
                        setBoardRevealMatrix([
                            [true, true, true, true, true],
                            [true, true, true, true, true],
                            [true, true, true, true, true],
                            [true, true, true, true, true],
                            [true, true, true, true, true],
                            [true, true, true, true, true]
                        ]);

                        onEnd();
                    }, 400);
                }, 400);
            }, 400);
        }, 400);
    }, 400);
};

export const revealCategories = (categories, doubleJeoparty, setCategoryPanelIndex, setCategoryRevealIndex, onEnd) => {
    console.log("reveal categories");
    sayCategoryRevealIntroductionFiller(doubleJeoparty, () => {
        setCategoryPanelIndex(0);

        setTimeout(() => {
            sayCategoryRevealFiller(_.get(categories, '[0].title'), () => {
                setCategoryRevealIndex(1);

                setTimeout(() => {
                    setCategoryPanelIndex(1);

                    setTimeout(() => {
                        sayCategoryRevealFiller(_.get(categories, '[1].title'), () => {
                            setCategoryRevealIndex(2);

                            setTimeout(() => {
                                setCategoryPanelIndex(2);

                                setTimeout(() => {
                                    sayCategoryRevealFiller(_.get(categories, '[2].title'), () => {
                                        setCategoryRevealIndex(3);

                                        setTimeout(() => {
                                            setCategoryPanelIndex(3);

                                            setTimeout(() => {
                                                sayCategoryRevealFiller(_.get(categories, '[3].title'), () => {
                                                    setCategoryRevealIndex(4);

                                                    setTimeout(() => {
                                                        setCategoryPanelIndex(4);

                                                        setTimeout(() => {
                                                            sayCategoryRevealFiller(_.get(categories, '[4].title'), () => {
                                                                setCategoryRevealIndex(5);

                                                                setTimeout(() => {
                                                                    setCategoryPanelIndex(5);

                                                                    setTimeout(() => {
                                                                        sayCategoryRevealFiller(`and ${_.get(categories, '[5].title')}`, () => {
                                                                            onEnd();
                                                                        });
                                                                    }, 500);
                                                                }, 1000);
                                                            });
                                                        }, 500);
                                                    }, 1000);
                                                });
                                            }, 500);
                                        }, 1000);
                                    });
                                }, 500);
                            }, 1000);
                        });
                    }, 500);
                }, 1000);
            });
        }, 500);
    });
};
