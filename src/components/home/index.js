import React, { useEffect, useState } from "react";
import axios from "axios";

const HomeScreen = () => {
  const [mkts, changeMkts] = useState(null);
  const [markets, changeMarkets] = useState(null);
  const [saved, changeSaved] = useState([]);

  let interval;
  useEffect(() => {
    fetchMarkets();
    interval = setInterval(() => {
      fetchMarkets();
    }, 30000);
  }, []);
  useEffect(() => {
    if (mkts) {
      calculatePercentage(mkts);
    }
  }, [mkts]);

  const fetchMarkets = () => {
    axios
      .get("https://api.bittrex.com/api/v1.1/public/getmarketsummaries", {
        crossdomain: true
      })
      .then(res => {
        const result = res.data.result
          .filter(el => el.MarketName.startsWith("BTC-") && el.BaseVolume > 2)
          .sort(function(a, b) {
            if (a.MarketName < b.MarketName) {
              return -1;
            }
            if (a.MarketName > b.MarketName) {
              return 1;
            }
            return 0;
          });
        changeMkts(result);
      });
  };

  const calculatePercentage = nextMarket => {
    if (!mkts) return null;
    if (!markets) return changeMarkets(nextMarket);
    const newMarket = nextMarket.map((el, i) => {
      const startingValue = markets.find(m => m.MarketName === el.MarketName)
        .Volume;
      const finalValue = el.Volume;
      let calc = finalValue - startingValue;
      calc = (calc / startingValue) * 100;
      return {
        ...el,
        percentageChange: Math.round(calc)
      };
    });
    addToSaved(newMarket);
    changeMarkets(newMarket);
  };

  const addToSaved = (array) => {
    const newArray = array.map(el => ({
      MarketName: el.MarketName,
      percentageChange: el.percentageChange,
      Volume: el.Volume
    }))
    changeSaved([...saved, newArray]);
  }

  const 

  const handleMinuteChange = ({ target: { value } }) => {
    clearInterval(interval);
    interval = setInterval(() => {
      fetchMarkets();
    }, 1000 * Number(value));
  };

  const handleClick = () => {};

  console.log(typeof markets);
  return (
    <div>
      <button onClick={fetchMarkets} disabled={!mkts}>
        click me
      </button>
      {/* <input type="number" onChange={handleMinuteChange} /> */}
      {markets &&
        markets
          .sort((a, b) => {
            return b.percentageChange - a.percentageChange;
          })
          .map(el => {
            return (
              <div style={{ display: "flex" }} key={el.MarketName}>
                <div
                  style={{
                    paddingRight: "10px",
                    borderRight: "1px solid black"
                  }}
                >
                  {el.MarketName}
                </div>
                <div
                  style={{
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    borderRight: "1px solid black"
                  }}
                >
                  {el.Volume} VOL
                </div>
                <div
                  style={{
                    paddingLeft: "10px",
                    color: el.percentageChange > 3 ? "red" : "black"
                  }}
                >
                  {el.percentageChange}%
                </div>
              </div>
            );
          })}
    </div>
  );
};

export default HomeScreen;
