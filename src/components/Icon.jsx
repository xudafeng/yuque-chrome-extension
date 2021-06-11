import React from 'react';

const Icon = (props) => {
  const { name } = props;
  return (
    <img src={`./${name}.png`} />
  );
};

export default Icon;
