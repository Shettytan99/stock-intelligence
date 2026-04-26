"use client";
import React, { useState, useEffect } from "react";

// 🔥 PRO VERSION: Real data + indicators + smarter signals

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default function StockTrackerPro() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("");

  const fetchStockData = async (sym) => {
    try {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${sym}.BSE&apikey=${API_KEY}`
      );
      const data = await res.json();

      const series = data["Time Series (Daily)"];
      if (!series) return;

      const prices = Object.values(series)
        .slice(0, 20)
        .map((d) => parseFloat(d["4. close"]))
        .reverse();

      const latest = prices[prices.length - 1];

      setStocks((prev) => [
        ...prev,
        { name: sym.toUpperCase(), price: latest, history: prices },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const addStock = () => {
    if (!symbol) return;
    fetchStockData(symbol);
    setSymbol("");
  };

  // 📊 Moving Average
  const movingAverage = (data) =>
    data.reduce((a, b) => a + b, 0) / data.length;

  // 📉 RSI Calculation (simplified)
  const calculateRSI = (prices) => {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const rs = gains / (losses || 1);
    return 100 - 100 / (1 + rs);
  };

  // 🧠 Smart Signal Engine
  const getSignal = (history) => {
    const latest = history[history.length - 1];
    const avg = movingAverage(history);
    const rsi = calculateRSI(history);

    if (rsi < 30 && latest < avg * 0.95)
      return "🔥 STRONG BUY (Oversold + Undervalued)";

    if (rsi > 70 && latest > avg * 1.1)
      return "⚠️ SELL / AVOID (Overbought)";

    if (latest < avg) return "📉 Watch for Dip Buying";

    return "⚖️ Hold / Wait";
  };

  // 🔄 Reversal detection
  const isReversal = (history) => {
    const n = history.length;
    if (n < 3) return false;
    return history[n - 3] > history[n - 2] && history[n - 2] < history[n - 1];
  };

  return (
    <div className="p-6 grid gap-4">
      <h1 className="text-3xl font-bold">🚀 PRO Stock Intelligence Dashboard</h1>

<div style={{ display: "flex", gap: 10 }}>
  <input
    placeholder="Add stock (e.g. SBIN)"
    value={symbol}
    onChange={(e) => setSymbol(e.target.value)}
    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
  />

  <button
    onClick={addStock}
    style={{
      padding: "8px 12px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    Track
  </button>
</div>

      <div className="grid md:grid-cols-2 gap-4">
        {stocks.map((stock, index) => (
          <div key={index}>
            <div style={{ 
  border: "1px solid #ccc", 
  padding: 16, 
  borderRadius: 12, 
  marginTop: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
}}>
  <h2 style={{ fontSize: 18, fontWeight: "bold" }}>{stock.name}</h2>

  <p style={{ fontSize: 16 }}>₹{stock.price.toFixed(2)}</p>

  <p style={{ marginTop: 8 }}>
    Signal: {getSignal(stock.history)}
  </p>

  {isReversal(stock.history) && (
    <p style={{ color: "green", fontWeight: "bold" }}>
      🔄 Reversal Detected (Early Entry Signal)
    </p>
  )}

  <p style={{ fontSize: 12, marginTop: 8 }}>
    RSI: {calculateRSI(stock.history).toFixed(2)}
  </p>

  <p style={{ fontSize: 12, color: "gray" }}>
    History: {stock.history.join(" → ")}
  </p>
</div>
          </div>
        ))}
      </div>
    </div>
  );
}
