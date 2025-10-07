import React, { useEffect, useState } from 'react';
import api from "../api.js";
import GetDriverByForenameForm from './GetDriverByForenameForm.jsx';

const DriverSearch = () => {
  const [drivers, setDrivers] = useState([]);

  const getDriverByForename = async (forename) => {
    try {
      const response = await api.get(`/driver?forename=${forename}`);
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers by forename", error);
    }
  };

  return (
    <div>
      <h2>Drivers</h2>
      <ul>
        {drivers.map((driver, index) => (
          <li key={index}>{driver.forename} {driver.surname}</li>
        ))}
      </ul>
      <GetDriverByForenameForm getDriverByForename={getDriverByForename} />
    </div>
  );
};

export default DriverSearch;