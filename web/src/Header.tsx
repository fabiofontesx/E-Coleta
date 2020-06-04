import React from 'react';

// import { Container } from './styles';

interface HeaderProps{
  title: String //obrigatório
  //title?: String //Não obrigatório

}

const Header: React.FC<HeaderProps> = (props) => {
  
  return (
      <header>
          <h1>
                {props.title} 
          </h1>
      </header>
  );
}

export default Header;