import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router

const LanguageMenu = (props) => {

    const [languages, setLanguages] = useState([])
    const [language, setLanguage] = useState('');
    // const fetchQuestions = async () => {
    //
    // };
    useEffect(() =>{
        async function fetchData(){
            try {
                const response = await fetch('http://localhost:5000/api/languages'); // Replace with your backend API endpoint
                setLanguages(await response.json());
            } catch (error) {
                console.error('Error fetching languages:', error);
            }

        }
        fetchData();
    },[]);

    function handleClick(name) {
        props.setLanguage(name);
    }
    return (
            <ul style={{ height:"auto", overflow: "auto"}}>
                {languages.map((language) => (
                    <li key={language.id}>
                        {/* Create a link to the QuizPage with the question ID as a parameter */}
                        <Link className='link' onClick={() => props.onLanguageChange(language)}>{language.name}</Link>
                    </li>
                ))}
            </ul>
    );
};

export default LanguageMenu;
