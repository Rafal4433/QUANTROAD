import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export function Layout() {
  return (
    <div id="page-wrapper">
      {/* Header */}
      <header id="header" className="alt">
        <h1><Link to="/">QuantRoad</Link></h1>
        <nav>
          <a href="#menu">Menu</a>
        </nav>
      </header>

      {/* Menu - this could be dynamic, but for now we mimic Solid State structure */}
      <nav id="menu">
        <div className="inner">
          <h2>Menu</h2>
          <ul className="links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blog/gem">GEM Simulator</Link></li>
            <li><a href="#">About</a></li>
          </ul>
          <a href="#" className="close">Close</a>
        </div>
      </nav>

      {/* Main Content Area */}
      <Outlet />

      {/* Footer */}
      <section id="footer">
        <div className="inner">
          <ul className="copyright">
            <li>&copy; QuantRoad. All rights reserved.</li><li>Design: HTML5 UP & Polish Quants</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
