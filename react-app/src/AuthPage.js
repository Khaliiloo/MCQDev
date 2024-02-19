import React, {useEffect, useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import Registration from './Registration';
import './QuizPage.css';
import HamburgerMenu from "./HamburgerMenu";


const AuthPage = () => {
    const location = useLocation();
    const [selectedMode, setSelectedMode] = useState(''); // Default mode is 'light'
    useEffect(() => {
        const mode = (localStorage.getItem('mode'));

        if (mode) {

            setSelectedMode(mode)

        } else {
            setSelectedMode('light')
        }
    }, [selectedMode]);
    return (
        <>
            <div style={{width: '40px'}}>
                <HamburgerMenu selectedMod={selectedMode}
                               setSelectedMode={(mode) => {

                                   //if(!setNotCode)
                                   setSelectedMode(mode)
                               }}
                />
            </div>
            <div className="book">

                <div className="book-pages">

                    <div className="page-left">
                        
                        
                                <h3 className="mt-4 mb-3">TOPIC:<span className='topic'>{}</span>
                                </h3>
                                <Registration />

                    </div>
                    <div className="page-right">
                        <h3 className="mt-4 mb-3">CODE EDITOR</h3>

                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
