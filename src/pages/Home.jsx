import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';
import { auth } from '../helpers/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

const numeral = require('numeral');

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [user, setUser] = useState(false);
  const [gettingUser, setGettingUser] = useState(true);

  const [formattedResults, setFormattedResults] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [totalValueUSD, setTotalValueUSD] = useState([]);
  const [chartData, setChartData] = useState(null);

  onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setGettingUser(false);
  });

  const fetchData = async () => {
    setIsFetching(true);

    let coinsData;
    let userData;
    let transactionData;

    // Get coins data
    try {
      const request = await axios(`${process.env.REACT_APP_BACKEND_API}/coins/data`);
      const { data } = request;
      coinsData = data;
    } catch (e) {
      console.error(e);
    }

    // Get user data
    try {
      const request = await axios(`${process.env.REACT_APP_BACKEND_API}/user/data`);
      const { data } = request;
      userData = data;
    } catch (e) {
      console.error(e);
    }

    // Get user data
    try {
      const request = await axios(`${process.env.REACT_APP_BACKEND_API}/transaction/data`);
      console.log('request', request);
      const { data } = request;
      transactionData = data;
    } catch (e) {
      console.error(e);
    }

    const currentUserData = userData.filter(item => item.userId === user.uid);
    const currentUserTransactionData = transactionData.filter(item => item.userId === user.uid);

    if (currentUserData) {
      const userPortfolio = currentUserData;
      // setUserData(userPortfolio);

      const userCoinsIds = userPortfolio.reduce((acc, item) => {
        const { symbol } = item;
        const coingeckoId = coinsData.find(item => item.symbol === symbol).coingeckoId;
        acc.push(coingeckoId);

        return acc;
      }, []);

      const priceObject = await fetchPrices(userCoinsIds);

      const mergedData = userPortfolio.reduce((acc, item) => {
        const { symbol } = item;
        const coinData = coinsData.find(item => item.symbol === symbol);
        acc.push({
          ...item,
          ...coinData,
        });

        return acc;
      }, []);

      const formattedData = mergedData.map(item => {
        const priceUSD = priceObject[item.coingeckoId];
        const valueUSD = Number(item.amount) * priceUSD;

        return {
          ...item,
          valueUSD,
          priceUSD,
        };
      });

      const totalValueUSD = formattedData.reduce((acc, item) => {
        acc = acc + item.valueUSD;
        return acc;
      }, 0);

      const labels = formattedData.map(item => item.symbol);
      const formattedChartData = formattedData.map(item => item.valueUSD);

      const rawChartData = {
        labels,
        datasets: [
          {
            label: 'value in USD',
            data: formattedChartData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      setChartData(rawChartData);
      setFormattedResults(formattedData);
      setTotalValueUSD(totalValueUSD);
      setTransactionData(currentUserTransactionData);
    }

    setIsFetching(false);
  };

  const fetchPrices = async ids => {
    setIsFetching(true);

    const promisesArray = ids.map(id =>
      axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: id,
          vs_currencies: 'usd',
        },
      }),
    );

    try {
      const results = await Promise.all(promisesArray);
      const priceObject = {};

      results.forEach((result, index) => {
        const { data } = result;
        priceObject[ids[index]] = data[ids[index]]['usd'];
      });

      return priceObject;
    } catch (err) {
      console.log('err', err);
      setIsFailed(true);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    user && fetchData();
  }, [user]);

  const renderRows = formattedResults.map((item, index) => (
    <tr key={index}>
      <td>
        <div className="d-flex align-items-center">
          <img width="20" src={`/coin-icons/${item.icon}`} alt="" />
          <span className="ms-3">{item.symbol}</span>
        </div>
      </td>
      <td className="text-end text-numeric">${numeral(item.priceUSD).format('0,0.00')}</td>
      <td className="text-end text-numeric">{item.amount}</td>
      <td className="text-end text-numeric">${numeral(item.valueUSD).format('0,0.00')}</td>
    </tr>
  ));

  const renderTransactionRows = transactionData.map((item, index) => (
    <tr key={index}>
      <td>
        <div className="d-flex align-items-center">
          <img width="20" src={`/coin-icons/${item.icon}`} alt="" />
          <span className="ms-3">{item.symbol}</span>
        </div>
      </td>
      <td className="text-end text-numeric">{item.type}</td>
      <td className="text-end text-numeric">{item.amount}</td>
      <td className="text-end text-numeric">${numeral(item.currentPriceUSD).format('0,0.00')}</td>
    </tr>
  ));

  const showTable = user && formattedResults.length > 0;
  const showChart = user && chartData && showTable;
  const showTransactionTable = user && transactionData.length > 0;

  return gettingUser ? (
    <div className="container py-5 py-lg-7 d-flex justify-content-center">
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading app...</span>
      </div>
    </div>
  ) : user ? (
    <div className="container py-5 py-lg-7">
      {isFailed ? (
        <div className="alert alert-danger" role="alert">
          Error on fetching data
        </div>
      ) : null}

      {isFetching ? (
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Fetching data...</span>
        </div>
      ) : null}

      <h2 className="mt-5 mt-lg-7">My assests</h2>

      <div className="row">
        <div className="col-md-8">
          {showTable ? (
            <table className="table mt-5">
              <thead>
                <tr>
                  <th>Asset symbol</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Value in USD</th>
                </tr>
              </thead>
              <tbody>
                {renderRows}
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="text-end fw-bold">${numeral(totalValueUSD).format('0,0.00')}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="alert alert-warning mt-5" role="alert">
              No data for this user
            </div>
          )}
        </div>

        <div className="col-md-4">{showChart ? <Doughnut data={chartData} /> : null}</div>
      </div>

      <h2 className="mt-5 mt-lg-7">My transactions</h2>

      {showTransactionTable ? (
        <table className="table mt-5">
          <thead>
            <tr>
              <th>Asset symbol</th>
              <th className="text-end">Type</th>
              <th className="text-end">Amount</th>
              <th className="text-end">Current price</th>
            </tr>
          </thead>
          <tbody>{renderTransactionRows}</tbody>
        </table>
      ) : (
        <div className="alert alert-warning mt-5" role="alert">
          No transactions for this user
        </div>
      )}
    </div>
  ) : (
    <LoginPage auth={auth} setGettingUser={setGettingUser} />
  );
};

export default Home;
