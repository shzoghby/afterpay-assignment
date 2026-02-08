import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/appkiyOFHuK6cTHVl/Order/${orderId}`, {
        method: 'GET', // Specify the method
        headers: {
          'Authorization': 'Bearer patvgnt8tOC6pMTbU.bfef0bd1b8449fac507dc9197cb6bd41cfdb8d1488afcded4a23a1a730071a91', // Inform the server about the content type
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json(); // Parse the JSON response
      return result;
      //setData(result.records); // Update the state with the returned data
    } catch (err) {
      setError(err.message); // Handle errors
      return {};
    } finally {
      //setIsLoading(false); // Set loading to false once complete
    }
  };

  const loadCustomerOrders = async (customer) => {
    customer.orders = [];

    if (customer.fields.Order) {
      for (const orderId of customer.fields.Order) {
        const customerOrder = await getOrderDetails(orderId);
        customer.orders.push(customerOrder.fields);
      }
    }
  }

  const loadCustomersListForDisplay = (customers) => {
    const customersList = customers.map(customer => {
      return {
        id: customer.fields.id,
        name: customer.fields.name,
        email: customer.fields.email,
        ordersCount: customer.orders.length,
        orders: loadCustomerOrdersForDisplay(customer.orders),
        totalAmount: getOrdersTotalAmount(customer.orders),
        averageAmount: getOrdersAverageAmount(customer.orders),
      };
    });

    return customersList;
  };

  const loadCustomerOrdersForDisplay = (orders) => {
    const ordersList = orders.map(order => {
      return {
        number: order.number,
        amount: order.amount,
        items: order.items
      };
    });

    return ordersList;
  };

  const getOrdersTotalAmount = (orders) => {
    return orders.reduce((accumulator, currentItem) => accumulator + currentItem.amount, 0);
  };

  const getOrdersAverageAmount = (orders) => {
    const totalAmount = orders.reduce((accumulator, currentItem) => accumulator + currentItem.amount, 0);
    return orders.length !== 0 ? totalAmount / orders.length : 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.airtable.com/v0/appkiyOFHuK6cTHVl/Customer', {
          method: 'GET', // Specify the method
          headers: {
            'Authorization': 'Bearer patvgnt8tOC6pMTbU.bfef0bd1b8449fac507dc9197cb6bd41cfdb8d1488afcded4a23a1a730071a91', // Inform the server about the content type
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json(); // Parse the JSON response
        for (const customer of result.records) {
          await loadCustomerOrders(customer);
        }

        const customerDetails = loadCustomersListForDisplay(result.records);
        //console.log(customerDetails);
        setData(customerDetails); // Update the state with the returned data
      } catch (err) {
        setError(err.message); // Handle errors
      } finally {
        setIsLoading(false); // Set loading to false once complete
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs once

  // 3. Conditionally render the UI based on the state.
  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const heading = ["Name", "Email", "Orders", "Total", "Average"];
  const sampleInput = [
    { "name": "Alice", "orders": [15.50, 23.75, 9.99] }
    , { "name": "Bob", "orders": [30.00, 10.50] }
    , { "name": "Charlie", "orders": [] }
  ];

  const sampleOutput = sampleInput.reduce((accumulator, currentItem) => {
    accumulator[currentItem.name] = [
      currentItem.orders.reduce((accumulator, currentItem) => accumulator + currentItem, 0),
      currentItem.orders.length !== 0
        ? Math.round((currentItem.orders.reduce((accumulator, currentItem) => accumulator + currentItem, 0) / currentItem.orders.length) * 100) / 100 : 0
    ];
    return accumulator;
  }, {});

  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome to FeedMe Restaurant</p>
        <title>FeedMe Restaurant</title>
      </header>

      {!isLoading ? (
        <><h2 className="title">Customers List</h2><div className="App-main">
          <table className="table">
            <thead>
              <tr>
                {heading.map((head, headID) => (
                  <th key={headID}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.ordersCount}</td>
                  <td>{customer.totalAmount}</td>
                  <td>{customer.averageAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></>
      ) : (
        <p>Loading data...</p>
      )}

      <h2 className="App-title-input">Array Sample - Input</h2>
      <div className="App-input">
        {JSON.stringify(sampleInput)}
      </div>

      <h2 className="App-title-output">Array Sample - Output</h2>
      <div className="App-output">
        {JSON.stringify(sampleOutput)}
      </div>
    </div>
  );
}

export default App;
