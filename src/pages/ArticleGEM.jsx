import React from 'react';
import { GEMSimulator } from '../simulator/GEMSimulator.jsx';

export function ArticleGEM() {
  return (
    <>
      <section id="wrapper">
        <header>
          <div className="inner">
            <h2>Global Equity Momentum (GEM)</h2>
            <p>A resilient trend-following strategy designed to protect capital during bear markets while capturing equity upside.</p>
          </div>
        </header>

        {/* Content */}
        <div className="wrapper">
          <div className="inner">
            <h3 className="major">How GEM Works</h3>
            <p>
              Global Equity Momentum, popularized by Gary Antonacci, compares the momentum of US Equities, International Equities, and Aggregate Bonds (or Cash/T-Bills). At the end of each month, the strategy evaluates the lookback returns and shifts 100% of the portfolio into the asset showing the strongest momentum, provided it is positive. If risk assets show negative momentum, the portfolio moves to a safe harbor asset.
            </p>

            <h3 className="major">Interactive Simulator</h3>
            <p>
              Use the advanced simulator below to stress-test the strategy. You can adjust the lookback lengths, add DCA (Dollar Cost Averaging), and even apply Polish tax wrappers (IKE / IKZE) to see realistic post-tax PLN returns.
            </p>

            {/* The GEM Simulator integrates organically without artificial borders */}
            <div style={{ marginTop: '4em' }}>
              <GEMSimulator />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
