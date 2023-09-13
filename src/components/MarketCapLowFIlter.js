import React, { useState } from "react";
import Slider from "@mui/material/Slider";

const MarketCapLowFilter = ({ onFilterChange }) => {
  const [rangeValue, setRangeValue] = useState([0, 1000000]); // Initial range values

  const handleRangeChange = (event, newValue) => {
    setRangeValue(newValue);
  };

  const handleFilterApply = () => {
    onFilterChange(rangeValue); // Notify the parent component of the filter change
  };

  return (
    <div>
      <Slider
        value={rangeValue}
        onChange={handleRangeChange}
        valueLabelDisplay="auto"
        min={0}
        max={1000000}
        step={1000}
      />
      <div>
        Market Cap Low Range: ${rangeValue[0]} - ${rangeValue[1]}
      </div>
      <button onClick={handleFilterApply}>Apply Filter</button>
    </div>
  );
};

export default MarketCapLowFilter;