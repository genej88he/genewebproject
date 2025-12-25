import React, { useState } from 'react';
import './HomePage.css';
import Header from './Header.js';

import MangoLogo from './assets/images/MangoMTrans.png';

const HomePage = () => {
    const [isBlue, setIsBlue] = useState(false);

    const toggleColor = () => {
        setIsBlue(!isBlue);
    };

    return (
        <div className="cafe-homepage">
            <Header/>
        </div>
    );
};

export default HomePage;
