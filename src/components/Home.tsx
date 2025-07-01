
import React, { useState } from 'react';
import Navbar from './Navbar';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';
import Main from './Main';
import Footer from './Footer';

const Home: React.FC = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
      />
      <Main />
      <LoginDialog open={openLogin} onClose={() => setOpenLogin(false)} />
      <SignupDialog open={openSignup} onClose={() => setOpenSignup(false)} />
    </div>
  );
};

export default Home;
