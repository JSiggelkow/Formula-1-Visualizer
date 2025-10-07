import React, { useState } from 'react';

const GetDriverByForenameForm = ({ getDriverByForename }) => {
  const [forename, setForename] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (forename) {
      getDriverByForename(forename);
      setForename('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={forename}
        onChange={(e) => setForename(e.target.value)}
        placeholder="Enter driver first name"
      />
      <button type="submit">Search Driver</button>
    </form>
  );
};

export default GetDriverByForenameForm;