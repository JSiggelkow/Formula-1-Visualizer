import React, { useEffect, useState } from 'react';
import api from "../api.js";
import GetDriverByForenameForm from './GetDriverByForenameForm.jsx';

const DriverSearch = () => {
  const [driver, setDriver] = useState(null);

  const getDriverByForename = async (forename) => {
    try {
      const response = await api.get(`/api/driver?forename=${forename}`);
      setDriver(response.data.length > 0 ? response.data[0] : null);
    } catch (error) {
      console.error("Error fetching drivers by forename", error);
      setDriver(null);
    }
  };

  return (
    <div>
      <h2>Driver Info</h2>
      {driver ? (
        <div>
          <h3>{driver.forename} {driver.surname}</h3>
          <p>Date of birth: {driver.dob}</p>
          <p>Nationality: {driver.nationality}</p>
        </div>
      ) : (
        <p>No driver found</p>
      )}
      <GetDriverByForenameForm getDriverByForename={getDriverByForename} />
    </div>
  );
};

export default DriverSearch;