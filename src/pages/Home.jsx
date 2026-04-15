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
          <p>Systematyczne strategie inwestycyjne, analiza danych i wolność finansowa.</p>
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
              <p>Zbadaj strategię GEM za pomocą naszego symulatora historycznego. Skonfiguruj parametry momentum, zastosuj tarczę podatkową (IKE/IKZE) i przetestuj wkłady DCA na historycznych danych ETF przeliczonych na PLN.</p>
              <Link to="/blog/gem" className="special">Otwórz symulator</Link>
            </div>
          </div>
        </section>

      </section>
    </>
  );
}
