import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      {/* Banner */}
      <section id="banner">
        <div className="inner">
          <div className="logo"><span className="icon fa-chart-line"></span></div>
          <h2>QuantRoad</h2>
          <p>Systematic Trading Strategies, Data Science, and Financial Independence.</p>
        </div>
      </section>

      {/* Wrapper */}
      <section id="wrapper">
        {/* One */}
        <section id="one" className="wrapper spotlight style1">
          <div className="inner">
            <a href="#" className="image"><img src="/images/pic01.jpg" alt="" /></a>
            <div className="content">
              <h2 className="major">Global Equity Momentum</h2>
              <p>Explore the GEM strategy using our robust backtester. Configure momentum parameters, apply your tax shield (IKE/IKZE), and backtest DCA contributions historically using real ETF data adjusted to PLN.</p>
              <Link to="/blog/gem" className="special">Open Simulator</Link>
            </div>
          </div>
        </section>

      </section>
    </>
  );
}
