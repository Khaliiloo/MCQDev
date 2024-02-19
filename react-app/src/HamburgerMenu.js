// HamburgerMenu.js
import React, {useEffect, useState} from 'react';
import './HamburgerMenu.css'; // We'll create this file to style the menu.
import {Link, useParams, useNavigate} from 'react-router-dom';
import LanguageMenu from "./LanguageMenu";
const HamburgerMenu = (props) => {
    const selectedMode = props.selectedMod;
    const setLanguage = props.setLanguage;
    const setSelectedMode = props.setSelectedMode;
    const [menuOpen, setMenuOpen] = useState(false);
    //const [selectedMode, setSelectedMode] = useState('light'); // Default mode is 'light'
    useEffect(() => {
        if (selectedMode === '') return
        localStorage.setItem('mode', selectedMode);
    }, [selectedMode]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLanguageChange = (language) => {
        setLanguage(language);
        setMenuOpen(false);
    }
    const handleModeChange = (mode) => {
        setSelectedMode(mode);

        if (mode === 'dark') {
            /*var elements = document.getElementsByTagName("*");

            for (var i=0; i < elements.length; i++)
            {
                if(elements[i].id == 'editor') continue;
               elements[i].classList.add('dark-theme')
            }*/
            //return;
            document.body.classList.add('dark-theme');
            document.getElementsByClassName('page-left')[0].classList.add('dark-theme')
            document.getElementsByClassName('page-right')[0].classList.add('dark-theme')
            document.getElementsByClassName('book')[0].classList.add('dark-theme-book')
        } else {
            /*var elements = document.getElementsByTagName("*");
            for (var i=0; i < elements.length; i++)
            {
                elements[i].classList.remove('dark-theme')
            }*/
           // return
            document.body.classList.remove('dark-theme');
            document.getElementsByClassName('page-left')[0].classList.remove('dark-theme')
            document.getElementsByClassName('page-right')[0].classList.remove('dark-theme')
            document.getElementsByClassName('book')[0].classList.remove('dark-theme-book')

        }
        setMenuOpen(false);
        // You can add code here to apply the selected mode to your app's theme
    };
    useEffect(() => {

        handleModeChange(selectedMode)
    },[selectedMode]);
    const handleMenuClick = () => {
        setMenuOpen(false);
    };
    const logOut = () => {
        setMenuOpen(false);
        props.logOut();
    }

    function handleShowResults(showModal) {
        showModal()
        setMenuOpen(false);
    }

    return (
        <div className="hamburger-menu">
            <div className={`menu-icon ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <div className={`${selectedMode === 'light' ? 'icon-bar' : 'icon-bar-dark'}`}></div>
                <div className={`${selectedMode === 'light' ? 'icon-bar' : 'icon-bar-dark'}`}></div>
                <div className={`${selectedMode === 'light' ? 'icon-bar' : 'icon-bar-dark'}`}></div>
            </div>
            {menuOpen && (
                <ul className={`${selectedMode == 'dark' ? 'menu-items-dark':'menu-items'}`}>
                    <Link className="link">Language
                        <LanguageMenu onLanguageChange={handleLanguageChange} />
                    </Link>
                    <Link to="/topics" className="link" onClick={handleMenuClick}>Topics</Link>
                    {/*<Link to="/" className="link">Questions</Link>*/}
                    <Link className={`mode-item link ${selectedMode == 'dark' ? 'dark-theme' : ''}`}>
                        <span className='mode-item link'>Mode</span>
                        <ul>
                            <li
                                className={selectedMode === 'light' ? 'selected sub-menu-item' : 'sub-menu-item-dark'}
                                onClick={() => handleModeChange('light')}
                            >
                                Light
                            </li>
                            <li
                                className={selectedMode === 'dark' ? 'sub-menu-item-dark' : 'sub-menu-item'}
                                onClick={() => handleModeChange('dark')}
                            >
                                Dark
                            </li>
                        </ul>
                    </Link>
                    {/*<Link to="/" className="link">Questions</Link>*/}
                    <Link onClick={() => handleShowResults(props.showModal)} className="link">My Results</Link>
                    {
                        !props.token &&
                        <Link to="/login" className="link">Login</Link>

                    }
                    {
                        !props.token &&
                            <Link to="/register" className="link">Register</Link>
                    }
                    {
                    props.token && (
                        <Link onClick={logOut} className="link">Logout</Link>
                    )
                }
                    <Link onClick={() => console.log(props.token)} >Props</Link>
                </ul>
            )}
        </div>
    );
};

export default HamburgerMenu;
